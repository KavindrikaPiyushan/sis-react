import { apiClient } from '../api.js';

// common data service to fetch shared data like programs, courses, etc.
export class CommonDataService {
  // Fetch all batch programs
  static async getAllBatchPrograms() {
    return await apiClient.get('/batches');
  }

}  
export default CommonDataService;