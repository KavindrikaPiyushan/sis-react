import {apiClient} from './api.js';

export class AttendenceService {
	// 1. Create Single Attendance Record (Admin)
	static async createAttendance(data) {
		try {
			const response = await apiClient.post('/attendance', data);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to create attendance record'
			};
		}
	}

	// 2. Bulk Create Attendance Records (Admin)
	static async bulkCreateAttendance(attendanceRecords) {
		try {
			const response = await apiClient.post('/attendance/bulk', { attendanceRecords });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to bulk create attendance records'
			};
		}
	}

	// 3. Update Attendance Record (Admin)
	static async updateAttendance(id, data) {
		try {
			const response = await apiClient.put(`/attendance/${id}`, data);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to update attendance record'
			};
		}
	}

	static async deleteAttendance(id) {
		try {
			const response = await apiClient.delete(`/attendance/${id}`);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to delete attendance record'
			};
		}
	}


	// Deletes multiple attendance records by their IDs
	static async bulkDeleteAttendance(attendanceIds) {
		try {
			const response = await apiClient.post('/attendance/bulk-delete', { attendanceIds });	
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to bulk delete attendance records'
			};
		}
	}

	// 4. Get All Attendance Records (Admin, with filters)
	// Accepts either an object of params or a query string. Empty/null/undefined values are removed
	// so that only provided parameters are sent to the API.
	static async getAllAttendance(params = {}) {
		console.log('Initial params:', params);
		try {
			// If params is a string like "a=1&b=2", parse it into an object
			let paramObj = {};
			if (typeof params === 'string') {
				// Use URLSearchParams to parse the query string
				const usp = new URLSearchParams(params);
				for (const [k, v] of usp.entries()) {
					paramObj[k] = v;
				}
			} else if (typeof params === 'object' && params !== null) {
				paramObj = { ...params };
			}

			// Remove keys with empty string, null or undefined values
			Object.keys(paramObj).forEach(key => {
				const val = paramObj[key];
				if (val === '' || val === null || typeof val === 'undefined') {
					delete paramObj[key];
				}
			});

			// Debug log
			console.log('Fetching attendance with params:', paramObj);

			const response = await apiClient.get('/attendance', { params: paramObj });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch attendance records'
			};
		}
	}

	// 5. Get My Attendance (Student)
	static async getMyAttendanceAcrossOfferings(params = {}) {
		try {
			const response = await apiClient.get('/attendance/me/offerings-stats', { params });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch your attendance records'
			};
		}
	}


    static async getMyAttendanceForOffering(offeringId, params = {}) {
		try {
			const response = await apiClient.get(`/attendance/me/offerings/${offeringId}/sessions`, { params });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch your attendance records for this offering'
			};
		}
	}

	// 6. Get My Attendance Statistics (Student)
	static async getMyAttendanceStats(params = {}) {
		try {
			const response = await apiClient.get('/attendance/me/stats', { params });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch your attendance statistics'
			};
		}
	}

	// 7. Get Student Attendance (Admin)
	static async getStudentAttendance(studentId, params = {}) {
		try {
			const response = await apiClient.get(`/attendance/student/${studentId}`, { params });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch student attendance records'
			};
		}
	}

	// 8. Get Student Attendance Statistics (Admin)
	static async getStudentAttendanceStats(studentId, params = {}) {
		try {
			const response = await apiClient.get(`/attendance/student/${studentId}/stats`, { params });
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch student attendance statistics'
			};
		}
	}

	// 9. Get Course Offering Statistics (Admin)
	static async getAdminCourseOfferingStats() {
		try {
			const response = await apiClient.get('/attendance/admin/course-offerings/stats');
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to fetch course offering statistics'
			};
		}
	}
}
export default AttendenceService;