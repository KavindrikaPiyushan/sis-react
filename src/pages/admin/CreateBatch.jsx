import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Users, X, Calendar, GraduationCap, Building2 } from 'lucide-react';

export default function CreateBatch() {
  const [formData, setFormData] = useState({
    name: '',
    programId: '',
    startYear: new Date().getFullYear()
  });

  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const mockFaculties = [
      { id: '1', name: 'Faculty of Computing' },
      { id: '2', name: 'Faculty of Engineering' },
      { id: '3', name: 'Faculty of Science' }
    ];

    const mockPrograms = [
      { 
        id: '1', 
        name: 'BSc (Hons) in Computer Science', 
        duration: 4, 
        facultyId: '1',
        departmentName: 'Computer Science'
      },
      { 
        id: '2', 
        name: 'BSc (Hons) in Software Engineering', 
        duration: 4, 
        facultyId: '1',
        departmentName: 'Software Engineering'
      },
      { 
        id: '3', 
        name: 'BSc (Hons) in Information Systems', 
        duration: 4, 
        facultyId: '1',
        departmentName: 'Information Systems'
      },
      { 
        id: '4', 
        name: 'BEng (Hons) in Civil Engineering', 
        duration: 4, 
        facultyId: '2',
        departmentName: 'Civil Engineering'
      },
      { 
        id: '5', 
        name: 'BSc (Hons) in Mathematics', 
        duration: 3, 
        facultyId: '3',
        departmentName: 'Mathematics'
      }
    ];

    setFaculties(mockFaculties);
    setPrograms(mockPrograms);
  }, []);

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
      setSubmitStatus({ type: 'error', message: 'Please fix the errors before submitting' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Batch Data:', formData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: `Batch "${formData.name}" created successfully!` 
      });
      
      setTimeout(() => {
        setFormData({
          name: '',
          programId: '',
          startYear: new Date().getFullYear()
        });
        setSubmitStatus(null);
      }, 2000);
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to create batch. Please try again.' 
      });
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
    setSubmitStatus(null);
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
  const selectedFaculty = selectedProgram 
    ? faculties.find(f => f.id === selectedProgram.facultyId)
    : null;

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 5; year++) {
    yearOptions.push(year);
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8" />
              Create Batch
            </h1>
            <p className="text-purple-100 mt-2">Add a new student batch to a degree program</p>
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
                    {program.name} ({program.duration} years) - {program.departmentName}
                  </option>
                ))}
              </select>
              {errors.programId && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.programId}
                </p>
              )}
              {selectedFaculty && (
                <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedFaculty.name}</span>
                </div>
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
                    <div>
                      <p className="text-gray-600 mb-1">Faculty</p>
                      <p className="font-medium text-gray-900">{selectedFaculty?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Department</p>
                      <p className="font-medium text-gray-900">{selectedProgram.departmentName}</p>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens after creating a batch?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Students can be admitted to this batch</li>
                    <li>Semesters will be created for this batch</li>
                    <li>Course offerings can be assigned to this batch</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Creating...' : 'Create Batch'}
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