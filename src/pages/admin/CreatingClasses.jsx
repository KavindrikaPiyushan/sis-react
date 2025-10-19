
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Save, X, ChevronDown, ChevronRight, BookOpen, CheckCircle, XCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { showToast } from '../utils/showToast';
import { formatDateUTC, formatTimeUTC } from '../../utils/dateUtils';
import ConfirmDialog from '../utils/ConfirmDialog';
import HeaderBar from '../../components/HeaderBar';

export default function CreatingClasses({ showConfirm }) {
  // State for ConfirmDialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(() => () => {});
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

  // header timestamp is handled by HeaderBar (centralized)



  const loadCourseOfferings = async () => {
    try {
      setLoading(true);
      // Use the lightweight API to fetch a smaller list for the sidebar
      const res = await AdminService.getLecturerAssignedCoursesLightData();
      if (res.success && Array.isArray(res.data)) {
        // Add enrollmentCount for UI compatibility and mock sessions for demo
        // The light API returns counts instead of full enrollments/sessions.
        // Ensure each offering has enrollments and sessions arrays for UI code that expects them.
        const offerings = res.data.map((offering) => ({
          ...offering,
          enrollments: offering.enrollments || [],
          sessions: offering.sessions || []
        }));
        setCourseOfferings(offerings);
      } else {
        setCourseOfferings([]);
      }
    } catch (error) {
      setCourseOfferings([]);
      console.error('Error loading course offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  // When user clicks a course in the sidebar, optimistically set the selected course using the
  // light data (fast) then fetch the full details and merge them into state.
  const handleSelectCourse = async (courseId) => {
    const light = courseOfferings.find(c => c.id === courseId);
    if (!light) return;

    // Optimistic UI: set selectedCourse to light item (it already contains useful fields)
    setSelectedCourse(light);

    try {
      const res = await AdminService.getCourseOfferingDetails(courseId);
      if (res && res.success && res.data) {
        // Merge full enrollments and sessions into the selected course
        setSelectedCourse(prev => ({
          ...prev,
          enrollments: Array.isArray(res.data.enrollments) ? res.data.enrollments : prev.enrollments || [],
          sessions: Array.isArray(res.data.sessions) ? res.data.sessions : prev.sessions || []
        }));

        // Also update the courseOfferings list so counts reflect the updated data if needed
        setCourseOfferings(prev => prev.map(item => item.id === courseId ? { ...item, ...light } : item));
      } else {
        // If details failed, keep light data and show a toast
        showToast('error', 'Failed to load course details', res?.message || 'Could not fetch course details');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      showToast('error', 'Error', err?.message || 'Failed to fetch course details');
    }
  };

  // Use shared UTC date/time formatting utils
  const formatDate = formatDateUTC;
  const formatTime = formatTimeUTC;

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
  // Approve enrollment request handler (real implementation)
  const handleApproveEnrollment = (enrollment) => {
    const approve = async () => {
      try {
        const res = await AdminService.approveEnrollment(enrollment.id);
        if (res && res.success) {
          showToast('success', 'Enrollment Approved', `Enrollment for ${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName} approved.`);
          // Update selectedCourse.enrollments and enrollmentCount in-place for instant UI feedback
          setSelectedCourse(prev => {
            if (!prev) return prev;
            const updatedEnrollments = prev.enrollments.map(e =>
              e.id === enrollment.id ? { ...e, status: 'active', enrolledDate: res.data?.enrolledDate || new Date().toISOString() } : e
            );
            return {
              ...prev,
              enrollments: updatedEnrollments,
              enrollmentCount: updatedEnrollments.filter(e => e.status === 'active').length
            };
          });
          // Force a full reload of courseOfferings from backend to guarantee sidebar is up-to-date
          await loadCourseOfferings();
        } else {
          showToast('error', 'Failed', res?.message || 'Failed to approve enrollment.');
        }
      } catch (err) {
        showToast('error', 'Error', err?.message || 'Failed to approve enrollment.');
      }
    };
    if (typeof showConfirm === 'function') {
      showConfirm(
        'Approve Enrollment',
        `Are you sure you want to approve enrollment for ${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}?`,
        approve
      );
    } else {
      if (window.confirm(`Are you sure you want to approve enrollment for ${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}?`)) {
        approve();
      }
    }
  };

    // Bulk approval state
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  // Bulk approve handler
  const handleBulkApprove = async () => {
    if (selectedEnrollments.length === 0) {
      showToast('error', 'No Selection', 'Please select at least one enrollment request.');
      return;
    }
    const doBulkApprove = async () => {
      try {
        const res = await AdminService.bulkApproveEnrollments(selectedEnrollments);
        if (res && res.success) {
          showToast('success', 'Bulk Approved', 'Selected enrollment requests have been approved.');
          setSelectedEnrollments([]);
          setSelectAll(false);
          // Refresh data
          setSelectedCourse(null);
          await loadCourseOfferings();
        } else {
          showToast('error', 'Failed', res?.message || 'Failed to bulk approve enrollments.');
        }
      } catch (err) {
        showToast('error', 'Error', err?.message || 'Failed to bulk approve enrollments.');
      }
    };
    if (typeof showConfirm === 'function') {
      showConfirm(
        'Bulk Approve Enrollments',
        `Are you sure you want to approve ${selectedEnrollments.length} enrollment request(s)?`,
        doBulkApprove
      );
    } else {
      if (window.confirm(`Are you sure you want to approve ${selectedEnrollments.length} enrollment request(s)?`)) {
        doBulkApprove();
      }
    }
  };

  // Checkbox handlers
  const handleSelectEnrollment = (id) => {
    setSelectedEnrollments((prev) =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = (ids) => {
    if (selectAll) {
      setSelectedEnrollments([]);
      setSelectAll(false);
    } else {
      setSelectedEnrollments(ids);
      setSelectAll(true);
    }
  };
  
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!validateSessionForm()) {
      return;
    }

    const doSubmit = async () => {
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
        let res;
        if (editingSession) {
          res = await AdminService.updateClassSession(editingSession.id, sessionData);
        } else {
          res = await AdminService.createClassSessions(sessionData);
        }
        const apiSuccess = (res && (res.success || (res.data && res.data.success)));
        const apiMessage = (res && (res.message || res.data?.message));
        if (apiSuccess) {
          showToast('success', editingSession ? 'Session Updated' : 'Session Created', apiMessage || (editingSession ? 'Class session updated successfully.' : 'Class session created successfully.'));
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
          await loadCourseOfferings();
          // Update selectedCourse to the latest object from the refreshed courseOfferings
          setCourseOfferings((prevOfferings) => {
            if (!selectedCourse) return prevOfferings;
            const updated = prevOfferings.find(c => c.id === selectedCourse.id);
            if (updated) setSelectedCourse(updated);
            return prevOfferings;
          });
        } else {
          showToast('error', 'Failed', apiMessage || (editingSession ? 'Failed to update class session.' : 'Failed to create class session.'));
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        showToast('error', 'Error', error.message || (editingSession ? 'Failed to update class session.' : 'Failed to create class session.'));
      } finally {
        setIsSubmitting(false);
      }
    };

    if (showConfirm) {
      showConfirm(
        editingSession ? 'Update Class Session' : 'Create Class Session',
        editingSession ? 'Are you sure you want to update this class session?' : 'Are you sure you want to create this class session?',
        doSubmit
      );
    } else {
      if (window.confirm(editingSession ? 'Are you sure you want to update this class session?' : 'Are you sure you want to create this class session?')) {
        doSubmit();
      }
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
      remarks: session.remarks != null ? session.remarks : ''
    });
    
    setEditingSession(session);
    setShowNewSessionForm(true);
    setErrors({});
  };

  const handleDeleteSession = async (sessionId, topic) => {
    const doDelete = async () => {
      try {
        const res = await AdminService.deleteClassSession(sessionId);
        const apiSuccess = (res && (res.success || (res.data && res.data.success)));
        const apiMessage = (res && (res.message || res.data?.message));
        if (apiSuccess) {
          showToast('success', 'Session Deleted', apiMessage || 'Class session deleted successfully.');
          await loadCourseOfferings();
          // Update selectedCourse to the latest object from the refreshed courseOfferings
          setCourseOfferings((prevOfferings) => {
            if (!selectedCourse) return prevOfferings;
            const updated = prevOfferings.find(c => c.id === selectedCourse.id);
            if (updated) setSelectedCourse(updated);
            return prevOfferings;
          });
        } else {
          showToast('error', 'Failed', apiMessage || 'Failed to delete class session.');
        }
      } catch (error) {
        showToast('error', 'Error', error.message || 'Failed to delete class session.');
      }
    };
    if (showConfirm) {
      showConfirm(
        'Delete Class Session',
        `Are you sure you want to delete the session "${topic}"?`,
        doDelete
      );
    } else {
      if (window.confirm(`Are you sure you want to delete the session "${topic}"?`)) {
        doDelete();
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
    const total = session.presentCount + session.absentCount;
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
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen  ">
      <div className="max-w-8xl mx-auto p-8">
        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={confirmCallback}
          onCancel={() => setConfirmOpen(false)}
        />
        {/* Header (shared) */}
        <HeaderBar
          title="My Courses"
          subtitle="Manage your course offerings and class sessions"
          Icon={BookOpen}
          unread={0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Assigned Courses</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {courseOfferings.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No assigned courses found.</div>
                ) : (
                  courseOfferings.map((course) => {
                    // Always use the latest course object from courseOfferings for counts
                    const latest = courseOfferings.find(c => c.id === course.id) || course;
                    const enrolledCount = Array.isArray(latest.enrollments)
                      ? latest.enrollments.filter(e => e.status === 'active').length
                      : 0;
                    const pendingCount = Array.isArray(latest.enrollments)
                      ? latest.enrollments.filter(e => e.status === 'pending').length
                      : 0;
                      return (
                        <button
                          key={course.id}
                          onClick={() => handleSelectCourse(course.id)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                            selectedCourse?.id === course.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                        >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-semibold text-blue-600">{latest.subject?.code || 'N/A'}</span>
                            <h3 className="font-medium text-gray-900 mt-1">{latest.subject?.name || 'Unnamed Subject'}</h3>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {latest.mode ? latest.mode.charAt(0).toUpperCase() + latest.mode.slice(1) : ''}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>{latest.batch?.name || 'Batch'}</div>
                          <div>{latest.semester?.name || 'Semester'}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <Users size={14} />
                              {latest.enrollmentsCount} enrolled
                            </span>
                            {latest.pendingEnrollmentsCount > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                <Users size={14} />
                                {latest.pendingEnrollmentsCount} pending
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
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
                      <div className="text-3xl font-bold text-gray-900">{selectedCourse.enrollments ? selectedCourse.enrollments.filter(e => e.status === 'active').length : 0}</div>
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
                      Enrolled Students ({selectedCourse.enrollments ? selectedCourse.enrollments.filter(e => e.status === 'active').length : 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className={`pb-2 px-1 font-medium transition-colors ${
                        activeTab === 'requests'
                          ? 'text-yellow-600 border-b-2 border-yellow-500'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Enrollment Requests ({selectedCourse.enrollments ? selectedCourse.enrollments.filter(e => e.status === 'pending').length : 0})
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'sessions' && (
                    <div>
                      {/* Action bar moved out of header: Add New Session */}
                      {!showNewSessionForm && (
                        <div className="mb-6 flex justify-end">
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
                                        {session.remarks && session.remarks.trim() !== '' && (
                                          <div className="mt-2 text-xs text-gray-500 italic">
                                            <span className="font-semibold text-gray-700">Remarks:</span> {session.remarks}
                                          </div>
                                        )}
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
                                            {/* No late count */}
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
                    <div>
                      {selectedCourse.sessions && selectedCourse.sessions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                            <thead className="bg-gradient-to-r from-blue-100 to-indigo-200">
                              <tr>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-blue-700 uppercase tracking-wide">#</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-blue-700 uppercase tracking-wide">Date</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-blue-700 uppercase tracking-wide">Topic</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-green-700 uppercase tracking-wide">Present</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-red-700 uppercase tracking-wide">Absent</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Status</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Attendance</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {selectedCourse.sessions.map((session, idx) => {
                                const total = session.presentCount + session.absentCount;
                                const percent = total === 0 ? 0 : Math.round((session.presentCount / total) * 100);
                                let statusLabel = 'Pending';
                                let statusColor = 'bg-gray-200 text-gray-700';
                                if (session.attendanceMarked) {
                                  statusLabel = 'Marked';
                                  statusColor = 'bg-green-100 text-green-700 border border-green-300';
                                }
                                return (
                                  <tr key={session.id} className="hover:bg-blue-100/60 transition-all duration-200 group">
                                    <td className="px-2 py-2 text-center text-xs text-gray-700 font-semibold">{idx + 1}</td>
                                    <td className="px-2 py-2 text-center text-xs">
                                      <span className="inline-block  text-blue-700 px-2 py-1 text-[10px] font-semibold">
                                        {formatDate(session.date)}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs text-gray-900 font-medium max-w-xs truncate" title={session.topic}>{session.topic}</td>
                                    <td className="px-2 py-2 text-center text-xs">
                                      <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold shadow-sm text-[10px]">
                                        {session.presentCount}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs">
                                      <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold shadow-sm text-[10px]">
                                        {session.absentCount}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs">
                                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-[10px] border ${statusColor} transition-all duration-200`}>
                                        {statusLabel}
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs min-w-[100px]">
                                      <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-2 rounded-full transition-all duration-300 ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                                            style={{ width: `${percent}%` }}
                                            title={`Attendance: ${percent}%`}
                                          ></div>
                                        </div>
                                        <span
                                          className={`font-bold text-[10px] ${percent >= 80 ? 'text-green-600' : percent >= 50 ? 'text-amber-600' : 'text-red-600'} transition-colors duration-200`}
                                          title={`Present: ${session.presentCount} / ${total}`}
                                        >
                                          {percent}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No class sessions to summarize attendance.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'students' && (
                    <div>
                      {selectedCourse.enrollments && selectedCourse.enrollments.filter(e => e.status === 'active').length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                            <thead className="bg-gradient-to-r from-blue-100 to-indigo-200">
                              <tr>
                                <th colSpan={5} className="text-left px-2 py-2 text-[13px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50">Enrolled Students ({selectedCourse.enrollments ? selectedCourse.enrollments.filter(e => e.status === 'active').length : 0})</th>
                              </tr>
                              <tr>
                                <th className="px-2 py-2 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide">#</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-green-700 uppercase tracking-wide">Student No</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Name</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-blue-700 uppercase tracking-wide">Email</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-gray-700 uppercase tracking-wide">Enrolled Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {selectedCourse.enrollments.filter(e => e.status === 'active').map((enrollment, idx) => (
                                <tr key={enrollment.id} className="hover:bg-blue-100/60 transition-all duration-200 group">
                                  <td className="px-2 py-2 text-center text-xs text-gray-700 font-semibold">{idx + 1}</td>
                                  <td className="px-2 py-2 text-center text-xs text-green-700 font-semibold">{enrollment.student?.studentNo || '-'}</td>
                                  <td className="px-2 py-2 text-center text-xs text-gray-900 font-medium max-w-xs truncate" title={`${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}`}>{enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}</td>
                                  <td className="px-2 py-2 text-center text-xs text-blue-700 max-w-xs truncate" title={enrollment.student?.user?.email}>{enrollment.student?.user?.email}</td>
                                  <td className="px-2 py-2 text-center text-xs text-gray-600">{formatDate(enrollment.enrolledDate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No students enrolled for this course.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'requests' && (
                    <div>
                      {selectedCourse.enrollments && selectedCourse.enrollments.filter(e => e.status === 'pending').length > 0 ? (
                        <div className="overflow-x-auto">
                          {/* Bulk Approve Controls */}
                          <div className="flex items-center gap-4 mb-2">
                            <button
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                              onClick={handleBulkApprove}
                              disabled={selectedEnrollments.length === 0}
                            >
                              Bulk Approve
                            </button>
                            <span className="text-sm text-gray-600">{selectedEnrollments.length} selected</span>
                          </div>
                          <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
                            <thead className="bg-gradient-to-r from-yellow-100 to-yellow-200">
                              <tr>
                                <th colSpan={7} className="text-left px-2 py-2 text-[13px] font-bold text-yellow-700 uppercase tracking-wide bg-yellow-50">Enrollment Requests ({selectedCourse.enrollments ? selectedCourse.enrollments.filter(e => e.status === 'pending').length : 0})</th>
                              </tr>
                              <tr>
                                <th className="px-2 py-2 text-center text-[10px] font-bold text-yellow-700 uppercase tracking-wide">
                                  <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={() => handleSelectAll(selectedCourse.enrollments.filter(e => e.status === 'pending').map(e => e.id))}
                                    aria-label="Select all"
                                  />
                                </th>
                                <th className="px-2 py-2 text-center text-[10px] font-bold text-yellow-700 uppercase tracking-wide">#</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-green-700 uppercase tracking-wide">Student No</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Name</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-blue-700 uppercase tracking-wide">Email</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-gray-700 uppercase tracking-wide">Requested Date</th>
                                <th className="px-2 py-2 text-center text-[11px] font-bold text-yellow-700 uppercase tracking-wide">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {selectedCourse.enrollments.filter(e => e.status === 'pending').map((enrollment, idx) => (
                                <tr key={enrollment.id} className="hover:bg-yellow-100/60 transition-all duration-200 group">
                                  <td className="px-2 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedEnrollments.includes(enrollment.id)}
                                      onChange={() => handleSelectEnrollment(enrollment.id)}
                                      aria-label={`Select enrollment ${idx + 1}`}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center text-xs text-yellow-700 font-semibold">{idx + 1}</td>
                                  <td className="px-2 py-2 text-center text-xs text-green-700 font-semibold">{enrollment.student?.studentNo || '-'}</td>
                                  <td className="px-2 py-2 text-center text-xs text-gray-900 font-medium max-w-xs truncate" title={`${enrollment.student?.user?.firstName} ${enrollment.student?.user?.lastName}`}>{enrollment.student?.user?.firstName} {enrollment.student?.user?.lastName}</td>
                                  <td className="px-2 py-2 text-center text-xs text-blue-700 max-w-xs truncate" title={enrollment.student?.user?.email}>{enrollment.student?.user?.email}</td>
                                  <td className="px-2 py-2 text-center text-xs text-gray-600">{formatDate(enrollment.enrolledDate)}</td>
                                  <td className="px-2 py-2 text-center text-xs">
                                    <button
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                      onClick={() => handleApproveEnrollment(enrollment)}
                                    >
                                      Approve
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-600">No pending enrollment requests for this course.</p>
                        </div>
                      )}
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