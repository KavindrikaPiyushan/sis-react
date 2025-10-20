import { apiClient } from './api.js';

export class DashboardService {
    // Get Dashboard Summary Data for students
    static async getStudentDashboardSummary() {
        try {
            const response = await apiClient.get('/dashboard/student');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get student dashboard summary'
            };
        }
    }

    // Get Dashboard Summary Data for lecturers
    static async getLecturerDashboardSummary() {
        try {
            const response = await apiClient.get('/dashboard/lecturer');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get lecturer dashboard summary'
            };
        }
    }

}

export default DashboardService;