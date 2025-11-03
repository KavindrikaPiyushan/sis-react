import React, { useState, useEffect } from 'react';
import { Menu, X, User, Settings, LogOut} from 'lucide-react';
import branding from '../config/branding.js';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

// Navbar Component
export default function Navbar({ role, onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
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
  
  // Dynamic time-based greeting
  function getTimeGreeting() {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  }
  const timeGreeting = getTimeGreeting();
  
  const handleSignOut = async () => {
    await AuthService.logout();
    window.location.href = '/login';
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header
      className={`fixed top-0 right-0 h-12 sm:h-14 bg-[#003366] text-white flex items-center px-3 sm:px-4 lg:px-6 shadow-lg z-50 justify-between w-full max-w-full
        ${!isMobile ? 'ml-[250px] left-auto' : 'left-0'}
        transition-transform duration-300
        ${isMobile && sidebarOpen ? 'translate-x-[250px]' : 'translate-x-0'}
      `}
      style={!isMobile ? { width: 'calc(100% - 250px)' } : {}}
    >
      {/* Left Section: Menu Button + Title */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-hidden flex-1 min-w-0">
        {isMobile && !sidebarOpen && (
          <button
            className="lg:hidden p-1.5 sm:p-2 rounded-md bg-[#ffd700] text-black hover:bg-yellow-400 transition-colors flex-shrink-0"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu size={18} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        )}
        <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="hidden md:inline">{branding.faculty} - {branding.system}</span>
          <span className="md:hidden">{branding.system}</span>
        </h1>
      </div>

      {/* Right Section: Greeting + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
        {/* Greeting Text - Hidden on small screens */}
        <span className="text-[11px] sm:text-xs lg:text-[13px] font-semibold hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] lg:max-w-[200px]">
          {timeGreeting}, {userName}
        </span>
        
        {/* Mobile Greeting - Show only on small screens */}
        <span className="text-[11px] font-semibold md:hidden whitespace-nowrap">
          {userName.split(' ')[0]}
        </span>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#ffd700] text-black rounded-full flex items-center justify-center text-sm sm:text-base font-semibold hover:bg-yellow-400 transition-colors overflow-hidden flex-shrink-0"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </button>
          
          {/* Dropdown Menu */}
          {userMenuOpen && (
            <>
              {/* Mobile backdrop */}
              <div 
                className="fixed inset-0 z-40 md:hidden" 
                onClick={() => setUserMenuOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white text-gray-800 rounded-lg shadow-xl border z-50">
                <div className="py-1">
                  {/* Profile Settings */}
                  <button
                    onClick={() => { 
                      setUserMenuOpen(false); 
                      navigate('/profile'); 
                    }}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-100 w-full text-left text-sm transition-colors"
                  >
                    <User size={16} className="flex-shrink-0" />
                    <span>Profile Settings</span>
                  </button>
                  
                  {/* Divider */}
                  <hr className="my-1" />
                  
                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-red-50 text-red-600 text-left text-sm transition-colors"
                  >
                    <LogOut size={16} className="flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}