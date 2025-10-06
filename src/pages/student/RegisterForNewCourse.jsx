import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, CheckCircle, XCircle, Clock, Users, Calendar, User, AlertCircle, Info } from 'lucide-react';

// Mock service - replace with your actual service
const StudentService = {
  fetchAvailableCourseOfferings: async () => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        subjectId: 'sub1',
        subject: { code: 'CS101', name: 'Introduction to Programming', credits: 3 },
        semesterId: 'sem1',
        semester: { name: 'Semester 1' },
        batchId: 'batch1',
        batch: { name: 'Batch 2022' },
        lecturer: { firstName: 'John', lastName: 'Doe', email: 'john@uni.lk' },
        year: 2025,
        mode: 'lecture',
        capacity: 100,
        enrolled: 45,
        isEnrolled: false
      }
    ];
  },
  
  fetchMyEnrollments: async () => {
    return [];
  },
  
  enrollInCourse: async (offeringId) => {
    console.log('Enrolling in course:', offeringId);
    return { success: true };
  },
  
  dropCourse: async (enrollmentId) => {
    console.log('Dropping course:', enrollmentId);
    return { success: true };
  }
};

const showToast = (type, title, message) => {
  console.log(`${type}: ${title} - ${message}`);
  alert(`${title}: ${message}`);
};

export default function RegisterForNewCourse() {
  const [availableOfferings, setAvailableOfferings] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offerings, enrollments] = await Promise.all([
        StudentService.fetchAvailableCourseOfferings(),
        StudentService.fetchMyEnrollments()
      ]);
      setAvailableOfferings(offerings || []);
      setMyEnrollments(enrollments || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Error', 'Failed to load course offerings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (offering) => {
    try {
      setEnrolling(offering.id);
      await StudentService.enrollInCourse(offering.id);
      showToast('success', 'Success', `Successfully enrolled in ${offering.subject.code} - ${offering.subject.name}`);
      await loadData();
    } catch (error) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course. Please try again.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  const handleDrop = async (enrollment) => {
    if (window.confirm(`Are you sure you want to drop ${enrollment.courseOffering.subject.code}? This action may affect your academic progress.`)) {
      try {
        await StudentService.dropCourse(enrollment.id);
        showToast('success', 'Success', 'Course dropped successfully');
        await loadData();
      } catch (error) {
        console.error('Error dropping course:', error);
        showToast('error', 'Error', 'Failed to drop course. Please try again.');
      }
    }
  };

  const filteredOfferings = availableOfferings.filter(offering => {
    const matchesSearch = 
      offering.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.lecturer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.lecturer.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMode = filterMode === 'all' || offering.mode === filterMode;
    const matchesSemester = filterSemester === 'all' || offering.semester.name === filterSemester;
    
    return matchesSearch && matchesMode && matchesSemester;
  });

  const uniqueSemesters = [...new Set(availableOfferings.map(o => o.semester.name))];

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading course offerings...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Course Registration
            </h1>
            <p className="text-blue-100 mt-2">Browse and enroll in available courses for the current semester</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'available'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Available Courses ({filteredOfferings.length})
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${
                  activeTab === 'enrolled'
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
                    placeholder="Search by course code, name, or lecturer..."
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
                      <option value="tutorial">Tutorial</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
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
            {filteredOfferings.length === 0 ? (
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
              filteredOfferings.map((offering) => (
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
                      {offering.isEnrolled && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm">
                          {offering.lecturer.firstName} {offering.lecturer.lastName}
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
                          {offering.enrolled} / {offering.capacity} enrolled
                        </span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Enrollment</span>
                        <span>{Math.round((offering.enrolled / offering.capacity) * 100)}% full</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            offering.enrolled >= offering.capacity
                              ? 'bg-red-500'
                              : offering.enrolled / offering.capacity > 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((offering.enrolled / offering.capacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Enroll Button */}
                    {offering.isEnrolled ? (
                      <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-lg font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Already Enrolled
                      </div>
                    ) : offering.enrolled >= offering.capacity ? (
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
                    {myEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                {enrollment.courseOffering.subject.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                {enrollment.courseOffering.subject.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enrollment.courseOffering.lecturer.firstName} {enrollment.courseOffering.lecturer.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enrollment.courseOffering.semester.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {enrollment.courseOffering.subject.credits}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            enrollment.status === 'active'
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
                              onClick={() => handleDrop(enrollment)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Drop Course
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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
    </main>
  );
}