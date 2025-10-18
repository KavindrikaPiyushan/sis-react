import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, X, Calendar, GraduationCap, Building2, Edit, Trash2, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdministrationService } from '../../services/super-admin/administationService';
import LoadingComponent from '../../components/LoadingComponent';
import { showToast } from "../../pages/utils/showToast.jsx";

export default function CreateBatch({ showConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    programId: '',
    startYear: new Date().getFullYear()
  });

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [serverPage, setServerPage] = useState(1);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
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

  const computedDisableNext = (pageArg, totalPagesArg, hasMoreFlag) => {
    if (totalPagesArg && totalPagesArg > 0) {
      return pageArg >= totalPagesArg;
    }
    return !hasMoreFlag;
  };
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsData, batchesResp] = await Promise.all([
        AdministrationService.fetchAllDegreePrograms(),
        AdministrationService.fetchAllBatches({ page, limit: itemsPerPage })
      ]);

      // Normalize programs list (service may return different shapes)
      const programsList = Array.isArray(programsData)
        ? programsData
        : Array.isArray(programsData?.data)
          ? programsData.data
          : Array.isArray(programsData?.data?.data)
            ? programsData.data.data
            : [];

      // batchesResp is expected to be an object { success, data: [...], meta: { total, totalPages, page, perPage } }
      const batchesList = Array.isArray(batchesResp)
        ? batchesResp
        : Array.isArray(batchesResp?.data)
          ? batchesResp.data
          : Array.isArray(batchesResp?.data?.data)
            ? batchesResp.data.data
            : [];

      setPrograms(programsList);
      setBatches(batchesList);

      // Extract meta information robustly (support different API shapes)
      const meta = batchesResp?.meta || batchesResp?.data?.meta || batchesResp?.data?.pagination || batchesResp?.pagination || null;

      let total = null;
      let computedTotalPages = null;

      if (meta) {
        if (meta.total !== undefined) total = Number(meta.total);
        else if (meta.totalCount !== undefined) total = Number(meta.totalCount);

        if (meta.totalPages !== undefined) computedTotalPages = Number(meta.totalPages);
        else if (meta.pages !== undefined) computedTotalPages = Number(meta.pages);
      }

      if (total === null) {
        if (batchesResp && batchesResp.total !== undefined) total = Number(batchesResp.total);
        else if (batchesResp && batchesResp.count !== undefined) total = Number(batchesResp.count);
      }

      if (total !== null) setTotalCount(total);
      if (computedTotalPages !== null) setTotalPages(computedTotalPages);

      // serverPage detection
      if (meta && meta.currentPage !== undefined) setServerPage(Number(meta.currentPage));
      else if (batchesResp && batchesResp.currentPage !== undefined) setServerPage(Number(batchesResp.currentPage));
      else setServerPage(page);

      if (computedTotalPages !== null) {
        setHasMore(page < computedTotalPages);
      } else {
        const inferredHasMore = Array.isArray(batchesList) && batchesList.length === itemsPerPage;
        setHasMore(inferredHasMore);
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
      [name]: name === 'startYear' ? parseInt(value) || '' : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Batch name must be at least 3 characters';
    }

    if (!formData.programId) {
      newErrors.programId = 'Degree program is required';
    }

    if (!formData.startYear) {
      newErrors.startYear = 'Start year is required';
    } else if (formData.startYear < 2000 || formData.startYear > 2050) {
      newErrors.startYear = 'Start year must be between 2000 and 2050';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingBatch) {
        await AdministrationService.updateBatch(editingBatch.id, formData);
        showToast('success', 'Success', `Batch "${formData.name}" updated successfully!`);
      } else {
        await AdministrationService.createBatch(formData);
        showToast('success', 'Success', `Batch "${formData.name}" created successfully!`);
      }
      
      // Reload data
      await loadData();
      
      // Reset form
      setTimeout(() => {
        handleReset();
        setShowForm(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving batch:', error);
      showToast('error', 'Error', editingBatch ? 'Failed to update batch. Please try again.' : 'Failed to create batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      programId: '',
      startYear: new Date().getFullYear()
    });
    setErrors({});
    setEditingBatch(null);
  };

  const handleEdit = (batch) => {
    setFormData({
      name: batch.name,
      programId: batch.programId,
      startYear: batch.startYear
    });
    setEditingBatch(batch);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (batchId, batchName) => {
    const performDelete = async () => {
      try {
        console.log('Attempting to delete batch:', batchId);
        const response = await AdministrationService.deleteBatch(batchId);
        console.log('Delete response:', response);
        // HTTP 204 No Content is a successful delete response
        // The response.data might be undefined/empty, which is normal for 204
        showToast('success', 'Success', `Batch "${batchName}" deleted successfully!`);
        await loadData();
      } catch (error) {
        // Only show error if there's an actual HTTP error (4xx, 5xx)
        console.error('Error deleting batch:', error);
        showToast('error', 'Error', error.message || 'Failed to delete batch. Please try again.');
      }
    };

    if (showConfirm) {
      showConfirm(
        'Delete Batch',
        `Are you sure you want to delete the batch "${batchName}"? This action cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if showConfirm is not available
      if (window.confirm(`Are you sure you want to delete the batch "${batchName}"? This action cannot be undone.`)) {
        await performDelete();
      }
    }
  };

  const generateBatchName = () => {
    if (formData.programId && formData.startYear) {
      const program = programs.find(p => p.id === formData.programId);
      if (program) {
        const programAbbr = program.name.split(' ')
          .filter(word => word.match(/^[A-Z]/))
          .map(word => word[0])
          .join('');
        return `${programAbbr} Batch ${formData.startYear}`;
      }
    }
    return '';
  };

  const handleAutoGenerateName = () => {
    const generatedName = generateBatchName();
    if (generatedName) {
      setFormData(prev => ({ ...prev, name: generatedName }));
      if (errors.name) {
        setErrors(prev => ({ ...prev, name: '' }));
      }
    }
  };

  const selectedProgram = programs.find(p => p.id === formData.programId);

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 5; year++) {
    yearOptions.push(year);
  }

  // Render loading inside the table so header and controls remain visible

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Batch Management
                </h1>
                <p className="text-purple-100 mt-2">Manage student batches and degree programs</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {showForm ? 'Cancel' : 'Add New Batch'}
              </button>
            </div>
          </div>

          {/* Batch Form */}
          {showForm && (
            <div className="p-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <GraduationCap className="w-4 h-4" />
                    Degree Program *
                  </label>
                  <select
                    name="programId"
                    value={formData.programId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.programId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a degree program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.duration} years)
                      </option>
                    ))}
                  </select>
                  {errors.programId && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.programId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="w-4 h-4" />
                    Start Year *
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, startYear: year }));
                          if (errors.startYear) {
                            setErrors(prev => ({ ...prev, startYear: '' }));
                          }
                        }}
                        className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                          formData.startYear === year
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  {errors.startYear && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startYear}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Batch Name *
                    </span>
                    {formData.programId && formData.startYear && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateName}
                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        Auto Generate
                      </button>
                    )}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Batch 2024, CS Batch 2024/2025"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                  {generateBatchName() && formData.name !== generateBatchName() && (
                    <p className="text-xs text-gray-500">
                      Suggestion: {generateBatchName()}
                    </p>
                  )}
                </div>

                {selectedProgram && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Batch Summary</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Program</p>
                          <p className="font-medium text-gray-900">{selectedProgram.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Duration</p>
                          <p className="font-medium text-gray-900">{selectedProgram.duration} years</p>
                        </div>
                      </div>
                      {formData.name && (
                        <div className="pt-3 border-t border-purple-200">
                          <p className="text-gray-600 mb-1">Batch Name</p>
                          <p className="font-medium text-gray-900">{formData.name}</p>
                        </div>
                      )}
                      {formData.startYear && (
                        <div>
                          <p className="text-gray-600 mb-1">Expected Graduation</p>
                          <p className="font-medium text-gray-900">
                            {formData.startYear + selectedProgram.duration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (editingBatch ? 'Updating...' : 'Creating...') : (editingBatch ? 'Update Batch' : 'Create Batch')}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batches List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="w-6 h-6" />
              All Batches ({totalCount})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Degree Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Graduation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="max-w-sm mx-auto">
                        <LoadingComponent message="Loading batches..." />
                      </div>
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No batches found</p>
                      <p className="text-sm">Create your first batch to get started</p>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const program = programs.find(p => p.id === batch.programId);
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{batch.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{program?.name || 'Unknown Program'}</div>
                          <div className="text-sm text-gray-500">{program?.duration} years</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {batch.startYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {program ? batch.startYear + program.duration : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(batch)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                              title="Edit batch"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(batch.id, batch.name)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls (consistent with DegreeProgrameCreation) */}
          {!loading && (totalPages > 1 || hasMore) && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-gray-600">
                {(() => {
                  const effectiveTotal = totalCount > 0 ? totalCount : (Array.isArray(batches) ? batches.length : 0);
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
      </div>
    </main>
  );
}