// Base API configuration
// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create a base API client with common configuration
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    // Build URL and attach query params (if provided).
    let url = `${this.baseURL}${endpoint}`;

    // Support passing `params` similar to axios: an object of key->value or arrays.
    const params = options.params;
    if (params && typeof params === 'object') {
      const usp = new URLSearchParams();
      Object.keys(params).forEach((k) => {
        const v = params[k];
        if (v === null || typeof v === 'undefined' || v === '') return; // skip empty
        if (Array.isArray(v)) {
          v.forEach(item => usp.append(k, String(item)));
        } else {
          usp.append(k, String(v));
        }
      });
      const q = usp.toString();
      if (q) {
        // If endpoint already contains ? keep it and append with &
        url += (url.includes('?') ? '&' : '?') + q;
      }
    }

    let headers = { ...options.headers };
    let body = options.body;

    // If body is FormData, do not set Content-Type and do not stringify
    const isFormData = body instanceof FormData;
    // Only set Content-Type and stringify body when there actually is a body
    if (body != null && !isFormData) {
      headers['Content-Type'] = 'application/json';
      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }
    }

    // Remove params from config passed to fetch (we already serialized them)
    const { params: _p, ...fetchOptions } = options;

    const config = {
      ...fetchOptions,
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
