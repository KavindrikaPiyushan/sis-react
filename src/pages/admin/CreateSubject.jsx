import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, BookOpen, X, Code, FileText, Award } from 'lucide-react';

export default function CreateSubject() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
    } else if (!/^[A-Z]{2,4}\d{3,4}$/.test(formData.code.trim())) {
      newErrors.code = 'Code format should be like CS101 or MATH2001';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Subject name must be at least 3 characters';
    }

    if (!formData.credits || formData.credits < 1 || formData.credits > 10) {
      newErrors.credits = 'Credits must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors before submitting' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Subject Data:', formData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: `Subject ${formData.code} created successfully!` 
      });
      
      setTimeout(() => {
        setFormData({
          code: '',
          name: '',
          credits: 3,
          description: ''
        });
        setSubmitStatus(null);
      }, 2000);
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to create subject. Please try again.' 
      });
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
    setSubmitStatus(null);
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Create Subject
            </h1>
            <p className="text-emerald-100 mt-2">Add a new subject to the curriculum</p>
          </div>

          {submitStatus && (
            <div className={`mx-8 mt-6 p-4 rounded-lg flex items-start gap-3 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {submitStatus.message}
              </p>
            </div>
          )}

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Code className="w-4 h-4" />
                Subject Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CS101, MATH2001"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.code && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code}
                </p>
              )}
              <p className="text-xs text-gray-500">Format: 2-4 letters followed by 3-4 digits (e.g., CS101)</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Subject Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Programming"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
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
                <Award className="w-4 h-4" />
                Credits *
              </label>
              <div className="flex gap-3 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((credit) => (
                  <button
                    key={credit}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, credits: credit }));
                      if (errors.credits) {
                        setErrors(prev => ({ ...prev, credits: '' }));
                      }
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      formData.credits === credit
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {credit}
                  </button>
                ))}
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className={`w-20 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center ${
                    errors.credits ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.credits && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.credits}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the subject, learning outcomes, prerequisites, etc."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500">{formData.description.length} characters</p>
            </div>

            {(formData.code || formData.name || formData.credits) && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Subject Preview</h3>
                <div className="space-y-2 text-sm">
                  {formData.code && (
                    <p><span className="font-medium">Code:</span> {formData.code.toUpperCase()}</p>
                  )}
                  {formData.name && (
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                  )}
                  {formData.credits && (
                    <p><span className="font-medium">Credits:</span> {formData.credits}</p>
                  )}
                  {formData.description && (
                    <p><span className="font-medium">Description:</span> {formData.description}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Creating...' : 'Create Subject'}
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
      </div>
    </main>
  );
}