import { apiClient } from './api.js';
import FileService from './common/fileService.js';

// Student-related services
export class StudentService {
  // Get student dashboard data
  static async getDashboardData() {
    try {
      const response = await apiClient.get('/student/dashboard');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch dashboard data' 
      };
    }
  }

  // Get student attendance
  static async getAttendance(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/student/attendance?${queryParams}` : '/student/attendance';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch attendance data' 
      };
    }
  }

  // Get student results
  static async getResults() {
    try {
      const response = await apiClient.get('/student/results');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch results' 
      };
    }
  }

  // Get student notices with filtering and pagination
  static async getNotices(params = {}) {
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
      if (params.status) queryParams.append('status', params.status);
      
      // Boolean filters
      if (params.isPinned !== undefined) queryParams.append('isPinned', params.isPinned);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
      
      // Date filters
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      
      // Sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = queryParams.toString() ? `/student/notices?${queryParams.toString()}` : '/student/notices';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch notices' 
      };
    }
  }

  // Mark notice as read
  static async markNoticeAsRead(noticeId) {
    try {
      const response = await apiClient.post(`/student/notices/${noticeId}/read`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to mark notice as read' 
      };
    }
  }

  // Mark notice as unread
  static async markNoticeAsUnread(noticeId) {
    try {
      const response = await apiClient.post(`/student/notices/${noticeId}/unread`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to mark notice as unread' 
      };
    }
  }

  // Pin notice
  static async pinNotice(noticeId) {
    try {
      const response = await apiClient.post(`/student/notices/${noticeId}/pin`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to pin notice' 
      };
    }
  }

  // Unpin notice
  static async unpinNotice(noticeId) {
    try {
      const response = await apiClient.post(`/student/notices/${noticeId}/unpin`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to unpin notice' 
      };
    }
  }



  // Get unread notices count for student
  static async getUnreadNoticesCount() {
    try {
      const response = await apiClient.get('/student/notices/unread-count');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch unread notices count' 
      };
    }
  }

  // Download file (using shared FileService)
  static async downloadFile(fileId, fileName) {
    return FileService.downloadFile(fileId, fileName);
  }
  // Submit medical report
  static async submitMedicalReport(formData) {
    try {
      const response = await apiClient.post('/student/medical-reports', formData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to submit medical report' 
      };
    }
  }

  // Get payment receipts
  static async getPaymentReceipts() {
    try {
      const response = await apiClient.get('/student/payment-receipts');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch payment receipts' 
      };
    }
  }

  // Get useful links
  static async getUsefulLinks() {
    try {
      const response = await apiClient.get('/student/special-links');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch useful links' 
      };
    }
  }

  // Get student GPA data
  static async getStudentGPA() {
    try {
      const response = await apiClient.get('/results/student/my-gpa');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch GPA data' 
      };
    }
  }
}

export default StudentService;
