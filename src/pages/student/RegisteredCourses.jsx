import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import studentService from '../../services/student/studentService';
import CommonDataService from '../../services/common/commonDataService';
import { formatDateUTC, formatTimeUTC } from '../../utils/dateUtils';
import LoadingComponent from '../../components/LoadingComponent';

const RegisteredCourses = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getEnrolledCourses();
      setCourses(response || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load enrolled courses. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const getAttendanceIcon = (status) => {
    if (status === 'present') {
      return <CheckCircle className="text-green-600" size={18} />;
    } else if (status === 'absent') {
      return <XCircle className="text-red-600" size={18} />;
    } else if (status === 'late') {
      return <AlertCircle className="text-amber-600" size={18} />;
    }
    return <AlertCircle className="text-gray-400" size={18} />;
  };

  const getAttendanceText = (status) => {
    if (status === 'present') return 'Present';
    if (status === 'absent') return 'Absent';
    if (status === 'late') return 'Late';
    return 'Not Marked';
  };

  const getAttendanceColor = (status) => {
    if (status === 'present') return 'bg-green-100 text-green-800';
    if (status === 'absent') return 'bg-red-100 text-red-800';
    if (status === 'late') return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-600';
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
      // Fetch sessions for this course offering
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
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-7xl mx-auto p-6">
          <LoadingComponent message="Loading your registered courses..." />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <XCircle className="text-red-600 animate-pulse" size={32} />
              <div>
                <h3 className="text-red-900 font-bold text-xl mb-1">Something went wrong</h3>
                <p className="text-red-700 text-base">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchEnrolledCourses}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Courses List View
  if (viewMode === 'list') {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-8xl mx-auto p-8">
          {/* header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">My Registered Courses</h1>
              <p className="text-blue-100 mt-2">View your enrolled courses and class sessions</p>
              <p className="text-blue-100/90 mt-1 text-sm">{currentDateTime.toLocaleString()}</p>
            </div>
            <div className="hidden md:block">
              <BookOpen size={48} className="text-blue-200" />
            </div>
          </div>
          {/*end header */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-blue-200">
              <BookOpen size={56} className="mx-auto text-blue-200 mb-5" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-600">You are not enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => {
                const attendance = calculateAttendance(course.sessions);
                return (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course)}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-blue-100 hover:border-blue-400 group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 m-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                        {course.subject.code}
                      </span>
                    </div>
                    <div className="p-7 pb-5 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="text-blue-300 group-hover:text-blue-500 transition-colors" size={32} />
                        <h3 className="text-lg font-bold text-gray-900 flex-1 truncate">{course.subject.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User size={14} />
                        <span className="truncate">{course.lecturer.user.firstName} {course.lecturer.user.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar size={14} />
                        <span>{course.semester.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <Calendar size={12} /> {course.sessionsCount} Sessions
                        </span>
                        {course.sessionsMarkedCount >= 1 && (<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${course.averageAttendanceRate >= 90 ? 'bg-green-100 text-green-700' :
                            course.averageAttendanceRate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          <CheckCircle size={12} /> {course.averageAttendanceRate}% Attendance
                        </span>)}
                      </div>
                      <button className="w-full mt-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-colors text-sm font-semibold shadow group-hover:scale-105 group-hover:shadow-lg">
                        View Classes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Course Detail View with Classes
  if (viewMode === 'detail' && selectedCourse) {
    // Use fetched sessions, or empty array
    const attendance = selectedCourse.sessions ? calculateAttendance(selectedCourse.sessions) : { totalSessions: 0, attended: 0, percentage: 0 };
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-8xl mx-auto p-8">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold text-base bg-blue-50 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-semibold tracking-wide">
                    {selectedCourse.subject.code}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold animate-pulse">
                    Active
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                  {selectedCourse.subject.name}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>{selectedCourse.lecturer.user.firstName} {selectedCourse.lecturer.user.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{selectedCourse.semester.name}</span>
                  </div>
                </div>
              </div>
              <BookOpen className="text-blue-200" size={56} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-blue-100">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
                <div className="text-3xl font-extrabold text-blue-900">{selectedCourse.sessionsCount}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-1">Attendance Rate</div>
                <div className={`text-3xl font-extrabold ${selectedCourse.averageAttendanceRate >= 90 ? 'text-green-600' :
                    selectedCourse.averageAttendanceRate >= 75 ? 'text-yellow-600' :
                      'text-red-600'
                  }`}>
                  {selectedCourse.averageAttendanceRate}%
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-600 mb-1">Credits</div>
                <div className="text-3xl font-extrabold text-blue-600">{selectedCourse.subject.credits}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <Calendar size={24} className="text-blue-400" /> Class Sessions
            </h2>
            {sessionsLoading ? (
              <div className="text-center py-16 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-6"></div>
                <p className="text-blue-700 font-semibold text-lg">Loading class sessions...</p>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-16 bg-red-50 rounded-2xl border-2 border-dashed border-red-200">
                <XCircle size={40} className="mx-auto text-red-400 mb-4 animate-pulse" />
                <p className="text-red-700 font-semibold text-lg">{sessionsError}</p>
              </div>
            ) : (selectedCourse.sessions && selectedCourse.sessions.length === 0) ? (
              <div className="text-center py-16 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
                <BookOpen size={56} className="mx-auto text-blue-200 mb-4" />
                <p className="text-blue-700 font-semibold text-lg">No class sessions scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCourse.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border-2 border-blue-100 rounded-xl overflow-hidden hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <button
                      onClick={() => toggleSessionExpand(session.id)}
                      className="w-full p-5 flex items-center justify-between bg-white hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start gap-4 flex-1 text-left">
                        <div className="p-2 bg-blue-100 rounded-lg mt-1">
                          <Calendar size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg group-hover:text-blue-700 transition-colors">{session.topic}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDateUTC(session.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatTimeUTC(session.date)} ({session.durationMinutes} min)
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {session.location}
                            </span>
                          </div>
                          {/* Attendance summary for session (if available) */}
                          {typeof session.attendanceRate === 'number' && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 shadow-sm`}>
                                Attendance: {session.attendanceRate}%
                              </span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 shadow-sm ml-2`}>
                                Present: {session.presentCount}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 shadow-sm ml-2`}>
                                Absent: {session.absentCount}
                              </span>
                              {session.excusedCount > 0 && (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 shadow-sm ml-2`}>
                                  Excused: {session.excusedCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedSessions[session.id] ? (
                          <ChevronDown size={20} className="text-blue-400" />
                        ) : (
                          <ChevronRight size={20} className="text-blue-400" />
                        )}
                      </div>
                    </button>
                    {expandedSessions[session.id] && (
                      <div className="p-5 bg-blue-50 border-t border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-semibold text-blue-700 mb-1">Date & Time</div>
                            <div className="text-base text-gray-900">
                              {formatDateUTC(session.date)} at {formatTimeUTC(session.date)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-blue-700 mb-1">Duration</div>
                            <div className="text-base text-gray-900">{session.durationMinutes} minutes</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-blue-700 mb-1">Location</div>
                            <div className="text-base text-gray-900">{session.location}</div>
                          </div>
                          {/* Attendance summary for session (if available) */}
                          {typeof session.attendanceRate === 'number' && (
                            <div>
                              <div className="text-sm font-semibold text-blue-700 mb-1">Attendance Summary</div>
                              <div className="flex flex-wrap gap-2 text-base">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 shadow-sm`}>
                                  Attendance: {session.attendanceRate}%
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 shadow-sm`}>
                                  Present: {session.presentCount}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 shadow-sm`}>
                                  Absent: {session.absentCount}
                                </span>
                                {session.excusedCount > 0 && (
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 shadow-sm`}>
                                    Excused: {session.excusedCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {session.remarks && (
                            <div className="md:col-span-2">
                              <div className="text-sm font-semibold text-blue-700 mb-1">Remarks</div>
                              <div className="text-base text-gray-900">{session.remarks}</div>
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
  // ...existing code...
};

export default RegisteredCourses;