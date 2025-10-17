import {apiClient} from '../api.js';

export class StudentService {
//   // Get student GPA
//   static async getStudentGPA() {    
//     try {
//       const response = await apiClient.get('/students/gpa');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching student GPA:', error);
//       throw error;
//     }
//   }

//   // Get student attendance
//   static async getStudentAttendance() {
//     try {
//       const response = await apiClient.get('/students/attendance');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching student attendance:', error);
//       throw error;
//     }
//   }


    // Get enrolled courses
    static async getEnrolledCourses() {
      try {
        const response = await apiClient.get('/course-offerings/student/myCourses/light');
        return response.data;
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
      }
    }

    // Get available courses for batch
    static async getAvailableCoursesForBatch() {
      try {
        const response = await apiClient.get('/course-offerings/student/batchAvailable');
        return response.data;
      } catch (error) {
        console.error('Error fetching available courses for batch:', error);
        throw error;
      }
    }

    // Request course enrollment
    static async requestCourseEnrollment(courseOfferingId) {
      try {
        const response = await apiClient.post('/enrollments/request', {
          courseOfferingId
        });
        return response;
      } catch (error) {
        console.error('Error requesting course enrollment:', error);
        throw error;
      }
    }   
}
export default StudentService;