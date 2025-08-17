import React from "react";

export default function AttendanceOverview({ subjects }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Attendance Overview</h3>
        <p className="text-sm text-gray-500">Current semester attendance by subject</p>
      </div>
      <div className="space-y-4">
        {subjects.map((subject, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{subject.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-200 rounded">
                <div
                  className={`h-1.5 rounded ${subject.color}`}
                  style={{ width: subject.width }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-700">{subject.percent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
