import { apiClient } from '../api.js';

// common data service to fetch shared data like programs, courses, etc.
export class CommonDataService {
  // Fetch all batch programs
  static async getAllBatchPrograms() {
    return await apiClient.get('/batches');
  }

  
  // Fetch course sessions by course offering ID
  static async getCourseSessions(courseOfferingId) {
    try {
      const response = await apiClient.get(`/course-offerings/${courseOfferingId}/sessions`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch course sessions'
      };
    }
  }
}  
export default CommonDataService;