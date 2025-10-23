import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, Upload, Download, DollarSign, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import HeaderBar from '../../components/HeaderBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminPaymentsService from '../../services/admin/paymentsService.js';
import FeeTypesService from '../../services/admin/feeTypesService';
import { showToast } from '../../pages/utils/showToast';

// Local initial state will be loaded from the admin API on mount

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

export default function PaymentApprovals() {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [remarks, setRemarks] = useState('');
  // Fee types management (admin-facing)
  // Start empty — admin can add fee types in the UI. Consider loading from /admin/fee-types in future.
  const [feeTypes, setFeeTypes] = useState([]);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [feeTypesLoading, setFeeTypesLoading] = useState(false);
  const [creatingFee, setCreatingFee] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  // Delete confirmation dialog
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  // HeaderBar provides the live timestamp and consistent header sizing

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const q = (searchTerm || '').toString().toLowerCase();
    const sName = (payment.studentName || '').toString().toLowerCase();
    const sNo = (payment.studentNo || '').toString().toLowerCase();
    const tref = (payment.transactionRef || '').toString().toLowerCase();
    const matchesSearch = q === '' || sName.includes(q) || sNo.includes(q) || tref.includes(q);
    return matchesStatus && matchesSearch;
  });

  // Map server payment object -> local shape helpers
  function normalizeServerPayment(p) {
    return {
      _id: p.id || p._id,
      studentId: p.studentId,
      studentName: p.studentName,
      studentNo: p.studentNo,
      feeTypeId: p.feeType || p.feeTypeId,
      feeTypeName: p.feeType || p.feeTypeName,
      semesterId: p.semesterId,
      amount: Number(p.amount) || 0,
      method: p.method || null,
      transactionRef: p.receiptNumber || p.transactionRef || '',
      attachments: Array.isArray(p.attachments) ? p.attachments : [],
      status: p.status,
      submittedAt: p.paymentDate || p.submittedAt,
      submittedBy: p.submittedBy,
      approvedAt: p.approvedAt,
      approvedBy: p.approvedBy,
      remarks: p.remarks || []
    };
  }

  // Fetch single payment details and open details modal
  const openPaymentDetails = async (paymentId) => {
    if (!paymentId) return;
    setDetailsLoading(true);
    try {
      const resp = await AdminPaymentsService.getPayment(paymentId);
      if (resp && resp.success && resp.data) {
        const det = normalizeServerPayment(resp.data);
        setPaymentDetails(det);
        setShowDetailsModal(true);
      } else {
        console.warn('Unexpected get payment response', resp);
      }
    } catch (err) {
      console.error('Failed to fetch payment details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Fetch payments from admin API
  const fetchPayments = async (opts = {}) => {
    setLoadingPayments(true);
    try {
      const params = {
        page: opts.page || 1,
        perPage: opts.perPage || 20,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchDebounced) params.q = searchDebounced;
      if (opts.startDate) params.startDate = opts.startDate;
      if (opts.endDate) params.endDate = opts.endDate;

      const resp = await AdminPaymentsService.listPayments(params);
      if (resp && resp.success) {
        const list = Array.isArray(resp.data.payments) ? resp.data.payments.map(normalizeServerPayment) : [];
        setPayments(list);
        // Optionally handle paging values from resp.data.page/perPage/total
      } else {
        // If apiClient returns a non-success structured value, log
        console.warn('Unexpected payments response', resp);
      }
    } catch (err) {
      console.error('Failed to fetch admin payments', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load fee types from server on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setFeeTypesLoading(true);
      try {
        const res = await FeeTypesService.listFeeTypes();
        if (!mounted) return;
        if (res && Array.isArray(res.feeTypes)) {
          setFeeTypes(res.feeTypes);
        } else if (res && Array.isArray(res)) {
          setFeeTypes(res);
        } else if (res && res.success && Array.isArray(res.data)) {
          setFeeTypes(res.data);
        } else if (res && res.success === false) {
          console.error('Failed to load fee types', res.message || res);
          showToast('error', 'Failed to load fee types', res.message || 'Server returned an error');
        }
      } catch (err) {
        console.error('Failed to load fee types', err);
        showToast('error', 'Failed to load fee types', err?.message || 'See console for details');
      } finally {
        if (mounted) setFeeTypesLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Fetch payments on mount and when filters/search change
  useEffect(() => {
    fetchPayments();
  }, [statusFilter, searchDebounced]);

  // Download attachment helper: attachments have `url` paths coming from API; use fetch to get blob
  const downloadAttachment = async (payment, attachment) => {
    try {
      // attachment may be object { filename, url } or a string path
      const urlPath = typeof attachment === 'string' ? attachment : attachment.url || attachment.path;
      if (!urlPath) return;

      // Delegate download to AdminPaymentsService which handles full URL resolution
  const path = typeof attachment === 'string' ? null : (attachment.url || attachment.path);
  const filename = typeof attachment === 'string' ? attachment : (attachment.filename || null);
  const dl = await AdminPaymentsService.downloadAttachment({ paymentId: payment._id, attachmentUrl: path, attachmentFilename: filename });
      if (dl && dl.success && dl.blob) {
        const filename = dl.filename || (typeof attachment === 'string' ? attachment : (attachment.filename || 'attachment'));
        const objectUrl = window.URL.createObjectURL(dl.blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      } else {
        throw new Error(dl && dl.message ? dl.message : 'Download failed');
      }
    } catch (e) {
      console.error('Failed to download attachment', e);
    }
  };

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

    const expectedStatus = selectedPayment.status;

    // Call backend to update status
    (async () => {
      try {
        const body = { action: approvalAction, remarks, notifyStudent: true, expectedStatus };
        const resp = await AdminPaymentsService.updatePaymentStatus(selectedPayment._id, body);
        if (resp && resp.success && resp.data) {
          // Update local payments array with server returned object
          const updated = normalizeServerPayment(resp.data);
          setPayments(prev => prev.map(p => p._id === updated._id ? updated : p));
          // If details modal open, update it too
          if (paymentDetails && paymentDetails._id === updated._id) setPaymentDetails(updated);
        } else {
          // Handle conflict or server rejection
          if (resp && resp.status === 409) {
            alert(resp.message || 'Conflict: payment status changed by another user');
          } else {
            console.warn('Failed to update payment on server, applying local update', resp);
            // Fallback local update: map action -> status
            const actionToStatus = (a) => {
              if (a === 'approve') return 'approved';
              if (a === 'reject') return 'rejected';
              if (a === 'need_more_info') return 'need_more_info';
              return a;
            };
            const newStatus = actionToStatus(approvalAction);
            const updatedPayments = payments.map(payment => {
              if (payment._id === selectedPayment._id) {
                return {
                  ...payment,
                  status: newStatus,
                  approvedAt: new Date().toISOString(),
                  approvedBy: 'admin_current',
                  remarks
                };
              }
              return payment;
            });
            setPayments(updatedPayments);
          }
        }
      } catch (err) {
        console.error('Error updating payment status', err);
        alert('Failed to update payment status. See console for details.');
      } finally {
        setShowModal(false);
        setRemarks('');
        setSelectedPayment(null);
        setApprovalAction(null);
      }
    })();
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
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
      <div className="p-6">
        <HeaderBar title="Payment Approvals" subtitle="Review and approve student payment submissions" Icon={DollarSign} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

         
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          {/* Fee types management UI */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700">Fee Types</h4>
            <p className="text-xs text-gray-500 mb-3">Manage the list of fee categories students can submit payments for.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {feeTypesLoading ? (
                <div className="col-span-3 text-sm text-gray-500">Loading fee types...</div>
              ) : feeTypes.length === 0 ? (
                <div className="col-span-3 text-sm text-gray-500">No fee types defined. Add one below.</div>
              ) : (
                feeTypes.map(ft => (
                  <div key={ft.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{ft.name}</div>
                      <div className="text-xs text-gray-500">Default: {formatCurrency(ft.defaultAmount)}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => setFeeToDelete(ft)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        aria-label={`Delete ${ft.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Fee name (e.g. Semester Fee)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                value={newFeeName}
                onChange={(e) => setNewFeeName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Default amount"
                className="w-44 px-3 py-2 border border-gray-300 rounded-lg"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!newFeeName.trim()) return;
                  const amt = Number(newFeeAmount || 0);
                  if (isNaN(amt) || amt < 0) {
                    showToast('error', 'Validation', 'Please enter a valid default amount');
                    return;
                  }
                  setCreatingFee(true);
                  try {
                    const payload = { name: newFeeName.trim(), defaultAmount: amt };
                    const res = await FeeTypesService.createFeeType(payload);
                    // If service returns an error-shaped object, surface it
                    if (res && res.success === false) {
                      console.error('Failed to create fee type', res);
                      showToast('error', 'Create failed', res.message || 'Server returned an error');
                    } else {
                      const created = (res && res.data) ? res.data : (res && res.feeType ? res.feeType : (res && res.id ? res : null));
                      if (created) {
                        setFeeTypes(prev => [...prev, created]);
                        setNewFeeName('');
                        setNewFeeAmount('');
                        showToast('success', 'Created', `Fee type "${created.name || newFeeName.trim()}" added`);
                      } else {
                        // Unexpected server response
                        console.warn('Unexpected createFeeType response', res);
                        showToast('error', 'Create failed', 'Unexpected server response');
                      }
                    }
                  } catch (err) {
                    console.error('Failed to create fee type', err);
                    showToast('error', 'Create failed', err?.message || 'Failed to create fee type');
                  } finally {
                    setCreatingFee(false);
                  }
                }}
                disabled={creatingFee}
                className={`px-4 py-2 ${creatingFee ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-lg`}
              >
                {creatingFee ? 'Adding...' : 'Add Fee'}
              </button>
            </div>
            {/* Fee type delete confirm dialog */}
            <ConfirmDialog
              open={!!feeToDelete}
              title="Delete Fee Type"
              message={feeToDelete ? `Delete fee type ${feeToDelete.name}? This will remove it from student dropdowns.` : 'Delete this fee type?'}
              onCancel={() => setFeeToDelete(null)}
              onConfirm={async () => {
                if (!feeToDelete) return;
                try {
                  const resp = await FeeTypesService.deleteFeeType(feeToDelete.id);
                  if (resp && resp.success === false) {
                    console.error('Failed to delete fee type', resp);
                    showToast('error', 'Delete failed', resp.message || 'Server returned an error');
                  } else if (resp && resp.success) {
                    setFeeTypes(prev => prev.filter(f => f.id !== feeToDelete.id));
                    showToast('success', 'Deleted', `Fee type "${feeToDelete.name}" deleted`);
                  } else {
                    // Some services return 204 -> { success:true }
                    setFeeTypes(prev => prev.filter(f => f.id !== feeToDelete.id));
                    showToast('success', 'Deleted', `Fee type "${feeToDelete.name}" deleted`);
                  }
                } catch (err) {
                  console.error('Failed to delete fee type', err);
                  showToast('error', 'Delete failed', err?.message || 'Failed to delete fee type');
                } finally {
                  setFeeToDelete(null);
                }
              }}
            />
          </div>
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
            {loadingPayments && (
              <div className="p-4 text-sm text-gray-600">Loading payments...</div>
            )}
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
                          {(payment.method || '').toString().replace('_', ' ')} - {(payment.transactionRef || '')}
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
                        <button
                          onClick={() => openPaymentDetails(payment._id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.attachments && payment.attachments.length > 0 && (
                          <button
                            onClick={() => downloadAttachment(payment, payment.attachments[0])}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproval(payment, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproval(payment, 'reject')}
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
                            <button
                              onClick={() => {
                                setPaymentToDelete(payment);
                                setShowConfirmDelete(true);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ">
            <div className="relative top-60 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between  mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {approvalAction === 'approve' ? 'Approve Payment' :
                     approvalAction === 'reject' ? 'Reject Payment' : 'Request More Information'}
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

                {/* Details Modal is rendered separately below so it isn't nested inside Approval Modal */}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {approvalAction === 'reject' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder={
                        approvalAction === 'approve' ? 'Payment verified and approved' :
                        approvalAction === 'reject' ? 'Reason for rejection...' :
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
                      approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      approvalAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    Confirm {approvalAction === 'approve' ? 'Approval' :
                           approvalAction === 'reject' ? 'Rejection' : 'Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Details Modal (rendered at top-level, independent of Approval Modal) */}
        {showDetailsModal && paymentDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ">
            <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Payment Details</h3>
                <button onClick={() => { setShowDetailsModal(false); setPaymentDetails(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              {detailsLoading && <div className="text-sm text-gray-600">Loading...</div>}

              {!detailsLoading && paymentDetails && (
                <div className="space-y-3">
                  <div><strong>Student:</strong> {paymentDetails.studentName} ({paymentDetails.studentNo})</div>
                  <div><strong>Amount:</strong> {formatCurrency(paymentDetails.amount)}</div>
                  <div><strong>Fee Type:</strong> {paymentDetails.feeTypeName}</div>
                  <div><strong>Method:</strong> {(paymentDetails.method || 'N/A')}</div>
                  <div><strong>Receipt/Ref:</strong> {paymentDetails.transactionRef}</div>
                  <div><strong>Status:</strong> {getStatusBadge(paymentDetails.status)}</div>
                  <div><strong>Submitted:</strong> {formatDate(paymentDetails.submittedAt)}</div>
                  <div>
                    <strong>Attachments:</strong>
                    <ul className="list-disc ml-6">
                      {paymentDetails.attachments.map((att, idx) => (
                        <li key={idx}>
                          <button className="text-blue-600 underline" onClick={() => downloadAttachment(paymentDetails, att)}>
                                    {typeof att === 'string' ? att : (att.filename || att.url)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={showConfirmDelete}
          title="Delete Payment"
          message={paymentToDelete ? `Delete payment for ${paymentToDelete.studentName}? This action cannot be undone.` : 'Delete payment?'}
          onCancel={() => { setShowConfirmDelete(false); setPaymentToDelete(null); }}
          onConfirm={async () => {
            if (!paymentToDelete) return;
            try {
              const resp = await AdminPaymentsService.deletePayment(paymentToDelete._id);
              if (resp && resp.success) {
                setPayments(prev => prev.filter(p => p._id !== paymentToDelete._id));
                if (paymentDetails && paymentDetails._id === paymentToDelete._id) {
                  setShowDetailsModal(false);
                  setPaymentDetails(null);
                }
              } else {
                if (resp && resp.status === 404) {
                  alert(resp.message || 'Payment not found');
                } else if (resp && resp.status === 409) {
                  alert(resp.message || 'Cannot delete payment in current status');
                } else {
                  alert(resp.message || 'Failed to delete payment');
                }
              }
            } catch (e) {
              console.error('Delete payment error', e);
              alert('Failed to delete payment. See console for details.');
            } finally {
              setShowConfirmDelete(false);
              setPaymentToDelete(null);
            }
          }}
        />
      </div>
    </main>
  );
}