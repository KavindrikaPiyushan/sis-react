
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import { BookOpen, Search, Filter, CheckCircle, XCircle, Users, Calendar, User, Info } from 'lucide-react';
import studentService from '../../services/student/studentService';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../utils/ConfirmDialog';
import LoadingComponent from '../../components/LoadingComponent';


export default function RegisterForNewCourse() {
  const { user } = useAuth();
  const [availableOfferings, setAvailableOfferings] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Load available offerings from API
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [refreshFlag]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get available courses for batch
      const available = await studentService.getAvailableCoursesForBatch();
      setAvailableOfferings(available || []);
      // Get enrolled courses for enrolled tab
      const enrolled = await studentService.getEnrolledCourses();
      setEnrolledCourses(enrolled || []);
    } catch (err) {
      showToast("error", "Error", "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course (with confirmation)
  const handleEnroll = (offering) => {
    setConfirmTitle("Confirm Enrollment");
    setConfirmMessage(
      `Are you sure you want to request enrollment for ${offering.subject.code} - ${offering.subject.name}?`
    );
    setConfirmCallback(() => () => enrollInCourse(offering));
    setConfirmOpen(true);
  };

  // Drop a course (with confirmation)
  const handleDrop = (offering, enrollment) => {
    setConfirmTitle("Confirm Drop");
    setConfirmMessage(
      `Are you sure you want to drop your enrollment for ${offering.subject.code} - ${offering.subject.name}?`
    );
    setConfirmCallback(() => () => dropCourse(offering, enrollment));
    setConfirmOpen(true);
  };

  // Actual enroll API call
  const enrollInCourse = async (offering) => {
    setConfirmOpen(false);
    setEnrolling(offering.id);
    try {
      // Pass user.id as studentId if required by API
      const res = await studentService.requestCourseEnrollment(offering.id);
      if (res && res.success) {
        showToast("success", "Enrollment Requested", "Your enrollment request has been submitted.");
        // Optimistically update local state for immediate UI feedback
        setAvailableOfferings((prev) => prev.map(o =>
          o.id === offering.id
            ? {
                ...o,
                enrollments: [
                  ...(Array.isArray(o.enrollments) ? o.enrollments : []),
                  {
                    id: res.data?.enrollmentId || 'pending',
                    status: 'pending',
                    student: { user: { id: user?.id } }
                  }
                ]
              }
            : o
        ));
      } else {
        showToast("error", "Failed", `Could not request enrollment. ${res && res.message ? res.message : ''}`);
      }
    } catch (err) {
      showToast("error", "Error", err?.response?.data?.message || err?.message || "Failed to request enrollment.");
    } finally {
      setEnrolling(null);
    }
  };

  // Actual drop API call
  const dropCourse = async (offering, enrollment) => {
    setConfirmOpen(false);
    setEnrolling(offering.id);
    try {
      // There is no drop API in your service, so just show a toast for now
      showToast("success", "Drop Requested", "Please contact admin to drop this course.");
      // If you add a drop API, call it here and refresh
      // setRefreshFlag((f) => !f);
    } catch (err) {
      showToast("error", "Error", "Failed to drop course.");
    } finally {
      setEnrolling(null);
    }
  };


  // Filtered offerings
  const filteredOfferings = availableOfferings.filter((offering) => {
    if (filterMode !== "all" && offering.mode !== filterMode) return false;
    if (filterSemester !== "all" && offering.semester.name !== filterSemester) return false;
    if (
      searchTerm &&
      !(
        offering.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offering.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const uniqueSemesters = [
    ...new Set(availableOfferings.map((o) => o.semester.name)),
  ];

   if (loading) {
      return (
        <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl mx-auto p-6">
            <LoadingComponent message="Loading your registered courses..." />
          </div>
        </main>
      );
    }

  // For each offering, find if the current user is enrolled (for available tab status)
  const userId = user?.id;
  const offeringsWithStatus = filteredOfferings.map(offering => {
    const myEnrollment = offering.enrollments?.find(
      en => en.student?.user?.id === userId
    );
    let status = 'not_enrolled';
    if (myEnrollment) status = myEnrollment.status;
    // Optionally, keep debug logs if needed
    // console.log('Enrollment Status:', status);
    // console.log('My Enrollment:', myEnrollment);
    const isRequested = myEnrollment && myEnrollment.status === 'pending';
    return { ...offering, myEnrollment, status, isRequested };
  });

  // My enrollments (for enrolled tab) - use enrolledCourses API directly
  const myEnrollments = Array.isArray(enrolledCourses) ? enrolledCourses : [];

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-8">
        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={confirmCallback}
          onCancel={() => setConfirmOpen(false)}
        />
        {/* Header */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Course Registration</h1>
            <p className="text-blue-100 mt-2">Browse and enroll in available courses for the current semester</p>
          </div>
          <div className="hidden md:block">
            <BookOpen size={48} className="text-blue-200" />
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'available'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Available Courses ({offeringsWithStatus.length})
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'enrolled'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                My Enrollments ({myEnrollments.length})
              </button>
            </div>
          </div>
          {/* Search and Filters */}
          {activeTab === 'available' && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by course code or name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>
              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Modes</option>
                      <option value="lecture">Lecture</option>
                      <option value="lab">Lab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Semesters</option>
                      {uniqueSemesters.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Courses Tab */}
        {activeTab === 'available' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {offeringsWithStatus.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl shadow-xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterMode !== 'all' || filterSemester !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No course offerings are available at the moment'}
                </p>
              </div>
            ) : (
              offeringsWithStatus.map((offering) => (
                <div key={offering.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="p-6">
                    {/* Course Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {offering.subject.code}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                            {offering.mode}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{offering.subject.name}</h3>
                      </div>
                      {offering.status === 'active' && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    {/* Course Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">
                          {offering.lecturer.user.firstName} {offering.lecturer.user.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{offering.semester.name} - {offering.year}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">{offering.subject.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {/* Only count active enrollments */}
                          {offering.enrollments?.filter(e => e.status === 'active').length || 0} / {offering.capacity} enrolled
                        </span>
                      </div>
                    </div>
                    {/* Capacity Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round(((offering.enrollments?.filter(e => e.status === 'active').length || 0) / offering.capacity) * 100)}% full</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${(offering.enrollments?.filter(e => e.status === 'active').length || 0) >= offering.capacity
                              ? 'bg-red-500'
                              : (offering.enrollments?.filter(e => e.status === 'active').length || 0) / offering.capacity > 0.8
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(((offering.enrollments?.filter(e => e.status === 'active').length || 0) / offering.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {/* Enroll Button or Requested */}
                    {offering.status === 'active' ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-lg font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Enrolled
                        <button
                          className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                          onClick={() => handleDrop(offering, offering.myEnrollment)}
                          disabled={enrolling === offering.id}
                        >
                          Drop
                        </button>
                      </div>
                    ) : offering.isRequested ? (
                      <button
                        className="w-full py-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium cursor-not-allowed opacity-70 flex items-center justify-center gap-2"
                        disabled
                      >
                        <CheckCircle className="w-5 h-5" />
                        Requested
                      </button>
                    ) : (offering.enrollments?.length || 0) >= offering.capacity ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-lg font-medium">
                        <XCircle className="w-5 h-5" />
                        Course Full
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnroll(offering)}
                        disabled={enrolling === offering.id}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {enrolling === offering.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Enrollments Tab */}
        {activeTab === 'enrolled' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {myEnrollments.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrollments yet</h3>
                <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Available Courses
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lecturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myEnrollments.map((course) => {
                      const enrollment = (course.enrollments && course.enrollments[0]) || null;
                      if (!enrollment) return null;
                      return (
                        <tr key={enrollment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {course.subject.code}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.subject.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.lecturer.user.firstName} {course.lecturer.user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.semester.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.subject.credits}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${enrollment.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : enrollment.status === 'dropped'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {enrollment.status === 'active' && (
                              <button
                                onClick={() => handleDrop(course, enrollment)}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Drop Course
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enrollment is subject to availability and prerequisite requirements</li>
                <li>• You can drop courses within the add/drop period without penalty</li>
                <li>• Make sure to attend the first class session of enrolled courses</li>
                <li>• Contact your academic advisor if you have questions about course selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>);
}