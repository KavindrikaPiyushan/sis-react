import React, { useState } from 'react';
import { CreditCard, Download, Eye, Calendar, AlertCircle, CheckCircle, Clock, DollarSign, FileText, Filter, Search, ChevronDown, Bell } from 'lucide-react';

const PaymentSection = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSemester, setSelectedSemester] = useState('2025-1');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock data
  const studentBalance = {
    totalDue: 1200,
    totalPaid: 3800,
    nextDueDate: '2025-10-15',
    overdueAmount: 0
  };

  const feeBreakdown = [
    { id: 1, type: 'Tuition Fee', amount: 2000, paid: 1000, balance: 1000, dueDate: '2025-10-15', status: 'partial' },
    { id: 2, type: 'Library Fee', amount: 100, paid: 100, balance: 0, dueDate: '2025-08-10', status: 'paid' },
    { id: 3, type: 'Exam Fee', amount: 300, paid: 100, balance: 200, dueDate: '2025-11-01', status: 'pending' },
    { id: 4, type: 'Lab Fee', amount: 150, paid: 150, balance: 0, dueDate: '2025-09-01', status: 'paid' }
  ];

  const paymentHistory = [
    { id: 1, date: '2025-09-20', amount: 500, method: 'Bank Transfer', reference: 'TXN-3421', status: 'verified', slip: 'receipt_001.pdf' },
    { id: 2, date: '2025-08-15', amount: 300, method: 'Cash', reference: 'CASH-8890', status: 'verified', slip: 'receipt_002.pdf' },
    { id: 3, date: '2025-07-05', amount: 250, method: 'Cheque', reference: 'CHQ-7765', status: 'pending', slip: 'receipt_003.pdf' },
    { id: 4, date: '2025-06-20', amount: 1000, method: 'Online Banking', reference: 'OB-5542', status: 'rejected', slip: 'receipt_004.pdf' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border border-red-200',
      verified: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200'
    };

    const icons = {
      paid: <CheckCircle className="w-4 h-4" />,
      partial: <Clock className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      overdue: <AlertCircle className="w-4 h-4" />,
      verified: <CheckCircle className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const PaymentModal = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [feeType, setFeeType] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF or image file');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upload Payment Slip</h3>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input 
                  type="date" 
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
              <select 
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fee type</option>
                <option value="tuition">Tuition Fee</option>
                <option value="library">Library Fee</option>
                <option value="exam">Exam Fee</option>
                <option value="lab">Lab Fee</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select payment method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="online_banking">Online Banking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input 
                type="text" 
                placeholder="Transaction/Reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Slip/Receipt *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                placeholder="Additional notes or comments"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Submit Payment
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Portal</h1>
          <p className="text-gray-600">Manage your fees and payment history</p>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">${studentBalance.totalDue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${studentBalance.totalPaid.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Due Date</p>
                <p className="text-lg font-semibold text-gray-900">{studentBalance.nextDueDate}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Status</p>
                <p className="text-lg font-semibold text-yellow-600">Partial</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Upload Payment Slip
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            Download Statement
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Eye className="w-5 h-5" />
            View Payment Instructions
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Fee Breakdown
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Semester Selector */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Current Semester Fees</h3>
                  <select 
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2025-1">Semester 1, 2025</option>
                    <option value="2024-2">Semester 2, 2024</option>
                    <option value="2024-1">Semester 1, 2024</option>
                  </select>
                </div>

                {/* Fee Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {feeBreakdown.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fee.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fee.paid}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${fee.balance}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.dueDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(fee.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {fee.balance > 0 && (
                              <button 
                                onClick={() => setShowPaymentModal(true)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Upload Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by reference number..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>

                {/* Payment History Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Slip</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payment.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.reference}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Payment Reminder</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your tuition fee payment of $1,000 is due on October 15, 2025. Upload your payment slip to complete the payment process.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Bank Account Details</h4>
                <div className="text-sm text-amber-700 mt-1">
                  <p><strong>Bank:</strong> National Bank of Sri Lanka</p>
                  <p><strong>Account Name:</strong> University Payment Account</p>
                  <p><strong>Account Number:</strong> 1234567890</p>
                  <p><strong>Branch Code:</strong> 001</p>
                  <p className="mt-2 font-medium">Please include your student number in the payment reference.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && <PaymentModal />}
    </main>
  );
};

export default PaymentSection;