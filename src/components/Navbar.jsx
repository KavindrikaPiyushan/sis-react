import React, { useState, useEffect } from 'react';

import { Menu, X, User, Settings, LogOut} from 'lucide-react';

// Navbar Component
export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#003366] text-white flex items-center px-6 shadow-lg z-50">
      
      
      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold">Faculty of Technology - Student Information System</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className=" text-[13px] font-semibold hidden sm:block">
          Good morning, Admin 
        </span>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-9 h-9 bg-[#ffd700] text-black rounded-full flex items-center justify-center font-semibold hover:bg-yellow-400 transition-colors"
          >
            A
          </button>
          
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl border z-50">
              <div className="py-1">
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <User size={16} />
                  Profile Settings
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100">
                  <Settings size={16} />
                  System Settings
                </a>
                <hr className="my-1" />
                <a href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600">
                  <LogOut size={16} />
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
