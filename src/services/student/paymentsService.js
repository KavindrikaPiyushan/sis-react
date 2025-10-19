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
}

export default StudentPaymentsService;
