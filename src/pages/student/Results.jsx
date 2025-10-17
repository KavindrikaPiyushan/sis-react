import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, FileText, BarChart3, Calendar, User, Award, Search, Filter,
  BookOpen, Clock, Target, Medal, AlertTriangle, Eye, ChevronRight,
  GraduationCap, Star, Zap, PieChart, LineChart, Users, Bell
} from 'lucide-react';

import LoadingComponent from '../../components/LoadingComponent';

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedSemester, setSelectedSemester] = useState('2025-S1');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Enhanced student data with more realistic information
  const studentInfo = {
    studentNo: "2022/ICT/045",
    fullName: "Kavindu Piyumal",
    batchId: "2022",
    currentSemester: "2025-S1",
    degreeProgram: "Bachelor of Information and Communication Technology",
    expectedGraduation: "2026",
    advisor: "Dr. Sarah Johnson"
  };

  // Enhanced semester data with more semesters
  const semesterData = {
    "2025-S1": {
      semesterName: "2025 - Semester 1",
      gpa: 3.45,
      creditsAttempted: 18,
      creditsEarned: 15,
      status: "current",
      courses: [
        {
          id: "cs101_2025_s1",
          code: "CS101",
          name: "Introduction to Programming",
          credits: 3,
          marks: 78,
          grade: "A",
          gradePoint: 4.0,
          status: "passed",
          lecturer: "Dr. Smith",
          attempts: 1,
          attendanceRate: 95,
          examEligible: true
        },
        {
          id: "cs201_2025_s1",
          code: "CS201",
          name: "Data Structures & Algorithms",
          credits: 3,
          marks: 42,
          grade: "F",
          gradePoint: 0.0,
          status: "failed",
          lecturer: "Prof. Johnson",
          attempts: 1,
          retakeAvailable: true,
          nextOffering: "2025-S2",
          attendanceRate: 72,
          examEligible: false
        },
        {
          id: "math201_2025_s1",
          code: "MATH201",
          name: "Discrete Mathematics",
          credits: 3,
          marks: 68,
          grade: "B+",
          gradePoint: 3.3,
          status: "passed",
          lecturer: "Dr. Williams",
          attempts: 1,
          attendanceRate: 88,
          examEligible: true
        },
        {
          id: "eng101_2025_s1",
          code: "ENG101",
          name: "Technical English",
          credits: 2,
          marks: 55,
          grade: "C+",
          gradePoint: 2.3,
          status: "passed",
          lecturer: "Ms. Brown",
          attempts: 1,
          attendanceRate: 92,
          examEligible: true
        },
        {
          id: "cs301_2025_s1",
          code: "CS301",
          name: "Database Systems",
          credits: 4,
          marks: 32,
          grade: "F",
          gradePoint: 0.0,
          status: "failed",
          lecturer: "Dr. Davis",
          attempts: 1,
          retakeAvailable: true,
          nextOffering: "2025-S2",
          attendanceRate: 65,
          examEligible: false
        },
        {
          id: "cs202_2025_s1",
          code: "CS202",
          name: "Object Oriented Programming",
          credits: 3,
          marks: 72,
          grade: "A-",
          gradePoint: 3.7,
          status: "passed",
          lecturer: "Prof. Wilson",
          attempts: 1,
          attendanceRate: 90,
          examEligible: true
        }
      ]
    },
    "2024-S2": {
      semesterName: "2024 - Semester 2",
      gpa: 3.22,
      creditsAttempted: 16,
      creditsEarned: 16,
      status: "completed",
      courses: [
        {
          id: "cs102_2024_s2",
          code: "CS102",
          name: "Programming Fundamentals II",
          credits: 3,
          marks: 82,
          grade: "A-",
          gradePoint: 3.7,
          status: "passed",
          attempts: 1
        },
        {
          id: "math102_2024_s2",
          code: "MATH102",
          name: "Calculus II",
          credits: 3,
          marks: 71,
          grade: "B+",
          gradePoint: 3.3,
          status: "passed",
          attempts: 1
        }
      ]
    }
  };

  const cumulativeData = {
    cgpa: 3.38,
    cgpaTrend: "up",
    previousCgpa: 3.22,
    totalCreditsCompleted: 78,
    totalCreditsRequired: 120,
    classification: "Upper Second Class",
    projectedClassification: "First Class",
    semesterRank: 12,
    batchSize: 85,
    percentile: 86
  };

  const analytics = {
    strongestSubjects: ["Programming", "Software Engineering"],
    improvementAreas: ["Mathematics", "Database Systems"],
    averageGradeImprovement: "+0.3",
    consistencyScore: 78,
    targetGPA: 3.5
  };

  // Filter and search functionality
  const filteredCourses = useMemo(() => {
    const currentSemester = semesterData[selectedSemester];
    if (!currentSemester) return [];

    return currentSemester.courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || 
                          (gradeFilter === 'passed' && course.status === 'passed') ||
                          (gradeFilter === 'failed' && course.status === 'failed') ||
                          (gradeFilter === 'retake' && course.status === 'retake');
      return matchesSearch && matchesGrade;
    });
  }, [selectedSemester, searchQuery, gradeFilter]);

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

  const currentSemester = semesterData[selectedSemester];
  const failedCourses = currentSemester?.courses?.filter(c => c.status === 'failed') || [];

  useEffect(() => {
    // simulate initial load / allow showing the shared loader briefly if needed
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-8xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingComponent message="Loading results..." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div >
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-8xl mx-auto p-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="mb-4 lg:mb-0">
              <div className="">
                  <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Academic Results</h1>
                  {/* <p className="text-blue-100 mt-2">Track your grades, GPA, and overall academic progress across all semesters.</p> */}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <User className="w-4 h-4 mr-1" />
                  {studentInfo.studentNo} - {studentInfo.fullName}
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Batch {studentInfo.batchId}
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Expected: {studentInfo.expectedGraduation}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <GraduationCap size={48} className="text-blue-200" />
            </div>
            {/* <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                <PieChart className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                <Download className="w-4 h-4 mr-2" />
                Transcript
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <LineChart className="w-4 h-4 mr-2" />
                Trends
              </button>
            </div> */}
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8 max-w-8xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current CGPA</p>
                <p className="text-3xl font-bold text-gray-900">{cumulativeData.cgpa}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{(cumulativeData.cgpa - cumulativeData.previousCgpa).toFixed(2)} from last semester
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-6 hover:shadow-xl transition-all">
            <div>
              <p className="text-sm font-medium text-gray-600">Semester GPA</p>
              <p className="text-3xl font-bold text-gray-900">{currentSemester?.gpa}</p>
              <p className="text-xs text-gray-500 mt-1">{currentSemester?.semesterName}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500 p-6 hover:shadow-xl transition-all">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {cumulativeData.totalCreditsCompleted}/{cumulativeData.totalCreditsRequired}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {Math.round((cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100)}% Complete
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-l-4 border-amber-500 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center">
              <Medal className="w-5 h-5 text-amber-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Classification</p>
                <p className="text-lg font-semibold text-gray-900">{cumulativeData.classification}</p>
                <p className="text-xs text-amber-600">Projected: {cumulativeData.projectedClassification}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-l-4 border-indigo-500 p-6 hover:shadow-xl transition-all">
            <div>
              <p className="text-sm font-medium text-gray-600">Class Rank</p>
              <p className="text-2xl font-bold text-gray-900">#{cumulativeData.semesterRank}</p>
              <p className="text-xs text-indigo-600">
                Top {cumulativeData.percentile}% of {cumulativeData.batchSize} students
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200 ">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-600" />
              Performance Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Strongest Areas</p>
                <p className="text-sm text-gray-600">{analytics.strongestSubjects.join(", ")}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Improvement Areas</p>
                <p className="text-sm text-gray-600">{analytics.improvementAreas.join(", ")}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Grade Trend</p>
                <p className="text-sm text-gray-600">{analytics.averageGradeImprovement} average improvement</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Consistency Score</p>
                <p className="text-sm text-gray-600">{analytics.consistencyScore}/100</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Tabs */}
        <div className="mb-6  max-w-8xl mx-auto p-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'current', name: 'Current Semester', count: currentSemester?.courses.length, icon: Clock },
                { id: 'all', name: 'All Semesters', count: null, icon: BookOpen },
                { id: 'retakes', name: 'Retakes & Backlogs', count: failedCourses.length, icon: RefreshCw },
                // { id: 'performance', name: 'Performance Insights', count: null, icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.count !== null && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
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
          <div className="p-6">
            {activeTab === 'current' && (
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                    {currentSemester?.semesterName} Results
                  </h3>
                  
                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Grades</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="retake">Retakes</option>
                    </select>
                  </div>
                </div>

                {/* Semester Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-green-700">Courses Passed</p>
                        <p className="text-lg font-semibold text-green-900">
                          {currentSemester?.courses.filter(c => c.status === 'passed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <p className="text-sm text-red-700">Courses Failed</p>
                        <p className="text-lg font-semibold text-red-900">{failedCourses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm text-blue-700">Credits Earned</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {currentSemester?.creditsEarned} / {currentSemester?.creditsAttempted}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Results Table */}
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'retakes' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
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
                                  Next offering available in: <strong>{course.nextOffering}</strong>
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
                          <p className="text-lg font-semibold text-gray-900">{semData.courses.length}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">Passed</p>
                          <p className="text-lg font-semibold text-green-900">
                            {semData.courses.filter(c => c.status === 'passed').length}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">Failed</p>
                          <p className="text-lg font-semibold text-red-900">
                            {semData.courses.filter(c => c.status === 'failed').length}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">Credits</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {semData.creditsEarned}/{semData.creditsAttempted}
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
                        {Object.values(semesterData).reduce((sum, sem) => sum + sem.courses.length, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Courses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-900">
                        {Object.values(semesterData).reduce((sum, sem) => 
                          sum + sem.courses.filter(c => c.status === 'passed').length, 0
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
                      {currentSemester?.courses.map((course) => (
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

        {/* Quick Stats Footer */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Milestone</p>
                <p className="font-semibold text-gray-900">Dean's List (3.5+ GPA)</p>
              </div>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(cumulativeData.cgpa / 3.5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Need {(3.5 - cumulativeData.cgpa).toFixed(2)} more points
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graduation Progress</p>
                <p className="font-semibold text-gray-900">
                  {Math.round((cumulativeData.totalCreditsCompleted / cumulativeData.totalCreditsRequired) * 100)}%
                </p>
              </div>
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cumulativeData.totalCreditsRequired - cumulativeData.totalCreditsCompleted} credits remaining
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Academic Standing</p>
                <p className="font-semibold text-green-900">Good Standing</p>
              </div>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              No academic probation
            </p>
          </div>
        </div> */}
      </main>
    </div>
  );
};

export default Results;