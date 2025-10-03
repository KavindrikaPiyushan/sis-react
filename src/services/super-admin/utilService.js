import { apiClient } from '../api.js';

// Super Admin utilService with helper functions
class UtilService {

  async getLogs() {
    try {
      const response = await apiClient.get('/logs');
      return response;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}

export default UtilService;
