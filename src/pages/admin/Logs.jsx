import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronRight, Clock, MapPin, Smartphone } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('24h');
  const [expandedLog, setExpandedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockLogs = [
    {
      logId: '1',
      timestamp: '2025-09-21T10:25:00Z',
      userId: 'student_123',
      userRole: 'student',
      module: 'auth',
      action: 'LOGIN',
      entityType: 'User',
      entityId: 'student_123',
      description: 'Student login successful',
      changes: null,
      ipAddress: '192.168.1.12',
      userAgent: 'Chrome 119 / Windows 11',
      status: 'success',
      remarks: null
    },
    {
      logId: '2',
      timestamp: '2025-09-21T11:05:00Z',
      userId: 'lecturer_045',
      userRole: 'lecturer',
      module: 'results',
      action: 'UPDATE',
      entityType: 'Result',
      entityId: 'result_789',
      description: 'Updated marks from 45 to 55 for CS101',
      changes: {
        marks: { old: 45, new: 55 },
        grade: { old: 'F', new: 'C' }
      },
      ipAddress: '192.168.1.25',
      userAgent: 'Firefox 118 / macOS',
      status: 'success',
      remarks: 'Grade improvement after review'
    },
    {
      logId: '3',
      timestamp: '2025-09-21T09:15:00Z',
      userId: 'unknown_user',
      userRole: 'unknown',
      module: 'auth',
      action: 'FAILED_LOGIN',
      entityType: 'User',
      entityId: null,
      description: 'Failed login attempt for admin@university.lk',
      changes: null,
      ipAddress: '203.94.15.22',
      userAgent: 'Chrome 119 / Linux',
      status: 'failure',
      remarks: 'Multiple failed attempts detected'
    },
    {
      logId: '4',
      timestamp: '2025-09-21T12:15:00Z',
      userId: 'admin_001',
      userRole: 'admin',
      module: 'payment',
      action: 'APPROVE',
      entityType: 'Payment',
      entityId: 'payment_2025_101',
      description: 'Approved semester fee payment of $350',
      changes: {
        status: { old: 'pending', new: 'approved' },
        approvedAt: { old: null, new: '2025-09-21T12:15:00Z' }
      },
      ipAddress: '192.168.1.50',
      userAgent: 'Chrome 119 / Windows 11',
      status: 'success',
      remarks: 'Payment verified and approved'
    },
    {
      logId: '5',
      timestamp: '2025-09-21T08:30:00Z',
      userId: 'system',
      userRole: 'system',
      module: 'attendance',
      action: 'SYNC',
      entityType: 'Attendance',
      entityId: 'batch_sync_001',
      description: 'Bulk attendance sync for morning sessions',
      changes: null,
      ipAddress: '127.0.0.1',
      userAgent: 'System Process',
      status: 'warning',
      remarks: 'Some records could not be synchronized'
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Date range filter (simplified for demo)
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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system_logs_export.json';
    link.click();
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Logs</h1>
          <p className="text-gray-600">Monitor and audit all system activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        </div>

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
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
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
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.logId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userId}</div>
                          <div className="text-sm text-gray-500 capitalize">{log.userRole}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {log.module}
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
                          onClick={() => setExpandedLog(expandedLog === log.logId ? null : log.logId)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          {expandedLog === log.logId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedLog === log.logId && (
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
                                    <span>{log.userAgent}</span>
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
                                    <span className="text-gray-600">ID:</span>
                                    <span className="ml-2">{log.entityId}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {log.remarks && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Remarks</h4>
                                  <p className="text-sm text-gray-600">{log.remarks}</p>
                                </div>
                              )}
                            </div>
                            
                            {log.changes && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Changes</h4>
                                <div className="bg-white p-3 rounded border">
                                  <pre className="text-sm text-gray-600 overflow-x-auto">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
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
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}