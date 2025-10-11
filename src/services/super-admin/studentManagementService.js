import { apiClient } from '../api.js';

// Super Admin Student Management Services
export class StudentManagementService {
  // Fetch all students with optional filters

    static async getAllStudents(filters = {}) {
      // Build query params
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);
      if (filters.search !== undefined && filters.search !== null) {
        // Let URLSearchParams handle encoding to avoid double-encoding
        params.append('search', filters.search);
      }
      // Add more filters if needed

      // Read cookie from file (simulate browser cookie for API)
      // In browser, cookies are sent automatically, but for this API, we need to set the cookie header manually
      // For local dev, you may need to set document.cookie or use a proxy

      // For fetch, set credentials: 'include' and rely on browser cookies
      // If you need to set a custom cookie, you can set headers['cookie']

      // Example: apiClient.get('/users/students?limit=5&page=1', { headers: { cookie: 'token=...' } })
      // But in browser, cookies are sent automatically if credentials: 'include' is set

      // For this implementation, we assume the token is already set in browser cookies
      // allow passing fetch options via filters.options (e.g., { signal })
      // Allow caller to pass fetch options via filters.options.
      // For search queries, force no-store cache by default to avoid stale 304 responses
      const callerOptions = filters.options || {};
      const fetchOptions = { ...callerOptions };
      if (filters.search !== undefined && filters.search !== null) {
        // only set no-store when caller hasn't explicitly provided a cache option
        if (fetchOptions.cache === undefined) fetchOptions.cache = 'no-store';
      }

      return await apiClient.get(`/users/students?${params.toString()}`, fetchOptions);
    }

  // Create a new student
  static async createStudent(studentData) {
    return await apiClient.post('/users', studentData);
  }

  static async bulkCreateStudents(studentsData) {
    return await apiClient.post('/users/bulk/students', studentsData);
  }

  // Delete a student by userId
  static async deleteStudent(userId) {
    return await apiClient.delete(`/users/${userId}`);
  }

  // Edit/update a student by userId
  static async editStudent(userId, studentData) {
    return await apiClient.put(`/users/${userId}`, studentData);
  }
}

export default StudentManagementService;
