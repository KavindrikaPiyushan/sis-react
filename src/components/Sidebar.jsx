import { NavLink } from "react-router-dom";

export default function Sidebar({ links = [] }) {
  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-20 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
