import { apiClient } from './api.js';

// Authentication service
export class AuthService {
  // Login user
  static async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.success) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
          name: `${response.data.firstName} ${response.data.lastName}`,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          studentId: response.data.studentId,
          phone: response.data.phone,
          address: response.data.address,
          dateOfBirth: response.data.dateOfBirth,
          isActive: response.data.isActive,
          lastLoginAt: response.data.lastLoginAt,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
        // Store user data only (no token)
        localStorage.setItem('userData', JSON.stringify(userData));
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

  // Check if user is authenticated (just check userData)
  static isAuthenticated() {
    const userData = this.getCurrentUser();
    return !!userData;
  }

  // Get auth token (not used with HttpOnly cookies)
  static getToken() {
    return null;
  }

  // Check if user has specific role
  static hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Refresh token (not needed with HttpOnly cookies, but kept for API compatibility)
  static async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to refresh token' 
      };
    }
  }

  // Forgot password (reset email)
  static async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to send reset email' 
      };
    }
  }

  // Reset password
  // Reset password using token and new password
  static async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to reset password' 
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
