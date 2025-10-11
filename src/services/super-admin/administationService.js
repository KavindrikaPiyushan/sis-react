import { apiClient } from '../api.js';

// Super Admin Administration Services
export class AdministrationService {

    // Fetch all faculties
    static async fetchAllFaculties() {
        try {
            const response = await apiClient.get('/faculties');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    }

    // ===== DEPARTMENT OPERATIONS =====

    // Fetch all departments
    static async fetchAllDepartments() {
        try {
            const response = await apiClient.get('/departments');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    }

    // Create a new department
    static async createDepartment(departmentData) {
        try {
            const response = await apiClient.post('/departments', departmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating department:', error);
            throw error;
        }
    }

    // Get department by ID
    static async getDepartmentById(id) {
        try {
            const response = await apiClient.get(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching department:', error);
            throw error;
        }
    }

    // Update department
    static async updateDepartment(id, departmentData) {
        try {
            const response = await apiClient.put(`/departments/${id}`, departmentData);
            return response.data;
        } catch (error) {
            console.error('Error updating department:', error);
            throw error;
        }
    }

    // Delete department
    static async deleteDepartment(id) {
        try {
            const response = await apiClient.delete(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting department:', error);
            throw error;
        }
    }

    // ===== DEGREE PROGRAM OPERATIONS =====

    // Get all degree programs
    static async fetchAllDegreePrograms(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.search !== undefined && filters.search !== null) params.append('search', filters.search);

            const callerOptions = filters.options || {};
            const fetchOptions = { ...callerOptions };
            // if search is provided, prefer no-store to avoid stale cached results
            if (filters.search !== undefined && filters.search !== null) {
                if (fetchOptions.cache === undefined) fetchOptions.cache = 'no-store';
            }

            const endpoint = `/degree-programs${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiClient.get(endpoint, fetchOptions);
            // Return the full response so callers can access both data and meta/pagination info
            return response;
        } catch (error) {
            console.error('Error fetching degree programs:', error);
            throw error;
        }
    }

    // Create degree program
    static async createDegreeProgram(programData) {
        try {
            const response = await apiClient.post('/degree-programs', programData);
            return response.data;
        } catch (error) {
            console.error('Error creating degree program:', error);
            throw error;
        }
    }

    // Get degree program by ID
    static async getDegreeProgramById(id) {
        try {
            const response = await apiClient.get(`/degree-programs/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching degree program:', error);
            throw error;
        }
    }

    // Update degree program
    static async updateDegreeProgram(id, programData) {
        try {
            const response = await apiClient.put(`/degree-programs/${id}`, programData);
            return response.data;
        } catch (error) {
            console.error('Error updating degree program:', error);
            throw error;
        }
    }

    // Delete degree program
    static async deleteDegreeProgram(id) {
        try {
            const response = await apiClient.delete(`/degree-programs/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting degree program:', error);
            throw error;
        }
    }

    // ===== BATCH OPERATIONS =====

    // Get all batches
    static async fetchAllBatches(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.search !== undefined && filters.search !== null && String(filters.search).trim() !== '') {
                params.append('search', filters.search);
            }

            const endpoint = `/batches${params.toString() ? `?${params.toString()}` : ''}`;
            // Allow caller to pass fetch options (e.g., cache control)
            const callerOptions = filters.options || {};
            const response = await apiClient.get(endpoint, callerOptions);
            // Return full response so caller can read data and meta (pagination)
            return response;
        } catch (error) {
            console.error('Error fetching batches:', error);
            throw error;
        }
    }

    // Create batch
    static async createBatch(batchData) {
        try {
            const response = await apiClient.post('/batches', batchData);
            return response.data;
        } catch (error) {
            console.error('Error creating batch:', error);
            throw error;
        }
    }

    // Get batch by ID
    static async getBatchById(id) {
        try {
            const response = await apiClient.get(`/batches/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching batch:', error);
            throw error;
        }
    }

    // Update batch
    static async updateBatch(id, batchData) {
        try {
            const response = await apiClient.put(`/batches/${id}`, batchData);
            return response.data;
        } catch (error) {
            console.error('Error updating batch:', error);
            throw error;
        }
    }

    // Delete batch
    static async deleteBatch(id) {
        try {
            const response = await apiClient.delete(`/batches/${id}`);
            // For 204 No Content, response will be null/undefined, which is success
            return response; // Return the response itself, not response.data
        } catch (error) {
            console.error('Error deleting batch:', error);
            throw error;
        }
    }

    // ===== SEMESTER OPERATIONS =====

    // Get all semesters
    static async fetchAllSemesters() {
        try {
            const response = await apiClient.get('/semesters');
            return response.data;
        } catch (error) {
            console.error('Error fetching semesters:', error);
            throw error;
        }
    }

    // Get semesters by batch ID
    static async fetchSemestersByBatchId(batchId) {
        try {
            const response = await apiClient.get(`/semesters/batch/${batchId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching semesters by batch ID:', error);
            throw error;
        }
    }

    // Create semester
    static async createSemester(semesterData) {
        try {
            const response = await apiClient.post('/semesters', semesterData);
            return response.data;
        } catch (error) {
            console.error('Error creating semester:', error);
            throw error;
        }
    }

    // Get semester by ID
    static async getSemesterById(id) {
        try {
            const response = await apiClient.get(`/semesters/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching semester:', error);
            throw error;
        }
    }

    // Update semester
    static async updateSemester(id, semesterData) {
        try {
            const response = await apiClient.put(`/semesters/${id}`, semesterData);
            return response.data;
        } catch (error) {
            console.error('Error updating semester:', error);
            throw error;
        }
    }

    // Delete semester
    static async deleteSemester(id) {
        try {
            const response = await apiClient.delete(`/semesters/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting semester:', error);
            throw error;
        }
    }

    // ===== SUBJECT OPERATIONS =====

    // Get all subjects (supports pagination filters)
    static async fetchAllSubjects(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.search !== undefined && filters.search !== null && String(filters.search).trim() !== '') {
                params.append('search', filters.search);
            }

            const endpoint = `/subjects${params.toString() ? `?${params.toString()}` : ''}`;
            const callerOptions = filters.options || {};
            const response = await apiClient.get(endpoint, callerOptions);
            // Return full response so callers can access data and meta/pagination info
            return response;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            throw error;
        }
    }

    // Create subject
    static async createSubject(subjectData) {
        try {
            const response = await apiClient.post('/subjects', subjectData);
            return response.data;
        } catch (error) {
            console.error('Error creating subject:', error);
            throw error;
        }
    }

    // Get subject by ID
    static async getSubjectById(id) {
        try {
            const response = await apiClient.get(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subject:', error);
            throw error;
        }
    }

    // Update subject
    static async updateSubject(id, subjectData) {
        try {
            const response = await apiClient.put(`/subjects/${id}`, subjectData);
            return response.data;
        } catch (error) {
            console.error('Error updating subject:', error);
            throw error;
        }
    }

    // Delete subject
    static async deleteSubject(id) {
        try {
            const response = await apiClient.delete(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting subject:', error);
            throw error;
        }
    }

    // ===== COURSE OFFERING OPERATIONS =====

    // Get all course offerings
    static async fetchAllCourseOfferings() {
        try {
            const response = await apiClient.get('/course-offerings');
            return response.data;
        } catch (error) {
            console.error('Error fetching course offerings:', error);
            throw error;
        }
    }

    // Create course offering
    static async createCourseOffering(offeringData) {
        try {
            const response = await apiClient.post('/course-offerings', offeringData);
            return response.data;
        } catch (error) {
            console.error('Error creating course offering:', error);
            throw error;
        }
    }

    // Get course offerings by lecturer ID
    static async getCourseOfferingsByLecturerId(lecturerId) {
        try {
            const response = await apiClient.get(`/course-offerings?lecturerId=${lecturerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course offerings by lecturer ID:', error);
            throw error;
        }
    }

    // Get course offering by ID
    static async getCourseOfferingById(id) {
        try {
            const response = await apiClient.get(`/course-offerings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course offering:', error);
            throw error;
        }
    }

    // Update course offering
    static async updateCourseOffering(id, offeringData) {
        try {
            const response = await apiClient.put(`/course-offerings/${id}`, offeringData);
            return response.data;
        } catch (error) {
            console.error('Error updating course offering:', error);
            throw error;
        }
    }

    // Delete course offering
    static async deleteCourseOffering(id) {
        try {
            const response = await apiClient.delete(`/course-offerings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting course offering:', error);
            throw error;
        }
    }

    // ===== LECTURERS OPERATIONS =====

    // Get all lecturers (admins with lecturer role)
    static async fetchAllLecturers() {
        try {
            const response = await apiClient.get('/users/admins');
            // Extract lecturers array from the response structure
            return response.data?.lecturers || [];
        } catch (error) {
            console.error('Error fetching lecturers:', error);
            throw error;
        }
    }
}

export default AdministrationService;