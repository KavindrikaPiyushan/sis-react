import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Bell, AlertTriangle, BookOpen, Calendar, DollarSign, Search, Filter, Pin, Eye, Download, X, 
  Bookmark, BookmarkCheck, Clock, Users, CheckCircle, RefreshCw, Loader2, 
  ChevronDown, SortAsc, SortDesc, Paperclip, Info, AlertCircle, Grid3X3, List,
  Image, FileText, Video, Play, ZoomIn, ZoomOut, RotateCw, Maximize2
} from 'lucide-react';
import HeaderBar from '../../components/HeaderBar';
import StudentService from '../../services/studentService';
import { useAuth } from '../../services/AuthContext';
import { showToast } from '../utils/showToast';
import { useNotices } from '../../contexts/NoticesContext';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

// Skeleton loader component
const NoticeCardSkeleton = () => (
  <Card className="p-3 sm:p-4 animate-pulse">
    <div className="flex items-start justify-between mb-2 sm:mb-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
        <div className="w-16 h-5 sm:w-20 sm:h-6 bg-gray-300 rounded-full"></div>
      </div>
      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="w-3/4 h-5 sm:h-6 bg-gray-300 rounded"></div>
      <div className="w-full h-3 sm:h-4 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-3 sm:h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between mt-3 sm:mt-4">
      <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded"></div>
      <div className="w-20 sm:w-24 h-3 sm:h-4 bg-gray-200 rounded"></div>
    </div>
  </Card>
);

