import React from "react";

export default function GpaSummary({ gpa, semesters }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Academic Performance</h3>
        <p className="text-sm text-gray-500">Your GPA trend over semesters</p>
      </div>
      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32">
          <svg width="120" height="120" className="absolute top-0 left-0">
            <circle cx="60" cy="60" r="50" stroke="#E0E0E0" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="50" stroke="#4CAF50" strokeWidth="8" fill="none"
              strokeDasharray="314" strokeDashoffset="86" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-gray-900">{gpa}</div>
        </div>
      </div>
      <div className="mt-4 text-center space-y-2">
        {semesters.map((sem, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-500">
            <span>{sem.label}</span>
            <span>{sem.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
