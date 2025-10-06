import React, { useState } from 'react';
import { BookOpen, User, Calendar, Clock, MapPin, ArrowLeft, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const CourseClassesView = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});

  // Mock student data
  const student = {
    studentNo: "2022/ICT/045",
    fullName: "Kavindu Piyumal",
    currentSemester: "Semester 5"
  };

  // Mock enrolled courses with class sessions
  const enrollments = [
    {
      _id: "enr1",
      status: "active",
      courseOffering: {
        _id: "co1",
        year: 2025,
        subject: {
          code: "CS301",
          name: "Data Structures & Algorithms",
          credits: 3
        },
        lecturer: {
          name: "Dr. Sarah Johnson",
          email: "sarah.j@uni.lk"
        },
        semester: {
          name: "Semester 5",
          startDate: "2025-02-01",
          endDate: "2025-06-30"
        }
      },
      attendance: {
        totalSessions: 24,
        attended: 22,
        percentage: 91.7
      },
      sessions: [
        {
          id: "s1",
          date: "2025-10-01T09:00:00Z",
          topic: "Introduction to Data Structures",
          durationMinutes: 90,
          location: "Lab 203",
          attendanceMarked: true,
          studentAttendance: "present"
        },
        {
          id: "s2",
          date: "2025-10-03T09:00:00Z",
          topic: "Arrays and Linked Lists",
          durationMinutes: 90,
          location: "Lab 203",
          attendanceMarked: true,
          studentAttendance: "present"
        },
        {
          id: "s3",
          date: "2025-10-05T09:00:00Z",
          topic: "Stacks and Queues",
          durationMinutes: 90,
          location: "Lab 203",
          attendanceMarked: true,
          studentAttendance: "absent"
        },
        {
          id: "s4",
          date: "2025-10-08T09:00:00Z",
          topic: "Binary Trees",
          durationMinutes: 90,
          location: "Lab 203",
          attendanceMarked: false,
          studentAttendance: null
        }
      ]
    },
    {
      _id: "enr2",
      status: "active",
      courseOffering: {
        _id: "co2",
        year: 2025,
        subject: {
          code: "CS302",
          name: "Database Management Systems",
          credits: 4
        },
        lecturer: {
          name: "Prof. Michael Chen",
          email: "m.chen@uni.lk"
        },
        semester: {
          name: "Semester 5",
          startDate: "2025-02-01",
          endDate: "2025-06-30"
        }
      },
      attendance: {
        totalSessions: 28,
        attended: 25,
        percentage: 89.3
      },
      sessions: [
        {
          id: "s5",
          date: "2025-10-02T14:00:00Z",
          topic: "Introduction to DBMS",
          durationMinutes: 120,
          location: "Lecture Hall A",
          attendanceMarked: true,
          studentAttendance: "present"
        },
        {
          id: "s6",
          date: "2025-10-04T14:00:00Z",
          topic: "SQL Basics",
          durationMinutes: 120,
          location: "Lecture Hall A",
          attendanceMarked: true,
          studentAttendance: "present"
        }
      ]
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const handleCourseClick = (enrollment) => {
    setSelectedCourse(enrollment);
    setViewMode('detail');
    setExpandedSessions({});
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCourse(null);
  };

  // Courses List View
  if (viewMode === 'list') {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Registered Courses</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User size={16} />
                {student.fullName}
              </span>
              <span>•</span>
              <span>{student.studentNo}</span>
              <span>•</span>
              <span>{student.currentSemester}</span>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                onClick={() => handleCourseClick(enrollment)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-medium">
                        {enrollment.courseOffering.subject.code}
                      </span>
                    </div>
                    <BookOpen className="text-gray-400" size={28} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {enrollment.courseOffering.subject.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} />
                      <span>{enrollment.courseOffering.lecturer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{enrollment.courseOffering.semester.name}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Class Sessions</span>
                      <span className="font-bold text-blue-600">{enrollment.sessions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Attendance</span>
                      <span className={`font-bold ${
                        enrollment.attendance.percentage >= 90 ? 'text-green-600' :
                        enrollment.attendance.percentage >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {enrollment.attendance.percentage}%
                      </span>
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    View Classes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Course Detail View with Classes
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm font-medium">
                  {selectedCourse.courseOffering.subject.code}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCourse.courseOffering.subject.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{selectedCourse.courseOffering.lecturer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{selectedCourse.courseOffering.semester.name}</span>
                </div>
              </div>
            </div>
            <BookOpen className="text-gray-400" size={40} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
              <div className="text-2xl font-bold text-gray-900">{selectedCourse.sessions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Attendance Rate</div>
              <div className={`text-2xl font-bold ${
                selectedCourse.attendance.percentage >= 90 ? 'text-green-600' :
                selectedCourse.attendance.percentage >= 75 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {selectedCourse.attendance.percentage}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Credits</div>
              <div className="text-2xl font-bold text-blue-600">{selectedCourse.courseOffering.subject.credits}</div>
            </div>
          </div>
        </div>

        {/* Class Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Class Sessions</h2>
          
          {selectedCourse.sessions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No class sessions scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCourse.sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <button
                    onClick={() => toggleSessionExpand(session.id)}
                    className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 text-left">
                      <div className="p-2 bg-blue-100 rounded-lg mt-1">
                        <Calendar size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{session.topic}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(session.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(session.date)} ({session.durationMinutes} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {session.location}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getAttendanceColor(session.studentAttendance)}`}>
                            {getAttendanceIcon(session.studentAttendance)}
                            {getAttendanceText(session.studentAttendance)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedSessions[session.id] ? (
                        <ChevronDown size={20} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSessions[session.id] && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Date & Time</div>
                          <div className="text-sm text-gray-900">
                            {formatDate(session.date)} at {formatTime(session.date)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Duration</div>
                          <div className="text-sm text-gray-900">{session.durationMinutes} minutes</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                          <div className="text-sm text-gray-900">{session.location}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">My Attendance</div>
                          <div className="flex items-center gap-1 text-sm">
                            {getAttendanceIcon(session.studentAttendance)}
                            <span className={`font-medium ${
                              session.studentAttendance === 'present' ? 'text-green-600' :
                              session.studentAttendance === 'absent' ? 'text-red-600' :
                              session.studentAttendance === 'late' ? 'text-amber-600' :
                              'text-gray-600'
                            }`}>
                              {getAttendanceText(session.studentAttendance)}
                            </span>
                          </div>
                        </div>
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
};

export default CourseClassesView;