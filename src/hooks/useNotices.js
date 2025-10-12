import { useState, useEffect, useCallback, useRef } from 'react';
import noticesService from '../services/admin/noticesService';

// Custom hook for managing notices with all advanced features
export const useNotices = (initialFilters = {}) => {
  // State management
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [stats, setStats] = useState({});
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filters
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
    sortOrder: 'desc',
    ...initialFilters
  });

  // Load notices
  const loadNotices = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      }
      
      const params = {
        page: reset ? 1 : pagination.currentPage + 1,
        limit: 10,
        ...activeFilters
      };
      
      const response = await noticesService.getNotices(params);
      
      if (response.success) {
        if (reset) {
          setNotices(response.data.notices);
        } else {
          setNotices(prev => [...prev, ...response.data.notices]);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, pagination.currentPage]);

  // Load more notices (infinite scroll)
  const loadMoreNotices = useCallback(async () => {
    if (loadingMore || !pagination.hasNext) return;
    
    setLoadingMore(true);
    try {
      const params = {
        page: pagination.currentPage + 1,
        limit: 10,
        ...activeFilters
      };
      
      const response = await noticesService.getNotices(params);
      
      if (response.success) {
        setNotices(prev => [...prev, ...response.data.notices]);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingMore(false);
    }
  }, [activeFilters, pagination, loadingMore]);

  // Load metadata
  const loadMetadata = useCallback(async () => {
    try {
      const response = await noticesService.getMetadata();
      if (response.success) {
        setMetadata(response.data);
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await noticesService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Update filters
  const updateFilter = useCallback((filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
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
  }, []);

  // Create notice
  const createNotice = useCallback(async (noticeData) => {
    try {
      const response = await noticesService.createNotice(noticeData);
      if (response.success) {
        loadNotices(true);
        loadStats();
        return response;
      }
    } catch (error) {
      throw error;
    }
  }, [loadNotices, loadStats]);

  // Update notice
  const updateNotice = useCallback(async (id, updates) => {
    try {
      const response = await noticesService.updateNotice(id, updates);
      if (response.success) {
        setNotices(prev => prev.map(notice => 
          notice.id === id ? { ...notice, ...updates } : notice
        ));
        loadStats();
        return response;
      }
    } catch (error) {
      throw error;
    }
  }, [loadStats]);

  // Delete notice
  const deleteNotice = useCallback(async (id) => {
    try {
      const response = await noticesService.deleteNotice(id);
      if (response.success) {
        setNotices(prev => prev.filter(notice => notice.id !== id));
        loadStats();
        return response;
      }
    } catch (error) {
      throw error;
    }
  }, [loadStats]);

  // Mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      const response = await noticesService.markAsRead(id);
      if (response.success) {
        setNotices(prev => prev.map(notice => 
          notice.id === id ? { ...notice, isRead: true } : notice
        ));
        return response;
      }
    } catch (error) {
      throw error;
    }
  }, []);

  // Bulk actions
  const bulkActions = useCallback(async (action, noticeIds, data = {}) => {
    try {
      const response = await noticesService.bulkActions(action, noticeIds, data);
      if (response.success) {
        loadNotices(true);
        loadStats();
        return response;
      }
    } catch (error) {
      throw error;
    }
  }, [loadNotices, loadStats]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
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
    return count;
  }, [activeFilters]);

  // Initialize data
  useEffect(() => {
    loadMetadata();
    loadStats();
  }, [loadMetadata, loadStats]);

  // Load notices when filters change
  useEffect(() => {
    loadNotices(true);
  }, [activeFilters]);

  return {
    // Data
    notices,
    metadata,
    stats,
    pagination,
    
    // Loading states
    loading,
    loadingMore,
    error,
    
    // Filters
    activeFilters,
    updateFilter,
    clearFilters,
    getActiveFilterCount,
    
    // Actions
    loadNotices,
    loadMoreNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    markAsRead,
    bulkActions,
    
    // Utilities
    loadStats,
    loadMetadata
  };
};

// Custom hook for search functionality with debouncing
export const useNoticeSearch = (onSearch, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay, onSearch]);

  // Load suggestions
  const loadSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await noticesService.getSearchSuggestions(query, 5);
      if (response.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Load suggestions when search term changes
  useEffect(() => {
    if (searchTerm.length > 2) {
      loadSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, loadSuggestions]);

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    loadingSuggestions
  };
};

// Custom hook for infinite scroll
export const useInfiniteScroll = (callback, hasMore, loading) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData();
  }, [isFetching]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching || loading || !hasMore) return;
    setIsFetching(true);
  };

  const fetchMoreData = useCallback(async () => {
    await callback();
    setIsFetching(false);
  }, [callback]);

  return [isFetching, setIsFetching];
};

// Custom hook for file uploads
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await noticesService.uploadFiles(Array.from(files));
      
      if (response.success) {
        const newFiles = response.data.uploads.map(upload => ({
          id: upload.id,
          fileName: upload.fileName,
          originalName: upload.originalName,
          fileSize: upload.fileSize,
          mimeType: upload.mimeType
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
        setUploadProgress(100);
        
        return newFiles;
      }
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const removeFile = useCallback((index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadedFiles,
    uploadFiles,
    removeFile,
    clearFiles,
    setUploadedFiles
  };
};