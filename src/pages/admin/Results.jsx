import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, TrendingUp, AlertTriangle, Calculator, Eye, Edit2, RotateCcw, Award, BarChart3, Users, Target, FileSpreadsheet, ChevronLeft, Upload, BookOpen, FileText } from 'lucide-react';

// Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default function ResultsGPASystem() {
  const [currentView, setCurrentView] = useState('subjects'); // 'subjects', 'subject-detail', 'result-detail'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeTab, setActiveTab] = useState('results');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Mock subjects data (modules taught by admin/lecturer)
  const subjects = [
    { 
      id: 1, 
      name: "Programming Fundamentals", 
      code: "ICT101", 
      students: 45, 
      semester: "Fall 2024",
      credits: 3,
      color: "from-blue-500 to-blue-600",
      resultCount: 42
    },
    { 
      id: 2, 
      name: "Data Structures & Algorithms", 
      code: "ICT102", 
      students: 38, 
      semester: "Fall 2024",
      credits: 4,
      color: "from-green-500 to-green-600",
      resultCount: 35
    },
    { 
      id: 3, 
      name: "Database Management Systems", 
      code: "ICT201", 
      students: 32, 
      semester: "Fall 2024",
      credits: 3,
      color: "from-purple-500 to-purple-600",
      resultCount: 30
    },
    { 
      id: 4, 
      name: "Software Engineering", 
      code: "ICT301", 
      students: 28, 
      semester: "Fall 2024",
      credits: 4,
      color: "from-orange-500 to-orange-600",
      resultCount: 25
    },
    { 
      id: 5, 
      name: "Network Security", 
      code: "ICT401", 
      students: 22, 
      semester: "Fall 2024",
      credits: 3,
      color: "from-red-500 to-red-600",
      resultCount: 20
    },
    { 
      id: 6, 
      name: "Machine Learning", 
      code: "ICT501", 
      students: 25, 
      semester: "Fall 2024",
      credits: 4,
      color: "from-pink-500 to-pink-600",
      resultCount: 22
    }
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

  // Upload Form Component
  const UploadResultForm = ({ subject, onSubmit, onCancel }) => {
    const [uploadForm, setUploadForm] = useState({
      examType: 'regular',
      semester: 'Fall 2024',
      file: null
    });

    const examTypes = ["Regular", "Improvement", "Repeat"];

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      setUploadForm({ ...uploadForm, file });
    };

    const handleSubmit = () => {
      if (uploadForm.examType && uploadForm.semester && uploadForm.file) {
        onSubmit(uploadForm);
      }
    };

    return (
       <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
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
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Excel files only (.xlsx, .xls)</p>
              {uploadForm.file && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {uploadForm.file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              disabled={!uploadForm.examType || !uploadForm.semester || !uploadForm.file}
            >
              Upload Results
            </button>
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

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject-detail');
  };

  const handleUploadSubmit = (formData) => {
    // Simulate adding new results
    const newResults = [
      {
        id: `res${Date.now()}`,
        studentId: 'stu123',
        subjectId: selectedSubject.id,
        studentName: 'John Smith',
        studentNumber: 'CS2021001',
        courseCode: selectedSubject.code,
        courseName: selectedSubject.name,
        marks: 75,
        grade: 'B+',
        gradePoint: 3.3,
        credits: selectedSubject.credits,
        attemptNo: 1,
        examType: formData.examType,
        semester: formData.semester,
        isBestAttempt: true,
        weightageBreakdown: { mid: 30, final: 45, quiz: 15, assignment: 10 }
      }
    ];
    
    setResults([...results, ...newResults]);
    setShowUploadForm(false);
  };

  const getSubjectResults = () => {
    return results.filter(result => result.subjectId === selectedSubject?.id);
  };

  const ResultsTable = () => {
    const subjectResults = getSubjectResults();
    
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedSubject.name} Results
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
                <option value="all">All Attempts</option>
                <option value="regular">Regular</option>
                <option value="improvement">Improvement</option>
                <option value="repeat">Repeat</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjectResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                      <div className="text-sm text-gray-500">{result.studentNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.marks}/100</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${gradeScale.find(g => g.grade === result.grade)?.color} text-white`}>
                      {result.grade} ({result.gradePoint})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">#{result.attemptNo}</span>
                      {result.examType !== 'regular' && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          {result.examType}
                        </span>
                      )}
                      {result.isBestAttempt && (
                        <Award className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedResult(result)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    );
  };

  // Subjects Overview Page (similar to attendance modules page)
  if (currentView === 'subjects') {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Results & GPA Management</h1>
            <p className="text-gray-600">Manage student results and GPA across all subjects you teach</p>
          </div>

          {/* Subject Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Subject</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div 
                    className={`h-32 bg-gradient-to-r ${subject.color} p-6 flex flex-col justify-between text-white`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-1">{subject.name}</h3>
                      <p className="text-sm opacity-90">{subject.code}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{subject.students} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{subject.resultCount} Results</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{subject.semester}</span>
                      <span>{subject.credits} Credits</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Subject Detail Page
  if (currentView === 'subject-detail' && selectedSubject) {
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
              <h1 className="text-3xl font-bold text-gray-900">{selectedSubject.name}</h1>
              <p className="text-gray-600 mt-1">
                {selectedSubject.code} • {selectedSubject.students} Students • {selectedSubject.credits} Credits
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
              subject={selectedSubject}
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
              <button
                onClick={() => setActiveTab('grading')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'grading' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Grade Distribution
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'results' && <ResultsTable />}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Subject Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Average Score" 
                  value="75.2" 
                  subtitle={`${selectedSubject.name}`}
                  icon={BarChart3}
                  trend={2.5}
                  color="blue"
                />
                <StatCard 
                  title="Pass Rate" 
                  value="92%" 
                  subtitle="Students Passed"
                  icon={Target}
                  color="green"
                />
                <StatCard 
                  title="High Achievers" 
                  value="12" 
                  subtitle="A Grade & Above"
                  icon={Award}
                  color="yellow"
                />
                <StatCard 
                  title="Need Support" 
                  value="3" 
                  subtitle="Below 60%"
                  icon={AlertTriangle}
                  color="red"
                />
              </div>

              {/* Grade Distribution Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                <div className="space-y-3">
                  {gradeScale.slice(0, 7).map((grade) => {
                    const count = Math.floor(Math.random() * 8) + 1;
                    const percentage = Math.floor((count / selectedSubject.students) * 100);
                    return (
                      <div key={grade.grade} className="flex items-center gap-4">
                        <div className={`w-8 h-6 rounded ${grade.color} flex items-center justify-center text-white text-xs font-bold`}>
                          {grade.grade}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{grade.grade} Grade</span>
                            <span className="text-sm text-gray-500">{count} students ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${grade.color.replace('bg-', 'bg-')}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-green-900">Improving Students</div>
                        <div className="text-2xl font-bold text-green-600">8</div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-red-900">Need Attention</div>
                        <div className="text-2xl font-bold text-red-600">3</div>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-blue-900">Consistent Performance</div>
                        <div className="text-2xl font-bold text-blue-600">32</div>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { component: 'Final Exam', weight: 50, avg: 72 },
                      { component: 'Mid Term', weight: 30, avg: 78 },
                      { component: 'Assignments', weight: 15, avg: 85 },
                      { component: 'Quizzes', weight: 5, avg: 80 }
                    ].map((item) => (
                      <div key={item.component} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.component}</div>
                          <div className="text-xs text-gray-500">{item.weight}% weightage</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{item.avg}%</div>
                          <div className="text-xs text-gray-500">Average</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grading' && (
            <div className="space-y-6">
              {/* Current Grading Policy */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Grading Policy</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Assessment Weightage</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Final Examination</span>
                        <span className="text-sm font-medium text-gray-900">50%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Mid Term Examination</span>
                        <span className="text-sm font-medium text-gray-900">30%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Assignments</span>
                        <span className="text-sm font-medium text-gray-900">15%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-sm text-gray-900">Quizzes</span>
                        <span className="text-sm font-medium text-gray-900">5%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Grade Scale</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2">Grade</th>
                            <th className="text-left py-2">Range</th>
                            <th className="text-left py-2">GP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeScale.slice(0, 6).map((grade) => (
                            <tr key={grade.grade} className="border-b border-gray-100">
                              <td className="py-2">
                                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${grade.color}`}>
                                  {grade.grade}
                                </div>
                              </td>
                              <td className="py-2 text-gray-900">
                                {grade.minMarks}-{grade.maxMarks}%
                              </td>
                              <td className="py-2 text-gray-900">
                                {grade.gradePoint}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Results & GPA Management</h1>
              <p className="text-gray-600">Manage student results and GPA across all subjects you teach</p>
            </div>

            {/* Subject Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Subject</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div 
                      className={`h-32 bg-gradient-to-r ${subject.color} p-6 flex flex-col justify-between text-white`}
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <div>
                        <h3 className="text-lg font-bold mb-1">{subject.name}</h3>
                        <p className="text-sm opacity-90">{subject.code}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{subject.students} Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{subject.resultCount} Results</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{subject.semester}</span>
                        <span>{subject.credits} Credits</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      
      <ResultDetailModal />
      <WhatIfModal />
    </>
  );
}