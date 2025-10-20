import React from "react";
import { Calendar, CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function AttendanceOverview({ subjects }) {
  // Calculate overall attendance
  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subject) => {
      const percent = parseFloat(subject.percent) || 0;
      return sum + percent;
    }, 0);
    return Math.round(total / subjects.length);
  };

  const overallAttendance = calculateOverallAttendance();

  // Get status icon and color based on percentage
  const getAttendanceStatus = (percent) => {
    const value = parseFloat(percent) || 0;
    if (value >= 75) {
      return { 
        icon: <CheckCircle className="w-4 h-4" />, 
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200"
      };
    }
    if (value >= 60) {
      return { 
        icon: <AlertCircle className="w-4 h-4" />, 
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200"
      };
    }
    return { 
      icon: <XCircle className="w-4 h-4" />, 
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    };
  };

  const overallStatus = getAttendanceStatus(overallAttendance);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 hover:shadow-xl transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Attendance Overview
        </h3>
        <p className="text-sm text-gray-600 ml-12">Current semester attendance by subject</p>
      </div>

      {/* Overall Attendance Card */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${overallStatus.border} ${overallStatus.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={overallStatus.color}>
              {overallStatus.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Overall Attendance</p>
              <p className={`text-2xl font-bold ${overallStatus.color}`}>{overallAttendance}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Required</p>
            <p className="text-lg font-bold text-gray-700">75%</p>
          </div>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      <div className="space-y-3">
        {subjects.map((subject, idx) => {
          const status = getAttendanceStatus(subject.percent);
          const percentValue = parseFloat(subject.percent) || 0;
          
          return (
            <div 
              key={idx} 
              className="p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className={status.color}>
                    {status.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {subject.name}
                  </span>
                </div>
                <span className={`text-sm font-bold ${status.color}`}>
                  {subject.percent}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${subject.color}`}
                    style={{ width: subject.width }}
                  />
                </div>
                {/* 75% Marker */}
                <div 
                  className="absolute top-0 h-2 w-0.5 bg-gray-400"
                  style={{ left: '75%' }}
                  title="Minimum requirement: 75%"
                >
                  <div className="absolute -top-0.5 -left-1 w-2 h-2 bg-gray-400 rounded-full border border-white" />
                </div>
              </div>
              
              {/* Warning Message */}
              {percentValue < 75 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {percentValue < 60 
                      ? "Critical: Well below requirement" 
                      : "Below minimum 75% requirement"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span className="text-gray-600">≥75%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
            <span className="text-gray-600">60-74%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            <span className="text-gray-600">&lt;60%</span>
          </div>
        </div>
      </div>
    </div>
  );
}