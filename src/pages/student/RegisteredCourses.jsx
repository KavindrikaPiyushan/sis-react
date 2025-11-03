import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import studentService from '../../services/student/studentService';
import CommonDataService from '../../services/common/commonDataService';
import { formatDateUTC, formatTimeUTC } from '../../utils/dateUtils';
import HeaderBar from '../../components/HeaderBar';

const RegisteredCourses = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getEnrolledCourses();
      setCourses(response || []);

      if (response && response.length > 0) {
        const activeSemesterIds = {};
        response.forEach(course => {
          if (course.semester.status === 'inprogress') {
            activeSemesterIds[course.semester.id] = true;
          }
        });
        setExpandedSemesters(activeSemesterIds);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load enrolled courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupCoursesBySemesterStatus = (courses) => {
    const semestersMap = {};
    courses.forEach(course => {
      const semId = course.semester.id;
      if (!semestersMap[semId]) {
        semestersMap[semId] = {
          semester: course.semester,
          offerings: [],
        };
      }
      semestersMap[semId].offerings.push(course);
    });

    const active = [];
    const future = [];
    const completed = [];
    Object.values(semestersMap).forEach(({ semester, offerings }) => {
      if (semester.status === 'inprogress') {
        active.push({ semester, offerings });
      } else if (semester.status === 'pending') {
        future.push({ semester, offerings });
      } else if (semester.status === 'completed') {
        completed.push({ semester, offerings });
      }
    });
    return { active, future, completed };
  };

  const toggleSemester = (semesterId) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semesterId]: !prev[semesterId]
    }));
  };

  const calculateAttendance = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return { totalSessions: 0, attended: 0, percentage: 0 };
    }

    const markedSessions = sessions.filter(s => s.studentAttendanceStatus && s.studentAttendanceStatus !== 'not_marked');
    const attended = sessions.filter(s => s.studentAttendanceStatus === 'present' || s.studentAttendanceStatus === 'late').length;
    const percentage = markedSessions.length > 0 ? ((attended / markedSessions.length) * 100).toFixed(1) : 0;

    return {
      totalSessions: sessions.length,
      attended,
      percentage: parseFloat(percentage)
    };
  };

  const toggleSessionExpand = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const handleCourseClick = async (course) => {
    setSessionsError(null);
    setSessionsLoading(true);
    setViewMode('detail');
    setExpandedSessions({});
    try {
      const response = await CommonDataService.getCourseSessions(course.id);
      if (response && response.success && Array.isArray(response.data)) {
        setSelectedCourse({ ...course, sessions: response.data });
      } else {
        setSelectedCourse({ ...course, sessions: [] });
        setSessionsError('Failed to load class sessions.');
      }
    } catch (err) {
      setSelectedCourse({ ...course, sessions: [] });
      setSessionsError('Failed to load class sessions.');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-base sm:text-lg text-blue-700 font-semibold px-4">Loading your registered courses...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="bg-white border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4">
              <XCircle className="text-red-600 animate-pulse flex-shrink-0 mt-1" size={24} />
              <div className="flex-1 min-w-0">
                <h3 className="text-red-900 font-bold text-lg sm:text-xl mb-1">Something went wrong</h3>
                <p className="text-red-700 text-sm sm:text-base break-words">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-6 w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (viewMode === 'list') {
    const { active, future, completed } = groupCoursesBySemesterStatus(courses);
    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
          <HeaderBar
            title="My Registered Courses"
            subtitle="View your enrolled courses and class sessions"
            Icon={BookOpen}
          />
          {loading ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-16 text-center border-2 border-dashed border-blue-200">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-base sm:text-lg text-blue-700 font-semibold">Loading your registered courses...</p>
            </div>
          ) : (active.length === 0 && future.length === 0 && completed.length === 0) ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-16 text-center border-2 border-dashed border-blue-200">
              <BookOpen size={48} className="mx-auto text-blue-200 mb-4 sm:mb-5 sm:w-14 sm:h-14" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-sm sm:text-base text-gray-600">You are not enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8 lg:space-y-10">
              {active.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 px-1">Active Courses</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {active.map(({ semester, offerings }) => (
                      <div key={semester.id} className="border border-blue-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                        <button
                          className="flex items-center w-full text-left px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                          onClick={() => toggleSemester(semester.id)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {expandedSemesters[semester.id] ?
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" /> :
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            }
                            <span className="font-bold text-blue-900 text-base sm:text-lg truncate">{semester.name}</span>
                            <span className="text-xs font-semibold px-2 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">Active</span>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-500 font-medium ml-2 flex-shrink-0">{offerings.length} courses</span>
                        </button>
                        {expandedSemesters[semester.id] && (
                          <div className="p-4 sm:p-6 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                              {offerings.map(course => (
                                <div
                                  key={course.id}
                                  onClick={() => handleCourseClick(course)}
                                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-blue-100 hover:border-blue-400 group relative overflow-hidden"
                                >
                                  <div className="absolute right-0 top-0 m-2 sm:m-3 z-10">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                      {course.subject.code}
                                    </span>
                                  </div>
                                  <div className="p-5 sm:p-7 pb-4 sm:pb-5 flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3 pr-16">
                                      <BookOpen className="text-blue-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" size={28} />
                                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 line-clamp-2">{course.subject.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                                      <User size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.lecturer.user.firstName} {course.lecturer.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                                      <Calendar size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.semester.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                        <Calendar size={12} /> {course.sessionsCount} Sessions
                                      </span>
                                      {course.sessionsMarkedCount >= 1 && (
                                        <>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            course.myAverageAttendanceRate >= 90 ? 'bg-green-100 text-green-700' :
                                            course.myAverageAttendanceRate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            <CheckCircle size={12} /> {course.myAverageAttendanceRate}% My Attendance
                                          </span>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                            <CheckCircle size={12} /> {course.averageAttendanceRate}% Avg Attendance
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <button className="w-full mt-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors text-xs sm:text-sm font-semibold shadow group-hover:scale-105 group-hover:shadow-lg">
                                      View Classes
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {future.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 px-1">Future Courses</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {future.map(({ semester, offerings }) => (
                      <div key={semester.id} className="border border-blue-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                        <button
                          className="flex items-center w-full text-left px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                          onClick={() => toggleSemester(semester.id)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {expandedSemesters[semester.id] ?
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" /> :
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            }
                            <span className="font-bold text-blue-900 text-base sm:text-lg truncate">{semester.name}</span>
                            <span className="text-xs font-semibold px-2 sm:px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">Pending</span>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-500 font-medium ml-2 flex-shrink-0">{offerings.length} courses</span>
                        </button>
                        {expandedSemesters[semester.id] && (
                          <div className="p-4 sm:p-6 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                              {offerings.map(course => (
                                <div
                                  key={course.id}
                                  onClick={() => handleCourseClick(course)}
                                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-blue-100 hover:border-blue-400 group relative overflow-hidden"
                                >
                                  <div className="absolute right-0 top-0 m-2 sm:m-3 z-10">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                      {course.subject.code}
                                    </span>
                                  </div>
                                  <div className="p-5 sm:p-7 pb-4 sm:pb-5 flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3 pr-16">
                                      <BookOpen className="text-blue-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" size={28} />
                                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 line-clamp-2">{course.subject.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                                      <User size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.lecturer.user.firstName} {course.lecturer.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                                      <Calendar size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.semester.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                        <Calendar size={12} /> {course.sessionsCount} Sessions
                                      </span>
                                      {course.sessionsMarkedCount >= 1 && (
                                        <>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            course.myAverageAttendanceRate >= 90 ? 'bg-green-100 text-green-700' :
                                            course.myAverageAttendanceRate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            <CheckCircle size={12} /> {course.myAverageAttendanceRate}% My Attendance
                                          </span>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                            <CheckCircle size={12} /> {course.averageAttendanceRate}% Avg Attendance
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <button className="w-full mt-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors text-xs sm:text-sm font-semibold shadow group-hover:scale-105 group-hover:shadow-lg">
                                      View Classes
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completed.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 sm:mb-4 px-1">Completed Courses</h2>
                  <div className="space-y-4 sm:space-y-6">
                    {completed.map(({ semester, offerings }) => (
                      <div key={semester.id} className="border border-blue-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                        <button
                          className="flex items-center w-full text-left px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                          onClick={() => toggleSemester(semester.id)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            {expandedSemesters[semester.id] ?
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" /> :
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            }
                            <span className="font-bold text-blue-900 text-base sm:text-lg truncate">{semester.name}</span>
                            <span className="text-xs font-semibold px-2 sm:px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex-shrink-0">Completed</span>
                          </div>
                          <span className="text-xs sm:text-sm text-blue-500 font-medium ml-2 flex-shrink-0">{offerings.length} courses</span>
                        </button>
                        {expandedSemesters[semester.id] && (
                          <div className="p-4 sm:p-6 bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                              {offerings.map(course => (
                                <div
                                  key={course.id}
                                  onClick={() => handleCourseClick(course)}
                                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-blue-100 hover:border-blue-400 group relative overflow-hidden"
                                >
                                  <div className="absolute right-0 top-0 m-2 sm:m-3 z-10">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                      {course.subject.code}
                                    </span>
                                  </div>
                                  <div className="p-5 sm:p-7 pb-4 sm:pb-5 flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3 pr-16">
                                      <BookOpen className="text-blue-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" size={28} />
                                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 line-clamp-2">{course.subject.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                                      <User size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.lecturer.user.firstName} {course.lecturer.user.lastName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                                      <Calendar size={14} className="flex-shrink-0" />
                                      <span className="truncate">{course.semester.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                        <Calendar size={12} /> {course.sessionsCount} Sessions
                                      </span>
                                      {course.sessionsMarkedCount >= 1 && (
                                        <>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            course.myAverageAttendanceRate >= 90 ? 'bg-green-100 text-green-700' :
                                            course.myAverageAttendanceRate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                          }`}>
                                            <CheckCircle size={12} /> {course.myAverageAttendanceRate}% My Attendance
                                          </span>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                            <CheckCircle size={12} /> {course.averageAttendanceRate}% Avg Attendance
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <button className="w-full mt-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors text-xs sm:text-sm font-semibold shadow group-hover:scale-105 group-hover:shadow-lg">
                                      View Classes
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  if (viewMode === 'detail' && selectedCourse) {
    const attendance = selectedCourse.sessions ? calculateAttendance(selectedCourse.sessions) : { totalSessions: 0, attended: 0, percentage: 0 };
    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 font-semibold text-sm sm:text-base bg-blue-50 px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs sm:text-sm font-semibold tracking-wide">
                    {selectedCourse.subject.code}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold animate-pulse">
                    Active
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 break-words">
                  {selectedCourse.subject.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <User size={16} className="flex-shrink-0" />
                    <span className="truncate">{selectedCourse.lecturer.user.firstName} {selectedCourse.lecturer.user.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span className="truncate">{selectedCourse.semester.name}</span>
                  </div>
                </div>
              </div>
              <BookOpen className="text-blue-200 hidden sm:block self-center" size={48} />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6 pt-5 sm:pt-6 border-t border-blue-100">
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4">
                <div className="text-xs text-gray-600 mb-1 text-center">Total Sessions</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-blue-900">{selectedCourse.sessionsCount}</div>
              </div>
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4">
                <div className="text-xs text-gray-600 mb-1 text-center">My Attendance</div>
                <div className={`text-lg sm:text-2xl lg:text-3xl font-extrabold ${
                  selectedCourse.myAverageAttendanceRate >= 90 ? 'text-green-600' :
                  selectedCourse.myAverageAttendanceRate >= 75 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {selectedCourse.myAverageAttendanceRate}%
                </div>
              </div>
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4">
                <div className="text-xs text-gray-600 mb-1 text-center">Avg Attendance</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-600">
                  {selectedCourse.averageAttendanceRate}%
                </div>
              </div>
              <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4">
                <div className="text-xs text-gray-600 mb-1 text-center">Credits</div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-blue-600">{selectedCourse.subject.credits}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 border border-blue-100">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-400 flex-shrink-0" /> Class Sessions
            </h2>
            {sessionsLoading ? (
              <div className="text-center py-12 sm:py-16 bg-blue-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-blue-200">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-blue-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-blue-700 font-semibold text-sm sm:text-base lg:text-lg px-4">Loading class sessions...</p>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-12 sm:py-16 bg-red-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-red-200">
                <XCircle size={32} className="mx-auto text-red-400 mb-4 animate-pulse sm:w-10 sm:h-10" />
                <p className="text-red-700 font-semibold text-sm sm:text-base lg:text-lg px-4">{sessionsError}</p>
              </div>
            ) : (selectedCourse.sessions && selectedCourse.sessions.length === 0) ? (
              <div className="text-center py-12 sm:py-16 bg-blue-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-blue-200">
                <BookOpen size={48} className="mx-auto text-blue-200 mb-4 sm:w-14 sm:h-14" />
                <p className="text-blue-700 font-semibold text-sm sm:text-base lg:text-lg px-4">No class sessions scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {selectedCourse.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-2 border-blue-100 rounded-lg sm:rounded-xl overflow-hidden hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <button
                      onClick={() => toggleSessionExpand(session.id)}
                      className="w-full p-4 sm:p-5 flex items-start justify-between bg-white hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 text-left min-w-0">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5 sm:mt-1 flex-shrink-0">
                          <Calendar size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg group-hover:text-blue-700 transition-colors break-words">
                            {session.topic}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} className="flex-shrink-0" />
                              <span className="truncate">{formatDateUTC(session.date)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="flex-shrink-0" />
                              <span className="truncate">{formatTimeUTC(session.date)} ({session.durationMinutes} min)</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="flex-shrink-0" />
                              <span className="truncate">{session.location}</span>
                            </span>
                          </div>
                          {typeof session.attendanceRate === 'number' && session.attendanceMarked && (
                            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold shadow-sm ${
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {session.myAttendance.status === 'present' && <CheckCircle size={12} />}
                                {session.myAttendance.status === 'absent' && <XCircle size={12} />}
                                {session.myAttendance.status === 'excused' && <AlertCircle size={12} />}
                                My Status: <span className={`${
                                session.myAttendance.status === 'present' ? 'bg-green-100 text-green-700' :
                                session.myAttendance.status === 'absent' ? 'bg-red-100 text-red-700' :
                                session.myAttendance.status === 'excused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}> {session.myAttendance.status.charAt(0).toUpperCase() + session.myAttendance.status.slice(1)}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold bg-blue-50 text-gray-600 shadow-sm">
                                Attendance Rate: {session.attendanceRate}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {expandedSessions[session.id] ? (
                          <ChevronDown size={18} className="text-blue-400" />
                        ) : (
                          <ChevronRight size={18} className="text-blue-400" />
                        )}
                      </div>
                    </button>
                    {expandedSessions[session.id] && (
                      <div className="p-4 sm:p-5 bg-blue-50 border-t border-blue-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Date & Time</div>
                            <div className="text-sm sm:text-base text-gray-900 break-words">
                              {formatDateUTC(session.date)} at {formatTimeUTC(session.date)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Duration</div>
                            <div className="text-sm sm:text-base text-gray-900">{session.durationMinutes} minutes</div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Location</div>
                            <div className="text-sm sm:text-base text-gray-900 break-words">{session.location}</div>
                          </div>
                          {typeof session.attendanceRate === 'number' && (
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Attendance Summary</div>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 text-sm sm:text-base">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold bg-blue-50 text-gray-600 shadow-sm">
                                  Attendance: {session.attendanceRate}%
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                                  <CheckCircle size={12} />
                                  Present: {session.presentCount}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                                  <XCircle size={12} />
                                  Absent: {session.absentCount}
                                </span>
                                {session.excusedCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                                    <AlertCircle size={12} />
                                    Excused: {session.excusedCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {session.remarks && (
                            <div className="sm:col-span-2">
                              <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-1">Remarks</div>
                              <div className="text-sm sm:text-base text-gray-900 break-words">{session.remarks}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
};

export default RegisteredCourses;