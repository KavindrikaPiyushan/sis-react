import { apiClient } from '../api.js';

export class AdminPaymentsService {
  /**
   * List payments with query params: page, perPage, q, status, startDate, endDate
   */
  static async listPayments(params = {}) {
    try {
      const response = await apiClient.get('/admin/payments', { params });
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to list payments';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Get single payment details
   */
  static async getPayment(paymentId) {
    try {
      if (!paymentId) return { success: false, message: 'paymentId is required' };
      const response = await apiClient.get(`/admin/payments/${paymentId}`);
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to fetch payment';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Download an attachment. Accepts either a full url path or a relative path from the API.
   * Returns { success:true, blob, filename } on success.
   */
  static async downloadAttachment({ paymentId, attachmentUrl, attachmentFilename }) {
    try {
      if (!attachmentUrl && !paymentId && !attachmentFilename) return { success: false, message: 'attachmentUrl or paymentId/filename is required' };

      // Use attachmentUrl if provided, otherwise construct attachments path using filename
      let path;
      if (attachmentUrl) {
        path = attachmentUrl;
      } else if (paymentId && attachmentFilename) {
        // Construct path matching server route for attachments
        const fn = encodeURIComponent(attachmentFilename);
        path = `/api/admin/payments/${paymentId}/attachments/${fn}`;
      } else {
        path = `/admin/payments/${paymentId}/slip`;
      }

      let fullUrl;
      if (/^https?:\/\//i.test(path)) {
        fullUrl = path;
      } else if (path.startsWith('/')) {
        try {
          const origin = new URL(apiClient.baseURL).origin;
          fullUrl = `${origin}${path}`;
        } catch (e) {
          const base = apiClient.baseURL.replace(/\/+$|\/$/g, '');
          const p = path.replace(/^\/+/, '');
          fullUrl = `${base}/${p}`;
        }
      } else {
        const base = apiClient.baseURL.replace(/\/+$/, '');
        const p = path.replace(/^\/+/, '');
        fullUrl = `${base}/${p}`;
      }

      const resp = await fetch(fullUrl, { method: 'GET', credentials: 'include', headers: { Accept: '*/*' } });
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
      return { success: false, message: error.message || 'Failed to download attachment' };
    }
  }

  /**
   * Update payment status (approve/reject/need_more_info)
   * Body: { action: 'approve'|'reject'|'need_more_info', remarks?: string }
   */
  static async updatePaymentStatus(paymentId, body = {}) {
    try {
      if (!paymentId) return { success: false, message: 'paymentId is required' };
      const response = await apiClient.request(`/admin/payments/${paymentId}`, {
        method: 'PATCH',
        body,
      });
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to update payment status';
      return { success: false, message: msg, status: error.status };
    }
  }

  /**
   * Delete a payment (only allowed when status is pending or need_more_info)
   * DELETE /admin/payments/:paymentId
   * Returns { success: true } on 204
   */
  static async deletePayment(paymentId) {
    try {
      if (!paymentId) return { success: false, message: 'paymentId is required' };
      const response = await apiClient.delete(`/admin/payments/${paymentId}`);
      // apiClient returns { success: true } for 204 per ApiClient implementation
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to delete payment';
      return { success: false, message: msg, status: error.status, data: error.data };
    }
  }

  static async getPaymentStats() {
    try {
      const response = await apiClient.get('/admin/payments/stats');
      return response;
    } catch (error) {
      const msg = (error && error.data && error.data.message) ? error.data.message : (error && error.message) || 'Failed to fetch payment stats';
      return { success: false, message: msg, status: error.status };
    }
  }
  
}

export default AdminPaymentsService;
