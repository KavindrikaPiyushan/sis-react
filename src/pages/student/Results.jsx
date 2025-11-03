
import React, { useState, useEffect, useMemo } from 'react';
import studentService from '../../services/studentService';
import { 
  Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, FileText, BarChart3, Calendar, User, Award, Search, Filter,
  BookOpen, Clock, Target, Medal, AlertTriangle, Eye, ChevronRight,
  GraduationCap, Star, Zap, PieChart, LineChart, Users, Bell
} from 'lucide-react';

import LoadingComponent from '../../components/LoadingComponent';

const Results = () => {

  const [activeTab, setActiveTab] = useState('current');
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual studentId logic if needed
        const response = await studentService.getMyResults();
        if (response.success && response.data) {
          setResultsData(response.data);
          // Default to current semester from API
          if (response.data.studentInfo?.currentSemester) {
            setSelectedSemester(response.data.studentInfo.currentSemester);
          } else if (response.data.semesters?.length > 0) {
            setSelectedSemester(response.data.semesters[0].semesterId);
          }
        } else {
          setError('Failed to load results');
        }
      } catch (err) {
        setError('Error loading results');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);


  // Helper to get semester data as object keyed by semesterId
  const semesterData = useMemo(() => {
    if (!resultsData?.semesters) return {};
    const obj = {};
    resultsData.semesters.forEach(sem => {
      obj[sem.semesterId] = sem;
    });
    return obj;
  }, [resultsData]);

  // Filter and search functionality
  const filteredCourses = useMemo(() => {
    const currentSemester = semesterData[selectedSemester];
    if (!currentSemester || !currentSemester.courses) return [];
    return currentSemester.courses.filter(course => {
      const matchesSearch = (course.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.code || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'all' ||
        (gradeFilter === 'passed' && course.status === 'passed') ||
        (gradeFilter === 'failed' && course.status === 'failed') ||
        (gradeFilter === 'retake' && course.status === 'retake');
      return matchesSearch && matchesGrade;
    });
  }, [semesterData, selectedSemester, searchQuery, gradeFilter]);

  const getGradeColor = (grade) => {
    const colors = {
      "A": "text-emerald-700 bg-emerald-100 border-emerald-200",
      "A-": "text-emerald-700 bg-emerald-100 border-emerald-200",
      "B+": "text-blue-700 bg-blue-100 border-blue-200",
      "B": "text-blue-700 bg-blue-100 border-blue-200",
      "B-": "text-blue-600 bg-blue-50 border-blue-200",
      "C+": "text-amber-700 bg-amber-100 border-amber-200",
      "C": "text-amber-700 bg-amber-100 border-amber-200",
      "C-": "text-orange-700 bg-orange-100 border-orange-200",
      "D+": "text-red-600 bg-red-50 border-red-200",
      "D": "text-red-600 bg-red-50 border-red-200",
      "F": "text-red-700 bg-red-100 border-red-300"
    };
    return colors[grade] || "text-gray-700 bg-gray-100 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'retake':
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Simulated rules (could be fetched from API in future)
const CGPA_RULES = [
  { min: 3.7, label: 'First Class', next: null },
  { min: 3.3, label: 'Upper Second Class', next: 3.7 },
  { min: 3.0, label: 'Second Class', next: 3.3 },
  { min: 2.0, label: 'General', next: 3.0 },
  { min: 0, label: 'Below General', next: 2.0 },
];


  const currentSemester = semesterData[selectedSemester];
  const failedCourses = currentSemester?.courses?.filter(c => c.status === 'failed') || [];

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading results...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }
  if (!resultsData) {
    return null;
  }

  const studentInfo = resultsData.studentInfo || {};
  const cumulativeData = resultsData.cumulative || {};
  const analytics = resultsData.analytics || {};


  return (
    <div>
    <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-lg sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="mb-3 sm:mb-4 lg:mb-0">
              <div className="">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1 tracking-tight">Academic Results</h1>
                  <p className="text-blue-100 mt-2 text-sm sm:text-base">Track your grades, GPA, and overall academic progress across all semesters.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-3">
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">{studentInfo.studentNo || 'N/A'} - </span>
                  <span className="truncate max-w-24 sm:max-w-none">{studentInfo.fullName || 'N/A'}</span>
                </span>
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Batch {studentInfo.batchId || 'N/A'}
                </span>
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Expected: </span>
                  {studentInfo.expectedGraduation || 'N/A'}
                </span>
                <span className="flex text-xs sm:text-sm items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden lg:inline">
                    {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",second:"2-digit" })}
                  </span>
                  <span className="lg:hidden">
                    {currentDateTime.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <Medal size={32} className="text-blue-200 sm:w-12 sm:h-12" />
            </div>
          </div>
          {/* Action bar: moved buttons out of header */}
          {/* <div className="mb-4 sm:mb-6 flex justify-end max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg text-sm sm:text-base"
              >
                <PieChart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </button>
            </div>
          </div> */}
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg border-l-4 border-blue-500 p-2 sm:p-4 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs font-medium text-gray-600">Current CGPA</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{cumulativeData.cgpa ?? 'N/A'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1 hidden sm:flex">
                  <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  +{(cumulativeData.cgpa && cumulativeData.previousCgpa ? (cumulativeData.cgpa - cumulativeData.previousCgpa).toFixed(2) : '0.00')} from last semester
                </p>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-100 rounded-full self-end sm:self-auto">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg border-l-4 border-green-500 p-2 sm:p-4 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all">
            <div>
              <p className="text-xs font-medium text-gray-600">Semester GPA</p>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{currentSemester?.gpa ?? 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{currentSemester?.semesterName ?? 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg border-l-4 border-purple-500 p-2 sm:p-4 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all col-span-2 sm:col-span-1">
            <div>
              <p className="text-xs font-medium text-gray-600">Credits Progress</p>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                {cumulativeData.totalCreditsCompleted ?? 'N/A'}/{cumulativeData.totalCreditsRequired ?? 'N/A'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(cumulativeData.totalCreditsCompleted && cumulativeData.totalCreditsRequired ? (cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100 : 0)}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {cumulativeData.totalCreditsCompleted && cumulativeData.totalCreditsRequired ? Math.round((cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100) : 0}% Complete
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg border-l-4 border-amber-500 p-2 sm:p-4 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all">
            <div className="flex items-center">
              <Medal className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-amber-600 mr-1 sm:mr-2" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600">Classification</p>
                <p className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900 truncate">{cumulativeData.classification ?? 'N/A'}</p>
                <p className="text-xs text-amber-600 truncate hidden sm:block">Projected: {cumulativeData.projectedClassification ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg border-l-4 border-indigo-500 p-2 sm:p-4 lg:p-6 hover:shadow-lg sm:hover:shadow-xl transition-all">
            <div>
              <p className="text-xs font-medium text-gray-600">Class Rank</p>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">#{cumulativeData.semesterRank ?? 'N/A'}</p>
              <p className="text-xs text-indigo-600 hidden sm:block">
                {(() => {
                  const rank = cumulativeData.semesterRank;
                  const size = cumulativeData.batchSize;
                  if (!rank || !size) return 'Rank N/A';
                  const percentile = ((size - rank + 1) / size) * 100;
                  return `Rank ${rank} out of ${size} students (Top ${percentile.toFixed(1)}%)`;
                })()}
              </p>
              <p className="text-xs text-indigo-600 sm:hidden">
                {(() => {
                  const rank = cumulativeData.semesterRank;
                  const size = cumulativeData.batchSize;
                  if (!rank || !size) return 'N/A';
                  return `${rank}/${size}`;
                })()}
              </p>
            </div>
          </div>
        </div>


        {/* Enhanced Navigation Tabs */}
        <div className="mb-4 sm:mb-6 max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 overflow-x-auto" aria-label="Tabs">
              {[ 
                { id: 'current', name: 'Current Semester', shortName: 'Current', count: currentSemester?.courses?.length ?? 0, icon: Clock },
                { id: 'all', name: 'All Semesters', shortName: 'All', count: null, icon: BookOpen },
                { id: 'retakes', name: 'Retakes & Backlogs', shortName: 'Retakes', count: failedCourses.length, icon: RefreshCw },
                // { id: 'performance', name: 'Performance Insights', count: null, icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.shortName}</span>
                  {tab.count !== null && (
                    <span className={`ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === 'current' && (
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-0">
                    {currentSemester?.semesterName} Results
                  </h3>
                  
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="relative">
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                      />
                    </div>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="all">All Grades</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="retake">Retakes</option>
                    </select>
                  </div>
                </div>

                {/* Semester Overview Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 sm:p-4 rounded-lg border border-green-200">
                    <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto sm:mx-0 sm:mr-2 mb-1 sm:mb-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-green-700">Courses Passed</p>
                        <p className="text-sm sm:text-lg font-semibold text-green-900">
                          {currentSemester?.courses.filter(c => c.status === 'passed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 p-2 sm:p-4 rounded-lg border border-red-200">
                    <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto sm:mx-0 sm:mr-2 mb-1 sm:mb-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-red-700">Courses Failed</p>
                        <p className="text-sm sm:text-lg font-semibold text-red-900">{failedCourses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 sm:p-4 rounded-lg border border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto sm:mx-0 sm:mr-2 mb-1 sm:mb-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-blue-700">Credits Earned</p>
                        <p className="text-sm sm:text-lg font-semibold text-blue-900">
                          {currentSemester?.creditsEarned} / {currentSemester?.creditsAttempted}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Results Table */}
                <div>
                  {/* Mobile Card Layout */}
                  <div className="block lg:hidden space-y-3 sm:space-y-4">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{course.code}</h4>
                            <p className="text-xs text-gray-500 truncate">{course.name}</p>
                            <p className="text-xs text-gray-400 truncate">{course.lecturer}</p>
                          </div>
                          <div className="flex items-center ml-2">
                            {getStatusIcon(course.status)}
                            <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full border ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500">Credits:</span>
                            <div className="flex items-center mt-1">
                              <BookOpen className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="font-medium">{course.credits}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Marks:</span>
                            <div className="flex items-center mt-1">
                              <span className="font-medium">{course.marks}</span>
                              <span className="text-gray-400 ml-1">/100</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Attendance:</span>
                            <div className="flex items-center mt-1">
                              <div className={`w-2 h-2 rounded-full mr-1 ${
                                course.attendanceRate >= 80 ? 'bg-green-500' : 
                                course.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <span className="font-medium">{course.attendanceRate}%</span>
                              {!course.examEligible && (
                                <AlertTriangle className="w-3 h-3 ml-1 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <div className="flex items-center mt-1">
                              <span className="font-medium capitalize">{course.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* <div className="mt-3 pt-3 border-t border-gray-100">
                          {course.status === 'failed' && course.retakeAvailable ? (
                            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors">
                              Enroll Retake
                            </button>
                          ) : (
                            <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-200 transition-colors flex items-center justify-center">
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </button>
                          )}
                        </div> */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {course.status === 'failed' && course.retakeAvailable ? (
                            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors">
                              Enroll Retake
                            </button>
                          ) : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCourses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{course.code}</div>
                                <div className="text-sm text-gray-500">{course.name}</div>
                                <div className="text-xs text-gray-400">{course.lecturer}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                                {course.credits}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <span className="font-medium">{course.marks}</span>
                                <span className="text-gray-400 ml-1">/100</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getGradeColor(course.grade)}`}>
                                {course.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  course.attendanceRate >= 80 ? 'bg-green-500' : 
                                  course.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-sm text-gray-900">{course.attendanceRate}%</span>
                                {!course.examEligible && (
                                  <AlertTriangle className="w-4 h-4 ml-2 text-red-500" title="Not eligible for exam" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(course.status)}
                                <span className="ml-2 text-sm text-gray-900 capitalize">{course.status}</span>
                              </div>
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                {course.status === 'failed' && course.retakeAvailable ? (
                                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                                    Enroll Retake
                                  </button>
                                ) : (
                                  <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Details
                                  </button>
                                )}
                              </div>
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                {course.status === 'failed' && course.retakeAvailable ? (
                                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                                    Enroll Retake
                                  </button>
                                ) : ''}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'retakes' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-600" />
                  Failed Subjects & Retake Opportunities
                </h3>
                
                {failedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {failedCourses.map((course) => (
                      <div key={course.id} className="border-l-4 border-red-500 rounded-lg p-6 bg-gradient-to-r from-red-50 to-rose-50 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <XCircle className="w-5 h-5 text-red-600 mr-2" />
                              <h4 className="text-lg font-semibold text-gray-900">
                                {course.code} - {course.name}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Credits</p>
                                <p className="font-semibold text-gray-900">{course.credits}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Marks Obtained</p>
                                <p className="font-semibold text-red-700">{course.marks}/100</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Grade</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(course.grade)}`}>
                                  {course.grade}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Attendance</p>
                                <p className={`font-semibold ${course.attendanceRate < 80 ? 'text-red-700' : 'text-gray-900'}`}>
                                  {course.attendanceRate}%
                                </p>
                              </div>
                            </div>
                            
                            {!course.examEligible && (
                              <div className="flex items-center p-3 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
                                <AlertTriangle className="w-4 h-4 text-yellow-700 mr-2" />
                                <span className="text-sm text-yellow-800">
                                  Not eligible for final exam due to low attendance
                                </span>
                              </div>
                            )}

                            {course.nextOffering && (
                              <div className="flex items-center p-3 bg-blue-100 border border-blue-300 rounded-lg">
                                <Calendar className="w-4 h-4 text-blue-700 mr-2" />
                                <span className="text-sm text-blue-800">
                                  Next offering available in: <strong>
                                    {course.nextOffering.semesterName || course.nextOffering.year || 'See details'}
                                  </strong>
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-3">
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                              Failed
                            </span>
                            {course.retakeAvailable && (
                              <div className="space-y-2">
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
                                  Request Retake
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-all">
                                  View Syllabus
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Improvement Suggestions */}
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Improvement Suggestions:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Focus on improving attendance (minimum 80% required)</li>
                            <li>• Review course materials and previous assignments</li>
                            <li>• Schedule consultation with {course.lecturer}</li>
                            <li>• Join study groups or peer tutoring sessions</li>
                          </ul>
                        </div>
                      </div>
                    ))}
                    
                    {/* Retake Summary
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                        Retake Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">{failedCourses.length}</p>
                          <p className="text-sm text-blue-700">Subjects to Retake</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">
                            {failedCourses.reduce((sum, course) => sum + course.credits, 0)}
                          </p>
                          <p className="text-sm text-blue-700">Credits to Recover</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">
                            {failedCourses.filter(c => c.retakeAvailable).length}
                          </p>
                          <p className="text-sm text-blue-700">Available for Retake</p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Excellent Performance!</h4>
                    <p className="text-gray-600">No failed subjects. Keep up the great work!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Academic History</h3>
                
                {/* Semester Timeline */}
                <div className="space-y-6">
                  {Object.entries(semesterData).reverse().map(([semId, semData]) => (
                    <div key={semId} className={`border rounded-xl p-6 transition-all hover:shadow-lg ${
                      semId === selectedSemester ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            semData.status === 'current' ? 'bg-blue-600' : 
                            semData.status === 'completed' ? 'bg-green-600' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{semData.semesterName}</h4>
                            <p className="text-sm text-gray-600 capitalize">{semData.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">GPA</p>
                          <p className="text-2xl font-bold text-gray-900">{semData.gpa}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Courses</p>
                          <p className="text-lg font-semibold text-gray-900">{semData.courses?.length ?? 0}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">Passed</p>
                          <p className="text-lg font-semibold text-green-900">
                            {semData.courses?.filter(c => c.status === 'passed').length ?? 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">Failed</p>
                          <p className="text-lg font-semibold text-red-900">
                            {semData.courses?.filter(c => c.status === 'failed').length ?? 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">Credits</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {semData.creditsEarned ?? 'N/A'}/{semData.creditsAttempted ?? 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedSemester(semId)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Overall Statistics */}
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {Object.values(semesterData).reduce((sum, sem) => sum + (sem.courses?.length ?? 0), 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Courses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-900">
                        {Object.values(semesterData).reduce((sum, sem) => 
                          sum + (sem.courses?.filter(c => c.status === 'passed').length ?? 0), 0
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Courses Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-900">{cumulativeData.cgpa}</p>
                      <p className="text-sm text-gray-600">Cumulative GPA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-900">{cumulativeData.totalCreditsCompleted}</p>
                      <p className="text-sm text-gray-600">Credits Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Performance Insights & Recommendations
                </h3>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Grade Distribution */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <PieChart className="w-4 h-4 mr-2" />
                      Grade Distribution - Current Semester
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {Object.entries({
                        "A": currentSemester?.courses.filter(c => c.grade.startsWith('A')).length || 0,
                        "B": currentSemester?.courses.filter(c => c.grade.startsWith('B')).length || 0,
                        "C": currentSemester?.courses.filter(c => c.grade.startsWith('C')).length || 0,
                        "F": currentSemester?.courses.filter(c => c.grade === 'F').length || 0
                      }).map(([grade, count]) => (
                        <div key={grade} className="text-center">
                          <div className={`h-12 flex items-end justify-center rounded-t ${getGradeColor(grade).split(' ')[1]}`}>
                            <div 
                              className={`w-6 ${getGradeColor(grade).split(' ')[1]} rounded`}
                              style={{ height: `${Math.max(count * 15, 4)}px` }}
                            ></div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-900">{grade}</div>
                            <div className="text-xs text-gray-500">{count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Overview */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Attendance Performance
                    </h4>
                    <div className="space-y-3">
                      {currentSemester?.courses?.map((course) => (
                        <div key={course.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              course.attendanceRate >= 80 ? 'bg-green-500' : 
                              course.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-900">{course.code}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">{course.attendanceRate}%</span>
                            {!course.examEligible && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvement Recommendations */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Personalized Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-600" />
                        Strengths to Leverage
                      </h5>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Excellent performance in programming courses</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Consistent attendance in most subjects</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Strong analytical and problem-solving skills</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                        Areas for Improvement
                      </h5>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Focus more on database and theoretical subjects</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Improve attendance in challenging courses</span>
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">Seek help earlier when struggling with concepts</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-purple-600" />
                    Immediate Action Items
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        priority: 'High', 
                        action: 'Schedule retake for failed subjects',
                        color: 'red',
                        icon: RefreshCw
                      },
                      { 
                        priority: 'High', 
                        action: 'Improve attendance in CS201 and CS301',
                        color: 'red',
                        icon: Clock
                      },
                      { 
                        priority: 'Medium', 
                        action: 'Meet with academic advisor',
                        color: 'yellow',
                        icon: User
                      },
                      { 
                        priority: 'Low', 
                        action: 'Join study groups for difficult subjects',
                        color: 'green',
                        icon: Users
                      }
                    ].map((item, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        item.color === 'red' ? 'border-red-500 bg-red-50' :
                        item.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      }`}>
                        <div className="flex items-start">
                          <item.icon className={`w-5 h-5 mr-3 mt-0.5 ${
                            item.color === 'red' ? 'text-red-600' :
                            item.color === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <div>
                            <div className={`text-xs font-medium mb-1 ${
                              item.color === 'red' ? 'text-red-700' :
                              item.color === 'yellow' ? 'text-yellow-700' :
                              'text-green-700'
                            }`}>
                              {item.priority} Priority
                            </div>
                            <p className="text-sm text-gray-700">{item.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Analytics Panel */}
        <div className="max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
          <div className="bg-white rounded-md sm:rounded-lg lg:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-200">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 sm:mr-2 text-purple-600" />
              <span className="hidden sm:inline">Performance Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-green-50 rounded-md sm:rounded-lg">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                  <span className="hidden sm:inline">Strongest Areas</span>
                  <span className="sm:hidden">Strengths</span>
                </p>
                <p className="text-xs text-gray-600 text-center break-words leading-tight min-h-[2.5rem] flex items-center justify-center px-1">
                  {analytics.strongestSubjects?.length ? analytics.strongestSubjects.join(", ") : 'N/A'}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-orange-50 rounded-md sm:rounded-lg">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                  <span className="hidden sm:inline">Improvement Areas</span>
                  <span className="sm:hidden">Improve</span>
                </p>
                <p className="text-xs text-gray-600 text-center break-words leading-tight min-h-[2.5rem] flex items-center justify-center px-1">
                  {analytics.improvementAreas?.length ? analytics.improvementAreas.join(", ") : 'N/A'}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-blue-50 rounded-md sm:rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                  <span className="hidden sm:inline">Grade Trend</span>
                  <span className="sm:hidden">Trend</span>
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {analytics.averageGradeImprovement ?? 'N/A'} 
                  <span className="hidden sm:inline"> average improvement</span>
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-purple-50 rounded-md sm:rounded-lg">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                  <span className="hidden sm:inline">Consistency Score</span>
                  <span className="sm:hidden">Score</span>
                </p>
                <p className="text-xs text-gray-600">{analytics.consistencyScore ?? 'N/A'}/100</p>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-8xl mx-auto p-3 sm:p-6 lg:p-8">
          {/* Next Milestone: Dean's List (3.5+ GPA) */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Next Milestone</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {(() => {
                    const cgpa = cumulativeData.cgpa;
                    if (cgpa === undefined || cgpa === null) return 'Milestone Unavailable';
                    const rule = CGPA_RULES.find(r => cgpa >= r.min && (!r.next || cgpa < r.next));
                    if (!rule) return 'Milestone Unavailable';
                    if (!rule.next) return `${rule.label} Achieved!`;
                    return `${rule.label === 'Below General' ? 'General' : rule.next === null ? rule.label : CGPA_RULES.find(r => r.min === rule.next).label} (${rule.next?.toFixed(1)}+ GPA)`;
                  })()}
                </p>
              </div>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                {(() => {
                  const cgpa = cumulativeData.cgpa;
                  if (cgpa === undefined || cgpa === null) return null;
                  const rule = CGPA_RULES.find(r => cgpa >= r.min && (!r.next || cgpa < r.next));
                  if (!rule) return null;
                  if (!rule.next) return <div className="bg-blue-600 h-1.5 sm:h-2 rounded-full" style={{ width: '100%' }}></div>;
                  const percent = Math.min((cgpa / rule.next) * 100, 100);
                  return (
                    <div
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  );
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const cgpa = cumulativeData.cgpa;
                  if (cgpa === undefined || cgpa === null) return 'N/A';
                  const rule = CGPA_RULES.find(r => cgpa >= r.min && (!r.next || cgpa < r.next));
                  if (!rule) return 'N/A';
                  if (!rule.next) return 'Milestone achieved!';
                  return `Need ${(rule.next - cgpa).toFixed(2)} more points`;
                })()}
              </p>
            </div>
          </div>

          {/* Graduation Progress */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Graduation Progress</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {cumulativeData.totalCreditsCompleted && cumulativeData.totalCreditsRequired
                    ? `${Math.round((cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100)}%`
                    : 'N/A'}
                </p>
              </div>
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cumulativeData.totalCreditsRequired && cumulativeData.totalCreditsCompleted !== undefined && cumulativeData.totalCreditsCompleted !== null
                ? `${cumulativeData.totalCreditsRequired - cumulativeData.totalCreditsCompleted} credits remaining`
                : 'N/A'}
            </p>
          </div>

          {/* Academic Standing */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Academic Standing</p>
                <p className="font-semibold text-green-900 text-sm sm:text-base">
                  {cumulativeData.classification || 'N/A'}
                </p>
              </div>
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {/* Show probation if classification is 'Fail' or contains 'probation' */}
              {cumulativeData.classification && (
                cumulativeData.classification.toLowerCase().includes('fail') ||
                cumulativeData.classification.toLowerCase().includes('probation')
              )
                ? 'On academic probation'
                : 'No academic probation'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;