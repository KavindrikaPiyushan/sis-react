import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, BookOpen, Calendar, DollarSign, Search, Filter, Pin, Eye, Download, X, Bookmark, BookmarkCheck, Archive, Clock, Users, CheckCircle } from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read, bookmarked
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [studentId] = useState('student_123'); // Mock student ID
  const [bookmarkedNotices, setBookmarkedNotices] = useState(new Set());

  // Mock data - replace with API call
  useEffect(() => {
    const mockNotices = [
      {
        noticeId: "noti_2025_001",
        title: "⚡ Urgent: CS101 Exam Postponed",
        body: "The CS101 midterm scheduled for 25 Sep 2025 is postponed due to weather conditions. New date will be announced within 24 hours. Please check your email for updates.\n\nImportant points to remember:\n• Keep checking your university email\n• No study materials will change\n• New date will be communicated 48 hours in advance\n• Contact academic office for any queries",
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
        readBy: [],
        isRelevantToStudent: true
      },
      {
        noticeId: "noti_2025_002",
        title: "New Library Operating Hours",
        body: "Starting October 1st, the library will extend its operating hours. This change is implemented to provide better access to study resources for all students.\n\nNew Schedule:\n• Monday to Friday: 7:00 AM - 10:00 PM\n• Saturday: 8:00 AM - 6:00 PM\n• Sunday: 10:00 AM - 4:00 PM\n\nPlease note that the silent study area will be available 24/7 with student ID access.",
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
        readBy: ["student_123"],
        isRelevantToStudent: true
      },
      {
        noticeId: "noti_2025_003",
        title: "Fee Payment Deadline Reminder",
        body: "This is a reminder that the semester fee payment deadline is September 30th, 2025. Late payments will incur a penalty of Rs. 5,000.\n\nPayment Methods Available:\n• Online payment through student portal\n• Bank deposit (Account details in attachment)\n• Cash payment at accounts office\n\nOffice Hours: 9:00 AM - 4:00 PM (Monday to Friday)\n\nFor any payment-related queries, please contact the accounts office or email finance@university.edu",
        category: "finance",
        priority: "high",
        audience: ["all_students"],
        startDate: "2025-09-19T00:00:00Z",
        endDate: "2025-09-30T23:59:59Z",
        attachments: ["fee_structure_2025.pdf", "bank_details.pdf"],
        postedBy: "admin_03",
        status: "published",
        createdAt: "2025-09-19T10:00:00Z",
        isPinned: false,
        readBy: [],
        isRelevantToStudent: true
      },
      {
        noticeId: "noti_2025_004",
        title: "Tech Symposium 2025 Registration Open",
        body: "Registration is now open for the Annual Tech Symposium 2025! This is a great opportunity to showcase your projects and learn from industry experts.\n\nEvent Details:\n• Date: October 15-16, 2025\n• Venue: Main Auditorium & Tech Labs\n• Registration Deadline: October 5th, 2025\n\nEarly Bird Benefits:\n• 50% discount on registration fee\n• Free symposium t-shirt\n• Access to exclusive workshops\n\nCategories:\n• Project Presentation\n• Paper Presentation\n• Poster Session\n• Hackathon\n\nRegister now to secure your spot!",
        category: "event",
        priority: "normal",
        audience: ["program_CS", "program_IT"],
        startDate: "2025-09-21T00:00:00Z",
        endDate: "2025-10-05T23:59:59Z",
        attachments: ["symposium_brochure.pdf", "registration_form.pdf"],
        postedBy: "event_coordinator",
        status: "published",
        createdAt: "2025-09-21T07:00:00Z",
        isPinned: false,
        readBy: [],
        isRelevantToStudent: true
      },
      {
        noticeId: "noti_2025_005",
        title: "System Maintenance Schedule",
        body: "The student portal will be under maintenance on September 25th from 2:00 AM to 6:00 AM. During this time, the system will be unavailable.\n\nServices Affected:\n• Student Portal\n• Online Library\n• Email Services\n• LMS Platform\n\nPlease plan accordingly and complete any urgent tasks before the maintenance window.\n\nFor emergency academic queries during this time, contact the IT helpdesk at +94-11-1234567.",
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
        readBy: [],
        isRelevantToStudent: true
      },
      {
        noticeId: "noti_2025_006",
        title: "Career Fair 2025 - Industry Partners",
        body: "We're excited to announce the upcoming Career Fair 2025! Connect with top employers and explore exciting career opportunities.\n\nParticipating Companies:\n• Google Sri Lanka\n• Microsoft\n• WSO2\n• Dialog Axiata\n• John Keells Holdings\n• Virtusa\n• IFS\n• And many more...\n\nWhat to Expect:\n• Job interviews on the spot\n• Internship opportunities\n• Career guidance sessions\n• Networking opportunities\n• Resume review services\n\nDate: October 20th, 2025\nTime: 9:00 AM - 5:00 PM\nVenue: University Grounds\n\nDress Code: Business Formal\nBring: Updated CV (Multiple copies)",
        category: "event",
        priority: "normal",
        audience: ["batch_2023", "batch_2024"],
        startDate: "2025-09-22T00:00:00Z",
        endDate: "2025-10-20T23:59:59Z",
        attachments: ["career_fair_companies.pdf", "cv_guidelines.pdf"],
        postedBy: "career_services",
        status: "published",
        createdAt: "2025-09-22T10:00:00Z",
        isPinned: true,
        readBy: [],
        isRelevantToStudent: true
      }
    ];
    
    setNotices(mockNotices);
    setFilteredNotices(mockNotices);
    
    // Load bookmarked notices from localStorage (in real app, this would be from API)
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNotices') || '[]');
    setBookmarkedNotices(new Set(savedBookmarks));
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

    if (filterStatus === 'unread') {
      filtered = filtered.filter(notice => !isRead(notice));
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(notice => isRead(notice));
    } else if (filterStatus === 'bookmarked') {
      filtered = filtered.filter(notice => bookmarkedNotices.has(notice.noticeId));
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
  }, [notices, searchTerm, filterCategory, filterPriority, filterStatus, bookmarkedNotices]);

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
        ? { ...notice, readBy: [...notice.readBy, studentId] }
        : notice
    ));
  };

  const isRead = (notice) => notice.readBy.includes(studentId);

  const toggleBookmark = (noticeId, event) => {
    event.stopPropagation();
    const newBookmarks = new Set(bookmarkedNotices);
    
    if (newBookmarks.has(noticeId)) {
      newBookmarks.delete(noticeId);
    } else {
      newBookmarks.add(noticeId);
    }
    
    setBookmarkedNotices(newBookmarks);
    localStorage.setItem('bookmarkedNotices', JSON.stringify([...newBookmarks]));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const openNotice = (notice) => {
    setSelectedNotice(notice);
    if (!isRead(notice)) {
      markAsRead(notice.noticeId);
    }
  };

  const getUnreadCount = () => {
    return notices.filter(notice => !isRead(notice)).length;
  };

  const downloadAttachment = (filename) => {
    // Mock download functionality
    alert(`Downloading: ${filename}`);
  };

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-8 h-8 text-blue-600" />
                Notices & Announcements
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with important information
                {getUnreadCount() > 0 && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {getUnreadCount()} unread
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Notices</p>
                  <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{getUnreadCount()}</p>
                </div>
                <Eye className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bookmarked</p>
                  <p className="text-2xl font-bold text-yellow-600">{bookmarkedNotices.size}</p>
                </div>
                <Bookmark className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">
                    {notices.filter(n => n.priority === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
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

              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="unread">📬 Unread</option>
                  <option value="read">✅ Read</option>
                  <option value="bookmarked">⭐ Bookmarked</option>
                </select>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="general">📢 General</option>
                    <option value="academic">📚 Academic</option>
                    <option value="finance">💰 Finance</option>
                    <option value="event">🎯 Events</option>
                    <option value="emergency">🚨 Emergency</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">🚨 Critical</option>
                  <option value="high">⚠️ High</option>
                  <option value="normal">📢 Normal</option>
                </select>
              </div>
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
                            <span className="w-2 h-2 bg-blue-600 rounded-full" title="Unread"></span>
                          )}
                          {isRead(notice) && (
                            <CheckCircle className="w-4 h-4 text-green-500" title="Read" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {notice.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {notice.body}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(notice.createdAt)}
                            </span>
                            {notice.attachments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {notice.attachments.length} file{notice.attachments.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => toggleBookmark(notice.noticeId, e)}
                            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                              bookmarkedNotices.has(notice.noticeId) ? 'text-yellow-500' : 'text-gray-400'
                            }`}
                            title={bookmarkedNotices.has(notice.noticeId) ? 'Remove bookmark' : 'Add bookmark'}
                          >
                            {bookmarkedNotices.has(notice.noticeId) ? 
                              <BookmarkCheck className="w-4 h-4" /> : 
                              <Bookmark className="w-4 h-4" />
                            }
                          </button>
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
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedNotice.priority)}`}>
                      {getPriorityBadge(selectedNotice.priority)}
                    </span>
                    {isRead(selectedNotice) && (
                      <CheckCircle className="w-5 h-5 text-green-500" title="Read" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleBookmark(selectedNotice.noticeId, e)}
                    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      bookmarkedNotices.has(selectedNotice.noticeId) ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={bookmarkedNotices.has(selectedNotice.noticeId) ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {bookmarkedNotices.has(selectedNotice.noticeId) ? 
                      <BookmarkCheck className="w-5 h-5" /> : 
                      <Bookmark className="w-5 h-5" />
                    }
                  </button>
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedNotice.title}
              </h2>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 flex-wrap">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(selectedNotice.category)}
                  <span className="capitalize">{selectedNotice.category}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Posted: {formatDate(selectedNotice.createdAt)}
                </span>
                {selectedNotice.endDate && new Date(selectedNotice.endDate) > new Date() && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Calendar className="w-4 h-4" />
                    Valid until: {new Date(selectedNotice.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNotice.body}
                </div>
              </div>

              {selectedNotice.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Attachments ({selectedNotice.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 font-medium">{attachment}</span>
                        </div>
                        <button 
                          onClick={() => downloadAttachment(attachment)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Notice ID: {selectedNotice.noticeId}</span>
                  <span>Posted by: {selectedNotice.postedBy}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}