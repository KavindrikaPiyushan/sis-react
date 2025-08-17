import React, { useEffect, useState } from 'react';
import { Bell, GraduationCap, FileText, Calendar, Activity, BarChart3, School, Medal, CalendarCheck, Megaphone, Link2, X } from 'lucide-react';


export default function Sidebar({ isOpen, onClose, role }) {
  // Responsive: detect if screen is desktop (lg and up)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Get role from localStorage if not provided
  if (!role) {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.role) role = userData.role;
    } catch { }
    if (!role) role = "admin";
  }
  // Admin sidebar sections
  const adminSections = [
    {
      title: "Main",
      items: [
        { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard", active: true }
      ]
    },
    {
      title: "Academic Management",
      items: [
        { icon: GraduationCap, label: "Results & GPA", href: "/admin/results" },
        { icon: Calendar, label: "Attendance", href: "/admin/attendance" }
      ]
    },
    {
      title: "Approvals",
      items: [
        { icon: FileText, label: "Medical Approvals", href: "/admin/medical-approvals", badge: 3 },
        { icon: FileText, label: "Payment Approvals", href: "/admin/payment-approvals", badge: 5 }
      ]
    },
    {
      title: "Content Management",
      items: [
        { icon: Bell, label: "Special Notices", href: "/admin/notices" },
        { icon: Activity, label: "Special Links", href: "/admin/special-links" }
      ]
    },
    {
      title: "System",
      items: [
        { icon: Activity, label: "System Logs", href: "/admin/logs" }
      ]
    }
  ];

  // Student sidebar sections
  const studentSections = [
    {
      title: "Main",
      items: [
        { icon: School, label: "Dashboard", href: "/student/dashboard", active: true }
      ]
    },
    {
      title: "Academic",
      items: [
        { icon: Medal, label: "My Results", href: "/student/results" },
        { icon: CalendarCheck, label: "Attendance", href: "/student/attendance" }
      ]
    },
    {
      title: "Submissions",
      items: [
        { icon: FileText, label: "Medical Reports", href: "/student/medical-reports" },
        { icon: FileText, label: "Payment Receipts", href: "/student/payment-receipts" }
      ]
    },
    {
      title: "Information",
      items: [
        { icon: Megaphone, label: "Notices", href: "/student/notices" },
        { icon: Link2, label: "Useful Links", href: "/student/useful-links" }
      ]
    }
  ];

  const navSections = role === "student" ? studentSections : adminSections;

  // Responsive sidebar overlay for mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (isDesktop) {
    // Desktop sidebar only
    return (
      <aside className="fixed left-0 top-0 h-full w-[250px] border-r-[1px] border-[#E0E0E0] bg-white shadow-lg z-50" style={{ maxWidth: '80vw' }}>
        <div className="h-14 bg-[#003366] text-white flex items-center px-6 ">
          {role === "student" ? (
            <School className="mr-3" size={24} />
          ) : (
            <GraduationCap className="mr-3" size={24} />
          )}
          <span className="font-semibold">{role === "student" ? "SIS Student" : "SIS Admin"}</span>
        </div>
        <nav className="p-4 overflow-y-auto h-full">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              {section.items.map((item, itemIdx) => (
                <a
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${item.active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon size={20} />
                  <span className="flex-1 text-sm text-[#21214c]">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    );
  } else {
    // Mobile sidebar only
    return (
      <div>
        {/* Overlay for mobile */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
          aria-hidden={!isOpen}
        />
        <aside
          className={`fixed left-0 top-0 h-full w-[250px] border-r-[1px] border-[#E0E0E0] bg-white shadow-lg transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ maxWidth: '80vw' }}
        >
          <div className="h-14 bg-[#003366] text-white flex items-center px-6 ">
            {role === "student" ? (
              <School className="mr-3" size={24} />
            ) : (
              <GraduationCap className="mr-3" size={24} />
            )}
            <span className="font-semibold">{role === "student" ? "SIS Student" : "SIS Admin"}</span>
            {/* Close button for mobile */}
            <button
              className="ml-auto p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 overflow-y-auto h-full">
            {navSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${item.active
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon size={20} />
                    <span className="flex-1 text-sm text-[#21214c]">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    );
  }
  // ...existing code...
}
