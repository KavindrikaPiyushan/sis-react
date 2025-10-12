import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AttachmentPreviewModal from '../../components/AttachmentPreviewModal';
// --- Attachment Preview Modal helpers (shared with student notices) ---
const getFileType = (fileName) => {
  if (!fileName) return '';
  const ext = fileName.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["txt"].includes(ext)) return "text";
  if (["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv", "mkv"].includes(ext)) return "video";
  return "other";
};

const canPreview = (fileName) => {
  const type = getFileType(fileName);
  return ["image", "pdf", "text"].includes(type);
};
import { 
  Bell, AlertTriangle, BookOpen, Calendar, DollarSign, Zap, Search, Filter, Pin, Eye, Download, X, Plus, Save, Upload, Trash2, Users, Clock,
  Edit, RefreshCw, MoreVertical, ChevronDown, CheckSquare, Square, SortAsc, SortDesc, FileText, Image, Paperclip,
  AlertCircle, CheckCircle, Info, Loader2, ArrowDown, ArrowUp, Tag, User, Calendar as CalendarIcon
} from 'lucide-react';
import noticesService from '../../services/admin/noticesService';
import { useAuth } from '../../services/AuthContext';
import { showToast } from '../utils/showToast';
import ConfirmDialog from '../utils/ConfirmDialog';
import { useNotices } from '../../contexts/NoticesContext';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

// Skeleton loader component
const NoticeCardSkeleton = () => (
  <Card className="p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-300 rounded"></div>
        <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
      </div>
      <div className="w-6 h-6 bg-gray-300 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between mt-4">
      <div className="w-32 h-4 bg-gray-200 rounded"></div>
      <div className="w-24 h-4 bg-gray-200 rounded"></div>
    </div>
  </Card>
);

// Error boundary component
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Error boundary caught:', event.error);
      setHasError(true);
      setError(event.error);
    };
    
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return fallback || (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-2">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <p className="text-sm text-gray-500 mb-4">Please refresh the page and try again.</p>
        <div className="space-x-3">
          <button 
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};


