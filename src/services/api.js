// Base API configuration
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
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
