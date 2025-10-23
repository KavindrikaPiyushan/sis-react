import React, { useState, useEffect } from 'react';
import { AlertCircle, BookOpen, X, Hash, FileText, Edit, Trash2, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdministrationService } from '../../services/super-admin/administationService';
import LoadingComponent from '../../components/LoadingComponent';
import HeaderBar from '../../components/HeaderBar';
import { showToast } from "../../pages/utils/showToast.jsx";
import { RiBookMarkedFill } from "react-icons/ri";

export default function CreateSubject({ showConfirm }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    description: ''
  });

  const [subjects, setSubjects] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [serverPage, setServerPage] = useState(1);
  // header timestamp is handled by HeaderBar (centralized)
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsResp = await AdministrationService.fetchAllSubjects({ page, limit: itemsPerPage });

      // normalize list
      const subjectsList = Array.isArray(subjectsResp)
        ? subjectsResp
        : Array.isArray(subjectsResp?.data)
          ? subjectsResp.data
          : Array.isArray(subjectsResp?.data?.data)
            ? subjectsResp.data.data
            : [];

      setSubjects(subjectsList);

      const meta = subjectsResp?.meta || subjectsResp?.data?.meta || subjectsResp?.data?.pagination || subjectsResp?.pagination || null;

      let total = null;
      let computedTotalPages = null;

      if (meta) {
        if (meta.total !== undefined) total = Number(meta.total);
        else if (meta.totalCount !== undefined) total = Number(meta.totalCount);

        if (meta.totalPages !== undefined) computedTotalPages = Number(meta.totalPages);
        else if (meta.pages !== undefined) computedTotalPages = Number(meta.pages);
      }

      if (total === null) {
        if (subjectsResp && subjectsResp.total !== undefined) total = Number(subjectsResp.total);
        else if (subjectsResp && subjectsResp.count !== undefined) total = Number(subjectsResp.count);
      }

      if (total !== null) setTotalCount(total);
      if (computedTotalPages !== null) setTotalPages(computedTotalPages);

      if (meta && meta.currentPage !== undefined) setServerPage(Number(meta.currentPage));
      else if (subjectsResp && subjectsResp.currentPage !== undefined) setServerPage(Number(subjectsResp.currentPage));
      else setServerPage(page);

      if (computedTotalPages !== null) {
        setHasMore(page < computedTotalPages);
      } else {
        const inferredHasMore = Array.isArray(subjectsList) && subjectsList.length === itemsPerPage;
        setHasMore(inferredHasMore);
        setTotalPages(prev => Math.max(prev, page));
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      showToast('error', 'Error', 'Failed to load subjects. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || '' : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'Subject code must be at least 2 characters';
    } else if (!/^[A-Z0-9\-_]+$/i.test(formData.code.trim())) {
      newErrors.code = 'Subject code can only contain letters, numbers, hyphens and underscores';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Subject name must be at least 3 characters';
    }

    if (!formData.credits || formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Credits must be between 1 and 10';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
      if (editingSubject) {
        await AdministrationService.updateSubject(editingSubject.id, formData);
        showToast('success', 'Success', `Subject "${formData.name}" updated successfully!`);
      } else {
        await AdministrationService.createSubject(formData);
        showToast('success', 'Success', `Subject "${formData.name}" created successfully!`);
      }
      
      // Reload data
      await loadData();
      
      // Reset form
      setTimeout(() => {
        handleReset();
        setShowForm(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving subject:', error);
      showToast('error', 'Error', editingSubject ? 'Failed to update subject. Please try again.' : 'Failed to create subject. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code: '',
      name: '',
      credits: 3,
      description: ''
    });
    setErrors({});
    setEditingSubject(null);
  };

  const handleEdit = (subject) => {
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      description: subject.description || ''
    });
    setEditingSubject(subject);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (subjectId, subjectName) => {
    const performDelete = async () => {
      try {
        console.log('Attempting to delete subject:', subjectId);
        const response = await AdministrationService.deleteSubject(subjectId);
        console.log('Delete response:', response);
        showToast('success', 'Success', `Subject "${subjectName}" deleted successfully!`);
        await loadData();
      } catch (error) {
        console.error('Error deleting subject:', error);
        showToast('error', 'Error', 'Failed to delete subject. Please try again.');
      }
    };

    if (showConfirm) {
      showConfirm(
        'Delete Subject',
        `Are you sure you want to delete the subject "${subjectName}"? This action cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if showConfirm is not available
      if (window.confirm(`Are you sure you want to delete the subject "${subjectName}"? This action cannot be undone.`)) {
        await performDelete();
      }
    }
  };

  // Render loading inside the table so header and controls remain visible

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className=" mx-auto p-8">
        {/* Page Header (shared) */}
        <HeaderBar
          title="Subject Management"
          subtitle="Manage academic subjects and their details"
          Icon={RiBookMarkedFill}
        />

        {/* Action bar: Add New Subject button moved out from header */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add New Subject'}
          </button>
        </div>

        {/* Subject Form */}
        {showForm && (
          <div className="p-8 border-t border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Hash className="w-4 h-4" />
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101, MATH201"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.code && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.code}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <BookOpen className="w-4 h-4" />
                    Credits *
                  </label>
                  <select
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.credits ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(credit => (
                      <option key={credit} value={credit}>
                        {credit} Credit{credit > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.credits && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.credits}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <BookOpen className="w-4 h-4" />
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Introduction to Computer Science"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the subject content and objectives..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              {formData.code && formData.name && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Subject Summary</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Subject Code</p>
                        <p className="font-medium text-gray-900">{formData.code}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Credits</p>
                        <p className="font-medium text-gray-900">{formData.credits}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-gray-600 mb-1">Subject Name</p>
                      <p className="font-medium text-gray-900">{formData.name}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{formData.description}</p>
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (editingSubject ? 'Updating...' : 'Creating...') : (editingSubject ? 'Update Subject' : 'Create Subject')}
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

        {/* Subjects List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Eye className="w-6 h-6" />
              All Subjects ({totalCount})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                        <LoadingComponent message="Loading subjects..." />
                      </div>
                    </td>
                  </tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No subjects found</p>
                      <p className="text-sm">Create your first subject to get started</p>
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{subject.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{subject.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {subject.credits} Credit{subject.credits > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {subject.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit subject"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id, subject.name)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete subject"
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
                  const effectiveTotal = totalCount > 0 ? totalCount : (Array.isArray(subjects) ? subjects.length : 0);
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