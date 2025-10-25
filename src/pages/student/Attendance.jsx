import React, { useState, useEffect } from 'react';
import { Calendar, Download, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Calculator } from 'lucide-react';
import AttendenceService from '../../services/attendenceService';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingComponent from '../../components/LoadingComponent';
import HeaderBar from '../../components/HeaderBar';
export default function StudentAttendance() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  // whatIfMissed: { [offeringId]: value }
  const [whatIfMissed, setWhatIfMissed] = useState({});
  const [courseSessions, setCourseSessions] = useState({}); // { offeringId: { sessions, stats } }
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  // Fetch attendance data on mount
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      const res = await AttendenceService.getMyAttendanceAcrossOfferings();
      setLoading(false);
      if (res.success && res.data) {
        setAttendanceData(res.data);
        // Extract unique semesters from offerings
        const semMap = {};
        res.data.offerings.forEach(o => {
          const sem = o.semester || o.courseOffering?.semester;
          if (sem && !semMap[sem.id]) {
            semMap[sem.id] = {
              id: sem.id,
              name: sem.name,
              startDate: sem.startDate,
              endDate: sem.endDate,
              status: sem.status
            };
          }
        });
        const semArr = Object.values(semMap).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setSemesters(semArr);
        if (semArr.length > 0) setSelectedSemester(semArr[0].id);
      } else {
        showToast('error', 'Error', res.message || 'Failed to fetch attendance');
      }
    };
    fetchAttendance();
  }, []);

  // Fetch sessions for a course offering
  const fetchCourseSessions = async (offeringId) => {
    setLoading(true);
    const res = await AttendenceService.getMyAttendanceForOffering(offeringId);
    setLoading(false);
    if (res.success && res.data) {
      setCourseSessions(prev => ({ ...prev, [offeringId]: res.data }));
    } else {
      showToast('error', 'Error', res.message || 'Failed to fetch course sessions');
    }
  };

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

  // course: {marked, attended}
  // Use attendanceMarkedSessionsCount for what-if calculation
  const calculateWhatIf = (course, additionalMissed) => {
    const marked = course.marked ?? 0;
    const attended = course.attended ?? 0;
    const totalAfter = marked + additionalMissed;
    if (totalAfter === 0) return 0;
    return Math.round((attended / totalAfter) * 100);
  };

  const OverviewTab = () => {
  if (!attendanceData) return null;
  // Filter courses by selected semester
  const filteredCourses = attendanceData.offerings.filter(o => (selectedSemester ? (o.semester?.id || o.courseOffering?.semesterId) === selectedSemester : true));
  const overall = attendanceData.overall ?? {};

  // Calculate correct overall attendance percent using only marked sessions
  const overallMarked = overall.marked ?? overall.total ?? 0;
  const overallAttended = overall.attended ?? 0;
  const overallPercent = overallMarked > 0 ? Math.round((overallAttended / overallMarked) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Overall Attendance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overallPercent}%</div>
            <div className="text-sm text-gray-600">Overall Attendance</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {overallAttended} / {overallMarked}
            </div>
            <div className="text-sm text-gray-600">Classes Attended</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{overall.excused ?? 0}</div>
            <div className="text-sm text-gray-600">Excused Classes</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{overall.attendanceThreshold ?? 75}%</div>
            <div className="text-sm text-gray-600">Required Threshold</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress towards threshold</span>
            <span>{overallPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
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
              {filteredCourses.map((o) => {
                const c = o.courseOffering;
                // Use attendanceMarkedSessionsCount for percentage
                const marked = o.attendanceMarkedSessionsCount ?? o.sessionsCount ?? 0;
                const attended = o.presentCount ?? 0;
                const percent = marked > 0 ? Math.round((attended / marked) * 100) : 0;
                const eligible = percent >= (overall.attendanceThreshold ?? 75);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{c.subject?.code}</div>
                        <div className="text-sm text-gray-500">{c.subject?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{o.lecturer?.user?.firstName} {o.lecturer?.user?.lastName}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{marked}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{attended}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{o.excusedCount}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{o.absentCount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceColor(percent)}`}>
                        {percent}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {eligible ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          if (!courseSessions[c.id]) await fetchCourseSessions(c.id);
                          setSelectedCourse({ ...o, sessions: courseSessions[c.id]?.sessions || [] });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  const CalendarTab = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold mb-4">Attendance Calendar</h2>
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Calendar view implementation would show monthly view with attendance markers</p>
      </div>
    </div>
  );

  const CalculatorTab = () => {
    if (!attendanceData) return null;
    const filteredCourses = attendanceData.offerings.filter(o => (selectedSemester ? (o.semester?.id || o.courseOffering?.semesterId) === selectedSemester : true));
    const overall = attendanceData.overall;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            What-If Calculator
          </h2>
          <p className="text-gray-600 mb-4">See how missing additional classes would affect your attendance percentage.</p>
          <div className="space-y-4">
            {filteredCourses.map((o) => {
              const c = o.courseOffering;
              // Use attendanceMarkedSessionsCount for calculations
              const marked = o.attendanceMarkedSessionsCount ?? 0;
              const attended = o.presentCount ?? 0;
              const percent = marked > 0 ? Math.round((attended / marked) * 100) : 0;
              const threshold = overall.attendanceThreshold ?? 75;
              // Calculate remaining sessions as sessionsCount - attendanceMarkedSessionsCount
              const remaining = Math.max((o.sessionsCount ?? 0) - marked, 0);
              const maxMiss = remaining;
              const missed = whatIfMissed[c.id] || 0;
              if ((o.sessionsCount ?? 0) === 0) {
                return (
                  <div key={c.id} className="border rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                    <h3 className="font-medium mb-2">{c.subject?.code} - {c.subject?.name}</h3>
                    <div className="text-sm">No sessions scheduled for this course.</div>
                  </div>
                );
              }
              // What-if calculation uses marked + missed as denominator
              const newPercent = calculateWhatIf({ marked, attended }, missed);
              return (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{c.subject?.code} - {c.subject?.name}</h3>
                      <p className="text-sm text-gray-500">Current: {percent}%</p>
                    </div>
                    <div className="text-xs text-gray-500">Remaining sessions: <span className="font-semibold text-blue-700">{maxMiss}</span></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional classes to miss:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxMiss}
                        value={missed}
                        onChange={e => {
                          let v = parseInt(e.target.value) || 0;
                          if (v < 0) v = 0;
                          if (v > maxMiss) v = maxMiss;
                          setWhatIfMissed(prev => ({ ...prev, [c.id]: v }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={maxMiss === 0}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New percentage would be:
                      </label>
                      <div className={`px-3 py-2 rounded-md text-center font-medium ${getAttendanceColor(newPercent)}`}>
                        {newPercent}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eligibility Status:
                      </label>
                      <div className="px-3 py-2 text-center">
                        {newPercent >= threshold ? (
                          <span className="text-green-600 font-medium">✓ Eligible</span>
                        ) : (
                          <span className="text-red-600 font-medium">⚠ Below Threshold</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const CourseDetailsModal = ({ course, onClose }) => {
    const c = course.courseOffering;
    const stats = courseSessions[c.id]?.stats || {};
    const sessions = courseSessions[c.id]?.sessions || [];
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{c.subject?.code} - {c.subject?.name}</h2>
              <p className="text-gray-600">{course.lecturer?.user?.firstName} {course.lecturer?.user?.lastName}</p>
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
                <div className="text-lg font-bold">{stats.totalSessions ?? 0}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-green-600">{stats.presentCount ?? 0}</div>
                <div className="text-sm text-gray-600">Attended</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">{stats.excusedCount ?? 0}</div>
                <div className="text-sm text-gray-600">Excused</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-red-600">{stats.absentCount ?? 0}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-3">
              {sessions.length === 0 && <div className="text-gray-500">No sessions found.</div>}
              {sessions.map((s, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(s.attendance?.status)}
                    <div>
                      <div className="font-medium">{s.session?.topic}</div>
                      <div className="text-sm text-gray-500">{s.session?.date ? new Date(s.session.date).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      s.attendance?.status === 'present' ? 'bg-green-100 text-green-800' :
                      s.attendance?.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {s.attendance?.status ? s.attendance.status.charAt(0).toUpperCase() + s.attendance.status.slice(1) : 'N/A'}
                    </span>
                    {s.attendance?.medicalId && (
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
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-8xl mx-auto p-8">
        {/* header */}
        <HeaderBar
          title="My Attendance"
          subtitle="Track your class attendance and eligibility status"
          Icon={Calendar}
        />
        {/*end header */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border shadow-sm">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
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
        {loading && <LoadingComponent message="Loading attendance..." spinner="circle" />}
        {!loading && viewMode === 'overview' && <OverviewTab />}
        {!loading && viewMode === 'calendar' && <CalendarTab />}
        {!loading && viewMode === 'calculator' && <CalculatorTab />}
        {/* Course Details Modal */}
        {selectedCourse && (
          <CourseDetailsModal
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
        {/* Confirm Dialog (for future actions) */}
        <ConfirmDialog
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          onConfirm={() => {
            if (confirm.onConfirm) confirm.onConfirm();
            setConfirm({ ...confirm, open: false });
          }}
          onCancel={() => setConfirm({ ...confirm, open: false })}
        />
      </div>
    </main>
  );
}