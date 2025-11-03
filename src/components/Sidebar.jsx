import React, { useEffect, useState } from "react";
import { usePaymentStatsContext } from '../contexts/PaymentStatsContext';
import { useMedicalPendingContext } from '../contexts/MedicalPendingContext';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  GraduationCap,
  FileText,
  Calendar,
  Activity,
  BarChart3,
  School,
  Medal,
  CalendarCheck,
  Megaphone,
  Link2,
  BookOpen,
  CreditCard,
  Globe,
  X,
  UserPlus,
} from "lucide-react";
import { PiStudentFill } from "react-icons/pi";
import { GrUserAdmin } from "react-icons/gr";
import { FaPeopleGroup } from "react-icons/fa6";
import { RiBookMarkedFill } from "react-icons/ri";
import { MdOutlineMoreTime } from "react-icons/md";
import { RiFileEditFill } from "react-icons/ri";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import LinksService from '../services/common/linksService';
import { useNotices } from '../contexts/NoticesContext';
import { useSpecialLinks } from '../contexts/SpecialLinksContext';

export default function Sidebar({ isOpen, onClose, role }) {
  const { pendingCount } = usePaymentStatsContext();
  const { pendingCount: pendingMedicalCount } = useMedicalPendingContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setRole] = useState(null);
  const { newLinksCount } = useSpecialLinks();
  const { unreadCount: unreadNoticesCount } = useNotices();
  const userData = (() => { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; } })();

  // Responsive breakpoints
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get role from localStorage if not provided
  if (!role) {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.role) role = userData.role;
    } catch {}
    if (!role) role = "admin";
  }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    setRole(userData?.role);
  }, [userRole]);

  // Function to handle navigation clicks
  const handleNavClick = (href, e) => {
    e.preventDefault();
    navigate(href);
    if (onClose && !isDesktop) onClose();
  };

  // Function to check if current path matches the nav item
  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  // Super Admin sidebar sections
  const superAdminSections = [
    {
      title: "Main",
      items: [
        { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
      ],
    },
    {
      title: "User Accounts",
      items: [
        {
          icon: PiStudentFill,
          label: "Student Accounts",
          href: "/admin/student-accounts",
        },
        {
          icon: GrUserAdmin,
          label: "Admin Accounts",
          href: "/admin/admin-accounts",
        },
      ],
    },
    {
      title: "Approvals",
      items: [
        {
          icon: FileText,
          label: "Payment Approvals",
          href: "/admin/payment-approvals",
          badge: pendingCount ? pendingCount : null,
        },
      ],
    },
    {
      title: "Course Offerings",
      items: [        
        {
          icon: GraduationCap,
          label: "Create Degree Program",
          href: "/admin/degree-program-creation",
        },
        {
          icon: FaPeopleGroup,
          label: "Create Batch",
          href: "/admin/create-batch",
        },
        {
          icon: RiBookMarkedFill,
          label: "Create Subject",
          href: "/admin/create-subject",
        },
        {
          icon: BookOpen,
          label: "Create Course Offering",
          href: "/admin/create-course-offering",
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        { icon: Bell, label: "Special Notices", href: "/admin/notices" },
        {
          icon: Globe,
          label: "Special Links",
          href: "/admin/special-links",
        },
      ],
    },
    {
      title: "System",
      items: [{ icon: Activity, label: "System Logs", href: "/admin/logs" }],
    },
  ];

  // Admin sidebar sections
  const adminSections = [
    {
      title: "Main",
      items: [
        { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
      ],
    },
    {
      title: "Academic Management",
      items: [
        { icon: GraduationCap, label: "Results & GPA", href: "/admin/results" },
        { icon: Calendar, label: "Attendance", href: "/admin/attendance" },
      ],
    },
    {
      title: "Creating Classes",
      items: [
        { icon: MdOutlineMoreTime, label: "Creating Classes", href: "/admin/creating-classes" },
      ],
    },
    {
      title: "Approvals",
      items: [
        {
          icon: FileText,
          label: "Medical Approvals",
          href: "/admin/medical-approvals",
          badge: pendingMedicalCount ? pendingMedicalCount : null,
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        { icon: Bell, label: "Special Notices", href: "/admin/notices" },
        {
          icon: Activity,
          label: "Special Links",
          href: "/admin/special-links",
        },
      ],
    },
  ];

  // Student sidebar sections
  const studentSections = [
    {
      title: "Main",
      items: [{ icon: School, label: "Dashboard", href: "/student/dashboard" }],
    },
    {
      title: "Courses",
      items: [
        { icon: BookOpen, label: "My Courses", href: "/student/registered-courses" },
        {
          icon: RiFileEditFill,
          label: "Register for New Courses",
          href: "/student/register-for-new-course",
        },
      ],
    },
    {
      title: "Academic",
      items: [
        { icon: Medal, label: "My Results", href: "/student/results" },
        {
          icon: CalendarCheck,
          label: "Attendance",
          href: "/student/attendance",
        },
      ],
    },
    {
      title: "Submissions",
      items: [
        {
          icon: FileText,
          label: "Medical Reports",
          href: "/student/medical-reports",
        },
        {
          icon: CreditCard,
          label: "Payment portal",
          href: "/student/payment-receipts",
        },
      ],
    },
    {
      title: "Information",
      items: [
        { icon: Megaphone, label: "Special Notices", href: "/student/notices" },
        { icon: Link2, label: "Special Links", href: "/student/special-links" },
      ],
    },
  ];

  // Select appropriate sections based on role
  const navSections =
    role === "student"
      ? studentSections
      : role === "super_admin"
      ? superAdminSections
      : adminSections;

  // Handle ESC key to close sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Render badge helper
  const renderBadge = (item) => {
    if ((item.href === '/admin/special-links' || item.href === '/student/special-links') && newLinksCount > 0) {
      return (
        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[18px] sm:min-w-[20px] text-center font-medium">
          {newLinksCount}
        </span>
      );
    }
    if ((item.href === '/admin/notices' || item.href === '/student/notices') && unreadNoticesCount > 0) {
      return (
        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[18px] sm:min-w-[20px] text-center font-medium">
          {unreadNoticesCount}
        </span>
      );
    }
    if (item.badge) {
      return (
        <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[18px] sm:min-w-[20px] text-center font-medium">
          {item.badge}
        </span>
      );
    }
    return null;
  };

  if (isDesktop) {
    // Desktop sidebar
    return (
      <aside
        className="fixed left-0 top-0 h-full w-[250px] border-r-[1px] border-[#E0E0E0] bg-white shadow-lg z-50"
      >
        <div className="h-14 bg-[#003366] text-white flex items-center px-4 lg:px-6">
          {role === "student" ? (
            <School className="mr-2 lg:mr-3 flex-shrink-0" size={22} />
          ) : (
            <GraduationCap className="mr-2 lg:mr-3 flex-shrink-0" size={22} />
          )}
          <span className="font-semibold text-sm lg:text-base truncate">
            {role === "student"
              ? "SIS Student"
              : role === "super_admin"
              ? "SIS Super Admin"
              : "SIS Admin"}
          </span>
        </div>
        <nav className="p-3 lg:p-4 overflow-y-auto h-[calc(100vh-56px)] pb-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-4 lg:mb-6">
              <h3 className="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 lg:mb-3 px-1">
                {section.title}
              </h3>
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className={`w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg mb-1 transition-all duration-200 text-left ${
                    isActiveRoute(item.href)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  }`}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="flex-1 text-xs lg:text-sm text-[#21214c] font-medium truncate">
                    {item.label}
                  </span>
                  {renderBadge(item)}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    );
  } else {
    // Mobile/Tablet sidebar
    return (
      <div>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
            isOpen
              ? "opacity-40 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
          aria-hidden={!isOpen}
        />
        
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-[280px] sm:w-[300px] max-w-[85vw] border-r-[1px] border-[#E0E0E0] bg-white shadow-2xl transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header */}
          <div className="h-12 sm:h-14 bg-[#003366] text-white flex items-center px-3 sm:px-4 gap-2">
            {role === "student" ? (
              <School className="flex-shrink-0" size={20} />
            ) : (
              <GraduationCap className="flex-shrink-0" size={20} />
            )}
            <span className="font-semibold text-sm sm:text-base flex-1 truncate">
              {role === "student"
                ? "SIS Student"
                : role === "super_admin"
                ? "SIS Super Admin"
                : "SIS Admin"}
            </span>
            {/* Close button */}
            <button
              className="p-1.5 sm:p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 sm:p-4 overflow-y-auto h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] pb-6">
            {navSections.map((section, idx) => (
              <div key={idx} className="mb-5 sm:mb-6">
                <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 px-1">
                  {section.title}
                </h3>
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={(e) => handleNavClick(item.href, e)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg mb-1 transition-all duration-200 text-left ${
                      isActiveRoute(item.href)
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="flex-1 text-xs sm:text-sm text-[#21214c] font-medium truncate">
                      {item.label}
                    </span>
                    {renderBadge(item)}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      </div>
    );
  }
}