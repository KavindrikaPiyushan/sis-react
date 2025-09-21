import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, TrendingUp, AlertTriangle, Calculator, Eye, Edit2, RotateCcw, Award, BarChart3, Users, Target, FileSpreadsheet } from 'lucide-react';

export default function ResultsGPASystem  () {
  const [activeTab, setActiveTab] = useState('results');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);

  // Mock data
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

  const results = [
    {
      id: 'res789',
      studentId: 'stu123',
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
      studentId: 'stu123',
      courseCode: 'ICT102',
      courseName: 'Data Structures',
      marks: 65,
      grade: 'B',
      gradePoint: 3.0,
      credits: 4,
      attemptNo: 2,
      examType: 'improvement',
      semester: 'Fall 2024',
      isBestAttempt: true,
      weightageBreakdown: { mid: 25, final: 50, quiz: 15, assignment: 10 }
    }
  ];

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

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
    </div>
  );

  const ResultsTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Results</h3>
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
              <option value="all">All Semesters</option>
              <option value="current">Current Semester</option>
              <option value="fall2024">Fall 2024</option>
              <option value="spring2024">Spring 2024</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Result
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => {
              const student = students.find(s => s.id === result.studentId);
              return (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student?.name}</div>
                      <div className="text-sm text-gray-500">{student?.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.courseCode}</div>
                      <div className="text-sm text-gray-500">{result.courseName}</div>
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
                        <Award className="h-4 w-4 text-gold-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const GPADashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Average CGPA" 
          value="3.40" 
          subtitle="All Students"
          icon={BarChart3}
          trend={2.5}
          color="blue"
        />
        <StatCard 
          title="At-Risk Students" 
          value="23" 
          subtitle="CGPA < 2.5"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard 
          title="Honor Students" 
          value="45" 
          subtitle="CGPA ≥ 3.5"
          icon={Award}
          color="green"
        />
        <StatCard 
          title="Total Students" 
          value="156" 
          subtitle="Active Enrollment"
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">GPA Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Semester
              </button>
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>GPA Trend Chart Visualization</p>
              <p className="text-sm">Shows semester-wise GPA progression</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="space-y-3">
            {gradeScale.slice(0, 6).map((grade) => (
              <div key={grade.grade} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${grade.color}`}></div>
                <span className="text-sm font-medium text-gray-700 flex-1">{grade.grade}</span>
                <span className="text-sm text-gray-500">
                  {Math.floor(Math.random() * 30) + 5}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Student GPA Rankings</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowWhatIfModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calculator className="h-4 w-4" />
                What-If Calculator
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGPA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current GPA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.sort((a, b) => b.cgpa - a.cgpa).map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                      {index < 3 && (
                        <Award className={`ml-2 h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">{student.cgpa.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.currentSemesterGpa.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.creditsCompleted}/{student.totalCredits}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(student.creditsCompleted / student.totalCredits) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {student.status}
                      </span>
                      {student.riskLevel === 'high' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Results & GPA Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive student performance tracking and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export Reports
            </button>
          </div>
        </div>

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
              onClick={() => setActiveTab('gpa')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gpa' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              GPA Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics & Reports
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'grading' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Grading Policy
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'results' && <ResultsTable />}
        {activeTab === 'gpa' && <GPADashboard />}
        
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-green-900">Improving Students</div>
                      <div className="text-2xl font-bold text-green-600">32</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-red-900">Declining Students</div>
                      <div className="text-2xl font-bold text-red-600">8</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-blue-900">Stable Performance</div>
                      <div className="text-2xl font-bold text-blue-600">116</div>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Department Comparison */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Performance</h3>
                <div className="space-y-3">
                  {[
                    { dept: 'Computer Science', avg: 3.45, students: 89, color: 'bg-blue-500' },
                    { dept: 'Information Technology', avg: 3.32, students: 67, color: 'bg-green-500' },
                    { dept: 'Software Engineering', avg: 3.28, students: 54, color: 'bg-purple-500' },
                    { dept: 'Data Science', avg: 3.51, students: 43, color: 'bg-orange-500' }
                  ].map((dept) => (
                    <div key={dept.dept} className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${dept.color}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{dept.dept}</span>
                          <span className="text-sm font-semibold text-gray-900">{dept.avg}</span>
                        </div>
                        <div className="text-xs text-gray-500">{dept.students} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance Analysis</h3>
                <div className="space-y-3">
                  {[
                    { course: 'Data Structures', avg: 2.8, difficulty: 'High', enrolled: 45 },
                    { course: 'Database Systems', avg: 3.2, difficulty: 'Medium', enrolled: 52 },
                    { course: 'Web Development', avg: 3.6, difficulty: 'Low', enrolled: 38 },
                    { course: 'Machine Learning', avg: 2.9, difficulty: 'High', enrolled: 29 }
                  ].map((course) => (
                    <div key={course.course} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{course.course}</span>
                        <span className="text-sm font-semibold text-gray-900">{course.avg} avg</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{course.enrolled} enrolled</span>
                        <span className={`px-2 py-1 rounded ${
                          course.difficulty === 'High' ? 'bg-red-100 text-red-800' :
                          course.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Warning System */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Early Warning Alerts
                </h3>
                <div className="space-y-3">
                  {[
                    { student: 'Sarah Johnson', issue: 'CGPA dropped below 3.0', severity: 'high' },
                    { student: 'Alex Brown', issue: 'Failed 2 consecutive courses', severity: 'high' },
                    { student: 'Emma Davis', issue: 'Attendance below 75%', severity: 'medium' },
                    { student: 'Ryan Miller', issue: 'No improvement attempts', severity: 'low' }
                  ].map((alert) => (
                    <div key={alert.student} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="text-sm font-medium text-gray-900">{alert.student}</div>
                      <div className="text-xs text-gray-600 mt-1">{alert.issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Analytics Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg GPA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Honor Roll</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">At Risk</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { semester: 'Fall 2024', enrolled: 156, passRate: '94.2%', avgGpa: 3.40, honor: 45, risk: 8 },
                      { semester: 'Spring 2024', enrolled: 148, passRate: '91.9%', avgGpa: 3.32, honor: 38, risk: 12 },
                      { semester: 'Fall 2023', enrolled: 142, passRate: '89.4%', avgGpa: 3.28, honor: 35, risk: 15 }
                    ].map((sem) => (
                      <tr key={sem.semester} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{sem.semester}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{sem.enrolled}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{sem.passRate}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{sem.avgGpa}</td>
                        <td className="px-6 py-4 text-sm text-green-600">{sem.honor}</td>
                        <td className="px-6 py-4 text-sm text-red-600">{sem.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'grading' && (
          <div className="space-y-6">
            {/* Grading Policy Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Grading Policy Configuration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Policy Settings */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Retake Handling Policy</label>
                    <div className="space-y-2">
                      {['best_grade', 'latest_attempt', 'average', 'count_all'].map((option) => (
                        <label key={option} className="flex items-center">
                          <input 
                            type="radio" 
                            name="retakePolicy" 
                            value={option}
                            defaultChecked={option === 'best_grade'}
                            className="mr-3 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {option.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Pass/Fail Courses</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="passFail" value="include" defaultChecked className="mr-3 text-blue-600" />
                        <span className="text-sm text-gray-700">Include in CGPA calculation</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="passFail" value="exclude" className="mr-3 text-blue-600" />
                        <span className="text-sm text-gray-700">Exclude from CGPA calculation</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Incomplete Grades</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="incomplete" value="exclude" defaultChecked className="mr-3 text-blue-600" />
                        <span className="text-sm text-gray-700">Exclude until resolved</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="incomplete" value="zero" className="mr-3 text-blue-600" />
                        <span className="text-sm text-gray-700">Treat as 0.0</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GPA Rounding</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="2">Round to 2 decimal places</option>
                      <option value="3">Round to 3 decimal places</option>
                      <option value="truncate">Truncate decimals</option>
                    </select>
                  </div>
                </div>

                {/* Grade Scale */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Grade Scale Configuration</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2">Grade</th>
                          <th className="text-left py-2">Min %</th>
                          <th className="text-left py-2">Max %</th>
                          <th className="text-left py-2">GP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeScale.map((grade) => (
                          <tr key={grade.grade} className="border-b border-gray-100">
                            <td className="py-2">
                              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${grade.color}`}>
                                {grade.grade}
                              </div>
                            </td>
                            <td className="py-2">
                              <input 
                                type="number" 
                                defaultValue={grade.minMarks}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </td>
                            <td className="py-2">
                              <input 
                                type="number" 
                                defaultValue={grade.maxMarks}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </td>
                            <td className="py-2">
                              <input 
                                type="number" 
                                step="0.1"
                                defaultValue={grade.gradePoint}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Reset to Default
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Policy Changes
                </button>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Policy Change History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affected Students</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">2024-09-15</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Dr. Admin</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Updated retake policy to "best_grade"</td>
                      <td className="px-6 py-4 text-sm text-gray-900">23 students</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">2024-08-20</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Registrar</td>
                      <td className="px-6 py-4 text-sm text-gray-900">Modified A+ grade point from 4.0 to 4.0</td>
                      <td className="px-6 py-4 text-sm text-gray-900">156 students</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <WhatIfModal />
      </div>
    </main>
  );}