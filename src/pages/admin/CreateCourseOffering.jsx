import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, X, Search, Calendar, Users, BookOpen, User } from 'lucide-react';

export default function CreateCourseOffering() {
  const [formData, setFormData] = useState({
    subjectId: '',
    semesterId: '',
    batchId: '',
    lecturerId: '',
    year: new Date().getFullYear(),
    mode: 'lecture',
    capacity: 100
  });

  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const mockSubjects = [
      { id: '1', code: 'CS101', name: 'Introduction to Programming', credits: 3 },
      { id: '2', code: 'CS201', name: 'Data Structures', credits: 4 },
      { id: '3', code: 'CS301', name: 'Database Systems', credits: 3 },
      { id: '4', code: 'MA101', name: 'Calculus I', credits: 4 },
      { id: '5', code: 'MA201', name: 'Linear Algebra', credits: 3 }
    ];

    const mockSemesters = [
      { id: '1', name: 'Semester 1 - 2025', batchId: '1', status: 'active', startDate: '2025-01-15', endDate: '2025-05-30' },
      { id: '2', name: 'Semester 2 - 2025', batchId: '1', status: 'active', startDate: '2025-06-15', endDate: '2025-10-30' },
      { id: '3', name: 'Semester 1 - 2025', batchId: '2', status: 'active', startDate: '2025-01-15', endDate: '2025-05-30' }
    ];

    const mockBatches = [
      { id: '1', name: 'Batch 2024', startYear: 2024, programName: 'BSc Computer Science' },
      { id: '2', name: 'Batch 2023', startYear: 2023, programName: 'BSc Computer Science' },
      { id: '3', name: 'Batch 2024', startYear: 2024, programName: 'BSc Software Engineering' }
    ];

    const mockLecturers = [
      { id: '1', lecturerId: 'LEC001', name: 'Dr. Samantha Perera', department: 'Computer Science' },
      { id: '2', lecturerId: 'LEC002', name: 'Prof. Nimal Silva', department: 'Computer Science' },
      { id: '3', lecturerId: 'LEC003', name: 'Dr. Ayesha Fernando', department: 'Mathematics' }
    ];

    setSubjects(mockSubjects);
    setFilteredSubjects(mockSubjects);
    setSemesters(mockSemesters);
    setBatches(mockBatches);
    setLecturers(mockLecturers);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'batchId') {
      setFormData(prev => ({ ...prev, semesterId: '' }));
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

    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.semesterId) newErrors.semesterId = 'Semester is required';
    if (!formData.batchId) newErrors.batchId = 'Batch is required';
    if (!formData.lecturerId) newErrors.lecturerId = 'Lecturer is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.capacity && formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

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
      
      console.log('Course Offering Data:', formData);
      
      setSubmitStatus({ 
        type: 'success', 
        message: 'Course offering created successfully!' 
      });
      
      setTimeout(() => {
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
        setSubmitStatus(null);
      }, 2000);
      
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to create course offering. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
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
    setErrors({});
    setSubmitStatus(null);
  };

  const filteredSemesters = formData.batchId 
    ? semesters.filter(s => s.batchId === formData.batchId)
    : semesters;

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);
  const selectedSemester = semesters.find(s => s.id === formData.semesterId);
  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId);

  return (
     <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Plus className="w-8 h-8" />
              Create Course Offering
            </h1>
            <p className="text-blue-100 mt-2">Add a new course offering for a semester</p>
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
                <BookOpen className="w-4 h-4" />
                Subject *
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setShowSubjectDropdown(true);
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    placeholder="Search by code or name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
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
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.subjectId}
                </p>
              )}
              {selectedSubject && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Selected:</strong> {selectedSubject.code} - {selectedSubject.name} ({selectedSubject.credits} credits)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4" />
                Batch *
              </label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.batchId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} - {batch.programName}
                  </option>
                ))}
              </select>
              {errors.batchId && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.batchId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4" />
                Semester *
              </label>
              <select
                name="semesterId"
                value={formData.semesterId}
                onChange={handleInputChange}
                disabled={!formData.batchId}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.semesterId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a semester</option>
                {filteredSemesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name} ({semester.status})
                  </option>
                ))}
              </select>
              {errors.semesterId && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.semesterId}
                </p>
              )}
              {!formData.batchId && (
                <p className="text-sm text-gray-500">Please select a batch first</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4" />
                Lecturer *
              </label>
              <select
                name="lecturerId"
                value={formData.lecturerId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lecturerId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.lecturerId}) - {lecturer.department}
                  </option>
                ))}
              </select>
              {errors.lecturerId && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.lecturerId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.year && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.year}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mode</label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Capacity (Optional)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                placeholder="Maximum number of students"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.capacity && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.capacity}
                </p>
              )}
            </div>

            {(selectedSubject || selectedBatch || selectedSemester || selectedLecturer) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Course Offering Summary</h3>
                <div className="space-y-2 text-sm">
                  {selectedSubject && (
                    <p><span className="font-medium">Subject:</span> {selectedSubject.code} - {selectedSubject.name}</p>
                  )}
                  {selectedBatch && (
                    <p><span className="font-medium">Batch:</span> {selectedBatch.name}</p>
                  )}
                  {selectedSemester && (
                    <p><span className="font-medium">Semester:</span> {selectedSemester.name}</p>
                  )}
                  {selectedLecturer && (
                    <p><span className="font-medium">Lecturer:</span> {selectedLecturer.name}</p>
                  )}
                  {formData.year && (
                    <p><span className="font-medium">Year:</span> {formData.year}</p>
                  )}
                  {formData.mode && (
                    <p><span className="font-medium">Mode:</span> {formData.mode}</p>
                  )}
                  {formData.capacity && (
                    <p><span className="font-medium">Capacity:</span> {formData.capacity} students</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Creating...' : 'Create Course Offering'}
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