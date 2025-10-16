import { apiClient } from '../api.js';

// Super Admin utilService with helper functions
class UtilService {

  /**
   * Fetch logs with optional query params for lazy loading and filters.
   * options: { limit, cursor, userId, action, entity, startDate, endDate }
   */
  async getLogs(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.cursor) params.append('cursor', options.cursor);
  if (options.userId) params.append('userId', options.userId);
  if (options.action) params.append('action', options.action);
  if (options.entity) params.append('entity', options.entity);
  if (options.module) params.append('module', options.module);
  if (options.status) params.append('status', options.status);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/logs${query}`);
      return response;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}

export default UtilService;
