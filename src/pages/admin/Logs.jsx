import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronRight, Clock, MapPin, Smartphone } from 'lucide-react';
import UtilService from '../../services/super-admin/utilService';
import * as XLSX from 'xlsx';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const sentinelRef = useRef(null);

  const utilService = new UtilService();

  // Fetch logs from API. options: { reset, limit, cursor }
  const fetchLogs = async (options = {}) => {
    const { reset = false, limit = 20, cursor = null } = options;
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Include client-side filters in server query so server returns filtered pages
      const moduleParam = selectedModule !== 'all' ? selectedModule : undefined;
      const statusParam = selectedStatus !== 'all' ? selectedStatus : undefined;
      const response = await utilService.getLogs({ limit, cursor, module: moduleParam, status: statusParam });

      if (response && response.success) {
        const newData = response.data || [];
        setLogs(prev => (reset ? newData : [...prev, ...newData]));

        // API may return pagination info
        // If response.count provided, use it, otherwise increment previous totalCount
        setTotalCount(prevCount => response.count ?? (reset ? newData.length : prevCount + newData.length));
        setNextCursor(response.nextCursor || null);
        setHasMore(response.hasMore === undefined ? (newData.length === limit) : Boolean(response.hasMore));
      } else {
        setError(response?.message || 'Failed to fetch logs');
        if (reset) {
          setLogs([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch logs');
      if (reset) setLogs([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // initial load
    setNextCursor(null);
    setHasMore(true);
    fetchLogs({ reset: true, limit: 20, cursor: null });
  }, []);

  // Reset and refetch when filters/search change
  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    fetchLogs({ reset: true, limit: 20, cursor: null });
  }, [selectedModule, selectedStatus]);

  // Standard pattern: callback ref for the last item
  const observer = useRef();
  const lastLogRef = useCallback(node => {
    if (loadingMore || isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchLogs({ reset: false, limit: 20, cursor: nextCursor });
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    if (node) observer.current.observe(node);
  }, [loadingMore, isLoading, hasMore, nextCursor]);

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.username && log.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user?.firstName && log.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.user?.lastName && log.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Module filter
    if (selectedModule !== 'all') {
      filtered = filtered.filter(log => log.module === selectedModule);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    // Date range filter
    const now = new Date();
    if (selectedDateRange !== 'all') {
      const hours = selectedDateRange === '24h' ? 24 : selectedDateRange === '7d' ? 168 : 720;
      const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedModule, selectedStatus, selectedDateRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failure': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failure': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRefresh = () => {
    // Reset pagination and reload
    setNextCursor(null);
    setHasMore(true);
    fetchLogs({ reset: true, limit: 20 });
  };

  const handleExport = () => {
    try {
      // Prepare data for Excel export
      const exportData = filteredLogs.map(log => ({
        'Timestamp': formatTimestamp(log.timestamp),
        'User': log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User',
        'Email': log.user?.email || 'N/A',
        'Username': log.user?.username || 'N/A',
        'Module': log.module.replace('_', ' '),
        'Action': log.action,
        'Status': log.status,
        'Description': log.description,
        'Entity Type': log.entityType,
        'Entity': log.entity,
        'Entity ID': log.entityId || 'N/A',
        'IP Address': log.ipAddress,
        'User Agent': log.userAgent,
        'Request URL': log.details?.url || 'N/A',
        'HTTP Method': log.details?.method || 'N/A',
        'Request Body': log.details?.body ? JSON.stringify(log.details.body) : 'N/A',
        'Request Params': log.details?.params ? JSON.stringify(log.details.params) : 'N/A'
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Timestamp
        { wch: 25 }, // User
        { wch: 30 }, // Email
        { wch: 20 }, // Username
        { wch: 15 }, // Module
        { wch: 10 }, // Action
        { wch: 10 }, // Status
        { wch: 40 }, // Description
        { wch: 15 }, // Entity Type
        { wch: 15 }, // Entity
        { wch: 25 }, // Entity ID
        { wch: 15 }, // IP Address
        { wch: 50 }, // User Agent
        { wch: 40 }, // Request URL
        { wch: 10 }, // HTTP Method
        { wch: 30 }, // Request Body
        { wch: 30 }  // Request Params
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'System Logs');
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `system_logs_${currentDate}.xlsx`;
      
      // Export file
      XLSX.writeFile(workbook, filename);
      
      console.log(`Exported ${filteredLogs.length} log entries to ${filename}`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs. Please try again.');
    }
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-600">Monitor and audit all system activities</p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((filteredLogs.filter(l => l.status === 'success').length / filteredLogs.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(l => l.status === 'failure').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredLogs.filter(l => l.status === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div> */}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Module Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                <option value="all">All Modules</option>
                <option value="auth">Authentication</option>
                <option value="degree_program">Degree Program</option>
                <option value="enrollment">Enrollment</option>
                <option value="results">Results</option>
                <option value="payment">Payments</option>
                <option value="attendance">Attendance</option>
                <option value="student">Student</option>
                <option value="medical">Medical</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {totalCount} logs (Page {currentPage} of {totalPages})
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading logs...</h3>
              <p className="text-gray-500">Please wait while we fetch the system logs.</p>
            </div>
          )}
          
          {!isLoading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log, idx) => (
                      <React.Fragment key={log.id}>
                        <tr ref={idx === filteredLogs.length - 1 ? lastLogRef : null} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.user?.email || log.user?.username || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {log.module.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 uppercase">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)}
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              {expandedLog === log.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Details */}
                        {expandedLog === log.id && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">System Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">IP:</span>
                                        <span>{log.ipAddress}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">User Agent:</span>
                                        <span className="break-all">{log.userAgent}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Entity Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-gray-600">Type:</span>
                                        <span className="ml-2">{log.entityType}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Entity:</span>
                                        <span className="ml-2">{log.entity}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Entity ID:</span>
                                        <span className="ml-2 break-all">{log.entityId || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-gray-600">User ID:</span>
                                        <span className="ml-2 break-all">{log.userId}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Username:</span>
                                        <span className="ml-2">{log.user?.username || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {log.details && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Request Details</h4>
                                    <div className="bg-white p-3 rounded border">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-600 font-medium">URL:</span>
                                          <span className="ml-2 break-all">{log.details.url}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-600 font-medium">Method:</span>
                                          <span className="ml-2">{log.details.method}</span>
                                        </div>
                                      </div>
                                      {log.details.body && Object.keys(log.details.body).length > 0 && (
                                        <div className="mt-3">
                                          <span className="text-gray-600 font-medium">Request Body:</span>
                                          <pre className="text-xs text-gray-600 mt-1 overflow-x-auto bg-gray-50 p-2 rounded">
                                            {JSON.stringify(log.details.body, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {log.details.params && Object.keys(log.details.params).length > 0 && (
                                        <div className="mt-3">
                                          <span className="text-gray-600 font-medium">Parameters:</span>
                                          <pre className="text-xs text-gray-600 mt-1 overflow-x-auto bg-gray-50 p-2 rounded">
                                            {JSON.stringify(log.details.params, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {loadingMore && (
                <div className="text-center py-4">
                  <RefreshCw className="w-6 h-6 text-blue-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">Loading more logs...</p>
                </div>
              )}
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}