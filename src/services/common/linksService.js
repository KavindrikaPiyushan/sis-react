import { apiClient } from '../api.js';

export class LinksService {
  
  // ===== ADMIN LINK MANAGEMENT =====

  /**
   * Create a new link (Admin/Super Admin only)
   * @param {Object} linkData - Link data
   * @returns {Promise<Object>} API response
   */
  static async createLink(linkData) {
    try {
      const response = await apiClient.post('/links', linkData);
      return response;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  }

  /**
   * Get all links with admin access (Admin/Super Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with links and pagination
   */
  static async getAllLinks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all possible query parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.targetAudience) queryParams.append('targetAudience', params.targetAudience);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.includeExpired !== undefined) queryParams.append('includeExpired', params.includeExpired);
      if (params.createdBy) queryParams.append('createdBy', params.createdBy);

      const endpoint = `/links${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching all links:', error);
      throw error;
    }
  }

  /**
   * Get a specific link by ID
   * @param {string} linkId - Link ID
   * @returns {Promise<Object>} API response with link data
   */
  static async getLinkById(linkId) {
    try {
      const response = await apiClient.get(`/links/${linkId}`);
      return response;
    } catch (error) {
      console.error('Error fetching link by ID:', error);
      throw error;
    }
  }

  /**
   * Update a link (Admin/Super Admin only)
   * @param {string} linkId - Link ID
   * @param {Object} updateData - Updated link data
   * @returns {Promise<Object>} API response
   */
  static async updateLink(linkId, updateData) {
    try {
      const response = await apiClient.put(`/links/${linkId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  }

  /**
   * Delete a link (Admin/Super Admin only)
   * @param {string} linkId - Link ID
   * @returns {Promise<Object>} API response
   */
  static async deleteLink(linkId) {
    try {
      const response = await apiClient.delete(`/links/${linkId}`);
      return response;
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }

  /**
   * Toggle link active status (Admin/Super Admin only)
   * @param {string} linkId - Link ID
   * @returns {Promise<Object>} API response
   */
  static async toggleLinkStatus(linkId) {
    try {
      const response = await apiClient.request(`/links/${linkId}/toggle-status`, { method: 'PATCH' });
      return response;
    } catch (error) {
      console.error('Error toggling link status:', error);
      throw error;
    }
  }

  /**
   * Duplicate a link (Admin/Super Admin only)
   * @param {string} linkId - Link ID to duplicate
   * @returns {Promise<Object>} API response with new link
   */
  static async duplicateLink(linkId) {
    try {
      const response = await apiClient.post(`/links/${linkId}/duplicate`);
      return response;
    } catch (error) {
      console.error('Error duplicating link:', error);
      throw error;
    }
  }

  // ===== USER ACCESS METHODS =====

  /**
   * Get active links for authenticated users
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with active links
   */
  static async getActiveLinks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/links/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching active links:', error);
      throw error;
    }
  }

  /**
   * Get public active links (no authentication required)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with public links
   */
  static async getPublicActiveLinks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/links/public/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching public active links:', error);
      throw error;
    }
  }

  /**
   * Get current user's created links
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with user's links
   */
  static async getMyLinks(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = `/links/my-links${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching my links:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get available link categories
   * @returns {Promise<Object>} API response with categories array
   */
  static async getCategories() {
    try {
      const response = await apiClient.get('/links/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get link statistics (Admin/Super Admin only)
   * @returns {Promise<Object>} API response with statistics
   */
  static async getStatistics() {
    try {
      const response = await apiClient.get('/links/statistics');
      return response;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Record a click for a link (increment view count server-side)
   * @param {string} linkId
   */
  static async recordClick(linkId) {
    try {
      // Authenticated view tracking endpoint per API docs
      const response = await apiClient.post(`/links/${linkId}/view`);
      return response;
    } catch (error) {
      console.error('Error recording link view:', error);
      // swallow errors to avoid breaking UX when analytics fail
      return null;
    }
  }

  // ===== BULK OPERATIONS =====

  /**
   * Update link display order (Admin/Super Admin only)
   * @param {Array} linkUpdates - Array of {id, order} objects
   * @returns {Promise<Object>} API response
   */
  static async updateLinkOrder(linkUpdates) {
    try {
      const response = await apiClient.request('/links/order', {
        method: 'PATCH',
        body: { linkUpdates }
      });
      return response;
    } catch (error) {
      console.error('Error updating link order:', error);
      throw error;
    }
  }

  /**
   * Bulk update multiple links (Admin/Super Admin only)
   * @param {Array} linkIds - Array of link IDs
   * @param {Object} updateData - Data to update for all links
   * @returns {Promise<Object>} API response with results
   */
  static async bulkUpdateLinks(linkIds, updateData) {
    try {
      const response = await apiClient.request('/links/bulk/update', {
        method: 'PATCH',
        body: { linkIds, updateData }
      });
      return response;
    } catch (error) {
      console.error('Error bulk updating links:', error);
      throw error;
    }
  }

  /**
   * Bulk delete multiple links (Admin/Super Admin only)
   * @param {Array} linkIds - Array of link IDs to delete
   * @returns {Promise<Object>} API response with results
   */
  static async bulkDeleteLinks(linkIds) {
    try {
      const response = await apiClient.delete('/links/bulk/delete', {
        body: { linkIds }
      });
      return response;
    } catch (error) {
      console.error('Error bulk deleting links:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Validate link data before sending to API
   * @param {Object} linkData - Link data to validate
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  static validateLinkData(linkData) {
    const errors = [];
    
    // Required fields
    if (!linkData.title || linkData.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (linkData.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }
    
    if (!linkData.url || linkData.url.trim().length === 0) {
      errors.push('URL is required');
    } else {
      // Basic URL validation
      try {
        new URL(linkData.url);
      } catch {
        errors.push('Please provide a valid URL');
      }
    }
    
    // Optional field validations
    if (linkData.description && linkData.description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    }
    
    if (linkData.category && linkData.category.length > 100) {
      errors.push('Category must be 100 characters or less');
    }
    
    if (linkData.icon && linkData.icon.length > 100) {
      errors.push('Icon must be 100 characters or less');
    }
    
    // Enum validations
    const validPriorities = ['normal', 'highlight'];
    if (linkData.priority && !validPriorities.includes(linkData.priority)) {
      errors.push('Priority must be either "normal" or "highlight"');
    }
    
    const validOpenModes = ['newtab', 'sametab'];
    if (linkData.openMode && !validOpenModes.includes(linkData.openMode)) {
      errors.push('Open mode must be either "newtab" or "sametab"');
    }
    
    const validTargetAudiences = ['all', 'students', 'admins'];
    if (linkData.targetAudience && !validTargetAudiences.includes(linkData.targetAudience)) {
      errors.push('Target audience must be "all", "students", or "admins"');
    }
    
    // Date validations
    if (linkData.startDate && linkData.endDate) {
      const startDate = new Date(linkData.startDate);
      const endDate = new Date(linkData.endDate);
      
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format link data for API submission
   * @param {Object} linkData - Raw link data
   * @returns {Object} Formatted link data
   */
  static formatLinkData(linkData) {
    const formatted = {
      title: linkData.title?.trim(),
      url: linkData.url?.trim(),
      description: linkData.description?.trim() || '',
      category: linkData.category?.trim() || '',
      priority: linkData.priority || 'normal',
      icon: linkData.icon?.trim() || '',
      openMode: linkData.openMode || 'newtab',
      isActive: linkData.isActive !== undefined ? linkData.isActive : true,
      targetAudience: linkData.targetAudience || 'all',
      order: linkData.order || 0
    };
    
    // Add optional date fields if provided
    if (linkData.startDate) {
      formatted.startDate = linkData.startDate;
    }
    if (linkData.endDate) {
      formatted.endDate = linkData.endDate;
    }

    // Ensure icon is not empty — default it according to category to satisfy API validation
    if (!formatted.icon || formatted.icon.length === 0) {
      const defaultIcons = {
        'Academic': 'library',
        'Administrative': 'payment',
        'Events': 'calendar',
        'Student Services': 'help',
        'Library': 'library',
        'Research': 'research'
      };
      formatted.icon = defaultIcons[formatted.category] || 'external';
    }
    
    return formatted;
  }

  /**
   * Check if a link is currently active based on dates
   * @param {Object} link - Link object
   * @returns {boolean} Whether the link is currently active
   */
  static isLinkCurrentlyActive(link) {
    if (!link.isActive) return false;
    
    const now = new Date();
    
    if (link.startDate) {
      const startDate = new Date(link.startDate);
      if (now < startDate) return false;
    }
    
    if (link.endDate) {
      const endDate = new Date(link.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  }

  /**
   * Filter links by user role and target audience
   * @param {Array} links - Array of links
   * @param {string} userRole - User's role (admin, super_admin, student, etc.)
   * @returns {Array} Filtered links appropriate for user
   */
  static filterLinksByUserRole(links, userRole) {
    return links.filter(link => {
      if (link.targetAudience === 'all') return true;
      
      if (link.targetAudience === 'students') {
        return userRole === 'student';
      }
      
      if (link.targetAudience === 'admins') {
        return userRole === 'admin' || userRole === 'super_admin';
      }
      
      return false;
    });
  }
}

export default LinksService;

