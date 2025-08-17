
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout({ role }) {
  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="app-shell w-full max-w-full overflow-x-hidden">
      <Navbar role={role} onMenuClick={handleMenuClick} />
      <main className="flex justify-start w-full max-w-full">
        <Sidebar role={role} isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <div className="hidden lg:block w-[250px]"></div>
        <section className="flex-1 space-y-6 px-4 sm:px-8 py-6 w-full max-w-full overflow-y-auto min-h-[calc(100vh-56px)]">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
