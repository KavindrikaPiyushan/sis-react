import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Eye, Trash, Calendar, AlertCircle, CheckCircle, Clock, DollarSign, FileText, Filter, Search, ChevronDown, Bell } from 'lucide-react';
import LoadingComponent from '../../components/LoadingComponent';
import StudentPaymentsService from '../../services/student/paymentsService';
import SemesterService from '../../services/student/semesterService';
import { showToast } from '../utils/showToast';
import PublicFeeTypesService from '../../services/common/feeTypesService';
import ConfirmDialog from '../../components/ConfirmDialog';
import HeaderBar from '../../components/HeaderBar';
// Shared status badge renderer used by multiple components in this file
function getStatusBadge(status) {
  const styles = {
    paid: 'bg-green-100 text-green-800 border border-green-200',
    partial: 'bg-yellow-100 text-blue-800 border border-yellow-200',
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border border-red-200',
    verified: 'bg-green-100 text-green-800 border border-green-200',
    approved: 'bg-green-100 text-green-800 border border-green-200',
    rejected: 'bg-red-100 text-red-800 border border-red-200'
  };

  const icons = {
    paid: <CheckCircle className="w-4 h-4" />,
    partial: <Clock className="w-4 h-4" />,
    pending: <Clock className="w-4 h-4" />,
    overdue: <AlertCircle className="w-4 h-4" />,
    verified: <CheckCircle className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />
  };

  const label = typeof status === 'string' && status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
      {icons[status]}
      {label}
    </span>
  );
}

