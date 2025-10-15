import { apiClient } from './api.js';

// Admin-related services
export class AdminService {
  // Get admin dashboard data
  static async getDashboardData() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch dashboard data' 
      };
    }
  }

  // Attendance management
  static async getAttendanceData(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/admin/attendance?${queryParams}` : '/admin/attendance';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch attendance data' 
      };
    }
  }

  static async updateAttendance(attendanceData) {
    try {
      const response = await apiClient.put('/admin/attendance', attendanceData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update attendance' 
      };
    }
  }

  // Results management
  static async getResults(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/admin/results?${queryParams}` : '/admin/results';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch results' 
      };
    }
  }

  static async uploadResults(resultsData) {
    try {
      const response = await apiClient.post('/admin/results', resultsData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to upload results' 
      };
    }
  }

  // Notice management
  static async getNotices() {
    try {
      const response = await apiClient.get('/admin/notices');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch notices' 
      };
    }
  }

  static async createNotice(noticeData) {
    try {
      const response = await apiClient.post('/admin/notices', noticeData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to create notice' 
      };
    }
  }

  static async updateNotice(noticeId, noticeData) {
    try {
      const response = await apiClient.put(`/admin/notices/${noticeId}`, noticeData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update notice' 
      };
    }
  }

  static async deleteNotice(noticeId) {
    try {
      const response = await apiClient.delete(`/admin/notices/${noticeId}`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to delete notice' 
      };
    }
  }

  // Medical approvals
  static async getMedicalApprovals() {
    try {
      const response = await apiClient.get('/admin/medical-approvals');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch medical approvals' 
      };
    }
  }

  static async approveMedicalReport(reportId, status) {
    try {
      const response = await apiClient.put(`/admin/medical-approvals/${reportId}`, { status });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update medical approval' 
      };
    }
  }

  // Payment approvals
  static async getPaymentApprovals() {
    try {
      const response = await apiClient.get('/admin/payment-approvals');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch payment approvals' 
      };
    }
  }

  static async approvePayment(paymentId, status) {
    try {
      const response = await apiClient.put(`/admin/payment-approvals/${paymentId}`, { status });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update payment approval' 
      };
    }
  }

  // System logs
  static async getLogs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/admin/logs?${queryParams}` : '/admin/logs';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch logs' 
      };
    }
  }

  // Special links management
  static async getSpecialLinks() {
    try {
      const response = await apiClient.get('/admin/special-links');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch special links' 
      };
    }
  }

  static async createSpecialLink(linkData) {
    try {
      const response = await apiClient.post('/admin/special-links', linkData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to create special link' 
      };
    }
  }

  static async updateSpecialLink(linkId, linkData) {
    try {
      const response = await apiClient.put(`/admin/special-links/${linkId}`, linkData);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to update special link' 
      };
    }
  }

  static async deleteSpecialLink(linkId) {
    try {
      const response = await apiClient.delete(`/admin/special-links/${linkId}`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to delete special link' 
      };
    }
  }

  // Lecturer assigned courses
  static async getLecturerAssignedCourses() {
    try {
      const response = await apiClient.get('/course-offerings/lecturer/myCourses');
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch assigned courses'
      };
    }
  }

  static async createClassSessions(sessionData) {
    try {
      const response = await apiClient.post('/class-sessions', sessionData);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create class sessions'
      };
    }
  }

  // for update class-sessions/:id use this
  static async updateClassSession(sessionId, sessionData) {
    try {
      const response = await apiClient.put(`/class-sessions/${sessionId}`, sessionData);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update class session'
      };
    }
  }

  //for delete class-sessions/:id use this
  static async deleteClassSession(sessionId) {
    try {
      const response = await apiClient.delete(`/class-sessions/${sessionId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete class session'
      };
    }
  }

  // Approve enrollment request
  static async approveEnrollment(enrollmentId) {
    try {
      const response = await apiClient.put(`/enrollments/${enrollmentId}/approve`);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to approve enrollment'
      };
    }
  }


  static async bulkApproveEnrollments(enrollmentIds) {
    try {
      const response = await apiClient.post('/enrollments/bulk-approve', { ids: enrollmentIds });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to bulk approve enrollments'
      };
    }
  }

}
export default AdminService;
