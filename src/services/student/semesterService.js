import { apiClient } from '../api.js';

export class SemesterService {
  static async getMySemesters(params = {}) {
    try {
      const response = await apiClient.get('/students/me/semesters', { params });
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch semesters' };
    }
  }
}

export default SemesterService;
