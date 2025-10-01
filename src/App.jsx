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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentAccounts from "./pages/admin/StudentAccounts";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import AdminAccounts from "./pages/admin/AdminAccounts";
import CreateStudentAcc from "./pages/admin/CreateStudentAcc";
import StudentBulkAccounts from "./pages/admin/StudentBulkAccounts.jsx";
import CreateAdminAcc from "./pages/admin/CreateAdminAcc.jsx";
import AdminBulkAccounts from "./pages/admin/AdminBulkAccounts.jsx";
import CreateCourseOffering from "./pages/admin/CreateCourseOffering.jsx";  
import CreateBatch from "./pages/admin/CreateBatch.jsx";
import CreateSubject from "./pages/admin/CreateSubject.jsx";

export default function App() {
  // Global confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Show confirm dialog
  const showConfirm = (title, message, onConfirm) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmCallback(() => onConfirm);
    setConfirmOpen(true);
  };
  // Hide confirm dialog
  const hideConfirm = () => {
    setConfirmOpen(false);
    setConfirmTitle("");
    setConfirmMessage("");
    setConfirmCallback(null);
  };
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
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={() => {
          if (confirmCallback) confirmCallback();
          hideConfirm();
        }}
        onCancel={hideConfirm}
      />
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
            <Route path="results" element={<AdminResults showConfirm={showConfirm} />} />
            <Route path="payment-approvals" element={<PaymentApprovals />} />
            <Route path="medical-approvals" element={<MedicalApprovals />} />
            <Route path="special-links" element={<SpecialLinks />} />
            <Route path="logs" element={<Logs />} />
            <Route path="admin-accounts" element={<AdminAccounts />} />
            <Route path="student-accounts" element={<StudentAccounts showConfirm={showConfirm} />} />
            <Route path="create-student-acc" element={<CreateStudentAcc />} />
            <Route path="bulk-import-students" element={<StudentBulkAccounts />} />
            <Route path="create-admin-acc" element={<CreateAdminAcc />} />
            <Route path="bulk-import-admins" element={<AdminBulkAccounts />} />
            <Route path="create-course-offering" element={<CreateCourseOffering />} />
            <Route path="create-batch" element={<CreateBatch />} />
            <Route path="create-subject" element={<CreateSubject />} />
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