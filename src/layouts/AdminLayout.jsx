import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/notices", label: "Notices" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/payment-approvals", label: "Payment Approvals" },
  { to: "/admin/medical-approvals", label: "Medical Approvals" },
  { to: "/admin/hyperlinks", label: "Useful Links" },
  { to: "/admin/logs", label: "Logs" },
];

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar title="SIS • Admin" />
      <main className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <Sidebar links={adminLinks} />
        <section className="flex-1 space-y-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
