
import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, Edit3, Clock, Download, DollarSign, AlertCircle, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import HeaderBar from '../../components/HeaderBar';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminPaymentsService from '../../services/admin/paymentsService.js';
import AdministrationService from '../../services/super-admin/administationService.js';
import FeeTypesService from '../../services/admin/feeTypesService';
import { showToast } from '../../pages/utils/showToast';

// Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, disabled, className = '', type = 'button', title = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm hover:shadow',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

// Badge Component
const Badge = ({ children, variant = 'default', icon: Icon }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

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
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [feeTypes, setFeeTypes] = useState([]);
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [newFeeType, setNewFeeType] = useState('general');
  const [newBatchId, setNewBatchId] = useState('');
  const [newSemesterId, setNewSemesterId] = useState('');
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [feeTypesLoading, setFeeTypesLoading] = useState(false);
  const [creatingFee, setCreatingFee] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('general');
  const [editBatchId, setEditBatchId] = useState('');
  const [editSemesterId, setEditSemesterId] = useState('');
  const [editSemesters, setEditSemesters] = useState([]);
  const [editingLoading, setEditingLoading] = useState(false);
  const [adminFeeTypes, setAdminFeeTypes] = useState([]);
  const [adminPage, setAdminPage] = useState(1);
  const [adminPerPage, setAdminPerPage] = useState(5);
  const [adminTotal, setAdminTotal] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminQuery, setAdminQuery] = useState('');
  const [adminOnlyActive, setAdminOnlyActive] = useState('all');
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  // Map server payment object
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

  // Fetch batches
  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await AdministrationService.fetchAllBatches();
        if (res) setBatches(res.data);
      } catch (e) { setBatches([]); }
    }
    loadBatches();
  }, []);

  // Fetch semesters for create
  useEffect(() => {
    async function loadSemesters() {
      if (newFeeType === 'semesterwise' && newBatchId) {
        try {
          const res = await AdministrationService.fetchSemestersByBatchId(newBatchId);
          if (res) setSemesters(res);
        } catch (e) { setSemesters([]); }
      } else {
        setSemesters([]);
      }
    }
    loadSemesters();
  }, [newFeeType, newBatchId]);

  // Fetch semesters for edit
  useEffect(() => {
    async function loadEditSemesters() {
      if (editType === 'semesterwise' && editBatchId) {
        try {
          const res = await AdministrationService.fetchSemestersByBatchId(editBatchId);
          if (res) setEditSemesters(res);
        } catch (e) { setEditSemesters([]); }
      } else {
        setEditSemesters([]);
      }
    }
    loadEditSemesters();
  }, [editType, editBatchId]);

  // Fetch payment details
  const openPaymentDetails = async (paymentId) => {
    if (!paymentId) return;
    setDetailsLoading(true);
    try {
      const resp = await AdminPaymentsService.getPayment(paymentId);
      if (resp && resp.success && resp.data) {
        const det = normalizeServerPayment(resp.data);
        setPaymentDetails(det);
        setShowDetailsModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch payment details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Fetch payments
  const fetchPayments = async (opts = {}) => {
    setLoadingPayments(true);
    try {
      const params = {
        page: opts.page || paymentsPage || 1,
        perPage: opts.perPage || paymentsPerPage || 5,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchDebounced) params.q = searchDebounced;

      const resp = await AdminPaymentsService.listPayments(params);
      if (resp && resp.success && resp.data) {
        const dt = resp.data;
        const list = Array.isArray(dt.payments) ? dt.payments.map(normalizeServerPayment) : [];
        setPayments(list);
        setPaymentsPage(dt.page || params.page || 1);
        setPaymentsPerPage(dt.perPage || params.perPage || paymentsPerPage);
        setPaymentsTotal(dt.total || 0);
        setPendingPaymentsTotal(dt.pendingCount || 0);
        setApprovedTodayTotal(dt.approvedTodayCount || 0);
        setRejectedTodayTotal(dt.rejectedTodayCount || 0);
      } else if (resp && Array.isArray(resp.payments)) {
        const list = resp.payments.map(normalizeServerPayment);
        setPayments(list);
        setPaymentsTotal(list.length);
      } else {
        setPayments([]);
        setPaymentsTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch payments', err);
      setPayments([]);
      setPaymentsTotal(0);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load fee types
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
        }
      } catch (err) {
        console.error('Failed to load fee types', err);
      } finally {
        if (mounted) setFeeTypesLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Fetch admin fee types
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
        setAdminFeeTypes(resp.feeTypes);
        setAdminTotal(resp.feeTypes.length);
      } else {
        setAdminFeeTypes([]);
        setAdminTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch admin fee types', err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminFeeTypes({ page: 1 });
  }, []);

  useEffect(() => {
    setPaymentsPage(1);
    fetchPayments({ page: 1 });
  }, [statusFilter, searchDebounced]);

  // Download attachment
  const downloadAttachment = async (payment, attachment, preview = false) => {
    try {
      const urlPath = typeof attachment === 'string' ? attachment : attachment.url || attachment.path;
      if (!urlPath) return;

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
        
        const downloadName = dl.filename || (typeof attachment === 'string' ? attachment : (attachment.filename || 'attachment'));
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      }
    } catch (e) {
      console.error('Failed to download attachment', e);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      approved: { variant: 'success', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'danger', icon: XCircle, label: 'Rejected' },
      need_more_info: { variant: 'info', icon: AlertCircle, label: 'Need Info' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant} icon={config.icon}>{config.label}</Badge>;
  };

  const handleApproval = (payment, action) => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setShowModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedPayment || !approvalAction) return;

    try {
      const body = { action: approvalAction, remarks, notifyStudent: true, expectedStatus: selectedPayment.status };
      const resp = await AdminPaymentsService.updatePaymentStatus(selectedPayment._id, body);
      if (resp && resp.success && resp.data) {
        let updated = normalizeServerPayment(resp.data);
        // If studentName, studentNo, or attachments missing, merge from old payment
        if (!updated.studentName && selectedPayment.studentName) updated.studentName = selectedPayment.studentName;
        if (!updated.studentNo && selectedPayment.studentNo) updated.studentNo = selectedPayment.studentNo;
        if ((!updated.attachments || updated.attachments.length === 0) && selectedPayment.attachments && selectedPayment.attachments.length > 0) {
          updated.attachments = selectedPayment.attachments;
        }
        setPayments(prev => prev.map(p => p._id === updated._id ? updated : p));
        if (updated.status === 'approved' || updated.status === 'rejected') {
          setPendingPaymentsTotal(prev => prev - 1);
        }
        if (updated.status === 'approved') setApprovedTodayTotal(prev => prev + 1);
        if (updated.status === 'rejected') setRejectedTodayTotal(prev => prev + 1);
        if (paymentDetails && paymentDetails._id === updated._id) setPaymentDetails(updated);
        showToast('success', 'Success', `Payment ${approvalAction}d successfully`);
      } else {
        if (resp && resp.status === 409) {
          showToast('error', 'Conflict', resp.message || 'Payment status changed by another user');
        } else {
          showToast('error', 'Error', 'Failed to update payment status');
        }
      }
    } catch (err) {
      console.error('Error updating payment status', err);
      showToast('error', 'Error', 'Failed to update payment status');
    } finally {
      setShowModal(false);
      setRemarks('');
      setSelectedPayment(null);
      setApprovalAction(null);
    }
  };

  const openEditFee = (ft) => {
    if (!ft) return;
    setEditingFee(ft);
    setEditName(ft.name || '');
    setEditAmount(ft.defaultAmount ?? '');
    setEditIsActive(ft.isActive ?? true);
    setEditDescription(ft.description || '');
    setEditType(ft.type || 'general');
    setEditDueDate(ft.dueDate ? ft.dueDate.split('T')[0] : '');
    if (ft.type === 'batchwise') {
      setEditBatchId(ft.batchId || (ft.batch && ft.batch.id) || '');
      setEditSemesterId('');
    } else if (ft.type === 'semesterwise') {
      let batchId = '';
      if (ft.semester && ft.semester.batch && ft.semester.batch.id) {
        batchId = ft.semester.batch.id;
      } else if (ft.batchId) {
        batchId = ft.batchId;
      }
      setEditBatchId(batchId);
      setEditSemesterId(ft.semesterId || (ft.semester && ft.semester.id) || '');
    } else {
      setEditBatchId('');
      setEditSemesterId('');
    }
  };

  const submitEditFee = async () => {
    if (!editingFee) return;
    const payload = {};
    if ((editName || '').trim() !== (editingFee.name || '')) payload.name = (editName || '').trim();
    const amtNum = editAmount === '' ? null : Number(editAmount);
    if (amtNum !== null && !Number.isNaN(amtNum) && amtNum !== (editingFee.defaultAmount ?? 0)) payload.defaultAmount = amtNum;
    if (editIsActive !== (editingFee.isActive ?? false)) payload.isActive = editIsActive;
    if ((editDescription || '').trim() !== (editingFee.description || '')) payload.description = (editDescription || '').trim();
    if (editType !== (editingFee.type || 'general')) payload.type = editType;
    if (editType === 'batchwise') payload.batchId = editBatchId;
    if (editType === 'semesterwise') payload.semesterId = editSemesterId;
    if ((editDueDate || '') !== (editingFee.dueDate ? editingFee.dueDate.split('T')[0] : '')) payload.dueDate = editDueDate;
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
        showToast('success', 'Updated', 'Fee type updated successfully');
      } else if (resp && resp.id) {
        const updated = resp;
        setAdminFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        setFeeTypes(prev => prev.map(f => f.id === updated.id ? updated : f));
        showToast('success', 'Updated', 'Fee type updated successfully');
      }
    } catch (err) {
      console.error('Failed to update fee type', err);
      showToast('error', 'Error', 'Failed to update fee type');
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

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const q = (searchTerm || '').toString().toLowerCase();
    const sName = (payment.studentName || '').toString().toLowerCase();
    const sNo = (payment.studentNo || '').toString().toLowerCase();
    const tref = (payment.transactionRef || '').toString().toLowerCase();
    const matchesSearch = q === '' || sName.includes(q) || sNo.includes(q) || tref.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}

                  <HeaderBar
                    title="Payment Approvals"
                    subtitle="Review and approve student payment submissions"
                    Icon={DollarSign}
                  />
          {/* <div className="flex justify-end space-x-3">
            <Button icon={RefreshCw} variant="secondary" onClick={() => fetchPayments()}>
              Refresh
            </Button>
          </div> */}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{pendingPaymentsTotal}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{approvedTodayTotal}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{rejectedTodayTotal}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{paymentsTotal}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by student name, number, or transaction ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </Card>

          {/* Payments Table */}
          <Card>
            <div className="overflow-x-auto">
              {loadingPayments ? (
                <div className="p-8 text-center text-gray-600">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading payments...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                              {payment.studentName && typeof payment.studentName === 'string' && payment.studentName.length > 0 ? payment.studentName.charAt(0) : '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-xs text-gray-500">{payment.studentNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{payment.feeTypeName}</div>
                          <div className="text-xs text-gray-500">{(payment.method || '').replace('_', ' ')} - {payment.transactionRef}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{formatDate(payment.submittedAt)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openPaymentDetails(payment._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {payment.attachments?.length > 0 && (
                              <button
                                onClick={() => downloadAttachment(payment, payment.attachments[0])}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Attachment"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproval(payment, 'approve')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApproval(payment, 'reject')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setPaymentToDelete(payment);
                                    setShowConfirmDelete(true);
                                  }}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Delete"
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
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{paymentsTotal > 0 ? (paymentsPage - 1) * paymentsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(paymentsPage * paymentsPerPage, paymentsTotal)}</span> of{' '}
                <span className="font-medium">{paymentsTotal}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => {
                    const p = Math.max(1, paymentsPage - 1);
                    setPaymentsPage(p);
                    fetchPayments({ page: p });
                  }}
                  disabled={paymentsPage === 1}
                >
                  Previous
                </Button>
                
                {(() => {
                  const buttons = [];
                  const totalPages = Math.max(1, Math.ceil(paymentsTotal / paymentsPerPage));
                  const maxVisible = 5;
                  let start = Math.max(1, paymentsPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
                  
                  for (let i = start; i <= end; i++) {
                    buttons.push(
                      <Button
                        key={i}
                        variant={paymentsPage === i ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setPaymentsPage(i);
                          fetchPayments({ page: i });
                        }}
                      >
                        {i}
                      </Button>
                    );
                  }
                  return buttons;
                })()}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const p = paymentsPage + 1;
                    setPaymentsPage(p);
                    fetchPayments({ page: p });
                  }}
                  disabled={paymentsPage >= Math.ceil(paymentsTotal / paymentsPerPage)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Fee Types Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Fee Types Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage the list of fee categories students can submit payments for</p>
              </div>
              <Button icon={Plus} onClick={() => setShowFeeTypeModal(true)}>
                Add Fee Type
              </Button>
            </div>

            {/* Search and filters */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search fee types..."
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={adminOnlyActive}
                onChange={(e) => setAdminOnlyActive(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button onClick={() => fetchAdminFeeTypes({ page: 1, q: adminQuery, onlyActive: adminOnlyActive })}>
                Search
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              {adminLoading ? (
                <div className="p-8 text-center text-gray-600">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading fee types...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Default Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminFeeTypes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                          No fee types found
                        </td>
                      </tr>
                    ) : (
                      adminFeeTypes.map((fee) => {
                        let batchName = '';
                        let semesterName = '';
                        if (fee.type === 'batchwise') {
                          batchName = fee.batch ? fee.batch.name : '';
                        } else if (fee.type === 'semesterwise') {
                          if (fee.semester && fee.semester.batch) {
                            batchName = fee.semester.batch.name;
                          }
                          semesterName = fee.semester ? fee.semester.name : '';
                        }
                        let dueDateStr = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
                        return (
                          <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{fee.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">{fee.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{batchName || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{semesterName || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(fee.defaultAmount ?? 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{dueDateStr}</td>
                            <td className="px-4 py-3">
                              {fee.isActive ? (
                                <Badge variant="success">Active</Badge>
                              ) : (
                                <Badge variant="default">Inactive</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {fee.createdAt ? formatDate(fee.createdAt) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditFee(fee)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setFeeToDelete(fee)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Soft Delete"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setHardDeleteTarget(fee)}
                                  className="p-1.5 text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination for fee types */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{adminTotal > 0 ? (adminPage - 1) * adminPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(adminPage * adminPerPage, adminTotal)}</span> of{' '}
                <span className="font-medium">{adminTotal}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const p = Math.max(1, adminPage - 1);
                    setAdminPage(p);
                    fetchAdminFeeTypes({ page: p });
                  }}
                  disabled={adminPage === 1}
                >
                  Previous
                </Button>
                
                {(() => {
                  const buttons = [];
                  const totalPages = Math.max(1, Math.ceil(adminTotal / adminPerPage));
                  const maxVisible = 5;
                  let start = Math.max(1, adminPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
                  
                  for (let i = start; i <= end; i++) {
                    buttons.push(
                      <Button
                        key={i}
                        variant={adminPage === i ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setAdminPage(i);
                          fetchAdminFeeTypes({ page: i });
                        }}
                      >
                        {i}
                      </Button>
                    );
                  }
                  return buttons;
                })()}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const p = adminPage + 1;
                    setAdminPage(p);
                    fetchAdminFeeTypes({ page: p });
                  }}
                  disabled={adminPage >= Math.ceil(adminTotal / adminPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

          {/* Approval Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={approvalAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            size="md"
          >
            {selectedPayment && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Student:</span>
                      <p className="font-medium text-gray-900">{selectedPayment.studentName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fee Type:</span>
                      <p className="font-medium text-gray-900">{selectedPayment.feeTypeName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transaction:</span>
                      <p className="font-medium text-gray-900">{selectedPayment.transactionRef}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows="4"
                    placeholder={
                      approvalAction === 'approve'
                        ? 'Payment verified and approved (optional)'
                        : 'Reason for rejection (required)...'
                    }
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant={approvalAction === 'approve' ? 'success' : 'danger'}
                    onClick={confirmApproval}
                  >
                    Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                  </Button>
                </div>
              </>
            )}
          </Modal>

          {/* Payment Details Modal */}
          <Modal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setPaymentDetails(null);
            }}
            title="Payment Details"
            size="lg"
          >
            {detailsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Loading details...</p>
              </div>
            ) : paymentDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Student Name</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{paymentDetails.studentName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Student Number</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{paymentDetails.studentNo}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Amount</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(paymentDetails.amount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Fee Type</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{paymentDetails.feeTypeName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Payment Method</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                      {(paymentDetails.method || 'N/A').replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Transaction Reference</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{paymentDetails.transactionRef}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Status</label>
                    <div className="mt-1">{getStatusBadge(paymentDetails.status)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase">Submitted At</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(paymentDetails.submittedAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 uppercase mb-2 block">Attachments</label>
                  {paymentDetails.attachments?.length > 0 ? (
                    <div className="space-y-2">
                      {paymentDetails.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">
                            {typeof att === 'string' ? att : (att.filename || att.url || 'Attachment')}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => downloadAttachment(paymentDetails, att, true)}
                            >
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Download}
                              onClick={() => downloadAttachment(paymentDetails, att)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No attachments</p>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* Add Fee Type Modal */}
          <Modal
            isOpen={showFeeTypeModal}
            onClose={() => {
              setShowFeeTypeModal(false);
              setNewFeeName('');
              setNewFeeAmount('');
              setNewFeeType('general');
              setNewBatchId('');
              setNewSemesterId('');
              setNewDueDate('');
            }}
            title="Add New Fee Type"
            size="md"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester Fee, Lab Fee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={newDueDate || ''}
                  onChange={e => setNewDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={newFeeType}
                  onChange={(e) => {
                    setNewFeeType(e.target.value);
                    setNewBatchId('');
                    setNewSemesterId('');
                  }}
                >
                  <option value="general">General</option>
                  <option value="batchwise">Batchwise</option>
                  <option value="semesterwise">Semesterwise</option>
                </select>
              </div>

              {newFeeType === 'batchwise' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                  >
                    <option value="">Choose a batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {newFeeType === 'semesterwise' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Batch <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={newBatchId}
                      onChange={(e) => {
                        setNewBatchId(e.target.value);
                        setNewSemesterId('');
                      }}
                    >
                      <option value="">Choose a batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={newSemesterId}
                      onChange={(e) => setNewSemesterId(e.target.value)}
                      disabled={!newBatchId}
                    >
                      <option value="">Choose a semester</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowFeeTypeModal(false);
                    setNewFeeName('');
                    setNewFeeAmount('');
                    setNewFeeType('general');
                    setNewBatchId('');
                    setNewSemesterId('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={creatingFee}
                  onClick={async () => {
                    if (!newFeeName.trim()) {
                      showToast('error', 'Validation', 'Please enter a fee name');
                      return;
                    }
                    const amt = Number(newFeeAmount || 0);
                    if (isNaN(amt) || amt < 0) {
                      showToast('error', 'Validation', 'Please enter a valid amount');
                      return;
                    }
                    if (newFeeType === 'batchwise' && !newBatchId) {
                      showToast('error', 'Validation', 'Please select a batch');
                      return;
                    }
                    if (newFeeType === 'semesterwise' && (!newBatchId || !newSemesterId)) {
                      showToast('error', 'Validation', 'Please select batch and semester');
                      return;
                    }

                    setCreatingFee(true);
                    try {
                      const payload = {
                        name: newFeeName.trim(),
                        defaultAmount: amt,
                        type: newFeeType,
                        ...(newFeeType === 'batchwise' ? { batchId: newBatchId } : {}),
                        ...(newFeeType === 'semesterwise' ? { semesterId: newSemesterId } : {}),
                        ...(newDueDate ? { dueDate: newDueDate } : {}),
                      };
                      const res = await FeeTypesService.createFeeType(payload);
                      
                      if (res && res.success === false) {
                        showToast('error', 'Error', res.message || 'Failed to create fee type');
                      } else {
                        const created = (res && res.data) ? res.data : (res && res.feeType ? res.feeType : (res && res.id ? res : null));
                        if (created) {
                          setFeeTypes(prev => [...prev, created]);
                          fetchAdminFeeTypes({ page: 1 });
                          setNewFeeName('');
                          setNewFeeAmount('');
                          setNewFeeType('general');
                          setNewBatchId('');
                          setNewSemesterId('');
                          setShowFeeTypeModal(false);
                          showToast('success', 'Success', 'Fee type created successfully');
                        } else {
                          showToast('error', 'Error', 'Unexpected response from server');
                        }
                      }
                    } catch (err) {
                      console.error('Failed to create fee type', err);
                      showToast('error', 'Error', err?.message || 'Failed to create fee type');
                    } finally {
                      setCreatingFee(false);
                    }
                  }}
                >
                  {creatingFee ? 'Creating...' : 'Create Fee Type'}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Edit Fee Type Modal */}
          <Modal
            isOpen={!!editingFee}
            onClose={() => setEditingFee(null)}
            title="Edit Fee Type"
            size="md"
          >
            {editingFee && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={editDueDate || ''}
                    onChange={e => setEditDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={editType}
                    onChange={(e) => {
                      setEditType(e.target.value);
                      setEditBatchId('');
                      setEditSemesterId('');
                    }}
                  >
                    <option value="general">General</option>
                    <option value="batchwise">Batchwise</option>
                    <option value="semesterwise">Semesterwise</option>
                  </select>
                </div>

                {editType === 'batchwise' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={editBatchId}
                      onChange={(e) => setEditBatchId(e.target.value)}
                    >
                      <option value="">Choose a batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {editType === 'semesterwise' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={editBatchId}
                        onChange={(e) => {
                          setEditBatchId(e.target.value);
                          setEditSemesterId('');
                        }}
                      >
                        <option value="">Choose a batch</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={editSemesterId}
                        onChange={(e) => setEditSemesterId(e.target.value)}
                        disabled={!editBatchId}
                      >
                        <option value="">Choose a semester</option>
                        {editSemesters.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows="3"
                    placeholder="Additional details about this fee type..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="secondary" onClick={() => setEditingFee(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={editingLoading}
                    onClick={submitEditFee}
                  >
                    {editingLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Attachment Preview Modal */}
          {previewAttachment && previewUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 relative flex flex-col max-h-[90vh]">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10"
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
                    <div className="font-semibold text-lg text-gray-800">Attachment Preview</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {typeof previewAttachment === 'string' ? previewAttachment : (previewAttachment.filename || previewAttachment.url)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">File type: {previewType || 'unknown'}</div>
                  </div>
                  <a
                    href={previewUrl}
                    download={typeof previewAttachment === 'string' ? previewAttachment : (previewAttachment.filename || 'attachment')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
                
                <div className="flex items-center justify-center flex-1 bg-gray-50 rounded-lg border p-4 overflow-auto">
                  {previewType && previewType.startsWith('image') ? (
                    <img src={previewUrl} alt="Attachment Preview" className="max-h-full max-w-full rounded border shadow" />
                  ) : previewType === 'application/pdf' ? (
                    <iframe src={previewUrl} title="PDF Preview" className="w-full h-full min-h-[500px] border rounded bg-white" />
                  ) : (
                    <div className="text-gray-600 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <div className="mb-2">Cannot preview this file type</div>
                      <span className="text-sm text-gray-400">File type: {previewType || 'unknown'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Payment Dialog */}
          <ConfirmDialog
            open={showConfirmDelete}
            title="Delete Payment"
            message={paymentToDelete ? `Delete payment for ${paymentToDelete.studentName}? This action cannot be undone.` : 'Delete payment?'}
            onCancel={() => {
              setShowConfirmDelete(false);
              setPaymentToDelete(null);
            }}
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
                  showToast('success', 'Success', 'Payment deleted successfully');
                } else {
                  showToast('error', 'Error', resp.message || 'Failed to delete payment');
                }
              } catch (e) {
                console.error('Delete payment error', e);
                showToast('error', 'Error', 'Failed to delete payment');
              } finally {
                setShowConfirmDelete(false);
                setPaymentToDelete(null);
              }
            }}
          />

          {/* Soft Delete Fee Type Dialog */}
          <ConfirmDialog
            open={!!feeToDelete}
            title="Delete Fee Type"
            message={feeToDelete ? `Delete fee type "${feeToDelete.name}"? This will set it as inactive (soft delete).` : 'Delete this fee type?'}
            onCancel={() => setFeeToDelete(null)}
            onConfirm={async () => {
              if (!feeToDelete) return;
              try {
                const resp = await FeeTypesService.deleteFeeType(feeToDelete.id);
                if (resp && resp.success === false) {
                  showToast('error', 'Error', resp.message || 'Failed to delete fee type');
                } else {
                  setFeeTypes(prev => prev.map(f => f.id === feeToDelete.id ? { ...f, isActive: false } : f));
                  fetchAdminFeeTypes({ page: adminPage });
                  showToast('success', 'Success', 'Fee type soft-deleted successfully');
                }
              } catch (err) {
                console.error('Failed to delete fee type', err);
                showToast('error', 'Error', 'Failed to delete fee type');
              } finally {
                setFeeToDelete(null);
              }
            }}
          />

          {/* Hard Delete Fee Type Dialog */}
          <ConfirmDialog
            open={!!hardDeleteTarget}
            title="Permanently Delete Fee Type"
            message={hardDeleteTarget ? `Permanently delete fee type "${hardDeleteTarget.name}"? This action cannot be undone.` : 'Permanently delete this fee type?'}
            onCancel={() => setHardDeleteTarget(null)}
            onConfirm={async () => {
              if (!hardDeleteTarget) return;
              try {
                const resp = await FeeTypesService.hardDeleteFeeType(hardDeleteTarget.id);
                if (resp && resp.success === false) {
                  showToast('error', 'Error', resp.message || 'Failed to delete fee type');
                } else {
                  setFeeTypes(prev => prev.filter(f => f.id !== hardDeleteTarget.id));
                  fetchAdminFeeTypes({ page: adminPage });
                  showToast('success', 'Success', 'Fee type permanently deleted');
                }
              } catch (err) {
                console.error('Failed to hard-delete fee type', err);
                showToast('error', 'Error', 'Failed to permanently delete fee type');
              } finally {
                setHardDeleteTarget(null);
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}