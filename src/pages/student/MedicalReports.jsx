import { useState, useEffect } from 'react';
import { Upload, Calendar, FileText, Clock, CheckCircle, ChevronLeft, XCircle, AlertCircle, X, Paperclip, ChevronDown, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import StudentService from '../../services/student/studentService';
import AttendenceService from '../../services/attendenceService';
import FileService from '../../services/common/fileService';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../utils/ConfirmDialog';

export default function MedicalReports() {
  const [medicalReports, setMedicalReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [expandedOfferings, setExpandedOfferings] = useState({});
  const [sessionsByOffering, setSessionsByOffering] = useState({});
  const [sessionsLoading, setSessionsLoading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    doctorName: '',
    remarks: '',
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
  const totalSubmissions = medicalReports.length || 0;
  const approvedDays = medicalReports.filter(r => r.status === 'approved').reduce((sum, r) => {
    const from = new Date(r.fromDate);
    const to = new Date(r.toDate);
    return sum + Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const pendingRequests = medicalReports.filter(r => r.status === 'pending').length || 0;
  const excusedSessions = medicalReports.reduce((sum, r) => sum + (r.excusedSessions || 0), 0);

  // File upload handler
  const handleFileUpload = (files) => {
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...Array.from(files)] }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  // Open medical form
  const openMedicalForm = (offering, session) => {
    setSelectedOffering(offering);
    setSelectedSession(session);
    setFormData({
      fromDate: session.session.date.slice(0, 10),
      toDate: session.session.date.slice(0, 10),
      reason: '',
      doctorName: '',
      remarks: '',
      attachments: []
    });
    setShowForm(true);
  };

  // Submit medical report
  const handleSubmitMedical = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.fromDate || !formData.toDate) {
      showToast('error', 'Validation', 'Please fill all required fields');
      return;
    }

    let uploadedFiles = [];
    if (formData.attachments.length > 0) {
      const uploadRes = await FileService.uploadFiles(formData.attachments);
      if (uploadRes.success === false) {
        showToast('error', 'Upload Failed', uploadRes.message);
        return;
      }
      uploadedFiles = uploadRes.data?.uploads || [];
    }

    showToast('success', 'Submitted', 'Medical report submitted for review');
    setShowForm(false);
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

  // Toggle offering
  const toggleOffering = async (offeringId) => {
    setExpandedOfferings(prev => ({ ...prev, [offeringId]: !prev[offeringId] }));
    if (!sessionsByOffering[offeringId]) {
      setSessionsLoading(prev => ({ ...prev, [offeringId]: true }));
      try {
        const res = await AttendenceService.getMyAttendanceForOffering(offeringId);
        if (res.data && res.data.sessions) {
          setSessionsByOffering(prev => ({ ...prev, [offeringId]: res.data }));
        } else {
          setSessionsByOffering(prev => ({ ...prev, [offeringId]: { sessions: [] } }));
        }
      } catch (err) {
        showToast('error', 'Error', 'Failed to load sessions');
        setSessionsByOffering(prev => ({ ...prev, [offeringId]: { sessions: [] } }));
      }
      setSessionsLoading(prev => ({ ...prev, [offeringId]: false }));
    }
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
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/60">
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-4">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                    Medical Reports
                  </h1>
                  <p className="text-blue-100 text-lg">Submit and track your medical leave requests</p>
                </div>
                <div className="flex items-center justify-center w-24 h-24">
                  <FileText className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>Active</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-slate-900">{totalSubmissions}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Approved Days</p>
            <p className="text-3xl font-bold text-slate-900">{approvedDays}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-slate-900">{pendingRequests}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Excused Sessions</p>
            <p className="text-3xl font-bold text-slate-900">{excusedSessions}</p>
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
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionList.map((s) => (
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
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {!s.attendance && (
                              <button
                                onClick={() => openMedicalForm(selectedCourse, s)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                              >
                                Submit Medical
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
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
                  <h2 className="text-2xl font-bold text-white">Submit Medical Report</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">From Date *</label>
                      <input
                        type="date"
                        value={formData.fromDate}
                        onChange={e => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">To Date *</label>
                      <input
                        type="date"
                        value={formData.toDate}
                        onChange={e => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Doctor / Hospital Name</label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={e => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="Optional - for verification"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Additional Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={e => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Any additional information..."
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
                                <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog {...confirmDialog} />
      </div>
    </main>
  );
}