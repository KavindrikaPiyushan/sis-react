import React, { useState, useEffect } from 'react';
import { AlertCircle, BookOpen, X, Hash, Calendar, Users, User, Edit, Trash2, Plus, Eye, Search } from 'lucide-react';
import { AdministrationService } from '../../services/super-admin/administationService';
import { showToast } from "../../pages/utils/showToast.jsx";

export default function CreateCourseOffering({ showConfirm }) {
  const [formData, setFormData] = useState({
    subjectId: '',
    semesterId: '',
    batchId: '',
    lecturerId: '',
    year: new Date().getFullYear(),
    mode: 'lecture',
    capacity: 100
  });

  const [courseOfferings, setCourseOfferings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]); // All semesters for table display
  const [formSemesters, setFormSemesters] = useState([]); // Filtered semesters for form dropdown
  const [batches, setBatches] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingOffering, setEditingOffering] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Subject search functionality
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (subjectSearch) {
      const filtered = subjects.filter(subject =>
        subject.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [subjectSearch, subjects]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offeringsData, subjectsData, batchesData, lecturersData, allSemestersData] = await Promise.all([
        AdministrationService.fetchAllCourseOfferings(),
        AdministrationService.fetchAllSubjects(),
        AdministrationService.fetchAllBatches(),
        AdministrationService.fetchAllLecturers(),
        AdministrationService.fetchAllSemesters() // Load all semesters for display purposes
      ]);
      
      setCourseOfferings(offeringsData || []);
      setSubjects(subjectsData || []);
      setFilteredSubjects(subjectsData || []);
      setBatches(batchesData || []);
      // Keep all semesters for display in table, but form will load semesters dynamically
      setSemesters(allSemestersData || []);
      // Lecturers data is now properly extracted by the API service
      setLecturers(Array.isArray(lecturersData) ? lecturersData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Error', 'Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Fetch semesters when batch changes (for the form dropdown)
    if (name === 'batchId') {
      setFormData(prev => ({ ...prev, semesterId: '' }));
      if (value) {
        try {
          const semestersData = await AdministrationService.fetchSemestersByBatchId(value);
          // Update a separate state for form semesters
          setFormSemesters(semestersData || []);
        } catch (error) {
          console.error('Error fetching semesters for batch:', error);
          showToast('error', 'Error', 'Failed to load semesters for selected batch.');
          setFormSemesters([]);
        }
      } else {
        setFormSemesters([]);
      }
    }
  };

  const handleSubjectSelect = (subject) => {
    setFormData(prev => ({ ...prev, subjectId: subject.id }));
    setSubjectSearch(`${subject.code} - ${subject.name}`);
    setShowSubjectDropdown(false);
    if (errors.subjectId) {
      setErrors(prev => ({ ...prev, subjectId: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject is required';
    }

    if (!formData.semesterId) {
      newErrors.semesterId = 'Semester is required';
    }

    if (!formData.batchId) {
      newErrors.batchId = 'Batch is required';
    }

    if (!formData.lecturerId) {
      newErrors.lecturerId = 'Lecturer is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const offeringData = {
        subjectId: formData.subjectId,
        semesterId: formData.semesterId,
        batchId: formData.batchId,
        lecturerId: formData.lecturerId,
        year: parseInt(formData.year),
        mode: formData.mode,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (editingOffering) {
        console.log('Updating course offering:', offeringData);
        const response = await AdministrationService.updateCourseOffering(editingOffering.id, offeringData);
        console.log('Update response:', response);
        showToast('success', 'Success', 'Course Offering updated successfully!');
      } else {
        console.log('Creating course offering:', offeringData);
        const response = await AdministrationService.createCourseOffering(offeringData);
        console.log('Create response:', response);
        showToast('success', 'Success', 'Course Offering created successfully!');
      }

      // Reset form
      setFormData({
        subjectId: '',
        semesterId: '',
        batchId: '',
        lecturerId: '',
        year: new Date().getFullYear(),
        mode: 'lecture',
        capacity: 100
      });
      setSubjectSearch('');
      setShowForm(false);
      setEditingOffering(null);
      setErrors({});
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error saving course offering:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save course offering. Please try again.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      subjectId: '',
      semesterId: '',
      batchId: '',
      lecturerId: '',
      year: new Date().getFullYear(),
      mode: 'lecture',
      capacity: 100
    });
    setSubjectSearch('');
    setShowForm(false);
    setErrors({});
    setEditingOffering(null);
  };

  const handleEdit = async (offering) => {
    // Load semesters for the selected batch FIRST
    if (offering.batchId) {
      try {
        const semestersData = await AdministrationService.fetchSemestersByBatchId(offering.batchId);
        setFormSemesters(semestersData || []);
      } catch (error) {
        console.error('Error fetching semesters for batch:', error);
        showToast('error', 'Error', 'Failed to load semesters for the batch.');
        setFormSemesters([]);
      }
    }
    
    // THEN set the form data after semesters are loaded
    setFormData({
      subjectId: offering.subjectId || '',
      semesterId: offering.semesterId || '',
      batchId: offering.batchId || '',
      lecturerId: offering.lecturer?.user?.id || '',
      year: offering.year ? offering.year.toString() : new Date().getFullYear().toString(),
      mode: offering.mode || 'lecture',
      capacity: offering.capacity ? offering.capacity.toString() : '100'
    });
    
    // Set subject search display
    const subject = subjects.find(s => s.id === offering.subjectId);
    if (subject) {
      setSubjectSearch(`${subject.code} - ${subject.name}`);
    }
    
    setEditingOffering(offering);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (offeringId, offeringName) => {
    const performDelete = async () => {
      try {
        console.log('Attempting to delete course offering:', offeringId);
        const response = await AdministrationService.deleteCourseOffering(offeringId);
        console.log('Delete response:', response);
        showToast('success', 'Success', `Course Offering "${offeringName}" deleted successfully!`);
        await loadData();
      } catch (error) {
        console.error('Error deleting course offering:', error);
        showToast('error', 'Error', 'Failed to delete course offering. Please try again.');
      }
    };

    if (showConfirm) {
      showConfirm(
        'Delete Course Offering',
        `Are you sure you want to delete the course offering "${offeringName}"? This action cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if showConfirm is not available
      if (window.confirm(`Are you sure you want to delete the course offering "${offeringName}"? This action cannot be undone.`)) {
        await performDelete();
      }
    }
  };

  // Helper functions to get names
  const getSubjectName = (subjectId) => {
    if (!Array.isArray(subjects) || !subjectId) return 'Unknown Subject';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.name}` : 'Unknown Subject';
  };

  const getSemesterName = (semesterId) => {
    if (!Array.isArray(semesters) || !semesterId) return 'Unknown Semester';
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.name : 'Unknown Semester';
  };

  const getBatchName = (batchId) => {
    if (!Array.isArray(batches) || !batchId) return 'Unknown Batch';
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };

  const getLecturerName = (lecturerId) => {
    if (!Array.isArray(lecturers) || !lecturerId) return 'Unknown Lecturer';
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown Lecturer';
  };

  // Use formSemesters for the form dropdown, semesters for table display
  const filteredSemesters = Array.isArray(formSemesters) ? formSemesters : [];

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8" />
                  Course Offering Management
                </h1>
                <p className="text-blue-100 mt-2">Create and manage course offerings for semesters</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                {showForm ? <Eye className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showForm ? 'View Offerings' : 'Add New Offering'}
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                {editingOffering ? 'Edit Course Offering' : 'Create New Course Offering'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Search */}
                <div className="md:col-span-2">
                  <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => {
                        setSubjectSearch(e.target.value);
                        setShowSubjectDropdown(true);
                      }}
                      onFocus={() => setShowSubjectDropdown(true)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.subjectId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Search by subject code or name..."
                    />
                    
                    {showSubjectDropdown && filteredSubjects.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSubjects.map((subject) => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => handleSubjectSelect(subject)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{subject.code}</div>
                            <div className="text-sm text-gray-600">{subject.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{subject.credits} Credits</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.subjectId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subjectId}
                    </p>
                  )}
                </div>

                {/* Batch */}
                <div>
                  <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="batchId"
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.batchId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Batch</option>
                      {Array.isArray(batches) && batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.batchId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.batchId}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="semesterId"
                      name="semesterId"
                      value={formData.semesterId}
                      onChange={handleInputChange}
                      disabled={!formData.batchId}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.semesterId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Semester</option>
                      {filteredSemesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.semesterId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.semesterId}
                    </p>
                  )}
                  {!formData.batchId && (
                    <p className="mt-2 text-sm text-gray-500">Please select a batch first</p>
                  )}
                </div>

                {/* Lecturer */}
                <div>
                  <label htmlFor="lecturerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Lecturer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="lecturerId"
                      name="lecturerId"
                      value={formData.lecturerId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lecturerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Lecturer</option>
                      {Array.isArray(lecturers) && lecturers.map((lecturer) => (
                        <option key={lecturer.id} value={lecturer.id}>
                          {lecturer.firstName} {lecturer.lastName} - {lecturer.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.lecturerId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lecturerId}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2020"
                      max="2030"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter year..."
                    />
                  </div>
                  {errors.year && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.year}
                    </p>
                  )}
                </div>

                {/* Mode */}
                <div>
                  <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="mode"
                      name="mode"
                      value={formData.mode}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="lecture">Lecture</option>
                      <option value="lab">Lab</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (Optional)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.capacity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter capacity..."
                    />
                  </div>
                  {errors.capacity && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.capacity}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingOffering ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      {editingOffering ? 'Update Offering' : 'Create Offering'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Course Offerings List */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200 px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Course Offerings ({courseOfferings.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lecturer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!Array.isArray(courseOfferings) || courseOfferings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg">No course offerings found</p>
                        <p className="text-sm">Create your first course offering to get started</p>
                      </td>
                    </tr>
                  ) : (
                    courseOfferings.map((offering) => (
                      <tr key={offering.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{getSubjectName(offering.subjectId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getBatchName(offering.batchId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getSemesterName(offering.semesterId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getLecturerName(offering.lecturer?.user?.id)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {offering.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                            {offering.mode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{offering.capacity || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(offering)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit offering"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(offering.id, getSubjectName(offering.subjectId))}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete offering"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}