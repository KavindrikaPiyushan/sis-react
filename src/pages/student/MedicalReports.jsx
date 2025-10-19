import { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Calendar, 
  FileText, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Camera,
  X,
  Paperclip
} from 'lucide-react';
import LoadingComponent from '../../components/LoadingComponent';

export default function MedicalReports() {
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 80);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const it = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(it);
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    doctorName: '',
    remarks: '',
    attachments: []
  });

  // Mock data for medical reports
  const medicalReports = [
    {
      id: 'MED001',
      submissionDate: '2025-09-21',
      fromDate: '2025-09-18',
      toDate: '2025-09-20',
      reason: 'High Fever',
      doctorName: 'Dr. Smith Medical Center',
      status: 'approved',
      decisionDate: '2025-09-22',
      excusedSessions: 6,
      attachments: ['medical_note.pdf', 'lab_report.jpg'],
      adminRemarks: 'Valid doctor certificate attached'
    },
    {
      id: 'MED002',
      submissionDate: '2025-09-15',
      fromDate: '2025-09-14',
      toDate: '2025-09-16',
      reason: 'Food poisoning',
      doctorName: 'General Hospital',
      status: 'pending',
      decisionDate: null,
      excusedSessions: 0,
      attachments: ['prescription.pdf'],
      adminRemarks: null
    },
    {
      id: 'MED003',
      submissionDate: '2025-09-05',
      fromDate: '2025-09-03',
      toDate: '2025-09-04',
      reason: 'Migraine',
      doctorName: '',
      status: 'rejected',
      decisionDate: '2025-09-06',
      excusedSessions: 0,
      attachments: [],
      adminRemarks: 'Insufficient medical documentation'
    }
  ];

  // Summary statistics
  const totalSubmissions = medicalReports.length;
  const approvedDays = medicalReports
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => {
      const from = new Date(r.fromDate);
      const to = new Date(r.toDate);
      return sum + Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    }, 0);
  const pendingRequests = medicalReports.filter(r => r.status === 'pending').length;
  const excusedSessions = medicalReports.reduce((sum, r) => sum + r.excusedSessions, 0);

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
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const filteredReports = medicalReports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-8xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingComponent message="Loading medical reports..." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
      <div className="max-w-8xl mx-auto p-8">
        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-4 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl  font-extrabold text-white flex items-center gap-3">
              Medical Reports
            </h1>
            <p className="text-blue-100 mt-2">Submit and track your medical leave requests</p>
            <p className="text-blue-100/90 mt-1 text-sm">{currentDateTime.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={48} className="text-blue-200 hidden md:block" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Submission</span>
            </button>
        </div>
        {/*end header */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Submissions</p>
                <p className="text-3xl font-bold text-green-600">{approvedDays}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excused Sessions</p>
                <p className="text-3xl font-bold text-purple-600">{excusedSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by reason or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
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
                    Excused Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.id}</p>
                        <p className="text-sm text-gray-500">{report.submissionDate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{report.fromDate}</p>
                        <p className="text-sm text-gray-500">to {report.toDate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                        {report.doctorName && (
                          <p className="text-sm text-gray-500">{report.doctorName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <span className={getStatusBadge(report.status)}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                      {report.decisionDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Decided: {report.decisionDate}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.excusedSessions > 0 ? (
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          {report.excusedSessions} sessions
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {report.attachments.length > 0 && (
                          <button
                            className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                            title="Download Attachments"
                          >
                            <Download className="w-4 h-4" />
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

        {/* New Submission Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">New Medical Submission</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date *
                      </label>
                      <input
                        type="date"
                        value={formData.fromDate}
                        onChange={(e) => setFormData(prev => ({...prev, fromDate: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date *
                      </label>
                      <input
                        type="date"
                        value={formData.toDate}
                        onChange={(e) => setFormData(prev => ({...prev, toDate: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason / Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                      placeholder="e.g., Flu, Fracture, Food poisoning"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor / Hospital Name
                    </label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={(e) => setFormData(prev => ({...prev, doctorName: e.target.value}))}
                      placeholder="Optional - for verification"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({...prev, remarks: e.target.value}))}
                      placeholder="Any additional information..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG up to 10MB each
                        </p>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        type="button"
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* File Previews */}
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Medical Report Details - {selectedReport.id}
                    </h2>
                    <p className="text-gray-600">
                      Submitted on {selectedReport.submissionDate}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Period</h3>
                        <p className="text-gray-700">
                          {selectedReport.fromDate} to {selectedReport.toDate}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Reason</h3>
                        <p className="text-gray-700">{selectedReport.reason}</p>
                      </div>
                      {selectedReport.doctorName && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Doctor/Hospital</h3>
                          <p className="text-gray-700">{selectedReport.doctorName}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Status</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedReport.status)}
                          <span className={getStatusBadge(selectedReport.status)}>
                            {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedReport.excusedSessions > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Excused Sessions</h3>
                          <p className="text-gray-700">{selectedReport.excusedSessions} class sessions</p>
                        </div>
                      )}
                      
                      {selectedReport.decisionDate && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Decision Date</h3>
                          <p className="text-gray-700">{selectedReport.decisionDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedReport.adminRemarks && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Admin Remarks</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">{selectedReport.adminRemarks}</p>
                      </div>
                    </div>
                  )}

                  {selectedReport.attachments.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Attachments</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedReport.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{attachment}</span>
                            </div>
                            <div className="flex space-x-1">
                              <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}