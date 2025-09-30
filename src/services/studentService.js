import { apiClient } from './api.js';

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

  // Get student notices
  static async getNotices() {
    try {
      const response = await apiClient.get('/student/notices');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch notices' 
      };
    }
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
      const response = await apiClient.get('/student/useful-links');
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
