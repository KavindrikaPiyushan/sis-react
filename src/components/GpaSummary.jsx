import React from "react";

export default function GpaSummary({ gpa, semesters }) {
  // Calculate dynamic stroke offset based on GPA (max 4.0)
  const maxGPA = 4.0;
  const currentGPA = parseFloat(gpa) || 0;
  const percentage = Math.min(currentGPA / maxGPA, 1); // Ensure it doesn't exceed 100%
  const circumference = 2 * Math.PI * 50; // 2 * π * radius (50)
  const strokeDashoffset = circumference - (percentage * circumference);
  
  // Dynamic color based on GPA range
  const getGPAColor = (gpaValue) => {
    if (gpaValue >= 3.5) return "#4CAF50"; // Green for excellent
    if (gpaValue >= 3.0) return "#8BC34A"; // Light green for good
    if (gpaValue >= 2.5) return "#FFC107"; // Yellow for average
    if (gpaValue >= 2.0) return "#FF9800"; // Orange for below average
    return "#F44336"; // Red for poor
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Academic Performance</h3>
        <p className="text-sm text-gray-500">Your GPA trend over semesters</p>
      </div>
      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32">
          <svg width="120" height="120" className="absolute top-0 left-0 transform -rotate-90">
            <circle cx="60" cy="60" r="50" stroke="#E0E0E0" strokeWidth="8" fill="none" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              stroke={getGPAColor(currentGPA)}
              strokeWidth="8" 
              fill="none"
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-gray-900">{gpa}</div>
              <div className="text-xs text-gray-500">/ {maxGPA}</div>
            </div>
          </div>
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
