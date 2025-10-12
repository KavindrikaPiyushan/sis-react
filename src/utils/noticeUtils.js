// Date and time utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
};

export const isDateExpired = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export const getDaysUntilExpiry = (dateString) => {
  if (!dateString) return null;
  const now = new Date();
  const expiry = new Date(dateString);
  const diffInDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diffInDays;
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType) => {
  if (!mimeType) return '📄';
  
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '🗜️';
  
  return '📄';
};

export const validateFileType = (file, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.some(type => file.type.includes(type));
};

export const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export const extractMentions = (text) => {
  const mentionRegex = /@[\w\d]+/g;
  return text.match(mentionRegex) || [];
};

export const extractHashtags = (text) => {
  const hashtagRegex = /#[\w\d]+/g;
  return text.match(hashtagRegex) || [];
};

export const generateExcerpt = (content, maxLength = 150) => {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) return plainText;
  
  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

// Validation utilities
export const validateNoticeTitle = (title) => {
  const errors = [];
  
  if (!title || !title.trim()) {
    errors.push('Title is required');
  } else {
    if (title.length < 5) {
      errors.push('Title must be at least 5 characters long');
    }
    if (title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
  }
  
  return errors;
};

export const validateNoticeContent = (content) => {
  const errors = [];
  
  if (!content || !content.trim()) {
    errors.push('Content is required');
  } else {
    if (content.length < 10) {
      errors.push('Content must be at least 10 characters long');
    }
    if (content.length > 5000) {
      errors.push('Content must be less than 5000 characters');
    }
  }
  
  return errors;
};

export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (!startDate) {
    errors.push('Start date is required');
    return errors;
  }
  
  const start = new Date(startDate);
  const now = new Date();
  
  if (start < now.setHours(0, 0, 0, 0)) {
    errors.push('Start date cannot be in the past');
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (end <= start) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
};

export const validateAudience = (audience) => {
  const errors = [];
  
  if (!audience || audience.length === 0) {
    errors.push('At least one audience must be selected');
  }
  
  return errors;
};

// Priority and category utilities
export const getPriorityLevel = (priority) => {
  const levels = {
    'critical': 3,
    'high': 2,
    'normal': 1
  };
  return levels[priority] || 1;
};

export const getPriorityColor = (priority) => {
  const colors = {
    'critical': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      badge: 'bg-red-500'
    },
    'high': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      badge: 'bg-yellow-500'
    },
    'normal': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      badge: 'bg-blue-500'
    }
  };
  return colors[priority] || colors.normal;
};

export const getCategoryIcon = (category) => {
  const icons = {
    'general': '📢',
    'academic': '📚',
    'finance': '💰',
    'event': '🎯',
    'emergency': '🚨',
    'announcement': '📣',
    'deadline': '⏰',
    'update': '🔄'
  };
  return icons[category] || '📢';
};

export const getCategoryColor = (category) => {
  const colors = {
    'general': 'bg-gray-100 text-gray-800',
    'academic': 'bg-blue-100 text-blue-800',
    'finance': 'bg-green-100 text-green-800',
    'event': 'bg-purple-100 text-purple-800',
    'emergency': 'bg-red-100 text-red-800',
    'announcement': 'bg-indigo-100 text-indigo-800',
    'deadline': 'bg-orange-100 text-orange-800',
    'update': 'bg-teal-100 text-teal-800'
  };
  return colors[category] || colors.general;
};

// Search and filter utilities
export const buildSearchQuery = (searchTerm, filters) => {
  const query = {
    search: searchTerm
  };
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      if (Array.isArray(filters[key]) && filters[key].length > 0) {
        query[key] = filters[key];
      } else if (!Array.isArray(filters[key])) {
        query[key] = filters[key];
      }
    }
  });
  
  return query;
};

export const parseFiltersFromURL = (searchParams) => {
  const filters = {};
  
  for (const [key, value] of searchParams) {
    if (key.endsWith('[]') || ['category', 'priority', 'status', 'audience', 'tags'].includes(key)) {
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    } else {
      filters[key] = value;
    }
  }
  
  return filters;
};

export const getActiveFilterCount = (filters) => {
  let count = 0;
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (Array.isArray(value) && value.length > 0) {
      count++;
    } else if (value !== null && value !== undefined && value !== '') {
      count++;
    }
  });
  
  return count;
};

// Sort utilities
export const sortNotices = (notices, sortBy, sortOrder) => {
  return [...notices].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle special cases
    if (sortBy === 'priority') {
      aValue = getPriorityLevel(a.priority);
      bValue = getPriorityLevel(b.priority);
    } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// URL utilities
export const generateNoticeURL = (notice) => {
  const slug = notice.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/notices/${notice.id}/${slug}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Export utilities
export const exportToCSV = (notices, filename = 'notices.csv') => {
  const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Author', 'Created Date', 'Audience'];
  const csvContent = [
    headers.join(','),
    ...notices.map(notice => [
      notice.id,
      `"${notice.title.replace(/"/g, '""')}"`,
      notice.category,
      notice.priority,
      notice.status,
      notice.author?.name || 'Unknown',
      formatDate(notice.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit' }),
      `"${notice.audience.join(', ')}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Local storage utilities
export const saveFiltersToStorage = (filters, key = 'notice_filters') => {
  try {
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to save filters to storage:', error);
  }
};

export const loadFiltersFromStorage = (key = 'notice_filters') => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load filters from storage:', error);
    return null;
  }
};

export const clearFiltersFromStorage = (key = 'notice_filters') => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear filters from storage:', error);
  }
};