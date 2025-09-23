import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, BookOpen, Calendar, DollarSign, Zap, Search, Filter, Pin, Eye, Download, X, Plus, Save, Upload, Trash2, Users, Clock } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userRole] = useState('admin'); // Changed to admin to show create functionality
  
  // Form state for creating notices
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    priority: 'normal',
    audience: [],
    startDate: '',
    endDate: '',
    isPinned: false,
    attachments: []
  });
  
  const [formErrors, setFormErrors] = useState({});

  // Mock data - replace with API call
  useEffect(() => {
    const mockNotices = [
      {
        noticeId: "noti_2025_001",
        title: "⚡ Urgent: CS101 Exam Postponed",
        body: "The CS101 midterm scheduled for 25 Sep 2025 is postponed due to weather conditions. New date will be announced within 24 hours. Please check your email for updates.",
        category: "academic",
        priority: "critical",
        audience: ["batch_2023", "program_CS"],
        startDate: "2025-09-21T09:00:00Z",
        endDate: "2025-09-28T23:59:59Z",
        attachments: ["exam_schedule_update.pdf"],
        postedBy: "admin_01",
        status: "published",
        createdAt: "2025-09-21T08:30:00Z",
        isPinned: true,
        readBy: []
      },
      {
        noticeId: "noti_2025_002",
        title: "New Library Operating Hours",
        body: "Starting October 1st, the library will extend its operating hours. Monday to Friday: 7:00 AM - 10:00 PM, Saturday: 8:00 AM - 6:00 PM, Sunday: 10:00 AM - 4:00 PM.",
        category: "general",
        priority: "normal",
        audience: ["all_students", "lecturers"],
        startDate: "2025-09-20T00:00:00Z",
        endDate: "2025-10-31T23:59:59Z",
        attachments: [],
        postedBy: "admin_02",
        status: "published",
        createdAt: "2025-09-20T14:20:00Z",
        isPinned: false,
        readBy: ["student_123"]
      },
      {
        noticeId: "noti_2025_003",
        title: "Fee Payment Deadline Reminder",
        body: "This is a reminder that the semester fee payment deadline is September 30th, 2025. Late payments will incur a penalty of Rs. 5,000. Visit the accounts office for queries.",
        category: "finance",
        priority: "high",
        audience: ["all_students"],
        startDate: "2025-09-19T00:00:00Z",
        endDate: "2025-09-30T23:59:59Z",
        attachments: ["fee_structure_2025.pdf"],
        postedBy: "admin_03",
        status: "published",
        createdAt: "2025-09-19T10:00:00Z",
        isPinned: false,
        readBy: []
      },
      {
        noticeId: "noti_2025_004",
        title: "Tech Symposium 2025 Registration Open",
        body: "Registration is now open for the Annual Tech Symposium 2025. Date: October 15-16, 2025. Register before October 5th to get early bird discount. Limited seats available.",
        category: "event",
        priority: "normal",
        audience: ["program_CS", "program_IT"],
        startDate: "2025-09-21T00:00:00Z",
        endDate: "2025-10-05T23:59:59Z",
        attachments: ["symposium_brochure.pdf"],
        postedBy: "event_coordinator",
        status: "published",
        createdAt: "2025-09-21T07:00:00Z",
        isPinned: false,
        readBy: []
      },
      {
        noticeId: "noti_2025_005",
        title: "System Maintenance Schedule",
        body: "The student portal will be under maintenance on September 25th from 2:00 AM to 6:00 AM. During this time, the system will be unavailable. Please plan accordingly.",
        category: "general",
        priority: "high",
        audience: ["all_students", "lecturers", "admins"],
        startDate: "2025-09-21T00:00:00Z",
        endDate: "2025-09-25T23:59:59Z",
        attachments: [],
        postedBy: "it_admin",
        status: "published",
        createdAt: "2025-09-21T06:00:00Z",
        isPinned: false,
        readBy: []
      }
    ];
    
    setNotices(mockNotices);
    setFilteredNotices(mockNotices);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = notices;

    if (searchTerm) {
      filtered = filtered.filter(notice => 
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(notice => notice.category === filterCategory);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(notice => notice.priority === filterPriority);
    }

    // Sort: pinned first, then by priority, then by date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      const priorityOrder = { critical: 3, high: 2, normal: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredNotices(filtered);
  }, [notices, searchTerm, filterCategory, filterPriority]);

  const getCategoryIcon = (category) => {
    const icons = {
      general: <Bell className="w-4 h-4" />,
      academic: <BookOpen className="w-4 h-4" />,
      finance: <DollarSign className="w-4 h-4" />,
      event: <Calendar className="w-4 h-4" />,
      emergency: <AlertTriangle className="w-4 h-4" />
    };
    return icons[category] || <Bell className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[priority];
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: '🚨 CRITICAL',
      high: '⚠️ HIGH',
      normal: '📢 NORMAL'
    };
    return badges[priority];
  };

  const markAsRead = (noticeId) => {
    setNotices(prev => prev.map(notice => 
      notice.noticeId === noticeId 
        ? { ...notice, readBy: [...notice.readBy, 'current_user'] }
        : notice
    ));
  };

  const isRead = (notice) => notice.readBy.includes('current_user');

  // Available audience options
  const audienceOptions = [
    { value: 'all_students', label: '👥 All Students' },
    { value: 'lecturers', label: '👨‍🏫 All Lecturers' },
    { value: 'admins', label: '⚙️ All Admins' },
    { value: 'batch_2023', label: '🎓 Batch 2023' },
    { value: 'batch_2024', label: '🎓 Batch 2024' },
    { value: 'batch_2025', label: '🎓 Batch 2025' },
    { value: 'program_CS', label: '💻 Computer Science' },
    { value: 'program_IT', label: '🖥️ Information Technology' },
    { value: 'program_BA', label: '📊 Business Administration' },
    { value: 'semester_1', label: '📚 Semester 1' },
    { value: 'semester_2', label: '📚 Semester 2' },
    { value: 'semester_3', label: '📚 Semester 3' },
    { value: 'semester_4', label: '📚 Semester 4' }
  ];

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      category: 'general',
      priority: 'normal',
      audience: [],
      startDate: '',
      endDate: '',
      isPinned: false,
      attachments: []
    });
    setFormErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.body.trim()) {
      errors.body = 'Notice content is required';
    } else if (formData.body.length < 10) {
      errors.body = 'Notice content must be at least 10 characters';
    }
    
    if (formData.audience.length === 0) {
      errors.audience = 'Please select at least one audience';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }
    
    const newNotice = {
      noticeId: `noti_2025_${String(notices.length + 1).padStart(3, '0')}`,
      title: formData.title,
      body: formData.body,
      category: formData.category,
      priority: formData.priority,
      audience: formData.audience,
      startDate: formData.startDate + 'T00:00:00Z',
      endDate: formData.endDate ? formData.endDate + 'T23:59:59Z' : null,
      attachments: formData.attachments,
      postedBy: 'current_admin',
      status: isDraft ? 'draft' : 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: formData.isPinned,
      readBy: []
    };
    
    setNotices(prev => [newNotice, ...prev]);
    setShowCreateForm(false);
    resetForm();
    
    // Show success message (in real app, this would be a toast notification)
    alert(`Notice ${isDraft ? 'saved as draft' : 'published'} successfully!`);
  };

  // Handle audience selection
  const toggleAudience = (audienceValue) => {
    setFormData(prev => ({
      ...prev,
      audience: prev.audience.includes(audienceValue)
        ? prev.audience.filter(a => a !== audienceValue)
        : [...prev.audience, audienceValue]
    }));
  };

  // Handle file upload (mock implementation)
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const fileNames = files.map(file => file.name);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileNames]
    }));
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openNotice = (notice) => {
    setSelectedNotice(notice);
    if (!isRead(notice)) {
      markAsRead(notice.noticeId);
    }
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
               
                Special Notices
              </h1>
              <p className="text-gray-600 mt-1">Stay updated with important announcements</p>
            </div>
            {userRole === 'admin' && (
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4" />
                Create Notice
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="finance">Finance</option>
                  <option value="event">Events</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Priority Filter */}
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Notices Grid */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notices found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </Card>
          ) : (
            filteredNotices.map((notice) => (
              <Card 
                key={notice.noticeId} 
                className={`p-4 cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                  notice.priority === 'critical' ? 'border-l-red-500' :
                  notice.priority === 'high' ? 'border-l-yellow-500' : 'border-l-blue-500'
                } ${!isRead(notice) ? 'bg-blue-50' : ''}`}
                onClick={() => openNotice(notice)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {notice.isPinned && (
                        <Pin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(notice.category)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                            {getPriorityBadge(notice.priority)}
                          </span>
                          {!isRead(notice) && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {notice.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {notice.body}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Posted: {formatDate(notice.createdAt)}</span>
                          {notice.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Notice Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Special Notice</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter notice title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Category and Priority Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="general">📢 General</option>
                      <option value="academic">📚 Academic</option>
                      <option value="finance">💰 Finance</option>
                      <option value="event">🎯 Event</option>
                      <option value="emergency">🚨 Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="normal">📢 Normal</option>
                      <option value="high">⚠️ High</option>
                      <option value="critical">🚨 Critical</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                      />
                      <span className="text-sm font-medium text-gray-700">📌 Pin to top</span>
                    </label>
                  </div>
                </div>

                {/* Notice Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Content *
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      formErrors.body ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="6"
                    placeholder="Enter the full notice content..."
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  />
                  {formErrors.body && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.body}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.body.length}/1000 characters
                  </p>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <div className={`border rounded-lg p-4 ${
                    formErrors.audience ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {audienceOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={formData.audience.includes(option.value)}
                            onChange={() => toggleAudience(option.value)}
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.audience && (
                      <p className="text-red-500 text-sm mt-2">{formErrors.audience}</p>
                    )}
                    {formData.audience.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-2">Selected audiences:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.audience.map((aud) => {
                            const option = audienceOptions.find(opt => opt.value === aud);
                            return (
                              <span key={aud} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {option?.label || aud}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    {formErrors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload files or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 5MB each)</p>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Choose Files
                      </label>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{file}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Publish Notice
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedNotice.isPinned && (
                    <Pin className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedNotice.priority)}`}>
                      {getPriorityBadge(selectedNotice.priority)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedNotice.title}
              </h2>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(selectedNotice.category)}
                  <span className="capitalize">{selectedNotice.category}</span>
                </div>
                <span>Posted: {formatDate(selectedNotice.createdAt)}</span>
                {selectedNotice.endDate && (
                  <span>Expires: {formatDate(selectedNotice.endDate)}</span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.body}
                </p>
              </div>

              {selectedNotice.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Download className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment}</span>
                        <button className="ml-auto text-blue-600 hover:text-blue-700 text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}