export default function Notices() {
  // --- CONTEXT (no auth check) ---
  const { user } = useAuth();
  const { notifyMarkAsRead, notifyMarkAsUnread } = useNotices();

  // --- ALL HOOKS BELOW THIS POINT (SAFE) ---
  // Attachment preview modal state
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  // State management
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [stats, setStats] = useState({});
  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    creating: false,
    updating: false,
    deleting: false,
    bulkAction: false,
    uploading: false,
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: [],
    priority: [],
    status: ['published'],
    audience: [],
    tags: [],
    isPinned: null,
    isRead: null,
    dateFrom: '',
    dateTo: '',
    author: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Open preview modal for attachment
  const handlePreviewAttachment = (attachment) => {
    if (!attachment) return;
    const type = getFileType(attachment.originalName || attachment.fileName || attachment.name);
    setPreviewAttachment(attachment);
    setPreviewType(type);
    setImageScale(1);
    setImageRotation(0);
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewAttachment(null);
    setPreviewType(null);
    setImageScale(1);
    setImageRotation(0);
  };



  // (No auth debug or early returns)
  
  // UI state
  const [selectedNotices, setSelectedNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    priority: 'normal',
    audience: [],
    tags: [],
    startDate: '',
    endDate: '',
    isPinned: false,
    status: 'published',
    attachments: [],
    attachmentIds: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs
  const searchInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  
  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Load metadata on mount
  useEffect(() => {
    loadMetadata();
    loadStats();
  }, []);
  
  // Load notices when filters or search changes
  useEffect(() => {
    loadNotices(true);
  }, [debouncedSearch, activeFilters]);
  
  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNext && !loadingMore && !loading) {
          loadMoreNotices();
        }
      },
      { threshold: 0.1 }
    );
    
    if (scrollTriggerRef.current) {
      observer.observe(scrollTriggerRef.current);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pagination.hasNext, loadingMore, loading]);
  
  // Load search suggestions
  useEffect(() => {
    if (searchTerm.length > 2) {
      loadSearchSuggestions(searchTerm);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm]);
  
  // API functions
  const loadMetadata = async () => {
    try {
      const response = await noticesService.getMetadata();
      // The service returns unwrapped data, check if we have metadata
      if (response && typeof response === 'object') {
        setMetadata(response);
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await noticesService.getStats();
      // The service returns unwrapped data, check if we have stats
      if (response && typeof response === 'object') {
        setStats(response);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  const loadNotices = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }
      
      const params = {
        page: reset ? 1 : pagination.currentPage + 1,
        limit: 10,
        search: debouncedSearch,
        ...activeFilters
      };
      
      console.log('🔍 Loading notices with params:', params);
      
      const response = await noticesService.getNotices(params);
      
      console.log('📄 Notices response:', response);
      
      // The service returns the unwrapped response.data, so check for notices and pagination directly
      if (response && (response.notices || Array.isArray(response.data))) {
        const noticesData = response.notices || response.data || [];
        const paginationData = response.pagination || response.meta || {};
        
        if (reset) {
          setNotices(noticesData);
          setPagination({
            currentPage: 1,
            totalPages: paginationData.totalPages || 1,
            totalItems: paginationData.totalItems || noticesData.length,
            hasNext: paginationData.hasNext || false,
            hasPrev: false
          });
          console.log('🔄 Reset notices to:', noticesData);
        } else {
          setNotices(prev => [...prev, ...noticesData]);
          setPagination(prev => ({
            ...prev,
            currentPage: paginationData.currentPage || prev.currentPage + 1,
            totalPages: paginationData.totalPages || prev.totalPages,
            totalItems: paginationData.totalItems || prev.totalItems,
            hasNext: paginationData.hasNext || false,
            hasPrev: paginationData.hasPrev || true
          }));
          console.log('➕ Added notices:', noticesData);
        }
      } else {
        console.error('❌ Failed to load notices - unexpected response structure:', response);
        setError('Failed to load notices');
      }
    } catch (error) {
      console.error('💥 Load notices error:', error);
      setError(error.message);
      showNotificationToast('error', 'Error', error.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreNotices = async () => {
    if (loadingMore || !pagination.hasNext) return;
    
    setLoadingMore(true);
    try {
      const params = {
        page: pagination.currentPage + 1,
        limit: 10,
        search: debouncedSearch,
        ...activeFilters
      };
      
      const response = await noticesService.getNotices(params);
      
      // The service returns the unwrapped response.data, so check for notices and pagination directly
      if (response && (response.notices || Array.isArray(response.data))) {
        const noticesData = response.notices || response.data || [];
        const paginationData = response.pagination || response.meta || {};
        
        setNotices(prev => [...prev, ...noticesData]);
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.currentPage || prev.currentPage + 1,
          totalPages: paginationData.totalPages || prev.totalPages,
          totalItems: paginationData.totalItems || prev.totalItems,
          hasNext: paginationData.hasNext || false,
          hasPrev: paginationData.hasPrev || true
        }));
      }
    } catch (error) {
      showNotificationToast('error', 'Error', error.message || 'Failed to load more notices');
    } finally {
      setLoadingMore(false);
    }
  };
  
  const loadSearchSuggestions = async (query) => {
    try {
      const response = await noticesService.getSearchSuggestions(query);
      // The service returns the unwrapped response.data, so check for suggestions directly
      if (response && (response.suggestions || Array.isArray(response))) {
        setSearchSuggestions(response.suggestions || response || []);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };
  
  // CRUD operations
  const handleCreateNotice = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, creating: !editingNotice, updating: !!editingNotice }));
      const noticeData = {
        ...formData,
        status: isDraft ? 'draft' : 'published'
      };
      
      console.log('🚀 Creating/updating notice with data:', noticeData);
      
      let response;
      if (editingNotice) {
        // Update existing notice
        response = await noticesService.updateNotice(editingNotice.id, noticeData);
      } else {
        // Create new notice
        response = await noticesService.createNotice(noticeData);
      }
      
      console.log('✅ Raw notice response:', response);
      
      // The service returns response.data directly, so check for notice in response
      const isSuccess = response && (response.notice || response.data?.notice || response.id);
      const noticeData_result = response?.notice || response?.data?.notice || response;
      
      console.log('🔍 Computed success:', isSuccess);
      console.log('🔍 Computed notice data:', noticeData_result);
      
      if (isSuccess) {
        console.log('✅ Notice operation successful!');
        const action = editingNotice ? 'updated' : (isDraft ? 'saved as draft' : 'published');
        showNotificationToast('success', 'Success', `Notice ${action} successfully!`);
        setShowCreateForm(false);
        setEditingNotice(null);
        resetForm();
        loadNotices(true);
        loadStats();
      } else {
        console.error('❌ Notice operation failed:', response);
        showNotificationToast('error', 'Error', response?.message || `Failed to ${editingNotice ? 'update' : 'create'} notice`);
      }
    } catch (error) {
      console.error('💥 Notice operation error:', error);
      showNotificationToast('error', 'Error', error.message || `Failed to ${editingNotice ? 'update' : 'create'} notice`);
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false, updating: false }));
    }
  };
  
  const handleUpdateNotice = async (id, updates) => {
    try {
      const response = await noticesService.updateNotice(id, updates);
      
      // Check if we have a valid response - update usually returns the updated notice
      if (response && (response.notice || response.data?.notice || response.id)) {
        showNotificationToast('success', 'Success', 'Notice updated successfully!');
        setNotices(prev => prev.map(notice => 
          notice.id === id ? { ...notice, ...updates } : notice
        ));
        setEditingNotice(null);
        setShowCreateForm(false);
        loadStats();
      } else {
        showNotificationToast('error', 'Error', response?.message || 'Failed to update notice');
      }
    } catch (error) {
      showNotificationToast('error', 'Error', error.message || 'Failed to update notice');
    }
  };
  
  const handleDeleteNotice = async (id) => {
    showConfirmDialog(
      'Delete Notice',
      'Are you sure you want to delete this notice? This action cannot be undone.',
      async () => {
        try {
          setLoadingStates(prev => ({ ...prev, deleting: true }));
          console.log('🗑️ Attempting to delete notice:', id);
          const response = await noticesService.deleteNotice(id);
          console.log('🗑️ Delete response:', response);
          
          // For delete operations, check for success or truthy response
          const isSuccess = response && (response.success === true || response.success !== false);
          console.log('🗑️ Computed success:', isSuccess);
          
          if (isSuccess) {
            console.log('✅ Delete successful!');
            showNotificationToast('success', 'Success', 'Notice deleted successfully!');
            setNotices(prev => prev.filter(notice => notice.id !== id));
            setSelectedNotice(null);
            loadStats();
          } else {
            console.error('❌ Delete failed:', response);
            showNotificationToast('error', 'Error', response?.message || 'Failed to delete notice');
          }
        } catch (error) {
          console.error('💥 Delete error:', error);
          showNotificationToast('error', 'Error', error.message || 'Failed to delete notice');
        } finally {
          setLoadingStates(prev => ({ ...prev, deleting: false }));
        }
      }
    );
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      const response = await noticesService.markAsRead(id);
      
      // Check if we have a valid response
      if (response !== null && response !== undefined) {
        setNotices(prev => prev.map(notice => 
          notice.id === id ? { ...notice, isRead: true } : notice
        ));
        // Notify the context about the read action
        notifyMarkAsRead();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  // Bulk operations
  const handleBulkAction = async (action) => {
    if (selectedNotices.length === 0) {
      showNotificationToast('error', 'Warning', 'Please select notices first');
      return;
    }

    const actionLabels = {
      'markRead': 'mark as read',
      'markUnread': 'mark as unread',
      'pin': 'pin',
      'unpin': 'unpin',
      'archive': 'archive',
      'delete': 'delete',
      'publish': 'publish',
      'draft': 'move to draft'
    };

    const actionLabel = actionLabels[action] || action;
    const noticeCount = selectedNotices.length;

    // Show confirmation for destructive actions
    if (['delete', 'archive'].includes(action)) {
      showConfirmDialog(
        `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Notices`,
        `Are you sure you want to ${actionLabel} ${noticeCount} selected notice${noticeCount > 1 ? 's' : ''}? ${action === 'delete' ? 'This action cannot be undone.' : ''}`,
        async () => {
          await executeBulkAction(action);
        }
      );
      return;
    }

    // Execute other actions directly
    await executeBulkAction(action);
  };

  const executeBulkAction = async (action) => {
    try {
      setLoadingStates(prev => ({ ...prev, bulkAction: true }));
      const response = await noticesService.bulkActions(action, selectedNotices);
      
      console.log('🔄 Bulk action response:', response);
      
      // Check if we have a valid response for bulk operations
      // The API returns: {"success":true,"message":"X notices pinned successfully","affectedCount":X}
      const isSuccess = response && (
        response.success === true || 
        response.updated || 
        response.affected || 
        response.affectedCount ||
        response.data?.success === true ||
        response.data?.updated ||
        response.data?.affected ||
        response.data?.affectedCount
      );
      
      console.log('🔄 Computed success:', isSuccess);
      
      if (isSuccess) {
        const updatedCount = response?.affectedCount || 
                            response?.updated || 
                            response?.affected || 
                            response?.data?.affectedCount ||
                            response?.data?.updated || 
                            response?.data?.affected || 
                            selectedNotices.length;
        
        const message = response?.message || 
                       response?.data?.message || 
                       `Bulk ${action} completed successfully! ${updatedCount} notice(s) ${action}ed.`;
        
        showNotificationToast('success', 'Success', message);
        setSelectedNotices([]);
        loadNotices(true);
        loadStats();
      } else {
        console.error('❌ Bulk action failed:', response);
        showNotificationToast('error', 'Error', response?.message || response?.data?.message || `Failed to ${action} notices`);
      }
    } catch (error) {
      console.error('💥 Bulk action error:', error);
      showNotificationToast('error', 'Error', error.message || `Failed to ${action} notices`);
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkAction: false }));
    }
  };
  
  // File upload
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    // Validate file types and sizes
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        showNotificationToast('error', 'Invalid File Type', `File "${file.name}" is not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.`);
        return;
      }
      if (file.size > maxSize) {
        showNotificationToast('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, uploading: true }));
      setUploadProgress(0);
      
      console.log('🔍 Starting file upload...', Array.from(files).map(f => f.name));
      const response = await noticesService.uploadFiles(Array.from(files));
      console.log('🔍 Raw upload response:', response);
      
      // The service returns response.data directly, so check for uploads in various possible locations
      const isSuccess = response && (
        response.uploads || 
        response.data?.uploads || 
        response.files ||
        response.data?.files ||
        Array.isArray(response.data) ||
        Array.isArray(response)
      );
      
      const uploads = response?.uploads || 
                     response?.data?.uploads || 
                     response?.files || 
                     response?.data?.files ||
                     (Array.isArray(response.data) ? response.data : null) ||
                     (Array.isArray(response) ? response : null) ||
                     [];
      
      console.log('🔍 Computed success:', isSuccess);
      console.log('🔍 Computed uploads:', uploads);
      
      if (isSuccess && Array.isArray(uploads) && uploads.length > 0) {
        console.log('✅ Upload successful, processing files:', uploads);
        
        const newAttachments = uploads.map(upload => ({
          id: upload.id || upload.fileId || upload._id,
          fileName: upload.fileName || upload.filename || upload.name,
          originalName: upload.originalName || upload.originalname || upload.fileName || upload.name,
          fileSize: upload.fileSize || upload.size,
          mimeType: upload.mimeType || upload.mimetype || upload.type,
          url: upload.url || upload.path || upload.downloadUrl
        }));
        
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments],
          attachmentIds: [...prev.attachmentIds, ...newAttachments.map(a => a.id)]
        }));
        
        showNotificationToast('success', 'Success', `${files.length} file(s) uploaded successfully!`);
      } else {
        console.error('❌ Upload failed - conditions not met:', {
          isSuccess,
          uploadsLength: Array.isArray(uploads) ? uploads.length : 0,
          response
        });
        showNotificationToast('error', 'Upload Failed', response?.message || 'Failed to upload files');
      }
    } catch (error) {
      console.error('💥 File upload error:', error);
      const errorMessage = error.message || error.toString() || 'Failed to upload files';
      showNotificationToast('error', 'Upload Error', errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, uploading: false }));
      setUploadProgress(0);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // File download function
  const handleDownloadFile = async (attachment) => {
    console.log('⬇️ Downloading file:', attachment);
    try {
      setLoadingStates(prev => ({ ...prev, downloading: true }));
      await noticesService.downloadFile(attachment.id, attachment.originalName);
      showNotificationToast('success', 'Download Started', `Downloading ${attachment.originalName}`);
    } catch (error) {
      console.error('Download error:', error);
      showNotificationToast('error', 'Download Failed', error.message || 'Failed to download file');
    } finally {
      setLoadingStates(prev => ({ ...prev, downloading: false }));
    }
  };

  // Check if file is an image
  const isImageFile = (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  };

  // Generate preview URL for images
  const getPreviewUrl = (attachment) => {
    if (attachment.downloadUrl) {
      return attachment.downloadUrl;
    }
    // Fallback to API endpoint if URL not provided
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/files/${attachment.id}/preview`;
  };

  // Utility functions
  const showNotificationToast = (type, title, message) => {
    showToast(type, title, message);
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      message: '',
      onConfirm: null
    });
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      category: 'general',
      priority: 'normal',
      audience: [],
      tags: [],
      startDate: '',
      endDate: '',
      isPinned: false,
      status: 'published',
      attachments: [],
      attachmentIds: []
    });
    setFormErrors({});
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Body validation
    if (!formData.body?.trim()) {
      errors.body = 'Notice content is required';
    } else if (formData.body.trim().length < 10) {
      errors.body = 'Notice content must be at least 10 characters';
    } else if (formData.body.length > 1000) {
      errors.body = 'Notice content must be less than 1000 characters';
    }
    
    // Audience validation
    if (!formData.audience || formData.audience.length === 0) {
      errors.audience = 'Please select at least one audience';
    }
    
    // Date validation
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (formData.endDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    // Priority validation
    if (!formData.priority) {
      errors.priority = 'Please select a priority level';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const openNotice = (notice) => {
    setSelectedNotice(notice);
    if (!notice.isRead) {
      handleMarkAsRead(notice.id);
    }
  };
  
  const startEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      body: notice.body,
      category: notice.category,
      priority: notice.priority,
      audience: notice.audience,
      tags: notice.tags || [],
      startDate: notice.startDate ? notice.startDate.split('T')[0] : '',
      endDate: notice.endDate ? notice.endDate.split('T')[0] : '',
      isPinned: notice.isPinned,
      status: notice.status,
      attachments: notice.attachments || [],
      attachmentIds: notice.attachments?.map(a => a.id) || []
    });
    setShowCreateForm(true);
  };
  
  const toggleNoticeSelection = (noticeId) => {
    setSelectedNotices(prev => 
      prev.includes(noticeId) 
        ? prev.filter(id => id !== noticeId)
        : [...prev, noticeId]
    );
  };
  
  const selectAllNotices = () => {
    if (selectedNotices.length === notices.length) {
      setSelectedNotices([]);
    } else {
      setSelectedNotices(notices.map(notice => notice.id));
    }
  };
  
  // Filter functions
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
      status: ['published'],
      audience: [],
      tags: [],
      isPinned: null,
      isRead: null,
      dateFrom: '',
      dateTo: '',
      author: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };
  
  // Helper function to determine available bulk actions based on selected notices
  const getAvailableBulkActions = () => {
    if (selectedNotices.length === 0) return [];
    
    const selectedNoticeObjects = notices.filter(notice => selectedNotices.includes(notice.id));
    
    const actions = [];
    
    // Read/Unread actions
    const hasUnreadNotices = selectedNoticeObjects.some(notice => !notice.isRead);
    const hasReadNotices = selectedNoticeObjects.some(notice => notice.isRead);
    
    if (hasUnreadNotices) {
      actions.push({ key: 'markRead', label: 'Mark as Read', icon: '✓' });
    }
    if (hasReadNotices) {
      actions.push({ key: 'markUnread', label: 'Mark as Unread', icon: '○' });
    }
    
    // Pin/Unpin actions
    const hasUnpinnedNotices = selectedNoticeObjects.some(notice => !notice.isPinned);
    const hasPinnedNotices = selectedNoticeObjects.some(notice => notice.isPinned);
    
    if (hasUnpinnedNotices) {
      actions.push({ key: 'pin', label: 'Pin', icon: '📌' });
    }
    if (hasPinnedNotices) {
      actions.push({ key: 'unpin', label: 'Unpin', icon: '📌' });
    }
    
    // Archive actions (only for non-archived notices)
    const hasActiveNotices = selectedNoticeObjects.some(notice => notice.status !== 'archived');
    
    if (hasActiveNotices) {
      actions.push({ key: 'archive', label: 'Archive', icon: '📦' });
    }
    
    // Publish/Draft actions
    const hasDraftNotices = selectedNoticeObjects.some(notice => notice.status === 'draft');
    const hasPublishedNotices = selectedNoticeObjects.some(notice => notice.status === 'published');
    const hasArchivedNotices = selectedNoticeObjects.some(notice => notice.status === 'archived');
    
    if (hasDraftNotices) {
      actions.push({ key: 'publish', label: 'Publish', icon: '✅' });
    }
    if (hasPublishedNotices || hasArchivedNotices) {
      actions.push({ key: 'draft', label: 'Move to Draft', icon: '📝' });
    }
    if (hasArchivedNotices) {
      actions.push({ key: 'publish', label: 'Publish', icon: '✅' });
    }
    
    // Delete action (always available)
    actions.push({ key: 'delete', label: 'Delete', icon: '🗑️', destructive: true });
    
    return actions;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.category.length > 0) count++;
    if (activeFilters.priority.length > 0) count++;
    if (activeFilters.status.length > 1 || !activeFilters.status.includes('published')) count++;
    if (activeFilters.audience.length > 0) count++;
    if (activeFilters.tags.length > 0) count++;
    if (activeFilters.isPinned !== null) count++;
    if (activeFilters.isRead !== null) count++;
    if (activeFilters.dateFrom || activeFilters.dateTo) count++;
    if (activeFilters.author) count++;
    if (debouncedSearch) count++;
    return count;
  };

  // Helper functions
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

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      academic: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><Image className="w-4 h-4" /></div>;
    }
    if (mimeType?.includes('pdf')) {
      return <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4" /></div>;
    }
    if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4" /></div>;
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
      return <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4" /></div>;
    }
    if (mimeType?.includes('zip') || mimeType?.includes('archive')) {
      return <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center"><Paperclip className="w-4 h-4" /></div>;
    }
    return <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center"><Paperclip className="w-4 h-4" /></div>;
  };

  // Memoized values
  const audienceOptions = useMemo(() => [
    { value: 'all', label: '👥 All Users' },
    { value: 'students', label: '🎓 Students' },
    { value: 'admins', label: '👨‍🏫 Lecturers' },
  ], []);

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

  const statusOptions = useMemo(() => [
    { value: 'published', label: '✅ Published' },
    { value: 'draft', label: '📝 Draft' },
    { value: 'archived', label: '📦 Archived' }
  ], []);

  return (
    <ErrorBoundary>
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="p-6">
          {/* Confirm Dialog */}
          <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => {
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
              hideConfirmDialog();
            }}
            onCancel={hideConfirmDialog}
          />

          {/* Header */}
          <div className="mb-6">

            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-blue-600" />
                  Special Notices
                  {stats.unread > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                      {stats.unread} unread
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">Stay updated with important announcements</p>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200 shadow-sm">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className="text-sm font-bold text-gray-900 bg-white px-2 py-0.5 rounded-full">
                      {stats.total || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full border border-green-200 shadow-sm">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Published</span>
                    <span className="text-sm font-bold text-green-900 bg-white px-2 py-0.5 rounded-full">
                      {stats.published || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-full border border-yellow-200 shadow-sm">
                    <Edit className="w-3 h-3 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Drafts</span>
                    <span className="text-sm font-bold text-yellow-900 bg-white px-2 py-0.5 rounded-full">
                      {stats.draft || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-full border border-red-200 shadow-sm">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Critical</span>
                    <span className="text-sm font-bold text-red-900 bg-white px-2 py-0.5 rounded-full">
                      {stats.critical || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                        <div className="bg-current w-1 h-1 rounded-sm"></div>
                        <div className="bg-current w-1 h-1 rounded-sm"></div>
                        <div className="bg-current w-1 h-1 rounded-sm"></div>
                        <div className="bg-current w-1 h-1 rounded-sm"></div>
                      </div>
                      Grid
                    </div>
                  </button>
                  <button
                    className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5 w-3 h-3">
                        <div className="bg-current w-full h-0.5 rounded-sm"></div>
                        <div className="bg-current w-full h-0.5 rounded-sm"></div>
                        <div className="bg-current w-full h-0.5 rounded-sm"></div>
                      </div>
                      List
                    </div>
                  </button>
                </div>
                
                {/* Create Notice Button */}
                {/* Temporarily always show button for testing */}
                {true && (
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                      console.log('Create Notice button clicked!');
                      setEditingNotice(null);
                      resetForm();
                      setShowCreateForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Notice
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters Bar */}
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search with Suggestions */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notices..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => {
                            setSearchTerm(suggestion.value);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="text-sm text-gray-500 capitalize">{suggestion.type}:</span>
                          <span>{suggestion.value}</span>
                          <span className="text-xs text-gray-400 ml-auto">({suggestion.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    className={`px-3 py-2 text-sm rounded-lg border flex items-center gap-2 ${
                      showFilters ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                  
                  {/* Clear Filters */}
                  {getActiveFilterCount() > 0 && (
                    <button
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                      onClick={clearFilters}
                    >
                      Clear All
                    </button>
                  )}
                  
                  {/* Refresh */}
                  <button
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
                    onClick={() => loadNotices(true)}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        multiple
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={activeFilters.status}
                        onChange={(e) => updateFilter('status', Array.from(e.target.selectedOptions, option => option.value))}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                          value={activeFilters.dateFrom}
                          onChange={(e) => updateFilter('dateFrom', e.target.value)}
                          placeholder="From"
                        />
                        <input
                          type="date"
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                          value={activeFilters.dateTo}
                          onChange={(e) => updateFilter('dateTo', e.target.value)}
                          placeholder="To"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Read Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Read Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={activeFilters.isRead || ''}
                        onChange={(e) => updateFilter('isRead', e.target.value === '' ? null : e.target.value === 'true')}
                      >
                        <option value="">All</option>
                        <option value="true">Read</option>
                        <option value="false">Unread</option>
                      </select>
                    </div>

                    {/* Pinned Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pinned</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={activeFilters.isPinned || ''}
                        onChange={(e) => updateFilter('isPinned', e.target.value === '' ? null : e.target.value === 'true')}
                      >
                        <option value="">All</option>
                        <option value="true">Pinned</option>
                        <option value="false">Not Pinned</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          value={activeFilters.sortBy}
                          onChange={(e) => updateFilter('sortBy', e.target.value)}
                        >
                          <option value="createdAt">Created Date</option>
                          <option value="updatedAt">Updated Date</option>
                          <option value="title">Title</option>
                          <option value="priority">Priority</option>
                        </select>
                        <button
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => updateFilter('sortOrder', activeFilters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {activeFilters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Bulk Actions Bar */}
            {selectedNotices.length > 0 && (
              <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedNotices.length} notice{selectedNotices.length > 1 ? 's' : ''} selected
                    </span>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setSelectedNotices([])}
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getAvailableBulkActions().map((action) => (
                      <button
                        key={action.key}
                        className={`px-3 py-2 text-sm rounded hover:opacity-80 transition-colors flex items-center gap-1 ${
                          action.destructive 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleBulkAction(action.key)}
                        disabled={loadingStates.bulkAction}
                        title={`${action.label} selected notices`}
                      >
                        {loadingStates.bulkAction ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{action.icon}</span>
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <NoticeCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notices</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => loadNotices(true)}
              >
                Try Again
              </button>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && notices.length === 0 && (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notices found</h3>
              <p className="text-gray-500 mb-4">
                {getActiveFilterCount() > 0 
                  ? "Try adjusting your search or filter criteria" 
                  : "Be the first to create a notice!"
                }
              </p>
              {getActiveFilterCount() > 0 ? (
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              ) : (user?.role === 'admin' || user?.role === 'super_admin') && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Notice
                </button>
              )}
            </Card>
          )}

          {/* Notices List */}
          {!loading && !error && notices.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {notices.map((notice) => (
                <Card key={notice.id} className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
                  notice.priority === 'critical' ? 'border-l-red-500' : 
                  notice.priority === 'high' ? 'border-l-yellow-500' : 'border-l-blue-500'
                } ${viewMode === 'grid' ? 'p-4' : 'p-6'}`}>
                  
                  {viewMode === 'grid' ? (
                    // Grid View Layout
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="checkbox"
                            checked={selectedNotices.includes(notice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotices(prev => [...prev, notice.id]);
                              } else {
                                setSelectedNotices(prev => prev.filter(id => id !== notice.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          {notice.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedNotice(notice)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Edit button - only show for notice author */}
                          {(notice.author?.id === user?.id) && (
                            <button
                              onClick={() => startEdit(notice)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Edit Notice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete button - only show for notice author, admin, or super_admin */}
                          {(notice.author?.id === user?.id || user?.role === 'admin' || user?.role === 'super_admin') && (
                            <button
                              onClick={() => handleDeleteNotice(notice.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Priority & Category Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                          {getPriorityBadge(notice.priority)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(notice.category)}`}>
                          {getCategoryIcon(notice.category)} {notice.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setSelectedNotice(notice)}>
                        {notice.title}
                      </h3>
                      
                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm line-clamp-3">{notice.excerpt || notice.body}</p>
                      
                      {/* Footer Info */}
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{notice.author?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{formatDate(notice.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{notice.viewCount || 0}</span>
                            </div>
                            {notice.attachments && notice.attachments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                <span>{notice.attachments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View Layout
                    <div className="flex items-start justify-between">
                      {/* Notice Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedNotices.includes(notice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNotices(prev => [...prev, notice.id]);
                              } else {
                                setSelectedNotices(prev => prev.filter(id => id !== notice.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          
                          {notice.isPinned && <Pin className="w-5 h-5 text-red-500" />}
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(notice.priority)}`}>
                            {getPriorityBadge(notice.priority)}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(notice.category)}`}>
                            {getCategoryIcon(notice.category)} {notice.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => setSelectedNotice(notice)}>
                          {notice.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{notice.excerpt || notice.body}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{notice.author?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(notice.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{notice.viewCount || 0} views</span>
                          </div>
                          {notice.attachments && notice.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-4 h-4" />
                              <span>{notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setSelectedNotice(notice)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Edit button - only show for notice author */}
                        {(notice.author?.id === user?.id) && (
                          <button
                            onClick={() => startEdit(notice)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Notice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete button - only show for notice author, admin, or super_admin */}
                        {(notice.author?.id === user?.id || user?.role === 'admin' || user?.role === 'super_admin') && (
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
              
              {/* Load More Button */}
              {pagination.hasNext && !loading && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMoreNotices}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4" />
                        Load More Notices
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Infinite Scroll Trigger */}
              <div ref={scrollTriggerRef} className="h-4" />
            </div>
          )}

      {/* Create Notice Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNotice ? 'Edit Notice' : 'Create Special Notice'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingNotice(null);
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
                            onChange={() => {
                              const newAudience = formData.audience.includes(option.value)
                                ? formData.audience.filter(a => a !== option.value)
                                : [...formData.audience, option.value];
                              setFormData(prev => ({ ...prev, audience: newAudience }));
                            }}
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                    {loadingStates.uploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-gray-600">Uploading files...</p>
                        </div>
                      </div>
                    )}
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
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={loadingStates.uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-block mt-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                          loadingStates.uploading 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Choose Files
                      </label>
                    </div>
                    
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{file.originalName || file}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                              disabled={loadingStates.uploading}
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
                      setEditingNotice(null);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {!editingNotice && (
                    <button
                      type="button"
                      onClick={() => handleCreateNotice(true)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save as Draft
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCreateNotice(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    disabled={loadingStates.creating || loadingStates.updating}
                  >
                    {(loadingStates.creating || loadingStates.updating) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingNotice ? 'Updating...' : 'Publishing...'}
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        {editingNotice ? 'Update Notice' : 'Publish Notice'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Notice Detail Modal (Unified with Student UI, with admin features preserved) */}
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit/Delete buttons for admin only */}
                  {(selectedNotice.author?.id === user?.id) && (
                    <button
                      onClick={() => startEdit(selectedNotice)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Notice"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {(selectedNotice.author?.id === user?.id || user?.role === 'admin' || user?.role === 'super_admin') && (
                    <button
                      onClick={() => handleDeleteNotice(selectedNotice.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
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
                {selectedNotice.audience && selectedNotice.audience.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedNotice.audience
                      .map(aud => typeof aud === 'object' ? aud.name || aud.label || aud : aud)
                      .join(', ')}
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNotice.body}
                </div>
              </div>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments ({selectedNotice.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedNotice.attachments.map((attachment, index) => {
                      const fileName = attachment.originalName || attachment.fileName || attachment.name || `Attachment ${index + 1}`;
                      const fileType = (fileName.split('.').pop() || '').toLowerCase();
                      const previewable = canPreview(fileName);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-2">
                            {getFileIcon(fileName)}
                            <div>
                              <span className="text-sm text-gray-700 font-medium">
                                {fileName}
                              </span>
                              {attachment.fileSize && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({formatFileSize(attachment.fileSize)})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {previewable && (
                              <button
                                onClick={() => handlePreviewAttachment(attachment)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownloadFile(attachment)}
                              disabled={loadingStates.downloading}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {loadingStates.downloading ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  Download
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

              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Notice ID: {selectedNotice.id}</span>
                  <span>Posted by: {
                    typeof (selectedNotice.postedBy || selectedNotice.author) === 'object' 
                      ? (selectedNotice.postedBy?.name || selectedNotice.author?.name || 'Unknown')
                      : (selectedNotice.postedBy || selectedNotice.author || 'Unknown')
                  }</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
        </div>
    {/* Attachment Preview Modal (shared with student notices) */}
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
  </main>
  </ErrorBoundary>
  );
}