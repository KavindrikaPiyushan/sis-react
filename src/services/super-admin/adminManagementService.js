import { apiClient } from '../api.js';

// Super Admin Admin Management Services
export class AdminManagementService {
  // Fetch all admins with optional filters
  static async getAllAdmins(filters = {}) {
    // Build query params
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    if (filters.search !== undefined && filters.search !== null) {
      // Let URLSearchParams handle encoding to avoid double-encoding
      params.append('search', filters.search);
    }
    // Add more filters if needed

    // Allow caller to pass fetch options via filters.options.
    // For search queries, force no-store cache by default to avoid stale 304 responses
    const callerOptions = filters.options || {};
    const fetchOptions = { ...callerOptions };
    if (filters.search !== undefined && filters.search !== null) {
      // only set no-store when caller hasn't explicitly provided a cache option
      if (fetchOptions.cache === undefined) fetchOptions.cache = 'no-store';
    }

    return await apiClient.get(`/users/admins?${params.toString()}`, fetchOptions);
  }

  // Create a new admin
  static async createAdmin(adminData) {
    return await apiClient.post('/users', adminData);
  }

  static async bulkCreateAdmins(adminsData) {
    return await apiClient.post('/users/bulk/lecturers', adminsData);
  }

  // Delete an admin by userId
  static async deleteAdmin(userId) {
    return await apiClient.delete(`/users/${userId}`);
  }

  // Edit/update an admin by userId
  static async updateAdmin(userId, adminData) {
    return await apiClient.put(`/users/${userId}`, adminData);
  }
}

export default AdminManagementService;