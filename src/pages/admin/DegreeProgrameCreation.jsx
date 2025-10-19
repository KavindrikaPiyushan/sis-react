import React, { useState, useEffect } from 'react';
import { AlertCircle, GraduationCap, X, Hash, FileText, Edit, Trash2, Plus, Eye, School, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import HeaderBar from '../../components/HeaderBar';
import LoadingComponent from '../../components/LoadingComponent';
import { AdministrationService } from '../../services/super-admin/administationService';
import { showToast } from "../../pages/utils/showToast.jsx";

export default function DegreeProgrameCreation({ showConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    facultyId: '',
    departmentId: '',
    minCreditsToGraduate: '',
    minCGPARequired: '',
    honorsCriteria: ''
  });

  const [degreePrograms, setDegreePrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [serverPage, setServerPage] = useState(1);
  // HeaderBar provides consistent header and timestamp
  const currentDateTime = new Date(); // Use current date/time directly

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    // if we don't have a reliable totalPages but there may be more, allow one extra page
    const effectiveTotalPages = Math.max(totalPages, page + (hasMore ? 1 : 0));
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(effectiveTotalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            page === i
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const computedDisableNext = (page, totalPages, hasMoreFlag) => {
    if (totalPages && totalPages > 0) {
      return page >= totalPages;
    }
    // If totalPages unknown, disable next when hasMore is false
    return !hasMoreFlag;
  };

  useEffect(() => {
    console.log("TotalCount:", totalCount);
  },[totalCount, totalPages, degreePrograms.length])

  useEffect(() => {
    loadData();
  }, [page, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch programs with pagination and other reference data in parallel
      const [programsResp, facultiesData, departmentsData] = await Promise.all([
        AdministrationService.fetchAllDegreePrograms({ page, limit: itemsPerPage }),
        AdministrationService.fetchAllFaculties(),
        AdministrationService.fetchAllDepartments()
      ]);

      // Normalize programs response: support array or object with data/items and meta
      let items = [];
      let meta = null;

      if (Array.isArray(programsResp)) {
        items = programsResp;
      } else if (programsResp && Array.isArray(programsResp.data)) {
        items = programsResp.data;
        meta = programsResp.meta || programsResp.pagination || programsResp.paging || null;
      } else if (programsResp && Array.isArray(programsResp.items)) {
        items = programsResp.items;
        meta = programsResp.meta || programsResp.pagination || null;
      } else if (programsResp && programsResp.success && Array.isArray(programsResp.data)) {
        items = programsResp.data;
        meta = programsResp.meta || null;
      } else if (programsResp && programsResp.data && Array.isArray(programsResp.data.items)) {
        items = programsResp.data.items;
        meta = programsResp.data.meta || programsResp.meta || null;
      } else if (programsResp && programsResp.items && Array.isArray(programsResp.items)) {
        items = programsResp.items;
        meta = programsResp.meta || null;
      } else {
        // fallback: try to use the response as an array-like
        items = programsResp || [];
        if (!Array.isArray(items)) items = [];
      }

      setDegreePrograms(items);
      setFaculties(facultiesData || []);
      setDepartments(departmentsData || []);

      // Determine total count and total pages (support meta.totalCount, meta.totalPages)
      let total = null;
      let computedTotalPages = null;

      if (meta) {
        if (meta.totalCount !== undefined) total = Number(meta.totalCount);
        else if (meta.total !== undefined) total = Number(meta.total);
        if (meta.totalPages !== undefined) computedTotalPages = Number(meta.totalPages);
        else if (meta.pages !== undefined) computedTotalPages = Number(meta.pages);
      }

      if (total === null) {
        // Check top-level fields too
        if (programsResp && (programsResp.total !== undefined)) total = Number(programsResp.total);
        else if (programsResp && (programsResp.count !== undefined)) total = Number(programsResp.count);
      }

      if (computedTotalPages === null && total !== null) {
        computedTotalPages = Math.max(1, Math.ceil(total / itemsPerPage));
      }

      if (total !== null) setTotalCount(total);
      
      if (computedTotalPages !== null) setTotalPages(computedTotalPages);

      // Set serverPage from meta or response if available, else use local page
      if (meta && meta.currentPage !== undefined) setServerPage(Number(meta.currentPage));
      else if (programsResp && programsResp.currentPage !== undefined) setServerPage(Number(programsResp.currentPage));
      else setServerPage(page);

      // If we have a computedTotalPages use it to set hasMore, otherwise infer from items length
      if (computedTotalPages !== null) {
        setHasMore(page < computedTotalPages);
      } else {
        const inferredHasMore = Array.isArray(items) && items.length === itemsPerPage;
        setHasMore(inferredHasMore);
        // keep totalPages at least current page
        setTotalPages(prev => Math.max(prev, page));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('error', 'Error', 'Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Program name is required';
    }

    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 year';
    }

    if (!formData.facultyId) {
      newErrors.facultyId = 'Faculty is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    if (!formData.minCreditsToGraduate || formData.minCreditsToGraduate < 1) {
      newErrors.minCreditsToGraduate = 'Minimum credits must be at least 1';
    }

    if (!formData.minCGPARequired || formData.minCGPARequired < 0 || formData.minCGPARequired > 4) {
      newErrors.minCGPARequired = 'CGPA must be between 0 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Log the current form data
    console.log('Form data before validation:', formData);
    console.log('FacultyId value:', formData.facultyId, 'Type:', typeof formData.facultyId);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const programData = {
        name: formData.name.trim(),
        duration: parseInt(formData.duration),
        facultyId: formData.facultyId && formData.facultyId !== '' ? formData.facultyId : null,
        departmentId: formData.departmentId && formData.departmentId !== '' ? formData.departmentId : null,
        minCreditsToGraduate: parseInt(formData.minCreditsToGraduate),
        minCGPARequired: parseFloat(formData.minCGPARequired),
        honorsCriteria: formData.honorsCriteria.trim() || null
      };

      console.log('Program data to be sent:', programData);

      if (editingProgram) {
        console.log('Updating degree program:', programData);
        const response = await AdministrationService.updateDegreeProgram(editingProgram.id, programData);
        console.log('Update response:', response);
        showToast('success', 'Success', 'Degree Program updated successfully!');
      } else {
        console.log('Creating degree program:', programData);
        const response = await AdministrationService.createDegreeProgram(programData);
        console.log('Create response:', response);
        showToast('success', 'Success', 'Degree Program created successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        duration: '',
        facultyId: '',
        departmentId: '',
        minCreditsToGraduate: '',
        minCGPARequired: '',
        honorsCriteria: ''
      });
      setShowForm(false);
      setEditingProgram(null);
      setErrors({});
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error saving degree program:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save degree program. Please try again.';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      duration: '',
      facultyId: '',
      departmentId: '',
      minCreditsToGraduate: '',
      minCGPARequired: '',
      honorsCriteria: ''
    });
    setShowForm(false);
    setErrors({});
    setEditingProgram(null);
  };

  const handleEdit = (program) => {
    setFormData({
      name: program.name || '',
      duration: program.duration ? program.duration.toString() : '',
      facultyId: program.facultyId ? program.facultyId.toString() : '',
      departmentId: program.departmentId ? program.departmentId.toString() : '',
      minCreditsToGraduate: program.minCreditsToGraduate ? program.minCreditsToGraduate.toString() : '',
      minCGPARequired: program.minCGPARequired ? program.minCGPARequired.toString() : '',
      honorsCriteria: program.honorsCriteria || ''
    });
    setEditingProgram(program);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (programId, programName) => {
    const performDelete = async () => {
      try {
        console.log('Attempting to delete degree program:', programId);
        const response = await AdministrationService.deleteDegreeProgram(programId);
        console.log('Delete response:', response);
        showToast('success', 'Success', `Degree Program "${programName}" deleted successfully!`);
        await loadData();
      } catch (error) {
        console.error('Error deleting degree program:', error);
        showToast('error', 'Error', 'Failed to delete degree program. Please try again.');
      }
    };

    if (showConfirm) {
      showConfirm(
        'Delete Degree Program',
        `Are you sure you want to delete the degree program "${programName}"? This action cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if showConfirm is not available
      if (window.confirm(`Are you sure you want to delete the degree program "${programName}"? This action cannot be undone.`)) {
        await performDelete();
      }
    }
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'No Department';
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  // Instead of a full-page early return, render the loading UI inside the table
  // so the header and other controls remain visible while data is loading.

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Page Header (styled like student dashboard) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-4 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-white" />
              Degree Program Management
            </h1>
            <p className="text-blue-100 mt-2">Create and manage degree programs for your institution</p>
            <div className="flex items-center mt-4">
              <span className="text-sm text-blue-100">{currentDateTime.toLocaleString()}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <GraduationCap size={48} className="text-white/80" />
          </div>
        </div>

        {/* Action bar: Add/View Program button moved out from header */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
          >
            {showForm ? <Eye className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'View Programs' : 'Add New Program'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                {editingProgram ? 'Edit Degree Program' : 'Create New Degree Program'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter degree program name..."
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Years) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter duration in years..."
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.duration}
                    </p>
                  )}
                </div>

                {/* Faculty */}
                <div>
                  <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="facultyId"
                      name="facultyId"
                      value={formData.facultyId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.facultyId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.facultyId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.facultyId}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.departmentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.departmentId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.departmentId}
                    </p>
                  )}
                </div>

                {/* Min Credits */}
                <div>
                  <label htmlFor="minCreditsToGraduate" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Credits to Graduate <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="minCreditsToGraduate"
                      name="minCreditsToGraduate"
                      value={formData.minCreditsToGraduate}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.minCreditsToGraduate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter minimum credits..."
                    />
                  </div>
                  {errors.minCreditsToGraduate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.minCreditsToGraduate}
                    </p>
                  )}
                </div>

                {/* Min CGPA */}
                <div>
                  <label htmlFor="minCGPARequired" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum CGPA Required <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="minCGPARequired"
                      name="minCGPARequired"
                      value={formData.minCGPARequired}
                      onChange={handleInputChange}
                      min="0"
                      max="4"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.minCGPARequired ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter minimum CGPA..."
                    />
                  </div>
                  {errors.minCGPARequired && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.minCGPARequired}
                    </p>
                  )}
                </div>

                {/* Honors Criteria */}
                <div className="md:col-span-2">
                  <label htmlFor="honorsCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                    Honors Criteria (Optional)
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="honorsCriteria"
                      name="honorsCriteria"
                      value={formData.honorsCriteria}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter honors criteria..."
                    />
                  </div>
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingProgram ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      {editingProgram ? 'Update Program' : 'Create Program'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs List */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-gray-200 px-8 py-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-600" />
                Degree Programs ({degreePrograms.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min CGPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="max-w-sm mx-auto">
                          <LoadingComponent message="Loading degree programs..." />
                        </div>
                      </td>
                    </tr>
                  ) : degreePrograms.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg">No degree programs found</p>
                        <p className="text-sm">Create your first degree program to get started</p>
                      </td>
                    </tr>
                  ) : (
                    degreePrograms.map((program) => (
                      <tr key={program.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{program.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {program.duration} year{program.duration > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getFacultyName(program.facultyId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{getDepartmentName(program.departmentId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{program.minCreditsToGraduate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{program.minCGPARequired}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(program)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                              title="Edit program"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(program.id, program.name)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete program"
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
            {/* Pagination Controls */}
            {!loading && (totalPages > 1 || hasMore) && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {(() => {
                    const effectiveTotal = totalCount > 0 ? totalCount : (Array.isArray(degreePrograms) ? degreePrograms.length : 0);
                    console.log('Effective total:', effectiveTotal, 'TotalCount:', totalCount, 'DegreePrograms length:', degreePrograms.length);
                    const start = effectiveTotal > 0 ? (serverPage - 1) * itemsPerPage + 1 : 0;
                    const end = Math.min(serverPage * itemsPerPage, effectiveTotal);
                    return (
                      <>
                        Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{effectiveTotal}</span> results
                      </>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  {renderPaginationButtons()}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={computedDisableNext(page, totalPages, hasMore)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}