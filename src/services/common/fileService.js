import { apiClient } from '../api.js';

// Common file operations that can be used by both admin and student services
export class FileService {
  // Download file - generic function for all user types
  static async downloadFile(fileId, fileName) {
    try {
      const response = await apiClient.get(`/files/download/${fileId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to download file' 
      };
    }
  }

  // Upload files - generic function for all user types
  static async uploadFiles(files, type = 'attachment') {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('type', type);

      const response = await apiClient.post('/files/upload', formData, {
        // Don't set Content-Type header - let browser set it with proper boundary
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can emit this to a store or callback
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to upload files' 
      };
    }
  }

  // Get file info
  static async getFileInfo(fileId) {
    try {
      const response = await apiClient.get(`/files/${fileId}`);
      return response;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to fetch file info' 
      };
    }
  }

  // Utility function to format file size
  static formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Check if file is an image
  static isImageFile(mimeType) {
    return mimeType && mimeType.startsWith('image/');
  }
}

export default FileService;