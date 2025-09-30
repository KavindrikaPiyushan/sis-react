import {apiClient} from '../api.js';

// Admin-related services for managing results
export class ResultsService {
    // Fetch all modules/courses for lecturer
    async fetchAllModules() {
        try {
            const response = await apiClient.get('/course-offerings/lecturer/myCourses');
            return response.data;
        } catch (error) {
            console.error('Error fetching results:', error);
            throw error;
        }
    }

    // Get results for a specific course offering
    async getCourseResults(courseOfferingId) {
        try {
            const response = await apiClient.get(`/results/course-offering/${courseOfferingId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course results:', error);
            throw error;
        }
    }

    // Get course offering statistics
    async getCourseStatistics(courseOfferingId) {
        try {
            const response = await apiClient.get(`/results/course-offering/${courseOfferingId}/statistics`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course statistics:', error);
            throw error;
        }
    }

    // Create single result
    async createResult(resultData) {
        try {
            const response = await apiClient.post('/results', resultData);
            return response.data;
        } catch (error) {
            console.error('Error creating result:', error);
            throw error;
        }
    }

    // Bulk upload results
    async bulkUploadResults(resultsData) {
        try {
            const response = await apiClient.post('/results/bulk', {
                results: resultsData
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading bulk results:', error);
            throw error;
        }
    }

    // Get single result by ID
    async getResult(resultId) {
        try {
            const response = await apiClient.get(`/results/${resultId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching result:', error);
            throw error;
        }
    }

    // Update result
    async updateResult(resultId, updateData) {
        try {
            const response = await apiClient.put(`/results/${resultId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating result:', error);
            throw error;
        }
    }

    // Delete result
    async deleteResult(resultId) {
        try {
            const response = await apiClient.delete(`/results/${resultId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting result:', error);
            throw error;
        }
    }

    // Get students enrolled in a course offering
    async getEnrolledStudents(courseOfferingId) {
        try {
            const response = await apiClient.get(`/course-offerings/${courseOfferingId}/students`);
            return response.data;
        } catch (error) {
            console.error('Error fetching enrolled students:', error);
            throw error;
        }
    }

    // Get lecturer's results (for lecturer dashboard)
    async getLecturerResults() {
        try {
            const response = await apiClient.get('/results/lecturer/my-results');
            return response.data;
        } catch (error) {
            console.error('Error fetching lecturer results:', error);
            throw error;
        }
    }
}