const PaymentSection = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 80); return () => clearTimeout(t); }, []);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => { const it = setInterval(() => setCurrentDateTime(new Date()), 1000); return () => clearInterval(it); }, []);

  // Fetch semesters for selector
  useEffect(() => {
    let mounted = true;
    const fetchSemesters = async () => {
      const res = await SemesterService.getMySemesters();
      if (!mounted) return;
      if (res && res.semesters) {
        setSemesters(res.semesters);
        if (!selectedSemester && res.semesters.length > 0) setSelectedSemester(res.semesters[0].id);
      } else {
        showToast('error', 'Error', res.message || 'Failed to load semesters');
      }
    };
    fetchSemesters();
    return () => { mounted = false; };
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [studentBalance, setStudentBalance] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [feesData, setFeesData] = useState(null);
  const [feesLoading, setFeesLoading] = useState(false);
  // Payment history state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [skipSemesterFilter, setSkipSemesterFilter] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(5);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetailsLoading, setPaymentDetailsLoading] = useState(false);
  const [downloadingSlip, setDownloadingSlip] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch fee breakdown when semester changes
  useEffect(() => {
    let mounted = true;
    const fetchFees = async (semester) => {
      if (!semester) return;
      setFeesLoading(true);
      const res = await StudentPaymentsService.getFees(semester);
      if (!mounted) return;
      setFeesLoading(false);
      if (res && res.fees) {
        setFeesData(res);
        // derive a simple balance summary from fees
        try {
          const feesArr = Array.isArray(res.fees) ? res.fees : [];
          const totalDue = feesArr.reduce((s, f) => s + (Number(f.balance) || 0), 0);
          const totalPaid = feesArr.reduce((s, f) => s + (Number(f.paid) || 0), 0);
          const balancesDue = feesArr.filter(f => (Number(f.balance) || 0) > 0 && f.dueDate).map(f => ({ dueDate: f.dueDate }));
          let nextDueDate = null;
          if (balancesDue.length > 0) {
            nextDueDate = balancesDue.map(b => new Date(b.dueDate)).sort((a,b) => a - b)[0];
            nextDueDate = nextDueDate ? nextDueDate.toISOString().split('T')[0] : null;
          }
          const overdueAmount = feesArr.reduce((s, f) => {
            if (f.dueDate && new Date(f.dueDate) < new Date() && (Number(f.balance) || 0) > 0) return s + (Number(f.balance) || 0);
            return s;
          }, 0);
          setStudentBalance({ totalDue, totalPaid, nextDueDate, overdueAmount });
        } catch (e) {
          console.warn('Failed to compute studentBalance from fees', e);
        }
      } else if (res && res.errors) {
        showToast('error', 'Error', res.errors.semester || 'Semester is required');
      } else {
        showToast('error', 'Error', res.message || 'Failed to load fees');
      }
    };
    fetchFees(selectedSemester);
    return () => { mounted = false; };
  }, [selectedSemester]);

  // Fetch payments list when filters or page change
  const fetchPayments = async (opts = {}) => {
    setPaymentsLoading(true);
    try {
      const params = {
        page: opts.page || paymentsPage,
  perPage: opts.perPage || paymentsPerPage,
  q: opts.q !== undefined ? opts.q : searchQuery,
  // only include status when explicitly provided or when a non-empty filter is selected
  ...( (opts.status !== undefined ? (opts.status ? { status: opts.status } : {}) : (statusFilter ? { status: statusFilter } : {})) ),
        startDate: opts.startDate !== undefined ? opts.startDate : startDate,
        endDate: opts.endDate !== undefined ? opts.endDate : endDate,
        // Only include semester if not skipped due to server-side issues
        ...( (opts.semester !== undefined ? opts.semester : selectedSemester) && !skipSemesterFilter ? { semester: (opts.semester !== undefined ? opts.semester : selectedSemester) } : {} ),
      };

      const res = await StudentPaymentsService.getPayments(params);
      if (res && Array.isArray(res.payments)) {
        setPayments(res.payments);
        setPaymentsPage(res.page || params.page || 1);
        setPaymentsPerPage(res.perPage || params.perPage || 5);
        setPaymentsTotal(res.total || 0);
      } else if (res && res.success === false) {
        // Show server-provided message when available
        const msg = res.message || `Failed to load payments${res.status ? ` (status ${res.status})` : ''}`;
        console.error('Payments API returned error:', res);

        // If server returned a 5xx and we included a semester, retry once without semester
        if (res.status && Number(res.status) >= 500 && params.semester) {
          console.warn('Payments API 5xx detected with semester param; retrying without semester as a fallback');
          try {
            const retryParams = { ...params };
            delete retryParams.semester;
            const retryRes = await StudentPaymentsService.getPayments(retryParams);
            if (retryRes && Array.isArray(retryRes.payments)) {
              setPayments(retryRes.payments);
              setPaymentsPage(retryRes.page || retryParams.page || 1);
              setPaymentsPerPage(retryRes.perPage || retryParams.perPage || 10);
              setPaymentsTotal(retryRes.total || 0);
              // Remember backend could not handle semester filter -> skip it going forward
              setSkipSemesterFilter(true);
              showToast('info', 'Notice', 'Failed to load payments for the selected semester; showing all semesters instead.');
              return;
            }
          } catch (retryErr) {
            console.error('Retry without semester also failed:', retryErr, retryErr && retryErr.data ? { responseData: retryErr.data } : null);
          }
        }

        showToast('error', 'Error', msg);
      } else {
        // fallback: empty or unexpected response
        setPayments([]);
      }
    } catch (err) {
      // err may be an Error with attached status/data from apiClient
      console.error('fetchPayments caught error:', err, err && err.data ? { responseData: err.data } : null);
      const serverMsg = err && err.data && err.data.message ? err.data.message : null;
      const msg = serverMsg || err.message || 'Failed to load payments';
      showToast('error', 'Error', msg);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch payments when user is viewing the history tab.
    // This avoids automatically sending a semester filter on mount which
    // the backend may not handle in some environments.
    if (activeTab === 'history') {
      fetchPayments({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester, activeTab]);

  // Refetch payments when statusFilter changes while on the history tab
  useEffect(() => {
    if (activeTab !== 'history') return;
    // debounce not strictly necessary here but avoid firing on every tiny change
    const t = setTimeout(() => fetchPayments({ page: 1, q: searchQuery, status: statusFilter }), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, activeTab]);

  // Fetch payment-related notifications (mounted)
  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      const res = await StudentPaymentsService.getPaymentNotifications();
      if (!mounted) return;
      setNotificationsLoading(false);
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      } else if (res && res.success === false) {
        showToast('error', 'Error', res.message || 'Failed to load notifications');
      } else {
        // unexpected shape - no notifications
        setNotifications([]);
      }
    };
    fetchNotifications();
    return () => { mounted = false; };
  }, []);

  // After a successful upload, refresh fees and payments in-place (avoid full page reload)
  const handleUploadSuccess = async (resp) => {
    try {
      // Refresh fee breakdown for the selected semester (if any)
      if (selectedSemester) {
        setFeesLoading(true);
        const feeRes = await StudentPaymentsService.getFees(selectedSemester);
        setFeesLoading(false);
        if (feeRes && feeRes.fees) {
          setFeesData(feeRes);
        } else if (feeRes && feeRes.success === false) {
          showToast('error', 'Error', feeRes.message || 'Failed to refresh fees');
        }
      }

      // Refresh payments list to include the newly uploaded slip
      await fetchPayments({ page: 1 });
    } catch (err) {
      console.error('handleUploadSuccess error:', err);
      showToast('error', 'Refresh failed', 'Failed to refresh payments or fees after upload');
    }
  };


  

  

  if (loading) {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
        <div className="max-w-8xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingComponent message="Loading payments..." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen ">
      <div className="max-w-8xl mx-auto p-8">
        {/* header */}
        <HeaderBar title="Payment Portal" subtitle="Manage your fees and payment history" Icon={CreditCard} />
        {/*end header */}

        {/* Balance Overview Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4  justify-end">
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Upload Payment Slip
          </button>
          {/* <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            Download Statement
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Eye className="w-5 h-5" />
            View Payment Instructions
          </button> */}
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
                    {semesters.length === 0 && <option value="">Loading semesters...</option>}
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.label || s.name || s.id}</option>
                    ))}
                  </select>
                </div>

                {/* Categorized Fee Breakdown Table */}
                <div className="overflow-x-auto">
                  {(() => {
                    const fees = feesData?.fees || {};
                    const categories = [
                      { key: 'general', label: 'General Fees', color: 'bg-gray-100' },
                      { key: 'batchwise', label: 'Batch Fees', color: 'bg-blue-50' },
                      { key: 'semesterwise', label: 'Current Semester Fees', color: 'bg-green-50' },
                    ];
                    return (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categories.map(cat => (
                            Array.isArray(fees[cat.key]) && fees[cat.key].length > 0 ? (
                              <React.Fragment key={cat.key}>
                                <tr>
                                  <td colSpan={8} className={`px-6 py-3 text-sm font-semibold text-gray-700 ${cat.color}`}>{cat.label}</td>
                                </tr>
                                {fees[cat.key].map(fee => (
                                  <tr key={fee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{cat.label}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.name || fee.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fee.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof fee.paid !== 'undefined' ? `$${fee.paid}` : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{typeof fee.balance !== 'undefined' ? `$${fee.balance}` : '—'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{
                                      fee.dueDate
                                        ? (() => {
                                            try {
                                              const d = new Date(fee.dueDate);
                                              if (!isNaN(d)) return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
                                            } catch {}
                                            return fee.dueDate;
                                          })()
                                        : '—'
                                    }</td>
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
                              </React.Fragment>
                            ) : null
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { fetchPayments({ page: 1, q: searchQuery, status: statusFilter }); } }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                      <option value="">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {/* Optional: keep Filter button if you prefer manual filter trigger */}
                  </div>
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
                      {paymentsLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Loading payments...</td>
                        </tr>
                      ) : (
                        (payments.length > 0 ? payments : []).map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{
                              payment.date
                                ? (() => {
                                    try {
                                      const d = new Date(payment.date);
                                      if (!isNaN(d)) return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
                                    } catch {}
                                    return payment.date;
                                  })()
                                : '—'
                            }</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${payment.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.reference}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button title="View payment" aria-label={`View payment ${payment.reference || payment.id}`} onClick={async () => {
                                  // open details modal and fetch payment
                                  setSelectedPaymentId(payment.id);
                                  setPaymentDetailsLoading(true);
                                  const resp = await StudentPaymentsService.getPayment(payment.id);
                                  setPaymentDetailsLoading(false);
                                  if (resp && resp.id) {
                                    setSelectedPayment(resp);
                                  } else if (resp && resp.success === false) {
                                    showToast('error', 'Error', resp.message || 'Failed to load payment');
                                  } else {
                                    showToast('error', 'Error', 'Failed to load payment');
                                  }
                                }} className="p-2 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50">
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Direct slip view/download button - open the server endpoint which may redirect to S3 or stream the file */}
                <button title="View/Download slip" aria-label={`View or download slip for ${payment.reference || payment.id}`} onClick={async () => {
                                    setDownloadingSlip(true);
                                    const slipEndpoint = payment.slipUrl ? { slipUrl: payment.slipUrl } : { paymentId: payment.id };
                                    const result = await StudentPaymentsService.downloadSlip(slipEndpoint);
                                    setDownloadingSlip(false);
                                    if (result && result.success && result.blob) {
                                      const url = window.URL.createObjectURL(result.blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = result.filename || `payment-${payment.id}-slip`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      a.remove();
                                    } else {
                                      // Fallback: open endpoint in new tab
                                      const slipHref = payment.slipUrl || `/api/students/me/payments/${payment.id}/slip`;
                                      window.open(slipHref, '_blank');
                                      showToast('error', 'Download failed', result.message || 'Could not download slip directly, opened in new tab');
                                    }
                                  }} className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50">
                                    <Download className="w-4 h-4" />
                                  </button>

                                {/* Delete pending/unverified */}
                                {payment.status === 'pending' && (
                                  <button
                                    title="Delete payment"
                                    aria-label={`Delete payment ${payment.reference || payment.id}`}
                                    onClick={() => { setConfirmTarget(payment); setConfirmOpen(true); }}
                                    className="p-2 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination controls (styled like DataTable) */}
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
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Previous
                    </button>

                    {/* numbered buttons */}
                    {(() => {
                      const buttons = [];
                      const total = typeof paymentsTotal === 'number' ? Math.ceil(paymentsTotal / paymentsPerPage) : Math.max(1, Math.ceil((payments.length || 0) / paymentsPerPage));
                      const maxVisible = 5;
                      let start = Math.max(1, paymentsPage - Math.floor(maxVisible / 2));
                      let end = Math.min(total, start + maxVisible - 1);
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
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications (fetched from API) */}
        <div className="mt-6 space-y-4">
          {notificationsLoading ? (
            <div className="px-4 py-6 bg-white border border-gray-100 rounded">Loading notifications...</div>
          ) : (
            (notifications.length > 0 ? notifications : []).map((n) => (
              <div key={n.id} className={`border rounded-lg p-4 ${n.type === 'reminder' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start gap-3">
                  {n.type === 'reminder' ? <Bell className="w-5 h-5 text-blue-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />}
                  <div>
                    <h4 className={`font-medium ${n.type === 'reminder' ? 'text-blue-900' : 'text-amber-900'}`}>{n.title}</h4>
                    <p className={`${n.type === 'reminder' ? 'text-blue-700' : 'text-amber-700'} text-sm mt-1`}>{n.message}</p>
                    {n.meta && Object.keys(n.meta).length > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        {Object.entries(n.meta).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>)}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          selectedSemester={selectedSemester}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
          {/* Payment details modal */}
          {selectedPayment && (
            <PaymentDetailsModal
              payment={selectedPayment}
              loading={paymentDetailsLoading}
              onClose={() => { setSelectedPayment(null); setSelectedPaymentId(null); }}
              onDeleted={async () => { setSelectedPayment(null); setSelectedPaymentId(null); fetchPayments({ page: paymentsPage }); }}
              onRequestDelete={() => { setConfirmTarget(selectedPayment); setConfirmOpen(true); }}
            />
          )}
          <ConfirmDialog
            open={confirmOpen}
            title="Delete Payment"
            message={confirmTarget ? `Delete payment ${confirmTarget.reference || confirmTarget.id}? This cannot be undone.` : 'Delete this payment?'}
            onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
            onConfirm={async () => {
              setConfirmOpen(false);
              if (!confirmTarget) return;
              const del = await StudentPaymentsService.deletePayment(confirmTarget.id);
              setConfirmTarget(null);
              if (del && del.success !== false) {
                showToast('success', 'Deleted', 'Payment deleted');
                // Close details modal if it was open for this payment
                if (selectedPaymentId === confirmTarget.id) {
                  setSelectedPayment(null);
                  setSelectedPaymentId(null);
                }
                fetchPayments({ page: paymentsPage });
              } else {
                showToast('error', 'Delete failed', del.message || 'Failed to delete');
              }
            }}
          />
    </main>
  );
};

export default PaymentSection;

// Extracted PaymentModal as a stable component to avoid remounting/input reset issues
function PaymentModal({ selectedSemester, feeTypes = [], onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [feeType, setFeeType] = useState('');
  const [localFeeTypes, setLocalFeeTypes] = useState(Array.isArray(feeTypes) ? feeTypes : []);
  const [paymentDate, setPaymentDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // If user edits amount manually, avoid overwriting when feeType changes
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF or image file');
    }
  };

  // Auto-fill amount when fee type selected, unless user already edited amount
  useEffect(() => {
    if (!feeType) return;
    if (amountManuallyEdited) return;
    // feeTypes from public API may contain `code` and `name`; match by code, name or id
    const selected = Array.isArray(localFeeTypes) ? localFeeTypes.find(f => f.code === feeType || f.name === feeType || String(f.id) === String(feeType)) : null;
    const amt = selected ? (selected.defaultAmount ?? selected.amount ?? selected.value ?? null) : null;
    if (amt != null) setPaymentAmount(String(amt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeType]);

  // If caller did not pass feeTypes, fetch public fee types for the dropdown
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (Array.isArray(feeTypes) && feeTypes.length > 0) return;
      try {
        const res = await PublicFeeTypesService.listPublicFeeTypes({ onlyActive: true });
        if (!mounted) return;
        if (res && res.success === false) {
          console.error('Failed to load public fee types', res);
          showToast('error', 'Failed to load fee types', res.message || 'Server returned an error');
        } else if (res && Array.isArray(res.feeTypes)) {
          setLocalFeeTypes(res.feeTypes);
        } else if (res && res.data && Array.isArray(res.data.feeTypes)) {
          setLocalFeeTypes(res.data.feeTypes);
        }
      } catch (err) {
        console.warn('Failed to load public fee types', err);
        showToast('error', 'Failed to load fee types', err?.message || 'See console for details');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!paymentAmount || Number(paymentAmount) <= 0) errors.paymentAmount = 'Must be > 0';
    if (!paymentDate) errors.paymentDate = 'Payment date is required';
    if (!feeType) errors.feeType = 'Fee type is required';
    if (!paymentMethod) errors.paymentMethod = 'Payment method is required';
    if (!selectedFile) errors.slipFile = 'Payment slip file is required';
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) errors.slipFile = 'File must be <= 10MB';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      showToast('error', 'Validation error', first);
      return;
    }

    // Normalize feeType to canonical values accepted by the server
    const normalizeFeeType = (val) => {
      if (!val) return val;
      const v = String(val).trim().toLowerCase();
      if (['tuition', 'library', 'examination', 'laboratory', 'other'].includes(v)) return v;
      if (['exam', 'exams'].includes(v)) return 'examination';
      if (['lab', 'labs'].includes(v)) return 'laboratory';
      if (v.includes('tuition')) return 'tuition';
      if (v.includes('library')) return 'library';
      if (v.includes('examin') || v.includes('exam')) return 'examination';
      if (v.includes('labor') || v.includes('lab')) return 'laboratory';
      if (v.includes('other')) return 'other';
      return v;
    };

    // Find the selected fee object from the fetched list (if any)
    const selectedFeeObj = Array.isArray(localFeeTypes) ? localFeeTypes.find(f => f.code === feeType || f.name === feeType || String(f.id) === String(feeType)) : null;
    console.debug('Selected fee object for submission:', selectedFeeObj);

    // Prefer an explicit code/key from the fee object if it clearly matches an accepted canonical value,
    // otherwise fall back to normalizing the chosen string (name or code) using the normalizer.
    let canonicalFeeType = null;
    let feeTypeId = null;
    if (selectedFeeObj) {
      const candidate = (selectedFeeObj.code ?? selectedFeeObj.name ?? selectedFeeObj.type ?? selectedFeeObj.id);
      canonicalFeeType = normalizeFeeType(candidate);
      feeTypeId = selectedFeeObj.id;
    }
    if (!canonicalFeeType) canonicalFeeType = normalizeFeeType(feeType);

    const formData = new FormData();
    formData.append('paymentAmount', paymentAmount);
    formData.append('paymentDate', paymentDate);
    formData.append('feeType', canonicalFeeType);
    if (feeTypeId) formData.append('feeTypeId', feeTypeId);
    formData.append('paymentMethod', paymentMethod);
    if (referenceNumber) formData.append('referenceNumber', referenceNumber);
    if (remarks) formData.append('remarks', remarks);
    if (selectedSemester) formData.append('semester', selectedSemester);
    formData.append('slipFile', selectedFile);

    try {
      // Debug: log canonical feeType and formData entries to help diagnose server-side validation
      console.debug('Submitting payment, canonicalFeeType:', canonicalFeeType);
      try {
        for (const entry of formData.entries()) {
          // entry is [key, value] - for files value will be a File object
          console.debug('formData entry:', entry[0], entry[1]);
        }
      } catch (fdErr) {
        console.warn('Unable to enumerate FormData entries for debug:', fdErr);
      }

      setUploading(true);
      setUploadProgress(0);
      const resp = await StudentPaymentsService.uploadPayment(formData, (ev) => {
        if (ev && ev.lengthComputable) {
          const pct = Math.round((ev.loaded * 100) / ev.total);
          setUploadProgress(pct);
        }
      });

      if (resp && resp.id) {
        showToast('success', 'Upload successful', 'Payment slip uploaded and pending verification');
        // close modal immediately so user sees toast in page context
        onClose && onClose();
        // delay any onSuccess action (like reload) so toast is visible
        if (onSuccess) setTimeout(() => onSuccess(resp), 800);
      } else if (resp && resp.success === false) {
        showToast('error', 'Upload failed', resp.message || 'Failed to upload');
      } else {
        showToast('error', 'Upload failed', 'Unexpected server response');
      }
    } catch (err) {
      showToast('error', 'Upload failed', err.message || 'Failed to upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Payment Slip</h3>
          <button onClick={() => onClose && onClose()} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
            <select value={feeType} onChange={(e) => { setFeeType(e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select fee type</option>
              {Array.isArray(localFeeTypes) && localFeeTypes.length > 0 ? (
                localFeeTypes.map(ft => (
                  // Use a stable identifier from the fetched object as the option value.
                  // Prefer `code` if present (admin-managed short code), otherwise fall back to `name` or id.
                  <option key={ft.id || ft.code || ft.name} value={ft.code ?? ft.name ?? ft.id}>{ft.name || ft.label || ft.type || ft.code || ft.id}</option>
                ))
              ) : (
                <>
                  <option value="tuition">Tuition Fee</option>
                  <option value="library">Library Fee</option>
                  {/* use canonical values expected by the API */}
                  <option value="examination">Exam Fee</option>
                  <option value="laboratory">Lab Fee</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>
          </div> <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
              <input type="number" placeholder="Enter amount" value={paymentAmount} onChange={(e) => { setPaymentAmount(e.target.value); setAmountManuallyEdited(true); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

         

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="online_banking">Online Banking</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
            <input type="text" placeholder="Transaction/Reference number" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Slip/Receipt *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea placeholder="Additional notes or comments" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => onClose && onClose()} disabled={uploading} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={uploading} className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}>{uploading ? `Uploading ${uploadProgress}%` : 'Submit Payment'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentDetailsModal({ payment, loading, onClose }) {
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto border border-gray-100">
  <div className="flex items-start justify-between px-6 py-4 gap-4 bg-blue-100 rounded-t-lg border-b border-gray-100">
          <div className="flex items-center gap-4">
            
            <div>
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <div className="text-sm text-gray-500">{payment.reference ? `Reference: #${payment.reference}` : '—'}</div>
            </div>
          </div>
          
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Reference</p>
              <p className="text-sm font-medium text-gray-800">{payment.reference || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-800">{payment.date ? new Date(payment.date).toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm font-medium text-gray-800">${payment.amount ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Method</p>
              <p className="text-sm font-medium text-gray-800">{payment.method || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fee Type</p>
              <p className="text-sm font-medium text-gray-800">{payment.feeType || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(payment.status)}</div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500">Remarks</p>
            <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap border border-gray-50 rounded-md p-3 bg-gray-50">{payment.remarks || '—'}</div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* slip actions (commented out for now) */}
            {/* {payment.slipUrl || payment.id ? ( ... ) } */}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => onClose && onClose()} className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}