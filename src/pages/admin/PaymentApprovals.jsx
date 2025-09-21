import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, Upload, Download, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Mock data for demonstration
const mockPayments = [
  {
    _id: "pay_2025_0001",
    studentId: "stu_123",
    studentName: "John Doe",
    studentNo: "2022/ICT/045",
    feeTypeId: "semester_fee",
    feeTypeName: "Semester Fee",
    semesterId: "sem_2025_S1",
    amount: 50000,
    method: "bank_deposit",
    transactionRef: "BANK123456",
    attachments: ["slip.jpg"],
    status: "pending",
    submittedAt: "2025-09-21T12:00:00Z",
    submittedBy: "student",
    approvedAt: null,
    approvedBy: null
  },
  {
    _id: "pay_2025_0002",
    studentId: "stu_124",
    studentName: "Jane Smith",
    studentNo: "2022/ICT/046",
    feeTypeId: "exam_fee",
    feeTypeName: "Exam Fee",
    semesterId: "sem_2025_S1",
    amount: 15000,
    method: "online_card",
    transactionRef: "STRIPE789012",
    attachments: [],
    status: "approved",
    submittedAt: "2025-09-20T14:30:00Z",
    submittedBy: "student",
    approvedAt: "2025-09-21T09:15:00Z",
    approvedBy: "admin_01"
  },
  {
    _id: "pay_2025_0003",
    studentId: "stu_125",
    studentName: "Mike Johnson",
    studentNo: "2022/ICT/047",
    feeTypeId: "retake_fee",
    feeTypeName: "Retake Fee",
    semesterId: "sem_2025_S1",
    amount: 25000,
    method: "bank_deposit",
    transactionRef: "BANK567890",
    attachments: ["receipt.pdf"],
    status: "rejected",
    submittedAt: "2025-09-19T16:45:00Z",
    submittedBy: "student",
    approvedAt: "2025-09-20T11:30:00Z",
    approvedBy: "admin_02"
  },
  {
    _id: "pay_2025_0004",
    studentId: "stu_126",
    studentName: "Sarah Wilson",
    studentNo: "2022/ICT/048",
    feeTypeId: "admission_fee",
    feeTypeName: "Admission Fee",
    semesterId: "sem_2025_S1",
    amount: 100000,
    method: "mobile_money",
    transactionRef: "MOBILE456789",
    attachments: ["screenshot.jpg"],
    status: "need_more_info",
    submittedAt: "2025-09-21T08:20:00Z",
    submittedBy: "student",
    approvedAt: null,
    approvedBy: null
  }
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

export default function PaymentApprovals() {
  const [payments, setPayments] = useState(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [remarks, setRemarks] = useState('');

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      need_more_info: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const handleApproval = (payment, action) => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setShowModal(true);
  };

  const confirmApproval = () => {
    if (!selectedPayment || !approvalAction) return;

    const updatedPayments = payments.map(payment => {
      if (payment._id === selectedPayment._id) {
        return {
          ...payment,
          status: approvalAction,
          approvedAt: new Date().toISOString(),
          approvedBy: "admin_current", // In real app, this would be current user
          remarks: remarks
        };
      }
      return payment;
    });

    setPayments(updatedPayments);
    setShowModal(false);
    setRemarks('');
    setSelectedPayment(null);
    setApprovalAction(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const totalAmount = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Approvals</h1>
          <p className="text-gray-600">Review and approve student payment submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name, number, or transaction ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="need_more_info">Need More Info</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payment List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                        <div className="text-sm text-gray-500">{payment.studentNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.feeTypeName}</div>
                        <div className="text-sm text-gray-500">
                          {payment.method.replace('_', ' ')} - {payment.transactionRef}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.attachments.length > 0 && (
                          <button className="text-green-600 hover:text-green-900 p-1 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(payment, 'approved')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(payment, 'rejected')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(payment, 'need_more_info')}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Approval Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {approvalAction === 'approved' ? 'Approve Payment' :
                     approvalAction === 'rejected' ? 'Reject Payment' : 'Request More Information'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {selectedPayment && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><strong>Student:</strong> {selectedPayment.studentName}</p>
                    <p className="text-sm"><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                    <p className="text-sm"><strong>Fee Type:</strong> {selectedPayment.feeTypeName}</p>
                    <p className="text-sm"><strong>Transaction:</strong> {selectedPayment.transactionRef}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {approvalAction === 'rejected' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder={
                      approvalAction === 'approved' ? 'Payment verified and approved' :
                      approvalAction === 'rejected' ? 'Reason for rejection...' :
                      'Additional information required...'
                    }
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                      approvalAction === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                      approvalAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    Confirm {approvalAction === 'approved' ? 'Approval' :
                           approvalAction === 'rejected' ? 'Rejection' : 'Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}