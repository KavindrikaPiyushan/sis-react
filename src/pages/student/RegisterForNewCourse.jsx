
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/AuthContext';
import { BookOpen, Search, Filter, CheckCircle, XCircle, Users, Calendar, User, Info } from 'lucide-react';
import studentService from '../../services/student/studentService';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../utils/ConfirmDialog';
import LoadingComponent from '../../components/LoadingComponent';
import { RiFileEditFill } from "react-icons/ri";
import HeaderBar from '../../components/HeaderBar';

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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
              enrollment: {
                id: res.data?.enrollmentId || 'pending',
                status: 'pending'
              }
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
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-7xl mx-auto p-3 sm:p-6">
          <LoadingComponent message="Loading your registered courses..." />
        </div>
      </main>
    );
  }

  // For each offering, find if the current user is enrolled (for available tab status)
  const userId = user?.id;
  const offeringsWithStatus = filteredOfferings.map(offering => {
    // Use the new 'enrollment' object to determine status
    let status = 'not_enrolled';
    let isRequested = false;
    if (offering.enrollment) {
      if (offering.enrollment.status === 'pending') {
        status = 'pending';
        isRequested = true;
      } else if (offering.enrollment.status === 'active') {
        status = 'active';
      }
    }
    return { ...offering, status, isRequested };
  });

  // My enrollments (for enrolled tab) - use enrolledCourses API directly
  const myEnrollments = Array.isArray(enrolledCourses) ? enrolledCourses : [];

  return (
    <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={confirmCallback}
          onCancel={() => setConfirmOpen(false)}
        />
        {/* Header */}

        <HeaderBar
          title="Course Registration"
          subtitle="Browse and enroll in available courses for the current semester"
          Icon={RiFileEditFill}
        />
        {/* Tabs */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base ${activeTab === 'available'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="hidden sm:inline">Available Courses ({offeringsWithStatus.length})</span>
                <span className="sm:hidden">Available ({offeringsWithStatus.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base ${activeTab === 'enrolled'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="hidden sm:inline">My Enrollments ({myEnrollments.length})</span>
                <span className="sm:hidden">Enrolled ({myEnrollments.length})</span>
              </button>
            </div>
          </div>
          {/* Search and Filters */}
          {activeTab === 'available' && (
            <div className="p-3 sm:p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by course code or name..."
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </button>
              </div>
              {/* Filter Options */}
              {showFilters && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      value={filterMode}
                      onChange={(e) => setFilterMode(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {offeringsWithStatus.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl p-8 sm:p-12 text-center">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-sm sm:text-base text-gray-500">
                  {searchTerm || filterMode !== 'all' || filterSemester !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No course offerings are available at the moment'}
                </p>
              </div>
            ) : (
              offeringsWithStatus.map((offering) => (
                <div key={offering.id} className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="p-4 sm:p-6">
                    {/* Course Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800">
                            {offering.subject.code}
                          </span>
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 capitalize">
                            {offering.mode}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{offering.subject.name}</h3>
                      </div>
                      {offering.status === 'active' && (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    {/* Course Details */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">
                          {offering.lecturer.user.firstName} {offering.lecturer.user.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{offering.semester.name} - {offering.year}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{offering.subject.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {offering.enrollmentsCount || 0} / {offering.capacity} enrolled
                        </span>
                      </div>
                    </div>
                    {/* Capacity Bar */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round(((offering.enrollmentsCount || 0) / offering.capacity) * 100)}% full</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${(offering.enrollmentsCount || 0) >= offering.capacity
                            ? 'bg-red-500'
                            : (offering.enrollmentsCount || 0) / offering.capacity > 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(((offering.enrollmentsCount || 0) / offering.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {/* Enroll Button or Requested */}
                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      {offering.status === 'active' ? (
                        <div className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-green-50 text-green-700 rounded-lg font-medium text-sm sm:text-base">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          Enrolled
                          {/* Drop not supported with new API, so just disable */}
                        </div>
                      ) : offering.isRequested ? (
                        <button
                          className="w-full py-2 sm:py-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium cursor-not-allowed opacity-70 flex items-center justify-center gap-2 text-sm sm:text-base"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          Requested
                        </button>
                      ) : (offering.enrollmentsCount || 0) >= offering.capacity ? (
                        <div className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-red-50 text-red-700 rounded-lg font-medium text-sm sm:text-base">
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          Course Full
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(offering)}
                          disabled={enrolling === offering.id}
                          className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95 transition-transform"
                        >
                          {enrolling === offering.id ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                              Enroll Now
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* My Enrollments Tab */}
        {activeTab === 'enrolled' && (
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            {myEnrollments.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No enrollments yet</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">You haven't enrolled in any courses yet</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Browse Available Courses
                </button>
              </div>
            ) : (
              <div>
                {/* Mobile Card Layout */}
                <div className="block lg:hidden">
                  <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {myEnrollments.map((course) => {
                      // Use the same status logic as desktop table
                      let statusLabel = 'Active';
                      let statusClass = 'bg-green-100 text-green-800';
                      if (course.enrollment) {
                        if (course.enrollment.status === 'pending') {
                          statusLabel = 'Pending';
                          statusClass = 'bg-yellow-100 text-yellow-800';
                        } else if (course.enrollment.status === 'active') {
                          statusLabel = 'Active';
                          statusClass = 'bg-green-100 text-green-800';
                        }
                      }
                      
                      return (
                        <div key={course.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {course.subject?.name || 'N/A'}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {course.subject?.code || 'N/A'}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {course.lecturer?.user?.firstName || ''} {course.lecturer?.user?.lastName || ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{course.semester?.name || 'N/A'} - {course.year || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{course.subject?.credits || 'N/A'} Credits</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden lg:block overflow-x-auto">
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
                        Enrollments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myEnrollments.map((course) => {
                      // Use the new 'enrollment' object for status
                      let statusLabel = '-';
                      let statusClass = 'bg-gray-100 text-gray-800';
                      if (course.enrollment) {
                        if (course.enrollment.status === 'pending') {
                          statusLabel = 'Pending';
                          statusClass = 'bg-yellow-100 text-yellow-800';
                        } else if (course.enrollment.status === 'active') {
                          statusLabel = 'Active';
                          statusClass = 'bg-green-100 text-green-800';
                        }
                      }
                      return (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {course.subject?.code || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.subject?.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.lecturer?.user?.firstName || ''} {course.lecturer?.user?.lastName || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.semester?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.subject?.credits || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {course.enrollmentsCount || 0} / {course.capacity || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {typeof course.averageAttendanceRate === 'number' ? `${course.averageAttendanceRate}%` : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {/* <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-2xl p-4 sm:p-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Important Information</h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Enrollment is subject to availability and prerequisite requirements</li>
                <li>• You can drop courses within the add/drop period without penalty</li>
                <li>• Make sure to attend the first class session of enrolled courses</li>
                <li>• Contact your academic advisor if you have questions about course selection</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </main>
  );
}