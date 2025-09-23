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
  MessageSquare
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

export default function MedicalApprovals() {
  const [medicalRequests, setMedicalRequests] = useState([
    {
      _id: "med123",
      studentId: "stu456",
      studentName: "Kavindu Piyumal",
      studentNo: "2022/ICT/045",
      fromDate: "2025-09-18",
      toDate: "2025-09-20",
      reason: "High fever and flu symptoms",
      attachments: ["medical_cert_001.pdf", "doctor_note.jpg"],
      status: "pending",
      submittedDate: "2025-09-21T08:30:00Z",
      medicalType: "hospital_certificate",
      approvedDates: [],
      reviewHistory: [
        {
          action: "submitted",
          by: "stu456",
          byName: "Kavindu Piyumal",
          date: "2025-09-21T08:30:00Z",
          remarks: ""
        }
      ],
      affectedSessions: [
        { date: "2025-09-18", subject: "Programming Fundamentals", lecturer: "Dr. Silva" },
        { date: "2025-09-19", subject: "Database Systems", lecturer: "Prof. Fernando" },
        { date: "2025-09-20", subject: "Web Development", lecturer: "Mr. Perera" }
      ]
    },
    {
      _id: "med124",
      studentId: "stu457",
      studentName: "Nimali Perera",
      studentNo: "2022/ICT/032",
      fromDate: "2025-09-15",
      toDate: "2025-09-17",
      reason: "Dental surgery",
      attachments: ["dental_report.pdf"],
      status: "approved",
      submittedDate: "2025-09-16T14:20:00Z",
      medicalType: "clinic_note",
      approvedDates: ["2025-09-15", "2025-09-16", "2025-09-17"],
      reviewHistory: [
        {
          action: "submitted",
          by: "stu457",
          byName: "Nimali Perera",
          date: "2025-09-16T14:20:00Z",
          remarks: ""
        },
        {
          action: "approved",
          by: "admin789",
          byName: "Dr. Admin",
          date: "2025-09-17T09:15:00Z",
          remarks: "Valid medical certificate. Full approval granted."
        }
      ],
      affectedSessions: [
        { date: "2025-09-15", subject: "Software Engineering", lecturer: "Dr. Rajapakse" },
        { date: "2025-09-16", subject: "Computer Networks", lecturer: "Prof. Wickramasinghe" },
        { date: "2025-09-17", subject: "AI Fundamentals", lecturer: "Dr. Gunasekara" }
      ]
    },
    {
      _id: "med125",
      studentId: "stu458",
      studentName: "Tharindu Silva",
      studentNo: "2022/ICT/067",
      fromDate: "2025-09-12",
      toDate: "2025-09-16",
      reason: "Food poisoning",
      attachments: ["hospital_discharge.pdf"],
      status: "partial",
      submittedDate: "2025-09-13T16:45:00Z",
      medicalType: "hospital_certificate",
      approvedDates: ["2025-09-12", "2025-09-13"],
      reviewHistory: [
        {
          action: "submitted",
          by: "stu458",
          byName: "Tharindu Silva",
          date: "2025-09-13T16:45:00Z",
          remarks: ""
        },
        {
          action: "partial_approval",
          by: "admin790",
          byName: "Ms. Registrar",
          date: "2025-09-14T11:30:00Z",
          remarks: "Approved for first 2 days only. Medical certificate covers acute phase."
        }
      ],
      affectedSessions: [
        { date: "2025-09-12", subject: "Data Structures", lecturer: "Dr. Bandara" },
        { date: "2025-09-13", subject: "Mathematics", lecturer: "Prof. Jayawardena" },
        { date: "2025-09-14", subject: "Physics", lecturer: "Dr. Mendis" },
        { date: "2025-09-15", subject: "English", lecturer: "Ms. Fernando" },
        { date: "2025-09-16", subject: "Statistics", lecturer: "Dr. Ranasinghe" }
      ]
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [partialDates, setPartialDates] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const filteredRequests = medicalRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.studentNo.includes(searchTerm) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      partial: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertTriangle }
    };
    
    const variant = variants[status];
    const Icon = variant.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
        <Icon className="w-3 h-3 mr-1" />
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
    
    if (action === 'partial') {
      // Initialize with all dates for partial selection
      const dateRange = getDateRange(request.fromDate, request.toDate);
      setPartialDates([]);
    }
    
    setShowApprovalModal(true);
  };

  const getDateRange = (fromDate, toDate) => {
    const dates = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const submitApproval = () => {
    const updatedRequests = medicalRequests.map(request => {
      if (request._id === selectedRequest._id) {
        const newHistoryEntry = {
          action: approvalAction === 'approve' ? 'approved' : 
                  approvalAction === 'reject' ? 'rejected' : 'partial_approval',
          by: 'current_admin',
          byName: 'Current Admin',
          date: new Date().toISOString(),
          remarks: remarks
        };

        return {
          ...request,
          status: approvalAction === 'approve' ? 'approved' : 
                  approvalAction === 'reject' ? 'rejected' : 'partial',
          approvedDates: approvalAction === 'approve' ? getDateRange(request.fromDate, request.toDate) :
                        approvalAction === 'partial' ? partialDates : [],
          reviewHistory: [...request.reviewHistory, newHistoryEntry]
        };
      }
      return request;
    });

    setMedicalRequests(updatedRequests);
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const togglePartialDate = (date) => {
    setPartialDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date].sort()
    );
  };

  return (
       <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen p-6">

      
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                 Medical Approvals
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and process student medical leave requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{filteredRequests.filter(r => r.status === 'pending').length}</span> pending requests
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name, number, or reason..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </div>
      

      {/* Medical Requests Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <React.Fragment key={request._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleRowExpansion(request._id)}
                          className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedRows.has(request._id) ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.studentNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(request.toDate) - new Date(request.fromDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.medicalType.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                      {request.status === 'partial' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {request.approvedDates.length} of {getDateRange(request.fromDate, request.toDate).length} days approved
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {request.attachments.map((attachment, index) => (
                          <button
                            key={index}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title={`Download ${attachment}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        ))}
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(request, 'approve')}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(request, 'partial')}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Partial Approval"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(request, 'reject')}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded row details */}
                  {expandedRows.has(request._id) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Affected Sessions */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Affected Sessions
                            </h4>
                            <div className="space-y-2">
                              {request.affectedSessions.map((session, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-sm font-medium">{session.subject}</div>
                                    <div className="text-xs text-gray-500">{session.lecturer}</div>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(session.date).toLocaleDateString()}
                                  </div>
                                  {request.approvedDates.includes(session.date) && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Review History */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Review History
                            </h4>
                            <div className="space-y-2">
                              {request.reviewHistory.map((history, index) => (
                                <div key={index} className="p-2 bg-white rounded border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {history.action.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(history.date).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    by {history.byName}
                                  </div>
                                  {history.remarks && (
                                    <div className="text-sm text-gray-700 mt-1 italic">
                                      "{history.remarks}"
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {approvalAction === 'approve' ? 'Approve' : 
                 approvalAction === 'reject' ? 'Reject' : 'Partial Approval'} Medical Request
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRequest.studentName} ({selectedRequest.studentNo})
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Period:</span> {new Date(selectedRequest.fromDate).toLocaleDateString()} - {new Date(selectedRequest.toDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span> {selectedRequest.reason}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedRequest.medicalType.replace('_', ' ')}
                  </div>
                  <div>
                    <span className="font-medium">Attachments:</span> {selectedRequest.attachments.length} file(s)
                  </div>
                </div>
              </div>

              {/* Partial Date Selection */}
              {approvalAction === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select dates to approve:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getDateRange(selectedRequest.fromDate, selectedRequest.toDate).map(date => (
                      <label key={date} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={partialDates.includes(date)}
                          onChange={() => togglePartialDate(date)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                      </label>
                    ))}
                  </div>
                  {partialDates.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">Please select at least one date to approve.</p>
                  )}
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter remarks for ${approvalAction}...`}
                />
                {approvalAction === 'reject' && !remarks.trim() && (
                  <p className="text-sm text-red-600 mt-1">Remarks are required when rejecting a request.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                disabled={
                  (approvalAction === 'reject' && !remarks.trim()) ||
                  (approvalAction === 'partial' && partialDates.length === 0)
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : approvalAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {approvalAction === 'approve' ? 'Approve Request' : 
                 approvalAction === 'reject' ? 'Reject Request' : 'Partial Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}