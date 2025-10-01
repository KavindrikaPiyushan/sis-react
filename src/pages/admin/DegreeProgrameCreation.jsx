import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

export default function DegreeProgrammeCreation() {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    facultyId: '',
    departmentId: '',
    minCreditsToGraduate: '',
    minCGPARequired: '',
    honorsCriteria: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Mock data - replace with actual API calls
  const faculties = [
    { id: '1', name: 'Faculty of Computing' },
    { id: '2', name: 'Faculty of Engineering' },
    { id: '3', name: 'Faculty of Science' },
    { id: '4', name: 'Faculty of Business' }
  ];

  const departments = [
    { id: '1', name: 'Department of Computer Science', facultyId: '1' },
    { id: '2', name: 'Department of Information Technology', facultyId: '1' },
    { id: '3', name: 'Department of Software Engineering', facultyId: '1' },
    { id: '4', name: 'Department of Mechanical Engineering', facultyId: '2' },
    { id: '5', name: 'Department of Civil Engineering', facultyId: '2' }
  ];

  const filteredDepartments = formData.facultyId
    ? departments.filter(d => d.facultyId === formData.facultyId)
    : [];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Programme name is required';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (parseInt(formData.duration) < 1 || parseInt(formData.duration) > 10) {
      newErrors.duration = 'Duration must be between 1 and 10 years';
    }

    if (!formData.facultyId) {
      newErrors.facultyId = 'Faculty is required';
    }

    if (!formData.minCreditsToGraduate) {
      newErrors.minCreditsToGraduate = 'Minimum credits is required';
    } else if (parseInt(formData.minCreditsToGraduate) < 1) {
      newErrors.minCreditsToGraduate = 'Credits must be positive';
    }

    if (!formData.minCGPARequired) {
      newErrors.minCGPARequired = 'Minimum CGPA is required';
    } else if (parseFloat(formData.minCGPARequired) < 0 || parseFloat(formData.minCGPARequired) > 4) {
      newErrors.minCGPARequired = 'CGPA must be between 0 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'facultyId') {
      setFormData(prev => ({
        ...prev,
        departmentId: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Submitting degree programme:', formData);
      
      setSubmitStatus('success');
      
      setTimeout(() => {
        handleReset();
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error creating degree programme:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      duration: '',
      facultyId: '',
      departmentId: '',
      minCreditsToGraduate: '',
      minCGPARequired: '',
      honorsCriteria: ''
    });
    setErrors({});
    setSubmitStatus(null);
  };

  return (
     <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Create Degree Programme</h1>
                <p className="text-blue-100 text-sm mt-1">Add a new academic programme to the system</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mx-8 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Programme Created Successfully</h3>
                <p className="text-sm text-green-700 mt-1">The degree programme has been added to the system.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error Creating Programme</h3>
                <p className="text-sm text-red-700 mt-1">Please try again or contact support if the issue persists.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Programme Information Section */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Programme Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Programme Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programme Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Bachelor of Science in Computer Science"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      placeholder="e.g., 4"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="facultyId"
                        value={formData.facultyId}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                          errors.facultyId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(faculty => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.facultyId && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.facultyId}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department (Optional)
                    </label>
                    <div className="relative">
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        disabled={!formData.facultyId}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Department</option>
                        {filteredDepartments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {!formData.facultyId && (
                      <p className="mt-1 text-sm text-gray-500">Select a faculty first to choose a department</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Graduation Requirements Section */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Graduation Requirements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Minimum Credits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Credits to Graduate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minCreditsToGraduate"
                      value={formData.minCreditsToGraduate}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g., 120"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.minCreditsToGraduate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.minCreditsToGraduate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.minCreditsToGraduate}
                      </p>
                    )}
                  </div>

                  {/* Minimum CGPA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum CGPA Required <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minCGPARequired"
                      value={formData.minCGPARequired}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="4"
                      placeholder="e.g., 2.00"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.minCGPARequired ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.minCGPARequired && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.minCGPARequired}
                      </p>
                    )}
                  </div>

                  {/* Honors Criteria */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Honors Criteria (Optional)
                    </label>
                    <textarea
                      name="honorsCriteria"
                      value={formData.honorsCriteria}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="e.g., CGPA >= 3.75 for First Class Honors, CGPA >= 3.25 for Second Class Upper..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">Describe the criteria for honors classification</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Programme
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>All fields marked with <span className="text-red-600">*</span> are required</li>
                <li>The programme will be available for batch creation after approval</li>
                <li>Degree rules can be modified later from the programme management section</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}