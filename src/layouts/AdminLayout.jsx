import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";



export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto px-4 py-6 flex gap-6">
        <Sidebar  className = "!border-r !border-[#E0E0E0] hidden"/>
        <section className="flex-1 space-y-6 ">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
