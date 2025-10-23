import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";


export default function HeaderBar({ title, subtitle, Icon, unread = 0 }) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-4 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-h-[96px]">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-white md:hidden" />}
          {title}
          {unread > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              {unread} unread
            </span>
          )}
        </h1>
        {subtitle && <p className="text-blue-100 mt-1">{subtitle}</p>}
        <div className="flex items-center mt-4">
          <span className="flex text-sm items-center bg-white px-3 py-1 rounded-full shadow-sm">
            <Clock className="w-4 h-4 mr-1 text-blue-600" />
            {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",second:"2-digit" })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {Icon && <Icon size={48} className="text-blue-200 hidden md:block" />}
      </div>
    </div>
  );
}
