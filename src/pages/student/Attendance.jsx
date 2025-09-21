import React, { useState } from 'react';
import { Calendar, Download, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Calculator } from 'lucide-react';

// Mock data - replace with actual API calls
const mockAttendanceData = {
  overall: {
    attendancePercentage: 82,
    totalClasses: 58,
    attendedClasses: 48,
    excusedClasses: 4,
    threshold: 75
  },
  courses: [
    {
      id: 1,
      code: "CS101",
      name: "Introduction to Programming",
      lecturer: "Dr. Silva",
      totalSessions: 20,
      attended: 18,
      excused: 1,
      absent: 1,
      attendancePercentage: 95,
      isEligible: true,
      sessions: [
        { date: "2024-09-20", topic: "Variables and Data Types", status: "present" },
        { date: "2024-09-18", topic: "Loops in Programming", status: "excused", medicalId: "med123" },
        { date: "2024-09-15", topic: "Conditional Statements", status: "present" },
        { date: "2024-09-13", topic: "Introduction to Java", status: "absent" }
      ]
    },
    {
      id: 2,
      code: "CS201",
      name: "Data Structures",
      lecturer: "Prof. Fernando",
      totalSessions: 18,
      attended: 11,
      excused: 2,
      absent: 5,
      attendancePercentage: 72,
      isEligible: false,
      sessions: [
        { date: "2024-09-21", topic: "Binary Trees", status: "present" },
        { date: "2024-09-19", topic: "Linked Lists", status: "absent" },
        { date: "2024-09-17", topic: "Arrays and Stacks", status: "excused", medicalId: "med124" }
      ]
    },
    {
      id: 3,
      code: "MA201",
      name: "Discrete Mathematics",
      lecturer: "Dr. Perera",
      totalSessions: 20,
      attended: 19,
      excused: 1,
      absent: 0,
      attendancePercentage: 100,
      isEligible: true,
      sessions: []
    }
  ],
  medicals: [
    { id: "med123", status: "approved", fromDate: "2024-09-18", toDate: "2024-09-18", reason: "Fever" },
    { id: "med124", status: "pending", fromDate: "2024-09-17", toDate: "2024-09-19", reason: "Food poisoning" }
  ]
};

const semesters = [
  { id: 'current', name: 'Semester 1 - 2024/2025', current: true },
  { id: 'prev1', name: 'Semester 2 - 2023/2024', current: false },
  { id: 'prev2', name: 'Semester 1 - 2023/2024', current: false }
];

export default function StudentAttendance() {
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'calendar', 'calculator'
  const [whatIfMissed, setWhatIfMissed] = useState(0);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'excused':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const calculateWhatIf = (course, additionalMissed) => {
    const totalAfter = course.totalSessions + additionalMissed;
    const attendedAfter = course.attended;
    return Math.round((attendedAfter / totalAfter) * 100);
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Overall Attendance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mockAttendanceData.overall.attendancePercentage}%</div>
            <div className="text-sm text-gray-600">Overall Attendance</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {mockAttendanceData.overall.attendedClasses} / {mockAttendanceData.overall.totalClasses}
            </div>
            <div className="text-sm text-gray-600">Classes Attended</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{mockAttendanceData.overall.excusedClasses}</div>
            <div className="text-sm text-gray-600">Excused Classes</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{mockAttendanceData.overall.threshold}%</div>
            <div className="text-sm text-gray-600">Required Threshold</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress towards threshold</span>
            <span>{mockAttendanceData.overall.attendancePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(mockAttendanceData.overall.attendancePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course-wise Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Course-wise Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lecturer</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Excused</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAttendanceData.courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{course.code}</div>
                      <div className="text-sm text-gray-500">{course.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{course.lecturer}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{course.totalSessions}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{course.attended}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {course.excused > 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        {course.excused}
                        <FileText className="w-3 h-3 text-blue-500" />
                      </span>
                    ) : (
                      course.excused
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">{course.absent}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(course.attendancePercentage)}`}>
                      {course.attendancePercentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {course.isEligible ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

  const CalendarTab = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Attendance Calendar</h2>
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Calendar view implementation would show monthly view with attendance markers</p>
      </div>
    </div>
  );

  const CalculatorTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          What-If Calculator
        </h2>
        <p className="text-gray-600 mb-4">See how missing additional classes would affect your attendance percentage.</p>
        
        <div className="space-y-4">
          {mockAttendanceData.courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{course.code} - {course.name}</h3>
                  <p className="text-sm text-gray-500">Current: {course.attendancePercentage}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional classes to miss:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={whatIfMissed}
                    onChange={(e) => setWhatIfMissed(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New percentage would be:
                  </label>
                  <div className={`px-3 py-2 rounded-md text-center font-medium ${getAttendanceColor(calculateWhatIf(course, whatIfMissed))}`}>
                    {calculateWhatIf(course, whatIfMissed)}%
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eligibility Status:
                  </label>
                  <div className="px-3 py-2 text-center">
                    {calculateWhatIf(course, whatIfMissed) >= mockAttendanceData.overall.threshold ? (
                      <span className="text-green-600 font-medium">✓ Eligible</span>
                    ) : (
                      <span className="text-red-600 font-medium">⚠ Below Threshold</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CourseDetailsModal = ({ course, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{course.code} - {course.name}</h2>
            <p className="text-gray-600">{course.lecturer}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold">{course.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{course.attended}</div>
              <div className="text-sm text-gray-600">Attended</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{course.excused}</div>
              <div className="text-sm text-gray-600">Excused</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{course.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {course.sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(session.status)}
                  <div>
                    <div className="font-medium">{session.topic}</div>
                    <div className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.status === 'present' ? 'bg-green-100 text-green-800' :
                    session.status === 'absent' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  {session.medicalId && (
                    <FileText className="w-4 h-4 text-blue-500" title="Medical excuse applied" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            <p className="text-gray-600 mt-1">Track your class attendance and eligibility status</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} {semester.current && '(Current)'}
                </option>
              ))}
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border shadow-sm">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'calendar', label: 'Calendar View', icon: Calendar },
            { key: 'calculator', label: 'What-If Calculator', icon: Calculator }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === tab.key
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {viewMode === 'overview' && <OverviewTab />}
        {viewMode === 'calendar' && <CalendarTab />}
        {viewMode === 'calculator' && <CalculatorTab />}

        {/* Course Details Modal */}
        {selectedCourse && (
          <CourseDetailsModal 
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
          />
        )}
      </div>
    </main>
  );
}