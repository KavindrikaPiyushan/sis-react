import { apiClient } from '../api';

export class StudentPaymentsService {
  /**
   * Upload a payment slip and create payment record
   * @param {FormData} formData - multipart/form-data with fields and file
   * @param {function} onUploadProgress - optional progress callback(progressEvent)
   */
  static async uploadPayment(formData, onUploadProgress) {
    try {
      const response = await apiClient.post('/students/me/payments', formData, {
        // Don't set Content-Type when sending FormData
        headers: {},
        // Pass through upload progress callback if apiClient supports it
        onUploadProgress,
      });
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to upload payment' };
    }
  }

  /**
   * Fetch payment-related notifications for the authenticated student
   * GET /students/me/notifications/payments
   */
  static async getPaymentNotifications() {
    try {
      const response = await apiClient.get('/students/me/notifications/payments');
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to fetch notifications';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Get fee breakdown for the authenticated student for a semester
   * @param {string} semester
   */
  static async getFees(semester) {
    try {
      if (!semester) {
        return { success: false, errors: { semester: 'Semester is required' } };
      }
      const response = await apiClient.get('/students/me/fees', { params: { semester } });
      return response;
    } catch (error) {
      return { success: false, message: error.message || 'Failed to fetch fees' };
    }
  }

  /**
   * Get payment history for the authenticated student
   * @param {object} params - query params: page, perPage, q, status, startDate, endDate, semester
   */
  static async getPayments(params = {}) {
    try {
      const response = await apiClient.get('/students/me/payments', { params });
      return response;
    } catch (error) {
      // If apiClient attached response data, prefer that message
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to fetch payments';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Get single payment details
   * @param {string} paymentId
   */
  static async getPayment(paymentId) {
    try {
      if (!paymentId) return { success: false, message: 'paymentId is required' };
      const response = await apiClient.get(`/students/me/payments/${paymentId}`);
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to fetch payment';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Download slip as blob by paymentId or direct slipUrl
   * Returns { blob, filename }
   */
  static async downloadSlip({ paymentId, slipUrl }) {
    try {
      const path = slipUrl || `/students/me/payments/${paymentId}/slip`;
      // If slipUrl is absolute (starts with http), use it directly
      let fullUrl;
      if (/^https?:\/\//i.test(path)) {
        fullUrl = path;
      } else if (path.startsWith('/')) {
        // Path is an absolute path on the same origin (e.g. '/api/...')
        // Use the origin from the apiClient.baseURL to avoid duplicating the '/api' segment
        try {
          const origin = new URL(apiClient.baseURL).origin;
          fullUrl = `${origin}${path}`;
        } catch (e) {
          // Fallback to simple join
          const base = apiClient.baseURL.replace(/\/+$/, '');
          const p = path.replace(/^\/+/, '');
          fullUrl = `${base}/${p}`;
        }
      } else {
        // Relative path (no leading slash) — join with baseURL
        const base = apiClient.baseURL.replace(/\/+$/, '');
        const p = path.replace(/^\/+/, '');
        fullUrl = `${base}/${p}`;
      }
      const resp = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: '*/*' },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => null);
        return { success: false, message: text || `HTTP ${resp.status}` };
      }

      const contentDisposition = resp.headers.get('content-disposition');
      let filename = null;
      if (contentDisposition) {
        const m = /filename\*=UTF-8''(.+)$/.exec(contentDisposition);
        if (m && m[1]) {
          filename = decodeURIComponent(m[1]);
        } else {
          const m2 = /filename="?([^";]+)"?/.exec(contentDisposition);
          if (m2 && m2[1]) filename = m2[1];
        }
      }

      const blob = await resp.blob();
      return { success: true, blob, filename };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to download slip' };
    }
  }

  /**
   * Delete a payment (only allowed for pending/unverified by server)
   * Returns { success:true } on 204 or { success:false, message }
   */
  static async deletePayment(paymentId) {
    try {
      if (!paymentId) return { success: false, message: 'paymentId is required' };
      const response = await apiClient.delete(`/students/me/payments/${paymentId}`);
      // apiClient returns { success: true } for 204
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to delete payment';
      return { success: false, message: msg, status: error.status };
    }
  }
}

export default StudentPaymentsService;