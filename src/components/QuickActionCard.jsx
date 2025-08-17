import React from "react";

export default function QuickActionCard({ icon, title, link, linkText }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      {icon}
      <h5 className="font-bold text-gray-900 mb-1">{title}</h5>
      <a href={link} className="text-blue-900 hover:underline text-sm font-medium">{linkText}</a>
    </div>
  );
}
