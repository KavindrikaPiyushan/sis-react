import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Edit3, Clock, Upload, Download, DollarSign, AlertCircle, CheckCircle, XCircle, Trash2 } from 'lucide-react';
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
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(5);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [pendingPaymentsTotal, setPendingPaymentsTotal] = useState(0);
  const [approvedTodayTotal, setApprovedTodayTotal] = useState(0);
  const [rejectedTodayTotal, setRejectedTodayTotal] = useState(0);
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
  // Preview modal state
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  // Fee types management (admin-facing)
  // Start empty — admin can add fee types in the UI. Consider loading from /admin/fee-types in future.
  const [feeTypes, setFeeTypes] = useState([]);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [feeTypesLoading, setFeeTypesLoading] = useState(false);
  const [creatingFee, setCreatingFee] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  // Hard-delete target (permanent)
  const [hardDeleteTarget, setHardDeleteTarget] = useState(null);
  // Edit fee type state
  const [editingFee, setEditingFee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDescription, setEditDescription] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);
  // Admin fee types paginated list (separate from inline/quick-list above)
  const [adminFeeTypes, setAdminFeeTypes] = useState([]);
  const [adminPage, setAdminPage] = useState(1);
  const [adminPerPage, setAdminPerPage] = useState(5);
  const [adminTotal, setAdminTotal] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminQuery, setAdminQuery] = useState('');
  const [adminOnlyActive, setAdminOnlyActive] = useState('all'); // 'all'|'active'|'inactive'
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
  // Debug: log preview modal info when opened
  useEffect(() => {
    if (previewAttachment && previewUrl) {
      // eslint-disable-next-line no-console
      console.log('[Preview Modal]', { previewUrl, previewType, previewAttachment });
    }
  }, [previewAttachment, previewUrl, previewType]);

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
        page: opts.page || paymentsPage || 1,
        perPage: opts.perPage || paymentsPerPage || 5,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchDebounced) params.q = searchDebounced;
      if (opts.startDate) params.startDate = opts.startDate;
      if (opts.endDate) params.endDate = opts.endDate;

      const resp = await AdminPaymentsService.listPayments(params);
      if (resp && resp.success && resp.data) {
        const dt = resp.data;
        const list = Array.isArray(dt.payments) ? dt.payments.map(normalizeServerPayment) : [];
        setPayments(list);
        setPaymentsPage(dt.page || params.page || 1);
        setPaymentsPerPage(dt.perPage || params.perPage || paymentsPerPage);
        setPaymentsTotal(dt.total || (Array.isArray(dt.payments) ? dt.payments.length : 0));
        setPendingPaymentsTotal(dt.pendingCount || 0);
        setApprovedTodayTotal(dt.approvedTodayCount || 0);
        setRejectedTodayTotal(dt.rejectedTodayCount || 0);
      } else if (resp && Array.isArray(resp.payments)) {
        // some implementations may return array directly
        const list = resp.payments.map(normalizeServerPayment);
        setPayments(list);
        setPaymentsPage(1);
        setPaymentsPerPage(list.length);
        setPaymentsTotal(list.length);
      } else {
        console.warn('Unexpected payments response', resp);
        setPayments([]);
        setPaymentsTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch admin payments', err);
      setPayments([]);
      setPaymentsTotal(0);
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

  // Load admin paginated fee types list
  const fetchAdminFeeTypes = async (opts = {}) => {
    setAdminLoading(true);
    try {
      const params = {
        page: opts.page || adminPage,
        perPage: opts.perPage || adminPerPage,
        q: opts.q !== undefined ? opts.q : adminQuery,
      };
      if ((opts.onlyActive !== undefined ? opts.onlyActive : adminOnlyActive) === 'active') params.active = true;
      if ((opts.onlyActive !== undefined ? opts.onlyActive : adminOnlyActive) === 'inactive') params.active = false;

      const resp = await FeeTypesService.listFeeTypes(params);
      if (resp && resp.success && resp.data) {
        const dt = resp.data;
        setAdminFeeTypes(Array.isArray(dt.feeTypes) ? dt.feeTypes : []);
        setAdminPage(dt.page || params.page || 1);
        setAdminPerPage(dt.perPage || params.perPage || adminPerPage);
        setAdminTotal(dt.total || 0);
      } else if (resp && Array.isArray(resp.feeTypes)) {
        // Some implementations return array directly
        setAdminFeeTypes(resp.feeTypes);
        setAdminPage(1);
        setAdminPerPage(resp.feeTypes.length);
        setAdminTotal(resp.feeTypes.length);
      } else {
        // Fallback: empty
        setAdminFeeTypes([]);
        setAdminTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch admin fee types', err);
      showToast('error', 'Failed to load fee types', err?.message || 'See console');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminFeeTypes({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch payments on mount and when filters/search change
  useEffect(() => {
    // reset to first page when filters/search change
    setPaymentsPage(1);
    fetchPayments({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchDebounced]);

  // Download or preview attachment helper
  const downloadAttachment = async (payment, attachment, preview = false) => {
    try {
      // attachment may be object { filename, url } or a string path
      const urlPath = typeof attachment === 'string' ? attachment : attachment.url || attachment.path;
      if (!urlPath) return;

      // Delegate download to AdminPaymentsService which handles full URL resolution
      const path = typeof attachment === 'string' ? null : (attachment.url || attachment.path);
      const filename = typeof attachment === 'string' ? attachment : (attachment.filename || null);
      const dl = await AdminPaymentsService.downloadAttachment({ paymentId: payment._id, attachmentUrl: path, attachmentFilename: filename });
      if (dl && dl.success && dl.blob) {
        const fileType = dl.blob.type;
        const objectUrl = window.URL.createObjectURL(dl.blob);
        if (preview) {
          setPreviewAttachment(attachment);
          setPreviewUrl(objectUrl);
          setPreviewType(fileType);
          return;
        }
        // Download fallback
        const downloadName = dl.filename || (typeof attachment === 'string' ? attachment : (attachment.filename || 'attachment'));
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = downloadName;
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

  // Open edit modal for fee type
  const openEditFee = (ft) => {
    if (!ft) return;
    setEditingFee(ft);
    setEditName(ft.name || '');
    setEditAmount(ft.defaultAmount ?? '');
    setEditIsActive(ft.isActive ?? true);
    setEditDescription(ft.description || '');
  };

  const submitEditFee = async () => {
    if (!editingFee) return;
    const payload = {};
    if ((editName || '').trim() !== (editingFee.name || '')) payload.name = (editName || '').trim();
    const amtNum = editAmount === '' ? null : Number(editAmount);
    if (amtNum !== null && !Number.isNaN(amtNum) && amtNum !== (editingFee.defaultAmount ?? 0)) payload.defaultAmount = amtNum;
    if ((editIsActive !== (editingFee.isActive ?? false))) payload.isActive = editIsActive;
    if ((editDescription || '').trim() !== (editingFee.description || '')) payload.description = (editDescription || '').trim();

    // If nothing changed, just close
    if (Object.keys(payload).length === 0) {
      setEditingFee(null);
      return;
    }

    setEditingLoading(true);
    try {
      const resp = await FeeTypesService.updateFeeType(editingFee.id, payload);
      if (resp && resp.success && resp.data) {
        const updated = resp.data;
        setAdminFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        setFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        showToast('success', 'Updated', 'Fee type updated');
      } else if (resp && resp.id) {
        // some implementations return the object directly
        const updated = resp;
        setAdminFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        setFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        showToast('success', 'Updated', 'Fee type updated');
      } else {
        console.warn('Unexpected update response', resp);
        showToast('error', 'Update failed', resp && resp.message ? resp.message : 'Failed to update fee type');
      }
    } catch (err) {
      console.error('Failed to update fee type', err);
      showToast('error', 'Update failed', err?.message || 'See console for details');
    } finally {
      setEditingLoading(false);
      setEditingFee(null);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{pendingPaymentsTotal}</p>
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
                <p className="text-2xl font-bold text-gray-900">{approvedTodayTotal}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedTodayTotal}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{paymentsTotal}</p>
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

        {/* Edit Fee Type Modal */}
        {editingFee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 ">
            <div className="relative top-40 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Edit Fee Type</h3>
                <button onClick={() => setEditingFee(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Amount</label>
                  <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={!!editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>

                <div className="flex justify-end items-center space-x-3">
                  <button onClick={() => setEditingFee(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                  <button disabled={editingLoading} onClick={submitEditFee} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${editingLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                    {editingLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Pagination controls for payments */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600">
            {(() => {
              const total = typeof paymentsTotal === 'number' ? paymentsTotal : payments.length;
              const start = total > 0 ? (paymentsPage - 1) * paymentsPerPage + 1 : 0;
              const end = Math.min(paymentsPage * paymentsPerPage, total);
              return (
                <>
                  Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span> results
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { const p = Math.max(1, paymentsPage - 1); setPaymentsPage(p); fetchPayments({ page: p }); }}
              disabled={paymentsPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Previous
            </button>

            {/* numbered buttons */}
            {(() => {
              const buttons = [];
              const totalPages = typeof paymentsTotal === 'number' && paymentsPerPage > 0 ? Math.max(1, Math.ceil(paymentsTotal / paymentsPerPage)) : Math.max(1, Math.ceil((payments.length || 0) / paymentsPerPage));
              const maxVisible = 5;
              let start = Math.max(1, paymentsPage - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);
              if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
              for (let i = start; i <= end; i++) {
                buttons.push(
                  <button key={i} onClick={() => { setPaymentsPage(i); fetchPayments({ page: i }); }} className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${paymentsPage === i ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {i}
                  </button>
                );
              }
              return buttons;
            })()}

            <button
              onClick={() => { const p = paymentsPage + 1; setPaymentsPage(p); fetchPayments({ page: p }); }}
              disabled={(typeof paymentsTotal === 'number' && paymentsPage >= Math.ceil(paymentsTotal / paymentsPerPage)) || (payments.length < paymentsPerPage && paymentsTotal === 0)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              Next
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        {/* Admin paginated fee types list (moved out of approval card) */}
        <Card className="p-6 mt-6">
          {/* Fee types management UI */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700">Fee Types</h4>
            <p className="text-xs text-gray-500 mb-3">Manage the list of fee categories students can submit payments for.</p>


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
                        // Refresh admin paginated list so new type appears there too
                        try { fetchAdminFeeTypes({ page: 1 }); } catch (e) { /* ignore */ }
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
            {/* Fee type soft-delete confirm dialog (sets isActive=false) */}
            <ConfirmDialog
              open={!!feeToDelete}
              title="Delete Fee Type"
              message={feeToDelete ? `Delete fee type "${feeToDelete.name}"? This will set it as inactive (soft delete) and remove it from student dropdowns.` : 'Delete this fee type?'}
              onCancel={() => setFeeToDelete(null)}
              onConfirm={async () => {
                if (!feeToDelete) return;
                try {
                  const resp = await FeeTypesService.deleteFeeType(feeToDelete.id);
                  if (resp && resp.success === false) {
                    console.error('Failed to delete fee type', resp);
                    showToast('error', 'Delete failed', resp.message || 'Server returned an error');
                  } else if (resp && resp.success) {
                    setFeeTypes(prev => prev.map(f => f.id === feeToDelete.id ? { ...f, isActive: false } : f));
                    // refresh admin list as well
                    try { fetchAdminFeeTypes({ page: adminPage }); } catch (e) { }
                    showToast('success', 'Deleted', `Fee type "${feeToDelete.name}" soft-deleted`);
                  } else {
                    // Some services may return 204 or other shapes
                    setFeeTypes(prev => prev.map(f => f.id === feeToDelete.id ? { ...f, isActive: false } : f));
                    try { fetchAdminFeeTypes({ page: adminPage }); } catch (e) { }
                    showToast('success', 'Deleted', `Fee type "${feeToDelete.name}" soft-deleted`);
                  }
                } catch (err) {
                  console.error('Failed to delete fee type', err);
                  showToast('error', 'Delete failed', err?.message || 'Failed to delete fee type');
                } finally {
                  setFeeToDelete(null);
                }
              }}
            />

            {/* Fee type hard-delete confirm dialog (permanent) */}
            <ConfirmDialog
              open={!!hardDeleteTarget}
              title="Permanently Delete Fee Type"
              message={hardDeleteTarget ? `Permanently delete fee type "${hardDeleteTarget.name}"? This will remove it completely and cannot be undone.` : 'Permanently delete this fee type?'}
              onCancel={() => setHardDeleteTarget(null)}
              onConfirm={async () => {
                if (!hardDeleteTarget) return;
                try {
                  const resp = await FeeTypesService.hardDeleteFeeType(hardDeleteTarget.id);
                  if (resp && resp.success === false) {
                    console.error('Failed to hard-delete fee type', resp);
                    showToast('error', 'Delete failed', resp.message || 'Server returned an error');
                  } else if (resp && resp.success) {
                    setFeeTypes(prev => prev.filter(f => f.id !== hardDeleteTarget.id));
                    try { fetchAdminFeeTypes({ page: adminPage }); } catch (e) { }
                    showToast('success', 'Deleted', `Fee type "${hardDeleteTarget.name}" permanently deleted`);
                  } else if (resp && resp.message) {
                    setFeeTypes(prev => prev.filter(f => f.id !== hardDeleteTarget.id));
                    try { fetchAdminFeeTypes({ page: adminPage }); } catch (e) { }
                    showToast('success', 'Deleted', resp.message || `Fee type "${hardDeleteTarget.name}" deleted`);
                  } else {
                    setFeeTypes(prev => prev.filter(f => f.id !== hardDeleteTarget.id));
                    try { fetchAdminFeeTypes({ page: adminPage }); } catch (e) { }
                    showToast('success', 'Deleted', `Fee type "${hardDeleteTarget.name}" deleted`);
                  }
                } catch (err) {
                  console.error('Failed to hard-delete fee type', err);
                  showToast('error', 'Delete failed', err?.message || 'Failed to permanently delete fee type');
                } finally {
                  setHardDeleteTarget(null);
                }
              }}
            />
          </div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">All Fee Types (Admin)</h5>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search fee types..." value={adminQuery} onChange={(e) => setAdminQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <select value={adminOnlyActive} onChange={(e) => setAdminOnlyActive(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={adminPerPage} onChange={(e) => { setAdminPerPage(Number(e.target.value)); fetchAdminFeeTypes({ page: 1, perPage: Number(e.target.value) }); }} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <button onClick={() => fetchAdminFeeTypes({ page: 1, q: adminQuery, onlyActive: adminOnlyActive })} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Search</button>
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Default Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {adminLoading ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">Loading fee types...</td></tr>
                ) : adminFeeTypes.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No fee types found</td></tr>
                ) : (
                  adminFeeTypes.map(ft => (
                    <tr key={ft.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{ft.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(ft.defaultAmount ?? 0)}</td>
                      <td className="px-4 py-3 text-sm">{ft.isActive ? <span className="text-green-600">Yes</span> : <span className="text-gray-500">No</span>}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ft.createdAt ? new Date(ft.createdAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditFee(ft)} className="text-blue-600 hover:text-blue-900 p-1 rounded" aria-label={`Edit ${ft.name}`}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setFeeToDelete(ft); }} className="text-red-600 hover:text-red-900 p-1 rounded" aria-label={`Delete ${ft.name}`}>
                            <X className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setHardDeleteTarget(ft); }} title="Permanently delete" className="text-red-700 hover:text-red-900 p-1 rounded" aria-label={`Permanently delete ${ft.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-600">
              {(() => {
                const total = typeof adminTotal === 'number' ? adminTotal : adminFeeTypes.length;
                const start = total > 0 ? (adminPage - 1) * adminPerPage + 1 : 0;
                const end = Math.min(adminPage * adminPerPage, total);
                return (
                  <>
                    Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span> results
                  </>
                );
              })()}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { const p = Math.max(1, adminPage - 1); setAdminPage(p); fetchAdminFeeTypes({ page: p }); }}
                disabled={adminPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              {/* numbered buttons */}
              {(() => {
                const buttons = [];
                const totalPages = typeof adminTotal === 'number' && adminPerPage > 0 ? Math.max(1, Math.ceil(adminTotal / adminPerPage)) : Math.max(1, Math.ceil((adminFeeTypes.length || 0) / adminPerPage));
                const maxVisible = 5;
                let start = Math.max(1, adminPage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);
                if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
                for (let i = start; i <= end; i++) {
                  buttons.push(
                    <button
                      key={i}
                      onClick={() => { setAdminPage(i); fetchAdminFeeTypes({ page: i }); }}
                      className={`px-3 py-1 text-sm rounded ${adminPage === i ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      {i}
                    </button>
                  );
                }
                return buttons;
              })()}

              <button
                onClick={() => { const p = adminPage + 1; setAdminPage(p); fetchAdminFeeTypes({ page: p }); }}
                disabled={adminPage >= Math.ceil((adminTotal || adminFeeTypes.length) / adminPerPage)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Student:</span>
                      <span className="text-gray-900">{paymentDetails.studentName}</span>
                      <span className="text-xs text-gray-500">({paymentDetails.studentNo})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Amount:</span>
                      <span className="text-gray-900">{formatCurrency(paymentDetails.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Fee Type:</span>
                      <span className="text-gray-900">{paymentDetails.feeTypeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Method:</span>
                      <span className="text-gray-900">{paymentDetails.method || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Receipt/Ref:</span>
                      <span className="text-gray-900">{paymentDetails.transactionRef}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Status:</span>
                      {getStatusBadge(paymentDetails.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Submitted:</span>
                      <span className="text-gray-900">{formatDate(paymentDetails.submittedAt)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Attachments:</span>
                    <ul className="mt-2 space-y-2">
                      {paymentDetails.attachments.length === 0 && (
                        <li className="text-xs text-gray-400 ml-2">No attachments</li>
                      )}
                      {paymentDetails.attachments.map((att, idx) => (
                        <li key={idx} className="flex items-center gap-2 ml-2">
                          {/* <span className="text-gray-800 text-sm">
                            {typeof att === 'string' ? att : (att.filename || att.url)}
                          </span> */}
                          <button
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 rounded px-2 py-1 transition-colors"
                            onClick={() => downloadAttachment(paymentDetails, att, true)}
                            type="button"
                          >
                            Preview
                          </button>
                          <button
                            className="text-gray-500 hover:text-blue-700"
                            title="Download"
                            onClick={() => downloadAttachment(paymentDetails, att)}
                            type="button"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Attachment Preview Modal */}
                  {previewAttachment && previewUrl && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center z-50" style={{ alignItems: 'flex-start' }}>
                      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative flex flex-col mt-[10vh]">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                          onClick={() => {
                            setPreviewAttachment(null);
                            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                            setPreviewType(null);
                          }}
                          aria-label="Close preview"
                        >
                          <X className="w-7 h-7" />
                        </button>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold text-base text-gray-800">Attachment Preview</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {typeof previewAttachment === 'string' ? previewAttachment : (previewAttachment.filename || previewAttachment.url)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">File type: {previewType || 'unknown'}</div>
                          </div>
                          <a
                            href={previewUrl}
                            download={typeof previewAttachment === 'string' ? previewAttachment : (previewAttachment.filename || 'attachment')}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4" /> Download
                          </a>
                        </div>
                        <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg border p-4">
                          {previewType && previewType.startsWith('image') ? (
                            <img src={previewUrl} alt="Attachment Preview" className="max-h-96 max-w-full rounded border shadow" />
                          ) : previewType === 'application/pdf' ? (
                            <iframe src={previewUrl} title="PDF Preview" className="w-full h-96 border rounded bg-white" />
                          ) : (
                            <div className="text-gray-600 text-center w-full">
                              <div className="mb-2">Cannot preview this file type.</div>
                              <span className="text-xs text-gray-400">File type: {previewType || 'unknown'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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