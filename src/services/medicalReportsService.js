import api from './api';
import FileService from './common/fileService';

class MedicalReportsService {
	// 1. Upload Medical Report Attachments
	static async uploadAttachments(files) {
		try {
			const response = await FileService.uploadFiles(files, 'medical-report');
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to upload attachments'
			};
		}
	}

	// 2. Submit Medical Report
	static async submitReport({ classSessionId, reason, description, attachments, studentId }) {
		try {
			const payload = { classSessionId, reason, description, attachments, studentId };
			const response = await api.post('/medical-reports', payload);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to submit medical report'
			};
		}
	}

	// 3. Update Medical Report (Pending Only)
	static async updateReport(reportId, { reason, description, attachments }) {
		try {
			const response = await api.put(`/medical-reports/${reportId}`, {
				reason,
				description,
				attachments,
			});
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to update medical report'
			};
		}
	}

	// 4. Review Medical Report (Admin)
	static async reviewReport(reportId, { status, reviewNotes }) {
		try {
			const response = await api.put(`/medical-reports/${reportId}/review`, {
				status,
				reviewNotes,
			});
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to review medical report'
			};
		}
	}

	// 5. Get Medical Reports by Student
	static async getReportsByStudent(studentId, classSessionId) {
		try {
			const response = await api.get(`/medical-reports/student/${studentId}`, {
				params: { classSessionId }
			});
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to get medical reports by student'
			};
		}
	}

	// 6. Get All Medical Reports (Admin)
	static async getAllReports() {
		try {
			const response = await api.get('/medical-reports/admin/course-offerings');
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to get all medical reports'
			};
		}
	}

	// Download file (using shared FileService)
	// pass id of attachment as fileId
	static async downloadFile(fileId, fileName) {
		try {
			const response = await FileService.downloadFile(fileId, fileName);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to download file'
			};
		}
	}

	// Delete Medical Report
		static async deleteReport(reportId) {
			try {
				const response = await api.delete(`/medical-reports/${reportId}`);
				return response;
			} catch (error) {
				return {
					success: false,
					message: error.message || 'Failed to delete medical report'
				};
			}
		}
    
	//pass id of attachment as fileId
	static async deleteAttachment(fileId) {
		try {
			const response = await api.delete(`/medical-reports/attachments/${fileId}`);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to delete attachment'
			};
		}
	}

	static async getStudentSummary(studentId) {
		try {
			const response = await api.get(`/medical-reports/student/summary`);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to get student medical report summary'
			};
		}
	}

	static async getAdminSummary() {
		try {
			const response = await api.get(`/medical-reports/lecturer/summary`);
			return response;
		} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to get admin medical report summary'
			};
		}
	}

}

export default MedicalReportsService;


