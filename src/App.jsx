import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAttendance from "./pages/admin/Attendance";
import AdminNotices from "./pages/admin/Notices";
import AdminResults from "./pages/admin/Results";
import PaymentApprovals from "./pages/admin/PaymentApprovals";
import MedicalApprovals from "./pages/admin/MedicalApprovals";
import Hyperlinks from "./pages/admin/Hyperlinks";
import Logs from "./pages/admin/Logs";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentNotices from "./pages/student/Notices";
import StudentResults from "./pages/student/Results";
import PaymentReceipts from "./pages/student/PaymentReceipts";
import MedicalReports from "./pages/student/MedicalReports";
import UsefulLinks from "./pages/student/UsefulLinks";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="payment-approvals" element={<PaymentApprovals />} />
        <Route path="medical-approvals" element={<MedicalApprovals />} />
        <Route path="hyperlinks" element={<Hyperlinks />} />
        <Route path="logs" element={<Logs />} />
      </Route>
      
      <Route 
        path="/student" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="notices" element={<StudentNotices />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="payment-receipts" element={<PaymentReceipts />} />
        <Route path="medical-reports" element={<MedicalReports />} />
        <Route path="useful-links" element={<UsefulLinks />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}