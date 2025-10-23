import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Download,
  Check,
  X,
  Clock,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ExternalLink,
  Paperclip
} from 'lucide-react';
import MedicalReportsService from '../../services/medicalReportsService';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

export default function MedicalApprovals() {
  const [medicalRequests, setMedicalRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approved');
  const [remarks, setRemarks] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    fetchMedicalReports();
  }, []);

  const fetchMedicalReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await MedicalReportsService.getAllReports();
      if (response.success) {
        setMedicalRequests(response.data);
      } else {
        setError(response.message || 'Failed to fetch medical reports');
      }
    } catch (err) {
      setError('Failed to load medical reports. Please try again.');
      console.error('Error fetching medical reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = medicalRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const studentName = `${request.student?.user?.firstName || ''} ${request.student?.user?.lastName || ''}`;
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.student?.studentNo?.includes(searchTerm) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle },
      rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle }
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${variant.bg} ${variant.text} ${variant.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const toggleRowExpansion = (requestId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  const handleApproval = (request, action) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setRemarks('');
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    if (approvalAction === 'rejected' && !remarks.trim()) {
      alert('Remarks are required when rejecting a request.');
      return;
    }

    try {
      const response = await MedicalReportsService.reviewReport(selectedRequest.id, {
        status: approvalAction,
        reviewNotes: remarks
      });

      if (response.success) {
        setMedicalRequests(prev => prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: approvalAction, reviewNotes: remarks, reviewedAt: new Date().toISOString() }
            : req
        ));
        setShowApprovalModal(false);
        setSelectedRequest(null);
        alert('Medical report reviewed successfully!');
      } else {
        alert(response.message || 'Failed to review medical report');
      }
    } catch (err) {
      console.error('Error reviewing report:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await MedicalReportsService.downloadFile(attachment.id, attachment.originalName);
      if (response.success) {
        // Handle successful download
      } else {
        alert(response.message || 'Failed to download attachment');
      }
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment. Please try again.');
    }
  };

  const handlePreviewAttachment = (attachment) => {
    setPreviewAttachment(attachment);
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading medical reports...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Reports</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchMedicalReports}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  Medical Approvals
                </h1>
                <p className="text-blue-100 mt-2">Review and process student medical leave requests</p>
                        <div className="flex items-center mt-4">
                          <span className="flex text-sm items-center bg-white px-3 py-1 rounded-full shadow-sm">
                            <Clock className="w-4 h-4 mr-1 text-blue-600" />
                            {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" ,second:"2-digit"})}
                          </span>
                        </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-white text-center">
                  <div className="text-sm opacity-90">Pending</div>
                  <div className="text-3xl font-bold text-yellow-300">{filteredRequests.filter(r => r.status === 'pending').length}</div>
                </div>
                <div className="text-white text-center">
                  <div className="text-sm opacity-90">Approved</div>
                  <div className="text-3xl font-bold text-green-300">{filteredRequests.filter(r => r.status === 'approved').length}</div>
                </div>
                <div className="text-white text-center">
                  <div className="text-sm opacity-90">Rejected</div>
                  <div className="text-3xl font-bold text-red-300">{filteredRequests.filter(r => r.status === 'rejected').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters - now separated below header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name, number, or reason..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-blue-200 bg-white shadow-sm transition-all text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              style={{ boxShadow: 'none' }}
            />
          </div>
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full px-4 py-2 shadow-sm">
            <Filter className="w-5 h-5 text-blue-500" />
            <select
              className="border-0 focus:ring-0 focus:outline-none bg-transparent text-base font-medium text-blue-900 cursor-pointer px-1 py-0.5 rounded-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ minWidth: 120 }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Medical Requests Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Session Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Attachments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleRowExpansion(request.id)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {expandedRows.has(request.id) ?
                              <ChevronDown className="w-4 h-4 text-gray-600" /> :
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            }
                          </button>
                          <div className="flex items-center gap-3">
                            {/* <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              {request.student?.user?.firstName?.[0]}{request.student?.user?.lastName?.[0]}
                            </div> */}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {request.student?.user?.firstName} {request.student?.user?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.student?.studentNo}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(request.classSession?.date)}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {request.classSession?.topic}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-medium">
                            {request.classSession?.courseOffering?.subject?.name}
                          </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {request.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.attachments?.length > 0 ? (
                          <button
                            onClick={() => setShowAttachmentsModal(request)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Paperclip className="w-4 h-4" />
                            {request.attachments.length} file{request.attachments.length > 1 ? 's' : ''}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No files</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(request.submitDate)}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproval(request, 'approved')}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(request, 'rejected')}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Reviewed</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded row details */}
                    {expandedRows.has(request.id) && (
                      <tr>
                        <td colSpan="7" className="px-6 py-6 bg-gradient-to-br from-gray-50 to-blue-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Request Details */}
                            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Request Details
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-medium text-gray-600">Description:</span>
                                  <span className="text-sm text-gray-900 text-right max-w-xs">{request.description || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-medium text-gray-600">Course:</span>
                                  <span className="text-sm text-gray-900 text-right">{request.classSession?.courseOffering?.subject?.name}</span>
                                </div>
                                <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-medium text-gray-600">Session Topic:</span>
                                  <span className="text-sm text-gray-900 text-right max-w-xs">{request.classSession?.topic}</span>
                                </div>
                                <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                  <span className="text-xs font-medium text-gray-600">Attendance Status:</span>
                                  <span className="text-sm text-gray-900 capitalize">
                                    {request.attendances?.[0]?.status || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Review History */}
                            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                Review Status
                              </h4>
                              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  {getStatusBadge(request.status)}
                                  {request.reviewedAt && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDateTime(request.reviewedAt)}
                                    </span>
                                  )}
                                </div>
                                {request.reviewNotes && (
                                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg italic border-l-4 border-blue-500">
                                    "{request.reviewNotes}"
                                  </div>
                                )}
                                {!request.reviewNotes && request.status === 'pending' && (
                                  <div className="text-sm text-gray-500 italic flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Awaiting review...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No medical reports found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Attachments Modal */}
        {showAttachmentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                      Attachments ({showAttachmentsModal.attachments?.length || 0})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {showAttachmentsModal.student?.user?.firstName} {showAttachmentsModal.student?.user?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAttachmentsModal(null)}
                    className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="space-y-3">
                  {showAttachmentsModal.attachments?.map((attachment, index) => (
                    <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.mimeType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handlePreviewAttachment(attachment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {approvalAction === 'approved' ? '✓ Approve' : '✗ Reject'} Medical Request
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRequest.student?.user?.firstName} {selectedRequest.student?.user?.lastName} ({selectedRequest.student?.studentNo})
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Request Details */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Session Date:</span>
                        <p className="text-gray-900">{formatDate(selectedRequest.classSession?.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-700">Attachments:</span>
                        <p className="text-gray-900">{selectedRequest.attachments?.length || 0} file(s)</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">Reason:</span>
                        <p className="text-gray-900">{selectedRequest.reason}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">Course:</span>
                        <p className="text-gray-900">{selectedRequest.classSession?.courseOffering?.subject?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Review Notes {approvalAction === 'rejected' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder={`Enter review notes for ${approvalAction}...`}
                  />
                  {approvalAction === 'rejected' && !remarks.trim() && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Review notes are required when rejecting a request
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-5 py-2.5 text-gray-700 bg-white hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  disabled={approvalAction === 'rejected' && !remarks.trim()}
                  className={`px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm ${
                    approvalAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {approvalAction === 'approved' ? '✓ Approve Request' : '✗ Reject Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Preview Modal */}
        {previewAttachment && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Attachment Preview
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{previewAttachment.originalName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAttachment(previewAttachment)}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closePreview}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-auto max-h-[calc(90vh-100px)] bg-gray-50">
                {previewAttachment.mimeType?.startsWith('image/') ? (
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.originalName}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  />
                ) : previewAttachment.mimeType === 'application/pdf' ? (
                  <iframe
                    src={previewAttachment.url}
                    className="w-full h-[70vh] rounded-lg shadow-lg"
                    title={previewAttachment.originalName}
                  />
                ) : (
                  <div className="text-center py-16 bg-white rounded-lg">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Preview not available for this file type</p>
                    <p className="text-gray-400 text-sm mb-6">{previewAttachment.mimeType}</p>
                    <button
                      onClick={() => handleDownloadAttachment(previewAttachment)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 font-medium shadow-sm transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}