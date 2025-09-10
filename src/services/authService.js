import { apiClient } from './api.js';

// Authentication service
export class AuthService {
  // Login user
  static async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.success) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          name: `${response.data.user.firstName} ${response.data.user.lastName}`,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          studentId: response.data.user.studentId,
          phone: response.data.user.phone,
          address: response.data.user.address,
          dateOfBirth: response.data.user.dateOfBirth,
          isActive: response.data.user.isActive,
          token: response.data.token,
        };

        // Store user data and token
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authToken', response.data.token);
        
        return { success: true, data: userData };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection and try again.' 
      };
    }
  }

  // Logout user
  static logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
  }

  // Get current user data
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const userData = this.getCurrentUser();
    return !!(token && userData);
  }

  // Get auth token
  static getToken() {
    return localStorage.getItem('authToken');
  }

  // Check if user has specific role
  static hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Refresh token (if your API supports it)
  static async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to refresh token' 
      };
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to send reset email' 
      };
    }
  }

  // Change password
  static async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to change password' 
      };
    }
  }
}

export default AuthService;
