import { apiClient } from '../api.js';

// Super Admin Admin Management Services
export class AdminManagementService {
  // Fetch all lectures with optional filters

    static async getAllAdmins(filters = {}) {
      // Build query params
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);
      // Add more filters if needed

      // Read cookie from file (simulate browser cookie for API)
      // In browser, cookies are sent automatically, but for this API, we need to set the cookie header manually
      // For local dev, you may need to set document.cookie or use a proxy

      // For fetch, set credentials: 'include' and rely on browser cookies
      // If you need to set a custom cookie, you can set headers['cookie']

      // Example: apiClient.get('/users/admins?limit=5&page=1', { headers: { cookie: 'token=...' } })
      // But in browser, cookies are sent automatically if credentials: 'include' is set

      // For this implementation, we assume the token is already set in browser cookies
      return await apiClient.get(`/users/admins?${params.toString()}`);
    }

  // Create a new lecturer
  static async createAdmin(adminData) {
    return await apiClient.post('/users', adminData);
  }

  static async bulkCreateAdmins(adminsData) {
    return await apiClient.post('/users/bulk/lecturers', adminsData);
  }

  // Delete a lecturer by userId
  static async deleteAdmin(userId) {
    return await apiClient.delete(`/users/${userId}`);
  }

  // Edit/update a lecturer by userId
  static async updateAdmin(userId, adminData) {
    return await apiClient.put(`/users/${userId}`, adminData);
  }
}

export default AdminManagementService;