export default function StudentNotices() {
  const { user } = useAuth();
  const { markAsRead: notifyMarkAsRead, markAsUnread: notifyMarkAsUnread } = useNotices();
  
  // State management
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  
  // Loading states for operations
  const [loadingStates, setLoadingStates] = useState({
    markingRead: new Set(),
    downloading: false
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    priority: [],
    status: 'published',
    isPinned: null,
    isRead: null,
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // UI state
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  
  // Local state for student-specific features
  const [pinnedNotices, setPinnedNotices] = useState(new Set());
  const [readNotices, setReadNotices] = useState(new Set());
  
  // Refs
  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);

  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Load notices when filters or search changes
  useEffect(() => {
    loadNotices(true);
  }, [debouncedSearch, activeFilters]);
  
  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !pagination.hasNext || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotices();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [pagination.hasNext, loadingMore, loading]);
  
  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
    loadNotices(true);
  }, []);

  // Handle keyboard shortcuts for preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewAttachment) return;

      switch (e.key) {
        case 'Escape':
          closePreview();
          break;
        case '+':
        case '=':
          if (previewType === 'image') {
            e.preventDefault();
            setImageScale(prev => Math.min(3, prev + 0.25));
          }
          break;
        case '-':
          if (previewType === 'image') {
            e.preventDefault();
            setImageScale(prev => Math.max(0.5, prev - 0.25));
          }
          break;
        case 'r':
        case 'R':
          if (previewType === 'image') {
            e.preventDefault();
            setImageRotation(prev => (prev + 90) % 360);
          }
          break;
        default:
          break;
      }
    };

    if (previewAttachment) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewAttachment, previewType]);
  
  // API functions
  const loadNotices = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = {
        page: reset ? 1 : pagination.currentPage + 1,
        limit: 10,
        search: debouncedSearch,
        status: 'published',
        ...activeFilters
      };

      Object.keys(params).forEach(key => {
        if (Array.isArray(params[key]) && params[key].length === 0) {
          delete params[key];
        } else if (params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      const response = await StudentService.getNotices(params);
      
      if (response.success) {
        const newNotices = response.data.notices || [];
        
        if (newNotices.length > 0) {
          console.log('Notice structure:', newNotices[0]);
        }
        
        const serverReadIds = newNotices
          .filter(notice => notice.isRead)
          .map(notice => getNoticeId(notice));
        
        const allReadIds = new Set([...readNotices, ...serverReadIds]);
        setReadNotices(allReadIds);
        localStorage.setItem('student_read_notices', JSON.stringify([...allReadIds]));
        
        const serverPinnedIds = newNotices
          .filter(notice => notice.isPinned)
          .map(notice => getNoticeId(notice));
        
        setPinnedNotices(new Set(serverPinnedIds));
        localStorage.setItem('student_pinned_notices', JSON.stringify(serverPinnedIds));
        
        if (reset) {
          setNotices(newNotices);
        } else {
          setNotices(prev => [...prev, ...newNotices]);
        }
        
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.totalItems || 0,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false
        });

        setStats(response.data.stats || {});
      } else {
        throw new Error(response.message || 'Failed to load notices');
      }
    } catch (error) {
      setError(error.message);
      showToast('error', 'Error', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotices = async () => {
    if (loadingMore || !pagination.hasNext) return;
    await loadNotices(false);
  };

  const loadUserPreferences = () => {
    const savedPinned = JSON.parse(localStorage.getItem('student_pinned_notices') || '[]');
    const savedRead = JSON.parse(localStorage.getItem('student_read_notices') || '[]');
    
    setPinnedNotices(new Set(savedPinned));
    setReadNotices(new Set(savedRead));
  };

  const saveUserPreferences = (type, noticeId, action) => {
    const storageKey = type === 'pin' ? 'student_pinned_notices' : 'student_read_notices';
    const currentSet = type === 'pin' ? pinnedNotices : readNotices;
    const newSet = new Set(currentSet);
    
    if (action === 'add') {
      newSet.add(noticeId);
    } else {
      newSet.delete(noticeId);
    }
    
    localStorage.setItem(storageKey, JSON.stringify([...newSet]));
    
    if (type === 'pin') {
      setPinnedNotices(newSet);
    } else {
      setReadNotices(newSet);
    }
  };

  const handleMarkAsRead = async (noticeId) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        markingRead: new Set([...prev.markingRead, noticeId])
      }));

      const response = await StudentService.markNoticeAsRead(noticeId);
      
      if (response.success) {
        saveUserPreferences('read', noticeId, 'add');
        notifyMarkAsRead();
        showToast('success', 'Success', 'Notice marked as read');
      } else {
        throw new Error(response.message || 'Failed to mark as read');
      }
    } catch (error) {
      showToast('error', 'Error', error.message);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        markingRead: new Set([...prev.markingRead].filter(id => id !== noticeId))
      }));
    }
  };

  const handleMarkAsUnread = async (noticeId) => {
    try {
      setLoadingStates(prev => ({
        ...prev,
        markingRead: new Set([...prev.markingRead, noticeId])
      }));

      const response = await StudentService.markNoticeAsUnread(noticeId);
      
      if (response.success) {
        saveUserPreferences('read', noticeId, 'remove');
        notifyMarkAsUnread();
        showToast('success', 'Success', 'Notice marked as unread');
      } else {
        throw new Error(response.message || 'Failed to mark as unread');
      }
    } catch (error) {
      showToast('error', 'Error', error.message);
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        markingRead: new Set([...prev.markingRead].filter(id => id !== noticeId))
      }));
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      setLoadingStates(prev => ({ ...prev, downloading: true }));
      
      const response = await StudentService.downloadFile(attachment.id || attachment.fileId, attachment.fileName || attachment.name);
      
      if (response.success) {
        showToast('success', 'Success', 'File downloaded successfully');
      } else {
        throw new Error(response.message || 'Failed to download file');
      }
    } catch (error) {
      showToast('error', 'Error', error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, downloading: false }));
    }
  };

  const openNotice = (notice) => {
    setSelectedNotice(notice);
    
    if (!isRead(notice)) {
      handleMarkAsRead(getNoticeId(notice));
    }
  };

  const updateFilter = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      category: [],
      priority: [],
      status: 'published',
      isPinned: null,
      isRead: null,
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  // Helper functions
  const getCategoryIcon = (category) => {
    const icons = {
      general: <Bell className="w-3 h-3 sm:w-4 sm:h-4" />,
      academic: <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />,
      finance: <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />,
      event: <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />,
      emergency: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
    };
    return icons[category] || <Bell className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800 border-gray-200',
      academic: 'bg-purple-100 text-purple-800 border-purple-200',
      finance: 'bg-green-100 text-green-800 border-green-200',
      event: 'bg-orange-100 text-orange-800 border-orange-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop().toLowerCase();
    
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const pdfTypes = ['pdf'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (pdfTypes.includes(extension)) return 'pdf';
    
    return 'other';
  };

  const getFileIcon = (fileName) => {
    const fileType = getFileType(fileName);
    const iconProps = { className: "w-3 h-3 sm:w-4 sm:h-4 text-gray-500" };
    
    switch (fileType) {
      case 'image':
        return <Image {...iconProps} className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
      case 'video':
        return <Video {...iconProps} className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
      case 'pdf':
        return <FileText {...iconProps} className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />;
      default:
        return <Download {...iconProps} />;
    }
  };

  const canPreview = (fileName) => {
    const fileType = getFileType(fileName);
    return ['image', 'video', 'pdf'].includes(fileType);
  };

  const handlePreviewAttachment = async (attachment) => {
    try {
      const fileType = getFileType(attachment.fileName || attachment.name || attachment.originalName);
      
      if (!canPreview(attachment.fileName || attachment.name || attachment.originalName)) {
        showToast('info', 'Info', 'This file type cannot be previewed');
        return;
      }

      const fileUrl = attachment.downloadUrl;
      
      if (!fileUrl) {
        showToast('error', 'Error', 'File URL not available');
        return;
      }

      setPreviewAttachment({
        ...attachment,
        url: fileUrl
      });
      setPreviewType(fileType);
      setImageScale(1);
      setImageRotation(0);
      
    } catch (error) {
      showToast('error', 'Error', error.message);
    }
  };

  const closePreview = () => {
    setPreviewAttachment(null);
    setPreviewType(null);
    setImageScale(1);
    setImageRotation(0);
  };

  const getNoticeId = (notice) => {
    const id = notice.id || notice.noticeId || notice._id || notice.notice_id;
    if (!id) {
      console.warn('Notice ID not found in notice object:', notice);
    }
    return id;
  };

  const isRead = (notice) => {
    return notice.isRead || readNotices.has(getNoticeId(notice));
  };
  
  const isPinned = (notice) => {
    return notice.isPinned || pinnedNotices.has(getNoticeId(notice));
  };

  const getUnreadCount = () => {
    return notices.filter(notice => !isRead(notice)).length;
  };

  const getPinnedCount = () => {
    return notices.filter(notice => isPinned(notice)).length;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.category.length > 0) count++;
    if (activeFilters.priority.length > 0) count++;
    if (activeFilters.isPinned !== null) count++;
    if (activeFilters.isRead !== null) count++;
    if (activeFilters.dateFrom) count++;
    if (activeFilters.dateTo) count++;
    return count;
  };

  // Memoized values
  const categoryOptions = useMemo(() => [
    { value: 'general', label: '📢 General', icon: '📢' },
    { value: 'academic', label: '📚 Academic', icon: '📚' },
    { value: 'finance', label: '💰 Finance', icon: '💰' },
    { value: 'event', label: '🎯 Event', icon: '🎯' },
    { value: 'emergency', label: '🚨 Emergency', icon: '🚨' }
  ], []);

  const priorityOptions = useMemo(() => [
    { value: 'normal', label: '📢 Normal', color: 'blue' },
    { value: 'high', label: '⚠️ High', color: 'yellow' },
    { value: 'critical', label: '🚨 Critical', color: 'red' }
  ], []);

  const sortedNotices = useMemo(() => {
    return [...notices].sort((a, b) => {
      const aPinned = isPinned(a);
      const bPinned = isPinned(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      const priorityOrder = { critical: 3, high: 2, normal: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notices, pinnedNotices]);

  
  return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <HeaderBar 
            title="Special Notices" 
            subtitle="Stay updated with important announcements" 
            Icon={Bell} 
            unread={getUnreadCount()} 
          />
          
          {/* Quick Stats */}
          <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 mb-3 sm:mb-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200 shadow-sm whitespace-nowrap flex-shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Total</span>
              <span className="text-xs sm:text-sm font-bold text-gray-900 bg-white px-1.5 sm:px-2 py-0.5 rounded-full">
                {pagination.totalItems || notices.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200 shadow-sm whitespace-nowrap flex-shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-blue-700">Unread</span>
              <span className="text-xs sm:text-sm font-bold text-blue-900 bg-white px-1.5 sm:px-2 py-0.5 rounded-full">
                {getUnreadCount()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full border border-orange-200 shadow-sm whitespace-nowrap flex-shrink-0">
              <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600" />
              <span className="text-xs sm:text-sm font-medium text-orange-700">Pinned</span>
              <span className="text-xs sm:text-sm font-bold text-orange-900 bg-white px-1.5 sm:px-2 py-0.5 rounded-full">
                {getPinnedCount()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-full border border-red-200 shadow-sm whitespace-nowrap flex-shrink-0">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
              <span className="text-xs sm:text-sm font-medium text-red-700">Critical</span>
              <span className="text-xs sm:text-sm font-bold text-red-900 bg-white px-1.5 sm:px-2 py-0.5 rounded-full">
                {notices.filter(n => n.priority === 'critical').length}
              </span>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-end">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('grid')}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </div>
              </button>
              <button
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('list')}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">List</span>
                </div>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search notices..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border flex items-center gap-1.5 sm:gap-2 ${
                    showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded-full text-xs">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                
                {getActiveFilterCount() > 0 && (
                  <button
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                )}
                
                <button
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 sm:gap-2"
                  onClick={() => loadNotices(true)}
                  disabled={loading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Category</label>
                    <select
                      multiple
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      value={activeFilters.category}
                      onChange={(e) => updateFilter('category', Array.from(e.target.selectedOptions, option => option.value))}
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Priority</label>
                    <select
                      multiple
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      value={activeFilters.priority}
                      onChange={(e) => updateFilter('priority', Array.from(e.target.selectedOptions, option => option.value))}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Read Status */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Read Status</label>
                    <select
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      value={activeFilters.isRead === null ? '' : activeFilters.isRead ? 'read' : 'unread'}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : e.target.value === 'read';
                        updateFilter('isRead', value);
                      }}
                    >
                      <option value="">All</option>
                      <option value="unread">📭 Unread</option>
                      <option value="read">✅ Read</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Date Range</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                        value={activeFilters.dateFrom}
                        onChange={(e) => updateFilter('dateFrom', e.target.value)}
                        placeholder="From"
                      />
                      <input
                        type="date"
                        className="w-full px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                        value={activeFilters.dateTo}
                        onChange={(e) => updateFilter('dateTo', e.target.value)}
                        placeholder="To"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  {/* Pinned Status */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Pinned Status</label>
                    <select
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                      value={activeFilters.isPinned === null ? '' : activeFilters.isPinned ? 'pinned' : 'unpinned'}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : e.target.value === 'pinned';
                        updateFilter('isPinned', value);
                      }}
                    >
                      <option value="">All</option>
                      <option value="pinned">📌 Pinned</option>
                      <option value="unpinned">Unpinned</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Sort By</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                        value={activeFilters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="updatedAt">Updated Date</option>
                        <option value="title">Title</option>
                        <option value="priority">Priority</option>
                      </select>
                      <button
                        className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        onClick={() => updateFilter('sortOrder', activeFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        {activeFilters.sortOrder === 'asc' ? <SortAsc className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <SortDesc className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Loading State */}
        {loading && notices.length === 0 && (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, index) => (
              <NoticeCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Notices</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{error}</p>
            <button
              className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => loadNotices(true)}
            >
              Try Again
            </button>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && sortedNotices.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No notices found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              {getActiveFilterCount() > 0 
                ? "Try adjusting your search or filter criteria" 
                : "No notices available at the moment"
              }
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                className="px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </Card>
        )}

        {/* Notices Grid/List */}
        {!loading && !error && sortedNotices.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'space-y-2'}>
            {sortedNotices.map((notice) => (
              <Card 
                key={getNoticeId(notice)} 
                className={`${viewMode === 'grid' ? 'p-3 sm:p-4' : 'p-2 sm:p-3'} transition-all hover:shadow-lg border-l-4 ${
                  notice.priority === 'critical' ? 'border-l-red-500' :
                  notice.priority === 'high' ? 'border-l-yellow-500' : 'border-l-blue-500'
                } ${!isRead(notice) ? 'bg-blue-50' : ''} ${
                  viewMode === 'list' ? 'hover:bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    {isPinned(notice) && (
                      <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getCategoryColor(notice.category)}`}>
                          {getCategoryIcon(notice.category)}
                          <span className="capitalize">{notice.category}</span>
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                          {getPriorityBadge(notice.priority)}
                        </span>
                        {!isRead(notice) && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full flex-shrink-0" title="Unread"></span>
                        )}
                      </div>
                      <h3 className={`font-semibold text-gray-900 mb-1.5 sm:mb-2 ${
                        viewMode === 'list' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                      } line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors`}
                          onClick={() => openNotice(notice)}>
                        {notice.title}
                      </h3>
                      <p className={`text-gray-600 mb-2 sm:mb-3 cursor-pointer text-xs sm:text-sm ${
                        viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'
                      }`} onClick={() => openNotice(notice)}>
                        {notice.body}
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(notice.createdAt)}
                          </span>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              {notice.attachments.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isRead(notice) ? handleMarkAsUnread(getNoticeId(notice)) : handleMarkAsRead(getNoticeId(notice));
                          }}
                          disabled={loadingStates.markingRead.has(getNoticeId(notice))}
                          className={`p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ${
                            isRead(notice) ? 'text-green-500' : 'text-gray-400'
                          } disabled:opacity-50`}
                          title={isRead(notice) ? 'Mark as unread' : 'Mark as read'}
                        >
                          {loadingStates.markingRead.has(getNoticeId(notice)) ? (
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          ) : isRead(notice) ? (
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Load More Trigger */}
            {pagination.hasNext && (
              <div 
                ref={loadMoreRef}
                className="flex justify-center py-3 sm:py-4"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-16 sm:pt-4">
          <Card className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto mt-2 sm:my-8 mb-4 max-h-[85vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-start flex-wrap gap-1.5 sm:gap-2 flex-1 min-w-0">
                  {isPinned(selectedNotice) && (
                    <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(selectedNotice.priority)} flex-shrink-0`}>
                    {getPriorityBadge(selectedNotice.priority)}
                  </span>
                  {isRead(selectedNotice) && (
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-500 flex-shrink-0 mt-0.5" title="Read" />
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isRead(selectedNotice) ? handleMarkAsUnread(getNoticeId(selectedNotice)) : handleMarkAsRead(getNoticeId(selectedNotice));
                    }}
                    disabled={loadingStates.markingRead.has(getNoticeId(selectedNotice))}
                    className={`p-1 sm:p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      isRead(selectedNotice) ? 'text-green-500' : 'text-gray-400'
                    } disabled:opacity-50`}
                    title={isRead(selectedNotice) ? 'Mark as unread' : 'Mark as read'}
                  >
                    {loadingStates.markingRead.has(getNoticeId(selectedNotice)) ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 animate-spin" />
                    ) : isRead(selectedNotice) ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setSelectedNotice(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-1.5 lg:p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 pr-2 leading-tight">
                {selectedNotice.title}
              </h2>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 flex-wrap">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(selectedNotice.category)}
                  <span className="capitalize">{selectedNotice.category}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {formatDate(selectedNotice.createdAt)}
                </span>
                {selectedNotice.endDate && new Date(selectedNotice.endDate) > new Date() && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    Valid: {new Date(selectedNotice.endDate).toLocaleDateString()}
                  </span>
                )}
                {selectedNotice.audience && selectedNotice.audience.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    {selectedNotice.audience.length} groups
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-4 sm:mb-6">
                <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3 sm:p-4 rounded-md sm:rounded-lg border">
                  {selectedNotice.body}
                </div>
              </div>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Attachments ({selectedNotice.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((attachment, index) => {
                      const fileName = attachment.originalName || attachment.fileName || attachment.name || `Attachment ${index + 1}`;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getFileIcon(fileName)}
                            <div className="min-w-0 flex-1">
                              <span className="text-xs sm:text-sm text-gray-700 font-medium block truncate">
                                {fileName}
                              </span>
                              {attachment.fileSize && (
                                <span className="text-xs text-gray-500">
                                  ({formatFileSize(attachment.fileSize)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {canPreview(fileName) && (
                              <button 
                                onClick={() => handlePreviewAttachment(attachment)}
                                className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">Preview</span>
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownloadAttachment(attachment)}
                              disabled={loadingStates.downloading}
                              className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {loadingStates.downloading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span className="hidden sm:inline">Download</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-3 sm:pt-4 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
                  <span className="truncate">ID: {getNoticeId(selectedNotice)}</span>
                  <span className="truncate">
                    By: {
                      typeof (selectedNotice.postedBy || selectedNotice.author) === 'object' 
                        ? (selectedNotice.postedBy?.name || selectedNotice.author?.name || 'Unknown')
                        : (selectedNotice.postedBy || selectedNotice.author || 'Unknown')
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {previewAttachment && (
        <AttachmentPreviewModal
          open={!!previewAttachment}
          onClose={closePreview}
          attachment={previewAttachment}
          type={previewType}
          imageScale={imageScale}
          setImageScale={setImageScale}
          imageRotation={imageRotation}
          setImageRotation={setImageRotation}
        />
      )}
    </main>
  );
}