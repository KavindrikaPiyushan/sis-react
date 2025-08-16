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
  return (
    <div className="app-shell">
      <Navbar title="SIS • Student" />
      <main className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <Sidebar links={studentLinks} />
        <section className="flex-1 space-y-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
