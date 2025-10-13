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
import Logs from "./pages/admin/Logs";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAttendance from "./pages/student/Attendance";
import StudentNotices from "./pages/student/Notices";
import StudentResults from "./pages/student/Results";
import PaymentReceipts from "./pages/student/PaymentReceipts";
import MedicalReports from "./pages/student/MedicalReports";
import SpecialLinks from "./pages/admin/SpecialLinks";
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
import DegreeProgrameCreation from "./pages/admin/DegreeProgrameCreation.jsx";
import Unauthorized from "./pages/Unauthorized";
import CreatingClasses from "./pages/admin/CreatingClasses.jsx";
import RegisteredCourses from "./pages/student/RegisteredCourses.jsx";
import RegisterForNewCourse from "./pages/student/RegisterForNewCourse.jsx";
import { NoticesProvider } from "./contexts/NoticesContext";
import { SpecialLinksProvider } from "./contexts/SpecialLinksContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
    <SpecialLinksProvider>
      <NoticesProvider>
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
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <AdminLayout role={role} />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              {/* Shared: Dashboard */}
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              {/* Admin only: Academic Management */}
              <Route path="attendance" element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminAttendance />
                </ProtectedRoute>
              } />
              <Route path="results" element={
                <ProtectedRoute allowedRoles="admin">
                  <AdminResults showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              {/* Admin only: Creating Classes */}
              <Route path="creating-classes" element={
                <ProtectedRoute allowedRoles="admin">
                  <CreatingClasses showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              {/* Admin only: Medical Approvals */}
              <Route path="medical-approvals" element={
                <ProtectedRoute allowedRoles="admin">
                  <MedicalApprovals />
                </ProtectedRoute>
              } />
              {/* Super Admin only: User Accounts */}
              <Route path="student-accounts" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <StudentAccounts showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="admin-accounts" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <AdminAccounts showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              {/* Super Admin only: Bulk/Creation */}
              <Route path="create-student-acc" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <CreateStudentAcc />
                </ProtectedRoute>
              } />
              <Route path="bulk-import-students" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <StudentBulkAccounts showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="create-admin-acc" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <CreateAdminAcc showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="bulk-import-admins" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <AdminBulkAccounts showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              {/* Super Admin only: Course Offerings */}
              <Route path="create-course-offering" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <CreateCourseOffering showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="create-batch" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <CreateBatch showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="create-subject" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <CreateSubject showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              <Route path="degree-program-creation" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <DegreeProgrameCreation showConfirm={showConfirm} />
                </ProtectedRoute>
              } />
              {/* Super Admin only: Payment Approvals */}
              <Route path="payment-approvals" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <PaymentApprovals />
                </ProtectedRoute>
              } />
              {/* Shared: Notices, Special Links */}
              <Route path="notices" element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminNotices />
                </ProtectedRoute>
              } />
              <Route path="special-links" element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <SpecialLinks />
                </ProtectedRoute>
              } />
              {/* Super Admin only: System Logs */}
              <Route path="logs" element={
                <ProtectedRoute allowedRoles="super_admin">
                  <Logs />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/student" element={
              <ProtectedRoute allowedRoles="student">
                <StudentLayout role={role} />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="notices" element={<StudentNotices />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="payment-receipts" element={<PaymentReceipts />} />
              <Route path="medical-reports" element={<MedicalReports />} />
              <Route path="special-links" element={<SpecialLinks />} />
              <Route path="registered-courses" element={<RegisteredCourses />} />
              <Route path="register-for-new-course" element={<RegisterForNewCourse />} />
            </Route>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>
      </NoticesProvider>
    </SpecialLinksProvider>
  );
}