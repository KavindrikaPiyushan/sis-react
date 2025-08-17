import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/attendance", label: "Attendance" },
  { to: "/student/notices", label: "Notices" },
  { to: "/student/results", label: "Results" },
  { to: "/student/payment-receipts", label: "Payment Receipts" },
  { to: "/student/medical-reports", label: "Medical Reports" },
  { to: "/student/useful-links", label: "Useful Links" },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="app-shell w-full max-w-full overflow-x-hidden">
      <Navbar role="student" onMenuClick={handleMenuClick} />
      <main className="flex justify-start w-full max-w-full">
        <Sidebar role="student" isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="hidden lg:block w-[250px]"></div>
        <section className="flex-1 space-y-6 px-4 sm:px-8 py-6 w-full max-w-full overflow-y-auto min-h-[calc(100vh-56px)]">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
