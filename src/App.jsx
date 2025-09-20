import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAttendance from "./pages/admin/Attendance";
import AdminNotices from "./pages/admin/Notices";
import AdminResults from "./pages/admin/Results";
import PaymentApprovals from "./pages/admin/PaymentApprovals";
import MedicalApprovals from "./pages/admin/MedicalApprovals";
import SpecialLinks from "./pages/admin/SpecialLinks";
import Logs from "./pages/admin/Logs";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentNotices from "./pages/student/Notices";
import StudentResults from "./pages/student/Results";
import PaymentReceipts from "./pages/student/PaymentReceipts";
import MedicalReports from "./pages/student/MedicalReports";
import UsefulLinks from "./pages/student/UsefulLinks";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import StudentAccounts from "./pages/admin/StudentAccounts";
import AdminAccounts from "./pages/admin/AdminAccounts";
import CreateStudentAcc from "./pages/admin/CreateStudentAcc";
import StudentBulkAccounts from "./pages/admin/StudentBulkAccounts.jsx";
import CreateAdminAcc from "./pages/admin/CreateAdminAcc.jsx";
import AdminBulkAccounts from "./pages/admin/AdminBulkAccounts.jsx";


export default function App() {
  const location = useLocation();
  // Get role from localStorage or context
  const [role, setRole] = useState("admin");
  useEffect(() => {
    const handleStorage = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.role) {
        setRole(userData.role);
      }
    };
    handleStorage();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  // Hide Navbar/Sidebar on login and reset-password pages
  const hideNav =
    location.pathname === "/" ||
    location.pathname.startsWith("/reset-password");

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {!hideNav && <Navbar role={role} onMenuClick={handleMenuClick} />}
      {!hideNav && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          role={role}
        />
      )}
      <main className="w-full max-w-full">
        <Routes>
          <Route path="/" element={<Login setRole={setRole} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminLayout role={role} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="payment-approvals" element={<PaymentApprovals />} />
            <Route path="medical-approvals" element={<MedicalApprovals />} />
            <Route path="special-links" element={<SpecialLinks />} />
            <Route path="logs" element={<Logs />} />
            <Route path="admin-accounts" element={<AdminAccounts />} />
            <Route path="student-accounts" element={<StudentAccounts />} />
            <Route path="create-student-acc" element={<CreateStudentAcc />} />
            <Route path="bulk-import-students" element={<StudentBulkAccounts />} />
            <Route path="create-admin-acc" element={<CreateAdminAcc />} />
            <Route path="bulk-import-admins" element={<AdminBulkAccounts />} />
            
          </Route>
          <Route path="/student" element={<StudentLayout role={role} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="results" element={<StudentResults />} />{" "}
            <Route path="payment-receipts" element={<PaymentReceipts />} />
            <Route path="medical-reports" element={<MedicalReports />} />
            <Route path="useful-links" element={<UsefulLinks />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
