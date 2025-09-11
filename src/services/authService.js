import { apiClient } from './api.js';
import uploadConfig from '../config/upload';
// Helper for S3 pre-signed upload
async function uploadToPresignedUrl(presignedUrl, file, contentType) {
  await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || file.type || 'application/octet-stream',
    },
    body: file,
  });
}
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
          profileImage: response.data.profileImage || null
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

  // Logout user (call API and clear localStorage)
  static async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      localStorage.removeItem('userData');
      return response;
    } catch (error) {
      localStorage.removeItem('userData');
      return { success: false, message: error.message || 'Logout failed' };
    }
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

  // Get current user profile
  static async getProfile() {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch profile' };
    }
  }
  

  // Update user profile
  static async updateProfile(profileData) {
    try {
      // Pre-signed S3 upload flow
      if (uploadConfig.UPLOAD_DRIVER === 's3' && uploadConfig.S3_IS_PRE_SIGNED) {
        // profileData: { ...fields, profileImageFile }
        const { profileImageFile, ...fields } = profileData;
        let profileImageKey = undefined;
        let profileImage = null;
        console.log('Profile data received for update 1:', profileData);
        if (profileImageFile) {
          console.log('Uploading profile image to S3 with pre-signed URL:', profileImageFile);
          // Generate S3 key (e.g., uploads/<userId>/profileImages/<filename>)
          const user = AuthService.getCurrentUser();
          const fileName = `${Date.now()}-${Math.floor(Math.random()*1e9)}-${profileImageFile.name}`;
          profileImageKey = `uploads/${user?.id || 'unknown'}/profileImages/${fileName}`;
          profileImage = fileName;
          // Get presigned URL
          const presignedRes = await apiClient.get(
            `/auth/presigned-upload-url?key=${encodeURIComponent(profileImageKey)}&fileType=${encodeURIComponent(profileImageFile.type)}`
          );
          if (!presignedRes.success || !presignedRes.url) {
            return { success: false, message: 'Failed to get S3 upload URL' };
          }
          await uploadToPresignedUrl(presignedRes.url, profileImageFile, profileImageFile.type);
        }
        // Send JSON to /auth/profile with profileImageKey and other fields
        const payload = { ...fields };
        if (profileImage) payload.profileImage = profileImage;
        const response = await apiClient.put('/auth/profile', payload);
        // Update localStorage if success
        if (response.success && response.data) {
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
            profileImage: response.data.profileImage || null
          };
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        return response;
      } else {
        console.log('Profile data being sent:', profileData);
        // Normal upload (local or S3 direct)
        const isFormData = (typeof FormData !== 'undefined') && profileData instanceof FormData;
        const config = isFormData ? { headers: {} } : undefined;
        const response = await apiClient.put('/auth/profile', profileData, config);
        if (response.success && response.data) {
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
            profileImage: response.data.profileImage || null
          };
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        return response;
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  }

  // Send change password OTP
  static async sendChangePasswordOtp() {
    try {
      const response = await apiClient.post('/auth/send-change-password-otp', {});
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to send OTP' };
    }
  }

  // Change password with OTP
  static async changePassword(currentPassword, newPassword, otp) {
    try {
      const response = await apiClient.put('/auth/change-password', { currentPassword, newPassword, otp });
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to change password' };
    }
  }
}

export default AuthService;
