import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Save, X, ChevronDown, ChevronRight, BookOpen, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';

export default function CreatingClasses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [activeTab, setActiveTab] = useState('sessions');
  const [editingSession, setEditingSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Mock current user - would come from auth context
  const currentLecturerId = 'lecturer123'; // Replace with actual auth
  
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [newSession, setNewSession] = useState({
    courseOfferingId: '',
    date: '',
    time: '',
    topic: '',
    durationMinutes: 90,
    location: '',
    remarks: ''
  });

  useEffect(() => {
    loadCourseOfferings();
  }, []);

  const loadCourseOfferings = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const offerings = await LecturerService.fetchMyCourseOfferings(currentLecturerId);
      
      // Mock data
      const mockOfferings = [
        {
          id: 'CS101_2025_S1',
          subjectId: 'subject1',
          subject: {
            code: 'CS101',
            name: 'Introduction to Programming',
            credits: 3
          },
          batch: { name: 'Batch 2022' },
          semester: { name: 'Semester 3' },
          year: 2025,
          mode: 'Lecture',
          enrollmentCount: 45,
          sessions: [
            {
              id: 'session1',
              courseOfferingId: 'CS101_2025_S1',
              date: '2025-10-05T09:00:00Z',
              topic: 'Introduction to Java',
              durationMinutes: 90,
              location: 'Lab 203',
              attendanceMarked: true,
              presentCount: 42,
              absentCount: 2,
              lateCount: 1
            }
          ]
        },
        {
          id: 'CS201_2025_S1',
          subjectId: 'subject2',
          subject: {
            code: 'CS201',
            name: 'Data Structures',
            credits: 3
          },
          batch: { name: 'Batch 2021' },
          semester: { name: 'Semester 5' },
          year: 2025,
          mode: 'Lecture',
          enrollmentCount: 38,
          sessions: []
        }
      ];
      
      setCourseOfferings(mockOfferings);
    } catch (error) {
      console.error('Error loading course offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const validateSessionForm = () => {
    const newErrors = {};

    if (!newSession.date) {
      newErrors.date = 'Date is required';
    }

    if (!newSession.time) {
      newErrors.time = 'Time is required';
    }

    if (!newSession.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    if (!newSession.durationMinutes || newSession.durationMinutes < 1) {
      newErrors.durationMinutes = 'Duration must be at least 1 minute';
    }

    if (!newSession.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!validateSessionForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionData = {
        courseOfferingId: selectedCourse.id,
        date: `${newSession.date}T${newSession.time}:00Z`,
        topic: newSession.topic,
        durationMinutes: parseInt(newSession.durationMinutes),
        location: newSession.location,
        remarks: newSession.remarks
      };

      // Replace with actual API call
      // if (editingSession) {
      //   await LecturerService.updateClassSession(editingSession.id, sessionData);
      // } else {
      //   await LecturerService.createClassSession(sessionData);
      // }

      console.log('Session data:', sessionData);
      
      // Reset form
      setNewSession({
        courseOfferingId: '',
        date: '',
        time: '',
        topic: '',
        durationMinutes: 90,
        location: '',
        remarks: ''
      });
      setShowNewSessionForm(false);
      setEditingSession(null);
      setErrors({});
      
      // Reload data
      await loadCourseOfferings();
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSession = (session) => {
    const sessionDate = new Date(session.date);
    const dateStr = sessionDate.toISOString().split('T')[0];
    const timeStr = sessionDate.toTimeString().slice(0, 5);
    
    setNewSession({
      courseOfferingId: session.courseOfferingId,
      date: dateStr,
      time: timeStr,
      topic: session.topic,
      durationMinutes: session.durationMinutes,
      location: session.location,
      remarks: session.remarks || ''
    });
    
    setEditingSession(session);
    setShowNewSessionForm(true);
    setErrors({});
  };

  const handleDeleteSession = async (sessionId, topic) => {
    if (window.confirm(`Are you sure you want to delete the session "${topic}"?`)) {
      try {
        // Replace with actual API call
        // await LecturerService.deleteClassSession(sessionId);
        console.log('Deleting session:', sessionId);
        await loadCourseOfferings();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setNewSession({
      courseOfferingId: '',
      date: '',
      time: '',
      topic: '',
      durationMinutes: 90,
      location: '',
      remarks: ''
    });
    setShowNewSessionForm(false);
    setEditingSession(null);
    setErrors({});
  };

  const toggleSessionExpand = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const getAttendancePercentage = (session) => {
    const total = session.presentCount + session.absentCount + session.lateCount;
    if (total === 0) return 0;
    return Math.round((session.presentCount / total) * 100);
  };

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  My Courses
                </h1>
                <p className="text-blue-100 mt-2">Manage your course offerings and class sessions</p>
              </div>
              <div className="text-white text-right">
                <div className="text-sm opacity-90">Total Courses</div>
                <div className="text-3xl font-bold">{courseOfferings.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Assigned Courses</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {courseOfferings.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowNewSessionForm(false);
                      setActiveTab('sessions');
                    }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedCourse?.id === course.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-blue-600">{course.subject.code}</span>
                        <h3 className="font-medium text-gray-900 mt-1">{course.subject.name}</h3>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {course.mode}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{course.batch.name}</div>
                      <div>{course.semester.name}</div>
                      <div className="flex items-center gap-1 text-blue-600 font-medium mt-2">
                        <Users size={14} />
                        {course.enrollmentCount} students
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                {/* Course Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-blue-600">{selectedCourse.subject.code}</span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedCourse.mode}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedCourse.subject.name}
                      </h2>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{selectedCourse.batch.name}</span>
                        <span>•</span>
                        <span>{selectedCourse.semester.name}</span>
                        <span>•</span>
                        <span>{selectedCourse.year}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Enrolled Students</div>
                      <div className="text-3xl font-bold text-gray-900">{selectedCourse.enrollmentCount}</div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => setActiveTab('sessions')}
                      className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'sessions'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Class Sessions
                    </button>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'attendance'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Attendance Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('students')}
                      className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'students'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Enrolled Students
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'sessions' && (
                    <div>
                      {/* Add/View Toggle */}
                      {!showNewSessionForm && (
                        <div className="mb-6">
                          <button
                            onClick={() => {
                              setShowNewSessionForm(true);
                              setEditingSession(null);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus size={18} />
                            Add New Session
                          </button>
                        </div>
                      )}

                      {/* New Session Form */}
                      {showNewSessionForm && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">
                              {editingSession ? 'Edit Class Session' : 'Create New Class Session'}
                            </h3>
                            <button
                              onClick={handleCancelForm}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          <form onSubmit={handleCreateSession}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <input
                                    type="date"
                                    name="date"
                                    value={newSession.date}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      errors.date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {errors.date && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.date}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Time <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <input
                                    type="time"
                                    name="time"
                                    value={newSession.time}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      errors.time ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {errors.time && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.time}
                                  </p>
                                )}
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Topic <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="topic"
                                  placeholder="e.g., For Loops in Java"
                                  value={newSession.topic}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.topic ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {errors.topic && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.topic}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Duration (minutes) <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  name="durationMinutes"
                                  value={newSession.durationMinutes}
                                  onChange={handleInputChange}
                                  min="1"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.durationMinutes ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {errors.durationMinutes && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.durationMinutes}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Location <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                  <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g., Lab 203"
                                    value={newSession.location}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      errors.location ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {errors.location && (
                                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.location}
                                  </p>
                                )}
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Remarks (optional)
                                </label>
                                <textarea
                                  name="remarks"
                                  rows={2}
                                  placeholder="Additional notes or materials..."
                                  value={newSession.remarks}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                              <button
                                type="button"
                                onClick={handleCancelForm}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {editingSession ? 'Updating...' : 'Creating...'}
                                  </>
                                ) : (
                                  <>
                                    <Save size={18} />
                                    {editingSession ? 'Update Session' : 'Create Session'}
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Sessions List */}
                      {!showNewSessionForm && (
                        <>
                          {selectedCourse.sessions.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <BookOpen size={48} className="mx-auto text-gray-400 mb-3" />
                              <p className="text-gray-600 font-medium mb-1">No class sessions yet</p>
                              <p className="text-gray-500 text-sm">Click "Add New Session" to create your first class</p>
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
                                      <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar size={20} className="text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">{session.topic}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
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
                                        {session.attendanceMarked && (
                                          <div className="flex items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                              <CheckCircle size={14} />
                                              {session.presentCount} Present
                                            </span>
                                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                              <XCircle size={14} />
                                              {session.absentCount} Absent
                                            </span>
                                            {session.lateCount > 0 && (
                                              <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                                                <AlertCircle size={14} />
                                                {session.lateCount} Late
                                              </span>
                                            )}
                                            <span className="text-sm text-gray-600">
                                              ({getAttendancePercentage(session)}% attendance)
                                            </span>
                                          </div>
                                        )}
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
                                      <div className="flex gap-3">
                                        <button 
                                          onClick={() => handleEditSession(session)}
                                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          <Edit2 size={16} />
                                          Edit Session
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                          <Users size={16} />
                                          Mark Attendance
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSession(session.id, session.topic)}
                                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Attendance summary view coming soon...</p>
                    </div>
                  )}

                  {activeTab === 'students' && (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Enrolled students list coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Course</h3>
                <p className="text-gray-600">Choose a course from the sidebar to view and manage class sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}