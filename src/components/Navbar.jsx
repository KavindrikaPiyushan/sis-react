import { Link } from "react-router-dom";

export default function Navbar({ title = "SIS" }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold">{title}</Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <Link to="/student/dashboard" className="hover:underline">Student</Link>
          <Link to="/admin/dashboard" className="hover:underline">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
