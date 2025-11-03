import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";

export default function HeaderBar({ title, subtitle, Icon, unread = 0 }) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDateTime = () => {
    // Mobile: Short format
    const shortFormat = currentDateTime.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit"
    });

    // Desktop: Full format
    const fullFormat = currentDateTime.toLocaleString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit" 
    });

    return { shortFormat, fullFormat };
  };

  const { shortFormat, fullFormat } = formatDateTime();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 rounded-xl sm:rounded-2xl shadow-lg mb-4 border border-blue-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white flex items-center gap-2 sm:gap-3">
          {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white lg:hidden flex-shrink-0" />}
          <span className="truncate">{title}</span>
          {unread > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              {unread} unread
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-blue-100 mt-1 text-sm sm:text-base">{subtitle}</p>
        )}
        <div className="flex items-center mt-2 sm:mt-3 lg:mt-4">
          <span className="flex text-xs sm:text-sm items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600 flex-shrink-0" />
            <span className="lg:hidden">{shortFormat}</span>
            <span className="hidden lg:inline">{fullFormat}</span>
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center">
        {Icon && <Icon size={48} className="text-blue-200 flex-shrink-0" />}
      </div>
    </div>
  );
}