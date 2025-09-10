import React, { useState, useEffect } from 'react';
import { Menu, X, User, Settings, LogOut} from 'lucide-react';
import branding from '../config/branding.js';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

// Navbar Component
export default function Navbar({ role, onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
  // Responsive Navbar with hamburger menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let userName = "User";
  let userProfileImage = null;
  try {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.name) userName = userData.name;
    if (userData && userData.profileImage) userProfileImage = userData.profileImage;
  } catch {}
  const greeting = role === "admin" ? "Admin" : "Student";
  const handleSignOut = async () => {
    await AuthService.logout();
    window.location.href = '/login';
  };

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-[#003366] text-white flex items-center px-4 sm:px-6 shadow-lg z-50 justify-between w-full max-w-full
        ${!isMobile ? 'ml-[250px] left-auto' : 'left-0'}
        transition-transform duration-300
        ${isMobile && sidebarOpen ? 'translate-x-[250px]' : 'translate-x-0'}
      `}
      style={!isMobile ? { width: 'calc(100% - 250px)' } : {}}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {isMobile && !sidebarOpen && (
          <button
            className="lg:hidden mr-2 p-2 rounded-md bg-[#ffd700] text-black hover:bg-yellow-400"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap truncate max-w-[70vw]">
          {branding.faculty} - {branding.system}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-semibold hidden sm:block truncate max-w-[20vw]">
          Good morning, {greeting} ({userName})
        </span>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-9 h-9 bg-[#ffd700] text-black rounded-full flex items-center justify-center font-semibold hover:bg-yellow-400 transition-colors overflow-hidden"
            style={{ padding: 0 }}
          >
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
                style={{ display: 'block' }}
              />
            ) : (
              userName.charAt(0)
            )}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl border z-50">
              <div className="py-1">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <User size={16} />
                  Profile Settings
                </button>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <Settings size={16} />
                  System Settings
                </a>
                <hr className="my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
