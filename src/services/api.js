// Base API configuration
// const API_BASE_URL = 'https://sis-express-production.up.railway.app/api';
const API_BASE_URL = 'http://localhost:3000/api';

// Create a base API client with common configuration
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    let headers = { ...options.headers };
    let body = options.body;

    // If body is FormData, do not set Content-Type and do not stringify
    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      if (body && typeof body === 'object') {
        body = JSON.stringify(body);
      }
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
      body,
    };

    try {
      const response = await fetch(url, config);
      let data;
      
      // Check if response has content before trying to parse JSON
      if (response.status === 204) {
        // 204 No Content - successful response with no body
        data = { success: true }; // Return a success indicator
      } else if (response.headers.get('content-length') === '0') {
        // Empty response
        data = { success: true };
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (jsonError) {
            // Handle malformed JSON
            console.warn('Failed to parse JSON response:', jsonError);
            data = { success: true }; // Assume success if response is ok but JSON is malformed
          }
        } else {
          // Non-JSON response
          const text = await response.text();
          if (text) {
            data = { success: false, message: text };
          } else {
            data = { success: true };
          }
        }
      }

      // Global invalid token handling
      if (data && data.success === false && data.message === 'Invalid token') {
        import('./authService').then(mod => {
          mod.default.logout();
        });
        window.location.href = '/';
        return data;
      }

      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
