import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, TrendingUp, AlertTriangle, Calculator, LayoutDashboard,Eye, Edit2, RotateCcw, Award, BarChart3, Users, Target, FileSpreadsheet, ChevronLeft, Upload, BookOpen, GraduationCap, FileText, CheckCircle, XCircle, AlertCircle, Trash2, Edit, X } from 'lucide-react';
import { ResultsService } from '../../services/admin/ResultsService';
import { parseExcelFile, generateExcelTemplate } from '../../utils/excelProcessor';
import { showToast as showToastUtil } from '../utils/showToast';

// Create showToast wrapper
const showToast = {
  success: (message) => showToastUtil('success', 'Success', message),
  error: (message) => showToastUtil('error', 'Error', message)
};

// Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default function ResultsGPASystem({ showConfirm }) {
  const [currentView, setCurrentView] = useState('subjects'); // 'subjects', 'subject-detail', 'result-detail'
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('results');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [courseResults, setCourseResults] = useState([]);
  const [courseStatistics, setCourseStatistics] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Color options for module cards
  const colorOptions = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600", 
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-red-500 to-red-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600"
  ];

  // Mock students data
  const students = [
    {
      id: 'stu123',
      name: 'John Smith',
      studentId: 'CS2021001',
      program: 'Computer Science',
      semester: '6th',
      cgpa: 3.45,
      currentSemesterGpa: 3.2,
      creditsCompleted: 78,
      totalCredits: 120,
      status: 'Active',
      riskLevel: 'low'
    },
    {
      id: 'stu124',
      name: 'Sarah Johnson',
      studentId: 'CS2021002', 
      program: 'Computer Science',
      semester: '6th',
      cgpa: 2.85,
      currentSemesterGpa: 2.5,
      creditsCompleted: 75,
      totalCredits: 120,
      status: 'Active',
      riskLevel: 'high'
    },
    {
      id: 'stu125',
      name: 'Mike Chen',
      studentId: 'CS2021003',
      program: 'Computer Science', 
      semester: '4th',
      cgpa: 3.89,
      currentSemesterGpa: 3.95,
      creditsCompleted: 54,
      totalCredits: 120,
      status: 'Active',
      riskLevel: 'low'
    }
  ];

  // Mock results data
  const [results, setResults] = useState([
    {
      id: 'res789',
      studentId: 'stu123',
      subjectId: 1,
      studentName: 'John Smith',
      studentNumber: 'CS2021001',
      courseCode: 'ICT101',
      courseName: 'Programming Fundamentals',
      marks: 72,
      grade: 'B+',
      gradePoint: 3.3,
      credits: 3,
      attemptNo: 1,
      examType: 'regular',
      semester: 'Fall 2024',
      isBestAttempt: true,
      weightageBreakdown: { mid: 28, final: 44, quiz: 10, assignment: 18 }
    },
    {
      id: 'res790', 
      studentId: 'stu124',
      subjectId: 1,
      studentName: 'Sarah Johnson',
      studentNumber: 'CS2021002',
      courseCode: 'ICT101',
      courseName: 'Programming Fundamentals',
      marks: 65,
      grade: 'B',
      gradePoint: 3.0,
      credits: 3,
      attemptNo: 2,
      examType: 'improvement',
      semester: 'Fall 2024',
      isBestAttempt: true,
      weightageBreakdown: { mid: 25, final: 50, quiz: 15, assignment: 10 }
    },
    {
      id: 'res791', 
      studentId: 'stu125',
      subjectId: 2,
      studentName: 'Mike Chen',
      studentNumber: 'CS2021003',
      courseCode: 'ICT102',
      courseName: 'Data Structures & Algorithms',
      marks: 88,
      grade: 'A-',
      gradePoint: 3.5,
      credits: 4,
      attemptNo: 1,
      examType: 'regular',
      semester: 'Fall 2024',
      isBestAttempt: true,
      weightageBreakdown: { mid: 32, final: 46, quiz: 12, assignment: 10 }
    }
  ]);

  const gradeScale = [
    { grade: 'A+', minMarks: 95, maxMarks: 100, gradePoint: 4.0, color: 'bg-green-500' },
    { grade: 'A', minMarks: 90, maxMarks: 94, gradePoint: 3.8, color: 'bg-green-400' },
    { grade: 'A-', minMarks: 85, maxMarks: 89, gradePoint: 3.5, color: 'bg-green-300' },
    { grade: 'B+', minMarks: 80, maxMarks: 84, gradePoint: 3.3, color: 'bg-blue-400' },
    { grade: 'B', minMarks: 75, maxMarks: 79, gradePoint: 3.0, color: 'bg-blue-300' },
    { grade: 'B-', minMarks: 70, maxMarks: 74, gradePoint: 2.7, color: 'bg-blue-200' },
    { grade: 'C+', minMarks: 65, maxMarks: 69, gradePoint: 2.3, color: 'bg-yellow-400' },
    { grade: 'C', minMarks: 60, maxMarks: 64, gradePoint: 2.0, color: 'bg-yellow-300' },
    { grade: 'C-', minMarks: 55, maxMarks: 59, gradePoint: 1.7, color: 'bg-yellow-200' },
    { grade: 'D', minMarks: 50, maxMarks: 54, gradePoint: 1.0, color: 'bg-orange-300' },
    { grade: 'F', minMarks: 0, maxMarks: 49, gradePoint: 0.0, color: 'bg-red-400' }
  ];

  const getAllModules = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching all modules...");
      const result = await new ResultsService().fetchAllModules();
      console.log("All modules here", result);
      
      // Transform API data to match expected format
      const transformedModules = result.map((module, index) => ({
        id: module.id,
        name: module.subject.name,
        code: module.subject.code,
        credits: module.subject.credits,
        students: module.enrollmentsCount || 0,
        semester: module.semester?.name || 'N/A',
        semesterInfo: module.semester,
        lecturer: module.lecturer,
        batch: module.batch,
        enrollments: module.enrollments,
        year: module.year,
        mode: module.mode,
        color: colorOptions[index % colorOptions.length],
        resultCount: module.resultsCount // This would need to be calculated from actual results data
      }));
      
      setModules(transformedModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllModules();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Upload Form Component
  const UploadResultForm = ({ subject, onSubmit, onCancel }) => {
    const [uploadForm, setUploadForm] = useState({
      examType: 'regular',
      semester: 'Fall 2024',
      file: null
    });
    const [uploading, setUploading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [showPreview, setShowPreview] = useState(false);

    const examTypes = ["Regular", "Improvement", "Repeat"];

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      setUploadForm({ ...uploadForm, file });
      setPreviewData(null);
      setValidationErrors([]);
      setShowPreview(false);

      if (file) {
        try {
          setUploading(true);
          const parsedData = await parseExcelFile(file);
          setPreviewData(parsedData);
          setValidationErrors(parsedData.errors || []);
          setShowPreview(true);
        } catch (error) {
          showToast.error(error.message);
          setUploadForm({ ...uploadForm, file: null });
        } finally {
          setUploading(false);
        }
      }
    };

    const handleSubmit = async () => {
      if (!uploadForm.examType || !uploadForm.semester || !uploadForm.file || !previewData) {
        showToast.error('Please fill all required fields and upload a valid Excel file');
        return;
      }

      if (validationErrors.length > 0) {
        showToast.error('Please fix validation errors before uploading');
        return;
      }

      try {
        setUploading(true);
        
        // Prepare data for API
        const resultsData = previewData.results.map(result => ({
          ...result,
          courseOfferingId: subject.id
        }));

        // Call API
        const resultsService = new ResultsService();
        const uploadResponse = await resultsService.bulkUploadResults(resultsData);
        
        console.log('Bulk upload response:', uploadResponse);
        
        // Handle response based on success/failure counts
        if (uploadResponse.success && uploadResponse.data) {
          console.log('Upload response data 1111111111111:', uploadResponse.data);
          const { summary, errors } = uploadResponse.data;
          
          if (summary.successfullyCreated > 0 && summary.failed === 0) {
            // All successful
            showToast.success(`Successfully uploaded ${summary.successfullyCreated} results`);
          } else if (summary.successfullyCreated > 0 && summary.failed > 0) {
            // Partial success
            showToast.success(`Uploaded ${summary.successfullyCreated} results successfully. ${summary.failed} failed.`);
            // Show error details
            if (errors && errors.length > 0) {
              const errorDetails = errors.map(err => `${err.studentNo}: ${err.error}`).join('\n');
              console.warn('Upload errors:', errorDetails);
              showToast.error(`Some uploads failed:\n${errorDetails}`);
            }
          } else if (summary.failed > 0 && summary.successfullyCreated === 0) {
            // All failed
            showToast.error(`Failed to upload any results. ${summary.failed} errors.`);
            if (errors && errors.length > 0) {
              const errorDetails = errors.map(err => `${err.studentNo}: ${err.error}`).join('\n');
              console.warn('Upload errors:', errorDetails);
              showToast.error(`Upload errors:\n${errorDetails}`);
            }
          }
          
          // Only call onSubmit if there were some successful uploads
          if (summary.successfullyCreated > 0) {
            onSubmit({ ...uploadForm, resultsData });
          }
        } else {
          showToast.success(`Successfully uploaded ${resultsData.length} results`);
          onSubmit({ ...uploadForm, resultsData });
        }
        
      } catch (error) {
        console.error('Upload error:', error);
        showToast.error(error.response?.data?.message || 'Failed to upload results');
      } finally {
        setUploading(false);
      }
    };

    const downloadTemplate = () => {
      const blob = generateExcelTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subject.code}_results_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
       <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${subject.color} rounded-xl flex items-center justify-center`}>
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Results</h2>
              <p className="text-gray-600">Upload results file for {subject.name}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Need a template?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Download our Excel template with the correct format. Columns: Student No, Marks (optional), Grade (optional)
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download Template →
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type
                </label>
                <select
                  value={uploadForm.examType}
                  onChange={(e) => setUploadForm({ ...uploadForm, examType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose exam type</option>
                  {examTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={uploadForm.semester}
                  onChange={(e) => setUploadForm({ ...uploadForm, semester: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Spring 2024">Spring 2024</option>
                  <option value="Summer 2024">Summer 2024</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Excel files only (.xlsx, .xls)</p>
                {uploadForm.file && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {uploadForm.file.name}
                  </p>
                )}
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2">
                    Processing file...
                  </p>
                )}
              </div>
            </div>

            {/* Preview and Validation */}
            {showPreview && previewData && (
              <div className="space-y-4">
                {/* Column Detection Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Detected Columns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Student No: <strong>{previewData.detectedColumns?.studentNo || 'Not found'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewData.detectedColumns?.marks ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span>Marks: <strong>{previewData.detectedColumns?.marks || 'Not found'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewData.detectedColumns?.grade ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span>Grade: <strong>{previewData.detectedColumns?.grade || 'Not found'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">File Preview</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Valid rows: {previewData.validRows}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Errors: {validationErrors.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Total rows: {previewData.totalRows}</span>
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-900">Validation Errors</h4>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Preview */}
                {previewData.validRows > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Valid Data Preview (First 5 rows)</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Student No</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Marks</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Grade</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">Grade Point</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {previewData.results.slice(0, 5).map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{result.studentNo}</td>
                              <td className="px-4 py-3 text-gray-900">{result.marks || '-'}</td>
                              <td className="px-4 py-3 text-gray-900">{result.grade || '-'}</td>
                              <td className="px-4 py-3 text-gray-900">{result.gradePoint || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {previewData.results.length > 5 && (
                      <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                        ... and {previewData.results.length - 5} more rows
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!uploadForm.examType || !uploadForm.semester || !uploadForm.file || !previewData || validationErrors.length > 0 || uploading}
              >
                {uploading ? 'Uploading...' : `Upload ${previewData?.validRows || 0} Results`}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
     <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-4 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="h-4 w-4 mr-1" />
          {trend > 0 ? '+' : ''}{trend}% from last semester
        </div>
      )}
    </main>
  );

  const handleModuleSelect = async (module) => {
    console.log('Module selected:', module);
    setSelectedModule(module);
    setCurrentView('subject-detail');
    await loadCourseData(module.id);
  };

  // Load course results and statistics
  const loadCourseData = async (courseOfferingId) => {
    console.log('Loading course data for courseOfferingId:', courseOfferingId);
    const resultsService = new ResultsService();
    
    // Load results
    setLoadingResults(true);
    try {
      const resultsResponse = await resultsService.getCourseResults(courseOfferingId);
      console.log('Results API Response:', resultsResponse);
      console.log('Type of resultsResponse:', typeof resultsResponse);
      console.log('Is resultsResponse an array?', Array.isArray(resultsResponse));
      console.log('resultsResponse keys:', Object.keys(resultsResponse || {}));
      
      // Check if response has the success wrapper or is direct data
      let results = [];
      if (Array.isArray(resultsResponse)) {
        // Direct array response
        console.log('Using direct array response');
        results = resultsResponse;
      } else if (resultsResponse && resultsResponse.success && Array.isArray(resultsResponse.data)) {
        // Wrapped response with success flag
        console.log('Using wrapped response with success flag');
        results = resultsResponse.data;
      } else if (resultsResponse && resultsResponse.data && Array.isArray(resultsResponse.data)) {
        // Just wrapped in data property
        console.log('Using wrapped response with data property');
        results = resultsResponse.data;
      } else {
        console.log('Could not determine response structure, defaulting to empty array');
        console.log('resultsResponse structure:', resultsResponse);
      }
      
      console.log('Parsed results:', results);
      console.log('Setting courseResults to:', results);
      setCourseResults(results);
      console.log('courseResults state after setCourseResults should be:', results);

      // Load statistics
      setLoadingStats(true);
      try {
        const statsResponse = await resultsService.getCourseStatistics(courseOfferingId);
        console.log('Statistics API Response:', statsResponse);
        
        // If API doesn't have statistics endpoint, calculate from results data
        if (!statsResponse || !statsResponse.success) {
          // Calculate statistics from the results data
          const stats = calculateStatisticsFromResults(results);
          setCourseStatistics(stats);
        } else {
          setCourseStatistics(statsResponse.data || null);
        }
      } catch (error) {
        console.error('Error loading course statistics:', error);
        
        // Fallback: Calculate statistics from results data if stats API fails
        const stats = calculateStatisticsFromResults(results);
        setCourseStatistics(stats);
      } finally {
        setLoadingStats(false);
      }
    } catch (error) {
      console.error('Error loading course results:', error);
      showToast.error('Failed to load course results');
      setCourseResults([]);
      setCourseStatistics(null);
      setLoadingStats(false);
    } finally {
      setLoadingResults(false);
    }
  };

  // Calculate statistics from results data
  const calculateStatisticsFromResults = (results) => {
    if (!results || results.length === 0) {
      return {
        totalStudents: 0,
        averageMarks: 0,
        passCount: 0,
        failCount: 0,
        highestMarks: 0,
        lowestMarks: 0
      };
    }

    const validMarks = results
      .filter(r => r.marks !== null && !isNaN(r.marks))
      .map(r => parseFloat(r.marks));

    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;

    return {
      totalStudents: results.length,
      averageMarks: validMarks.length > 0 ? validMarks.reduce((a, b) => a + b, 0) / validMarks.length : 0,
      passCount,
      failCount,
      highestMarks: validMarks.length > 0 ? Math.max(...validMarks) : 0,
      lowestMarks: validMarks.length > 0 ? Math.min(...validMarks) : 0
    };
  };

  const handleUploadSubmit = (formData) => {
    // Update local results state with uploaded data
    if (formData.resultsData && formData.resultsData.length > 0) {
      const newResults = formData.resultsData.map((result, index) => ({
        id: `res${Date.now()}_${index}`,
        studentId: result.studentNo, // This should be mapped to actual student ID
        subjectId: selectedModule.id,
        studentName: `Student ${result.studentNo}`, // This should come from student lookup
        studentNumber: result.studentNo,
        courseCode: selectedModule.code,
        courseName: selectedModule.name,
        marks: result.marks || null,
        grade: result.grade || null,
        gradePoint: result.gradePoint || null,
        credits: selectedModule.credits,
        attemptNo: 1,
        examType: formData.examType,
        semester: formData.semester,
        isBestAttempt: true,
        weightageBreakdown: { mid: 30, final: 45, quiz: 15, assignment: 10 }
      }));
      
      setResults(prevResults => [...prevResults, ...newResults]);
    }
    
    setShowUploadForm(false);
    
    // Refresh data if needed
    getAllModules();
  };

  const getSubjectResults = () => {
    console.log('getSubjectResults called, courseResults:', courseResults);
    return courseResults;
  };

  // Handle result editing
  const handleEditResult = (result) => {
    setEditingResult(result);
    setShowEditModal(true);
  };

  // Handle result deletion
  const handleDeleteResult = (result) => {
    console.log('Delete button clicked for result:', result);
    
    if (!showConfirm) {
      console.error('showConfirm function not available');
      showToast.error('Delete functionality not available');
      return;
    }
    
    const studentName = result.student?.user?.firstName && result.student?.user?.lastName 
      ? `${result.student.user.firstName} ${result.student.user.lastName}` 
      : 'Unknown Student';
    
    const resultDisplay = result.marks 
      ? `${result.marks} marks` 
      : result.grade 
        ? `Grade ${result.grade}` 
        : 'No result data';
    
    showConfirm(
      'Delete Result',
      `Are you sure you want to delete the result for ${studentName} (${result.student?.studentNo})? 
      
Result: ${resultDisplay}

This action cannot be undone.`,
      () => confirmDeleteResult(result)
    );
  };

  // Confirm deletion
  const confirmDeleteResult = async (result) => {
    console.log('Confirm delete called with result:', result);
    if (!result) return;
    
    try {
      const resultsService = new ResultsService();
      console.log('Calling deleteResult API with ID:', result.id);
      await resultsService.deleteResult(result.id);
      
      console.log('Delete successful, reloading course data...');
      // Reload course data
      await loadCourseData(selectedModule.id);
      
      showToast.success('Result deleted successfully');
    } catch (error) {
      console.error('Error deleting result:', error);
      showToast.error('Failed to delete result');
    }
  };

  // Save edited result
  const saveEditedResult = async (updatedData) => {
    if (!editingResult) return;
    
    try {
      const resultsService = new ResultsService();
      await resultsService.updateResult(editingResult.id, updatedData);
      
      // Reload course data
      await loadCourseData(selectedModule.id);
      
      showToast.success('Result updated successfully');
      setShowEditModal(false);
      setEditingResult(null);
    } catch (error) {
      console.error('Error updating result:', error);
      showToast.error('Failed to update result');
    }
  };

  const ResultsTable = () => {
    const subjectResults = getSubjectResults();
    console.log('ResultsTable - subjectResults:', subjectResults);
    console.log('ResultsTable - searchTerm:', searchTerm);
    console.log('ResultsTable - filterSemester:', filterSemester);
    
    const filteredResults = subjectResults.filter(result => {
      console.log('Filtering result:', result);
      const matchesSearch = !searchTerm || 
                           result.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.student?.studentNo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      console.log('matchesSearch:', matchesSearch);
      
      // For semester filter, we'll show all results by default
      const matchesFilter = filterSemester === 'all' || 
                           (filterSemester === 'pass' && result.status === 'pass') ||
                           (filterSemester === 'fail' && result.status === 'fail') ||
                           (filterSemester === 'pending' && (!result.status || result.status === 'pending'));
      
      console.log('matchesFilter:', matchesFilter);
      const finalMatch = matchesSearch && matchesFilter;
      console.log('Final match:', finalMatch);
      
      return finalMatch;
    });
    
    console.log('Final filteredResults:', filteredResults);
    
    if (loadingResults) {
      return (
        <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      );
    }
    
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedModule.name} Results ({filteredResults.length} students)
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="all">All Results</option>
                <option value="pass">Passed</option>
                <option value="fail">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.student?.user?.firstName} {result.student?.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{result.student?.studentNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.marks !== null ? `${result.marks}/100` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {result.grade && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            gradeScale.find(g => g.grade === result.grade)?.color || 'bg-gray-200'
                          } text-white`}>
                            {result.grade}
                          </span>
                        )}
                        {result.gradePoint && (
                          <span className="text-sm text-gray-600">({result.gradePoint})</span>
                        )}
                        {!result.grade && !result.gradePoint && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'pass' ? 'bg-green-100 text-green-800' : 
                        result.status === 'fail' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {result.resultType || 'mixed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedResult(result)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditResult(result)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Edit Result"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Delete button clicked:', result.id);
                            handleDeleteResult(result);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Result"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">No results found</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {searchTerm ? 'Try adjusting your search terms' : 'No results have been uploaded for this course yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    );
  };

  // Subjects Overview Page (similar to attendance modules page)
  if (currentView === 'subjects') {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen  bg-gradient-to-br from-blue-50 to-white">
        <div className="p-6">
          {/* Header - student dashboard style */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Results & GPA Management</h1>
                <p className="text-blue-100/90 mt-1">Manage student results and GPA across all subjects you teach</p>
                <p className="text-blue-100/80 mt-2 text-sm">{currentDateTime.toLocaleString()}</p>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <GraduationCap className="w-20 h-20 text-blue-100/80 opacity-80" />
              </div>
            </div>
          </div>

          {/* Subject Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Subject</h2>
            
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-48"></div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium">{error}</p>
                <button 
                  onClick={getAllModules}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Modules Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div 
                      className={`h-32 bg-gradient-to-r ${module.color} p-6 flex flex-col justify-between text-white`}
                      onClick={() => handleModuleSelect(module)}
                    >
                      <div>
                        <h3 className="text-lg font-bold mb-1">{module.name}</h3>
                        <p className="text-sm opacity-90">{module.code}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{module.students} Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{module.resultCount} Results</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{module.semester}</span>
                        <span>{module.credits} Credits</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* No modules state */}
            {!loading && !error && modules.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No modules assigned</p>
                <p className="text-gray-500 text-sm mt-2">You don't have any modules assigned for this semester.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Subject Detail Page
  if (currentView === 'subject-detail' && selectedModule) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setCurrentView('subjects')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Subjects
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedModule.name}</h1>
              <p className="text-gray-600 mt-1">
                {selectedModule.code} • {selectedModule.students} Students • {selectedModule.credits} Credits
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {showUploadForm ? 'Cancel Upload' : 'Upload Results'}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <UploadResultForm
              subject={selectedModule}
              onSubmit={handleUploadSubmit}
              onCancel={() => setShowUploadForm(false)}
            />
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'results' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Results Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Subject Analytics
              </button>
              {/* <button
                onClick={() => setActiveTab('grading')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'grading' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Grade Distribution
              </button> */}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'results' && <ResultsTable />}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Loading State */}
              {loadingStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-24"></div>
                  ))}
                </div>
              )}

              {/* Statistics Cards */}
              {!loadingStats && courseStatistics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Students</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">{courseStatistics.totalStudents || 0}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Marks</p>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {courseStatistics.averageMarks ? courseStatistics.averageMarks.toFixed(1) : '0.0'}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100">
                          <Target className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                          <p className="text-2xl font-bold text-emerald-600 mt-1">
                            {courseStatistics.totalStudents > 0 
                              ? ((courseStatistics.passCount / courseStatistics.totalStudents) * 100).toFixed(1)
                              : '0.0'
                            }%
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {courseStatistics.passCount} passed, {courseStatistics.failCount} failed
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-100">
                          <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Highest Score</p>
                          <p className="text-2xl font-bold text-purple-600 mt-1">{courseStatistics.highestMarks || 0}%</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Lowest: {courseStatistics.lowestMarks || 0}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-purple-100">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Grade Distribution */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Grade Distribution</h3>
                    
                    {/* Bell Curve Chart */}
                    <div className="mb-8">
                      <div className="relative h-64 bg-gradient-to-b from-blue-50 to-white rounded-lg p-4">
                        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                          {/* Grid lines */}
                          <defs>
                            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                            </pattern>
                            <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                              <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 0.3}} />
                            </linearGradient>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Bell Curve */}
                          <path
                            d="M 20 160 Q 50 140, 80 120 Q 120 80, 160 60 Q 200 40, 240 60 Q 280 80, 320 120 Q 350 140, 380 160"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            className="drop-shadow-sm"
                          />
                          
                          {/* Fill under curve */}
                          <path
                            d="M 20 160 Q 50 140, 80 120 Q 120 80, 160 60 Q 200 40, 240 60 Q 280 80, 320 120 Q 350 140, 380 160 L 380 180 L 20 180 Z"
                            fill="url(#bellGradient)"
                            opacity="0.6"
                          />
                          
                          {/* Grade markers on X-axis */}
                          {gradeScale.slice(0, 7).map((grade, index) => {
                            const x = 40 + (index * 50);
                            const count = courseResults.filter(result => result.grade === grade.grade).length;
                            const height = Math.max(count * 15, 5); // Minimum height of 5
                            
                            return (
                              <g key={grade.grade}>
                                {/* Vertical line */}
                                <line x1={x} y1="180" x2={x} y2="185" stroke="#6b7280" strokeWidth="1"/>
                                
                                {/* Grade label */}
                                <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600" fontSize="10">
                                  {grade.grade}
                                </text>
                                
                                {/* Data point */}
                                {count > 0 && (
                                  <g>
                                    <circle cx={x} cy={180 - height} r="4" fill="#ef4444" className="drop-shadow-sm"/>
                                    <text x={x} y={175 - height} textAnchor="middle" className="text-xs fill-gray-700" fontSize="9">
                                      {count}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                          
                          {/* Y-axis label */}
                          <text x="10" y="20" className="text-xs fill-gray-600" fontSize="10">Students</text>
                          <text x="350" y="20" className="text-xs fill-gray-600" fontSize="10">Normal Distribution</text>
                        </svg>
                        
                        {/* Legend */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-blue-500"></div>
                            <span>Expected Curve</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Actual Data</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Detailed Grade Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-md font-medium text-gray-800 mb-3">Detailed Breakdown</h4>
                      {gradeScale.map((grade) => {
                        const count = courseResults.filter(result => result.grade === grade.grade).length;
                        const percentage = courseStatistics.totalStudents > 0 ? (count / courseStatistics.totalStudents) * 100 : 0;
                        
                        return (
                          <div key={grade.grade} className="flex items-center gap-4">
                            <div className={`w-8 h-6 rounded ${grade.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {grade.grade}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {grade.grade} Grade ({grade.minMarks}-{grade.maxMarks}%)
                                </span>
                                <span className="text-sm text-gray-500">{count} students ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${grade.color}`}
                                  style={{ width: `${Math.max(percentage, 2)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Performance Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Categories</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-green-900">Excellent (A+ to A-)</div>
                            <div className="text-2xl font-bold text-green-600">
                              {courseResults.filter(r => ['A+', 'A', 'A-'].includes(r.grade)).length}
                            </div>
                          </div>
                          <Award className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-blue-900">Good (B+ to B-)</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {courseResults.filter(r => ['B+', 'B', 'B-'].includes(r.grade)).length}
                            </div>
                          </div>
                          <Target className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-yellow-900">Satisfactory (C+ to C-)</div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {courseResults.filter(r => ['C+', 'C', 'C-'].includes(r.grade)).length}
                            </div>
                          </div>
                          <BarChart3 className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-red-900">Need Improvement (D, F)</div>
                            <div className="text-2xl font-bold text-red-600">
                              {courseResults.filter(r => ['D', 'F'].includes(r.grade)).length}
                            </div>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowUploadForm(true)}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Upload More Results</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('results')}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">View All Results</span>
                        </button>
                        <button
                          onClick={() => setShowWhatIfModal(true)}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Calculator className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-900">What-If Analysis</span>
                        </button>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* No Data State */}
              {!loadingStats && !courseStatistics && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No statistics available</p>
                  <p className="text-gray-500 text-sm mt-2">Upload some results to see analytics</p>
                </div>
              )}
            </div>
          )}


        </div>
      </main>
    );
  }

  // Result Detail Modal
  const ResultDetailModal = () => {
    if (!selectedResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Result Details</h3>
              <button 
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <p className="text-gray-900">{selectedResult.studentName}</p>
                <p className="text-sm text-gray-500">{selectedResult.studentNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <p className="text-gray-900">{selectedResult.courseName}</p>
                <p className="text-sm text-gray-500">{selectedResult.courseCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <p className="text-2xl font-bold text-gray-900">{selectedResult.marks}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${gradeScale.find(g => g.grade === selectedResult.grade)?.color} text-white`}>
                  {selectedResult.grade}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Points</label>
                <p className="text-2xl font-bold text-blue-600">{selectedResult.gradePoint}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Assessment Breakdown</label>
              <div className="space-y-3">
                {Object.entries(selectedResult.weightageBreakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 capitalize">{key} Exam</span>
                    <span className="text-sm text-gray-900">{value} marks</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attempt Number</label>
                <p className="text-gray-900">#{selectedResult.attemptNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedResult.examType === 'regular' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {selectedResult.examType}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Result
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Result Modal
  const EditResultModal = () => {
    const [editForm, setEditForm] = useState({
      marks: editingResult?.marks || '',
      grade: editingResult?.grade || '',
      gradePoint: editingResult?.gradePoint || ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (editingResult) {
        setEditForm({
          marks: editingResult.marks || '',
          grade: editingResult.grade || '',
          gradePoint: editingResult.gradePoint || ''
        });
      }
    }, [editingResult]);

    const handleSave = async () => {
      if (!editForm.marks && !editForm.grade) {
        showToast.error('Either marks or grade is required');
        return;
      }

      setSaving(true);
      try {
        const updateData = {};
        if (editForm.marks) {
          updateData.marks = parseFloat(editForm.marks);
        }
        if (editForm.grade) {
          updateData.grade = editForm.grade;
          if (editForm.gradePoint) {
            updateData.gradePoint = parseFloat(editForm.gradePoint);
          }
        }

        await saveEditedResult(updateData);
      } finally {
        setSaving(false);
      }
    };

    if (!showEditModal || !editingResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Edit Result</h3>
            <button 
              onClick={() => {
                setShowEditModal(false);
                setEditingResult(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={editForm.marks}
                onChange={(e) => setEditForm({ ...editForm, marks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter marks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={editForm.grade}
                onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select grade</option>
                {gradeScale.map((grade) => (
                  <option key={grade.grade} value={grade.grade}>
                    {grade.grade} ({grade.gradePoint})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Point
              </label>
              <input
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={editForm.gradePoint}
                onChange={(e) => setEditForm({ ...editForm, gradePoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter grade point"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingResult(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={saving || (!editForm.marks && !editForm.grade)}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const WhatIfModal = () => {
    const [projectedGrades, setProjectedGrades] = useState([
      { course: 'Advanced Database', credits: 3, currentGrade: '', projectedGrade: 'A' },
      { course: 'Software Engineering', credits: 4, currentGrade: '', projectedGrade: 'B+' },
      { course: 'Network Security', credits: 3, currentGrade: '', projectedGrade: 'A-' }
    ]);

    if (!showWhatIfModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">What-If GPA Calculator</h3>
              <button 
                onClick={() => setShowWhatIfModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>John Smith (CS2021001)</option>
                <option>Sarah Johnson (CS2021002)</option>
                <option>Mike Chen (CS2021003)</option>
              </select>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Projected Grades for Upcoming Courses</h4>
              {projectedGrades.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.course}</div>
                    <div className="text-xs text-gray-500">{item.credits} credits</div>
                  </div>
                  <div>
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={item.projectedGrade}
                      onChange={(e) => {
                        const newGrades = [...projectedGrades];
                        newGrades[index].projectedGrade = e.target.value;
                        setProjectedGrades(newGrades);
                      }}
                    >
                      {gradeScale.map(grade => (
                        <option key={grade.grade} value={grade.grade}>{grade.grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    {gradeScale.find(g => g.grade === item.projectedGrade)?.gradePoint} GP
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Projected Results</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Current CGPA</div>
                  <div className="text-xl font-bold text-gray-900">3.45</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Projected CGPA</div>
                  <div className="text-xl font-bold text-blue-600">3.62</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-green-600">
                ↗ Improvement of +0.17 points
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowWhatIfModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main content based on current view */}
      {currentView === 'subjects' && (
        <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6 border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">Results & GPA Management</h1>
                  <p className="text-blue-100/90 mt-1">Manage student results and GPA across all subjects you teach</p>
                  <p className="text-blue-100/80 mt-2 text-sm">{currentDateTime.toLocaleString()}</p>
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <GraduationCap className="w-20 h-20 text-blue-100/80 opacity-80" />
                </div>
              </div>
            </div>

            {/* Subject Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Subject</h2>
              
              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-48"></div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-700 font-medium">{error}</p>
                  <button 
                    onClick={getAllModules}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Modules Grid */}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.map((module) => (
                    <Card key={module.id} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <div 
                        className={`h-32 bg-gradient-to-r ${module.color} p-6 flex flex-col justify-between text-white`}
                        onClick={() => handleModuleSelect(module)}
                      >
                        <div>
                          <h3 className="text-lg font-bold mb-1">{module.name}</h3>
                          <p className="text-sm opacity-90">{module.code}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{module.enrollmentsCount} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{module.resultCount} Results</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{module.semester}</span>
                          <span>{module.credits} Credits</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* No modules state */}
              {!loading && !error && modules.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No modules assigned</p>
                  <p className="text-gray-500 text-sm mt-2">You don't have any modules assigned for this semester.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      
      <ResultDetailModal />
      <EditResultModal />
      <WhatIfModal />
    </>
  );
}