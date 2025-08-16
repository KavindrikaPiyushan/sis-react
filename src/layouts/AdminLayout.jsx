import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";



export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="mx-auto  flex  justify-start">
        <Sidebar /> 
        <div className="w-[250px]"></div>
        <section className="flex-1 space-y-6 px-8 py-6 ">
         
          <Outlet />
        </section>
      </main>
    </div>
  );
}
