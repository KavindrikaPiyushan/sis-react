import { useState, useEffect } from 'react';
import MedicalReportsService from '../../services/medicalReportsService';
import { Upload, Calendar, FileText, Clock, CheckCircle, ChevronLeft, XCircle, AlertCircle, X, Paperclip, ChevronDown, ChevronRight, Activity, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import StudentService from '../../services/student/studentService';
import AttendenceService from '../../services/attendenceService';
import FileService from '../../services/common/fileService';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../utils/ConfirmDialog';
import HeaderBar from '../../components/HeaderBar';
export default function MedicalReports() {
  const [medicalReports, setMedicalReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    attachments: []
  });
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    title: '', 
    message: '', 
    onConfirm: null, 
    onCancel: null 
  });

  const [view, setView] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessionList, setSessionList] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalSubmissions: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch enrolled courses on mount
  useEffect(() => {
    setLoadingCourses(true);
    StudentService.getEnrolledCourses()
      .then((data) => {
        const filtered = (data || []).filter(c => c.semester && (c.semester.status === 'inprogress' || c.semester.status === 'completed'));
        setCourses(filtered);
        setLoadingCourses(false);
        if (filtered.length > 0) {
          const currentSem = filtered.find(c => c.semester.status === 'inprogress');
          if (currentSem) {
            setExpandedSemesters({ [currentSem.semester.id]: true });
          }
        }
      })
      .catch(() => {
        setLoadingCourses(false);
        showToast('error', 'Error', 'Failed to load enrolled courses');
      });
  }, []);

  // Fetch summary stats when studentId is available
  useEffect(() => {
    if (currentStudentId) {
      fetchSummaryStats(currentStudentId);
    }
  }, [currentStudentId]);

  const fetchSummaryStats = async (studentId) => {
    setLoadingStats(true);
    try {
      const response = await MedicalReportsService.getStudentSummary(studentId);
      if (response.success && response.summary) {
        setSummaryStats({
          totalSubmissions: response.summary.totalSubmissions || 0,
          approved: response.summary.approved || 0,
          pending: response.summary.pending || 0,
          rejected: response.summary.rejected || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch summary stats:', error);
    }
    setLoadingStats(false);
  };

  // Group courses by semester
  const semesterMap = {};
  courses.forEach(c => {
    if (!semesterMap[c.semester.id]) {
      semesterMap[c.semester.id] = { semester: c.semester, offerings: [] };
    }
    semesterMap[c.semester.id].offerings.push(c);
  });
  const semesters = Object.values(semesterMap).sort((a, b) => (a.semester.startDate > b.semester.startDate ? -1 : 1));

  // Show sessions for a course
  const showSessionsScreen = async (offering) => {
    setSelectedCourse(offering);
    setView('sessions');
    setSessionList([]);
    setSessionLoading(true);
    try {
      const res = await AttendenceService.getMyAttendanceForOffering(offering.id);
      if (res.data && res.data.sessions) {
        setSessionList(res.data.sessions);
        const sessionWithAttendance = res.data.sessions.find(s => s.attendance);
        if (sessionWithAttendance && sessionWithAttendance.attendance.studentId) {
          const studentId = sessionWithAttendance.attendance.studentId;
          if (studentId !== currentStudentId) {
            setCurrentStudentId(studentId);
          }
        }
      } else {
        setSessionList([]);
      }
    } catch (err) {
      setSessionList([]);
      showToast('error', 'Error', 'Failed to load sessions');
    }
    setSessionLoading(false);
  };

  const backToList = () => {
    setView('list');
    setSelectedCourse(null);
    setSessionList([]);
  };

  // Summary statistics
  const totalSubmissions = summaryStats.totalSubmissions;
  const approvedCount = summaryStats.approved;
  const pendingRequests = summaryStats.pending;
  const rejectedCount = summaryStats.rejected;

  // File upload handler
  const handleFileUpload = async (files) => {
    const response = await MedicalReportsService.uploadAttachments(Array.from(files));
    if (response.success) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...(response.data?.uploads || response.uploads || [])]
      }));
      showToast('success', 'Upload Success', response.message || 'Files uploaded successfully');
    } else {
      showToast('error', 'Upload Failed', response.message || 'File upload failed');
    }
  };

  // Remove attachment
  const removeAttachment = async (index) => {
    const file = formData.attachments[index];
    if (file?.id) {
      const response = await MedicalReportsService.deleteAttachment(file.id);
      if (!response.success) {
        showToast('error', 'Delete Failed', response.message);
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Open medical form
  const openMedicalForm = (offering, session, report = null) => {
    setSelectedOffering(offering);
    setSelectedSession(session);
    if (report) {
      setFormData({
        reason: report.reason || '',
        description: report.description || '',
        attachments: report.attachments || [],
        reportId: report.id
      });
    } else {
      setFormData({
        reason: '',
        description: '',
        attachments: [],
        reportId: undefined
      });
    }
    setShowForm(true);
  };

  // Submit or edit medical report
  const handleSubmitMedical = async (e) => {
    e.preventDefault();
    if (!formData.reason) {
      showToast('error', 'Validation', 'Please fill all required fields');
      return;
    }
    const { reason, description, attachments, reportId } = formData;
    const studentId = selectedSession?.attendance?.studentId || currentStudentId;
    
    let response;
    if (reportId) {
      response = await MedicalReportsService.updateReport(reportId, {
        reason,
        description,
        attachments
      });
    } else {
      response = await MedicalReportsService.submitReport({
        classSessionId: selectedSession.session.id,
        reason,
        description,
        attachments,
        studentId
      });
    }
    if (response.success) {
      showToast('success', 'Submitted', 'Medical report submitted for review');
      setShowForm(false);
      if (selectedCourse) {
        showSessionsScreen(selectedCourse);
      }
      // Refresh stats after submission
      if (currentStudentId) {
        fetchSummaryStats(currentStudentId);
      }
    } else {
      showToast('error', 'Failed', response.message || 'Failed to submit medical report');
    }
  };

  // View medical report
  const handleViewReport = async (session) => {
    if (!session.attendance || !session.attendance.medicalReportInfo) return;
    
    const studentId = session.attendance.studentId || currentStudentId;
    const classSessionId = session.session.id;
    
    try {
      const response = await MedicalReportsService.getReportsByStudent(studentId, classSessionId);
      if (response.success && response.data && response.data.length > 0) {
        setViewingReport(response.data[0]);
        setShowViewModal(true);
      } else {
        showToast('error', 'Error', 'Medical report not found');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to load medical report');
    }
  };

  // Edit medical report
  const handleEditReport = async (session) => {
     if (!session.attendance || !session.attendance.medicalReportInfo) return;
    
    const studentId = session.attendance.studentId || currentStudentId;
    const classSessionId = session.session.id;
    
    try {
      const response = await MedicalReportsService.getReportsByStudent(studentId, classSessionId);
      if (response.success && response.data && response.data.length > 0) {
        const report = response.data[0];
        if (report.status !== 'pending') {
          showToast('error', 'Cannot Edit', 'Only pending reports can be edited');
          return;
        }
        openMedicalForm(selectedCourse, session, report);
      } else {
        showToast('error', 'Error', 'Medical report not found');
      }
    } catch (err) {
      showToast('error', 'Error', 'Failed to load medical report');
    }
  };

  const handleDeleteReport = (session) => {
    if (!session.attendance || !session.attendance.medicalReportInfo) return;

    const medicalReportInfo = session.attendance.medicalReportInfo;

    // Allow deleting only pending reports
    if (medicalReportInfo.status !== 'pending') {
      showToast('error', 'Cannot Delete', 'Only pending reports can be deleted');
      return;
    }

    openConfirm(
      'Delete Medical Report',
      'Are you sure you want to delete this medical report? This action cannot be undone.',
      async () => {
        const studentId = session.attendance.studentId || currentStudentId;
        const classSessionId = session.session.id;

        try {
          const response = await MedicalReportsService.getReportsByStudent(studentId, classSessionId);
          if (response.success && Array.isArray(response.data) && response.data.length > 0) {
            const fullReport = response.data[0];
            // Delete attachments
            if (Array.isArray(fullReport.attachments) && fullReport.attachments.length > 0) {
              const deletePromises = fullReport.attachments.map(async (attachment) => {
                try {
                  await MedicalReportsService.deleteAttachment(attachment.id);
                } catch (attachmentErr) {}
              });
              await Promise.allSettled(deletePromises);
            }
            // Delete the medical report itself
            try {
              const deleteResponse = await MedicalReportsService.deleteReport(fullReport.id);
              if (deleteResponse.success) {
                showToast('success', 'Deleted', 'Medical report deleted successfully');
                if (selectedCourse) {
                  showSessionsScreen(selectedCourse);
                }
                // Refresh stats after deletion
                if (currentStudentId) {
                  fetchSummaryStats(currentStudentId);
                }
              } else {
                showToast('error', 'Delete Failed', deleteResponse.message || 'Failed to delete medical report');
              }
            } catch (reportErr) {
              showToast('error', 'Error', 'Failed to delete medical report');
            }
          } else {
            showToast('error', 'Not Found', 'No medical report found for this session');
          }
        } catch (err) {
          showToast('error', 'Error', 'Failed to delete medical report');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    );
  };

  // Download file handler
  const handleDownload = async (fileId, fileName) => {
    await FileService.downloadFile(fileId, fileName);
  };

  // Confirm dialog helpers
  const openConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ 
      open: true, 
      title, 
      message, 
      onConfirm, 
      onCancel: () => setConfirmDialog({ ...confirmDialog, open: false }) 
    });
  };

  // Toggle semester
  const toggleSemester = (semesterId) => {
    setExpandedSemesters(prev => ({ ...prev, [semesterId]: !prev[semesterId] }));
  };

  // Status helpers
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1";
    switch (status) {
      case 'approved':
      case 'present':
        return `${baseClasses} bg-emerald-100 text-emerald-700`;
      case 'rejected':
        return `${baseClasses} bg-rose-100 text-rose-700`;
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-700`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-700`;
    }
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <HeaderBar
            title="Medical Reports"
            subtitle="Submit and track your medical leave requests"
            Icon={FileText}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <Activity className="w-3 h-3" />
                <span>Total</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Total Submissions</p>
            {loadingStats ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Approved Reports</p>
            {loadingStats ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{approvedCount}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Pending Requests</p>
            {loadingStats ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{pendingRequests}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Rejected Reports</p>
            {loadingStats ? (
              <div className="h-9 w-16 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{rejectedCount}</p>
            )}
          </div>
        </div>

        {/* Course List View */}
        {view === 'list' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
              <p className="text-slate-600 mt-1">Select a course to view sessions and submit medical reports</p>
            </div>
            
            <div className="p-8">
              {loadingCourses ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                  <p className="text-slate-600 mt-4">Loading courses...</p>
                </div>
              ) : semesters.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No enrolled courses found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {semesters.map(({ semester, offerings }) => (
                    <div key={semester.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        className="flex items-center w-full text-left px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-colors duration-200"
                        onClick={() => toggleSemester(semester.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {expandedSemesters[semester.id] ? 
                            <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                          }
                          <span className="font-bold text-slate-900 text-lg">{semester.name}</span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            semester.status === 'inprogress' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {semester.status === 'inprogress' ? 'In Progress' : 'Completed'}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">{offerings.length} courses</span>
                      </button>
                      
                      {expandedSemesters[semester.id] && (
                        <div className="p-6 bg-white">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offerings.map(offering => (
                              <button
                                key={offering.id}
                                onClick={() => showSessionsScreen(offering)}
                                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{offering.subject.code}</h3>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{offering.subject.name}</p>
                                <span className="inline-block text-xs font-semibold bg-white/60 text-blue-700 px-3 py-1 rounded-full">
                                  {offering.mode}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions View */}
        {view === 'sessions' && selectedCourse && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <button 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
                onClick={backToList}
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Courses
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.subject.code}</h2>
                  <p className="text-slate-600">{selectedCourse.subject.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                  {selectedCourse.mode}
                </span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
                  {selectedCourse.semester.name}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              {sessionLoading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                  <p className="text-slate-600 mt-4">Loading sessions...</p>
                </div>
              ) : sessionList.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No sessions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Topic</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Medical</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionList.map((s) => {
                      const hasMedicalReport = s.attendance && s.attendance.medicalReportInfo;
                      const medicalStatus = hasMedicalReport ? s.attendance.medicalReportInfo.status : null;
                      const isAbsent = s.attendance && s.attendance.status === 'absent';
                        
                        return (
                          <tr key={s.session.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                              {new Date(s.session.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900">{s.session.topic}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{s.session.location}</td>
                            <td className="px-6 py-4">
                              {s.attendance ? (
                                <span className={getStatusBadge(s.attendance.status)}>
                                  <CheckCircle className="w-3 h-3" />
                                  {s.attendance.status}
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  No Record
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {hasMedicalReport && isAbsent && (
                                <span className={getStatusBadge(medicalStatus)}>
                                  {getStatusIcon(medicalStatus)}
                                  {medicalStatus}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {hasMedicalReport ? (
                                  <>
                                    <button
                                      onClick={() => handleViewReport(s)}
                                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                      title="View Report"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    {medicalStatus === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleEditReport(s)}
                                          className="text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors"
                                          title="Edit Report"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReport(s)}
                                          className="text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors"
                                          title="Delete Report"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </>
                                ) : isAbsent && (
                                  <button
                                    onClick={() => openMedicalForm(selectedCourse, s)}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                  >
                                    Submit Medical
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Submission Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {formData.reportId ? 'Edit Medical Report' : 'Submit Medical Report'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">Provide details about your absence</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]" onSubmit={handleSubmitMedical}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason / Diagnosis *</label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g., Flu, Fracture, Food poisoning"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed reason for absence, doctor notes, etc."
                      rows={3}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Medical Documents</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-slate-900 font-semibold mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-500">PDF, JPG, PNG up to 10MB each</p>
                      </label>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Paperclip className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{file.originalName || file.name}</p>
                                <p className="text-xs text-slate-500">
                                  {file.fileSize ? (file.fileSize / 1024 / 1024).toFixed(2) : (file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeAttachment(index)} 
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg p-2 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)} 
                      className="px-6 py-3 text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {formData.reportId ? 'Update Report' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Medical Report Modal */}
        {showViewModal && viewingReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Medical Report Details</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Submitted on {new Date(viewingReport.submitDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-sm font-semibold text-slate-700">Report Status</span>
                    <span className={getStatusBadge(viewingReport.status)}>
                      {getStatusIcon(viewingReport.status)}
                      {viewingReport.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason / Diagnosis</label>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-slate-900">{viewingReport.reason}</p>
                    </div>
                  </div>

                  {viewingReport.description && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-900 whitespace-pre-wrap">{viewingReport.description}</p>
                      </div>
                    </div>
                  )}

                  {viewingReport.reviewNotes && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Review Notes</label>
                      <div className={`p-4 rounded-xl border ${
                        viewingReport.status === 'approved' 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-rose-50 border-rose-200'
                      }`}>
                        <p className={viewingReport.status === 'approved' ? 'text-emerald-900' : 'text-rose-900'}>
                          {viewingReport.reviewNotes}
                        </p>
                      </div>
                      {viewingReport.reviewedAt && (
                        <p className="text-xs text-slate-500 mt-2">
                          Reviewed on {new Date(viewingReport.reviewedAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {viewingReport.attachments && viewingReport.attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Medical Documents</label>
                      <div className="space-y-3">
                        {viewingReport.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Paperclip className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{file.originalName}</p>
                                <p className="text-xs text-slate-500">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleDownload(file.id, file.originalName)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg px-4 py-2 transition-colors flex-shrink-0 font-semibold text-sm"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setShowViewModal(false)} 
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog {...confirmDialog} />
      </div>
    </main>
  );
}