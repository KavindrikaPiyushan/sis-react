import api from '../api';
import FileService from '../common/fileService';

class NoticesService {
  // Get notices with pagination, filtering, and search
  async getNotices(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Search
      if (params.search) queryParams.append('search', params.search);
      
      // Filters
      if (params.category?.length) {
        params.category.forEach(cat => queryParams.append('category', cat));
      }
      if (params.priority?.length) {
        params.priority.forEach(pri => queryParams.append('priority', pri));
      }
      if (params.status?.length) {
        params.status.forEach(stat => queryParams.append('status', stat));
      }
      if (params.audience?.length) {
        params.audience.forEach(aud => queryParams.append('audience', aud));
      }
      if (params.tags?.length) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }
      
      // Boolean filters
      if (params.isPinned !== undefined) queryParams.append('isPinned', params.isPinned);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
      
      // Date filters
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      // Sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Author filter
      if (params.author) queryParams.append('author', params.author);

      const response = await api.get(`/notices?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      const errorDetails = this.handleError(error);
      throw new Error(errorDetails.message);
    }
  }

  // Get single notice by ID
  async getNoticeById(id) {
    try {
      const response = await api.get(`/notices/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new notice
  async createNotice(noticeData) {
    try {
      const response = await api.post('/notices', noticeData);
      return response.data;
    } catch (error) {
      const errorDetails = this.handleError(error);
      throw new Error(errorDetails.message);
    }
  }

  // Update existing notice
  async updateNotice(id, noticeData) {
    try {
      const response = await api.put(`/notices/${id}`, noticeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete notice
  async deleteNotice(id) {
    try {
      const response = await api.delete(`/notices/${id}`);
      console.log('🔍 Delete API response:', response);
      console.log('🔍 Delete response.data:', response.data);
      console.log('🔍 Delete response.status:', response.status);
      
      // If response.data is undefined but response has the data directly, return response
      // Otherwise return response.data (standard axios pattern)
      if (response.data === undefined && response.success !== undefined) {
        console.log('🔍 Returning direct response:', response);
        return response;
      } else {
        console.log('🔍 Returning response.data:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('💥 Delete service error:', error);
      throw this.handleError(error);
    }
  }

  // Mark notice as read
  async markAsRead(id) {
    try {
      const response = await api.post(`/notices/${id}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk operations
  async bulkActions(action, noticeIds, data = {}) {
    try {
      const response = await api.post('/notices/bulk-actions', {
        action,
        noticeIds,
        data
      });
      
      console.log('🔍 Bulk actions API response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      
      // The API client already returns the parsed JSON response directly
      // So response = {"success": true, "message": "...", "affectedCount": 3}
      // We should return response directly, not response.data
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get notices statistics
  async getStats() {
    try {
      const response = await api.get('/notices/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get unread notices count
  async getUnreadCount() {
    try {
      const response = await api.get('/notices/unread-count');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query, limit = 5) {
    try {
      const response = await api.get(`/notices/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get metadata (categories, priorities, audiences, tags)
  async getMetadata() {
    try {
      const response = await api.get('/notices/metadata');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload files (using shared FileService)
  async uploadFiles(files, type = 'notice-attachment') {
    try {
      const response = await FileService.uploadFiles(files, type);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data || response;
    } catch (error) {
      const errorDetails = this.handleError(error);
      throw new Error(errorDetails.message);
    }
  }

  // Download file (using shared FileService)
  async downloadFile(fileId, fileName) {
    try {
      const response = await FileService.downloadFile(fileId, fileName);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export notices
  async exportNotices(params = {}, format = 'excel') {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      queryParams.append('format', format);

      const response = await api.get(`/notices/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `notices_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || [],
        type: 'API_ERROR'
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        type: 'NETWORK_ERROR'
      };
    } else {
      // Other error
      return {
        status: 500,
        message: error.message || 'An unexpected error occurred',
        type: 'UNKNOWN_ERROR'
      };
    }
  }
}

export default new NoticesService();