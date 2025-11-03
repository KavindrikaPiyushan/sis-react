import React from "react";
import { TrendingUp, Award, Target } from "lucide-react";

const CGPA_RULES = [
  { min: 3.7, label: 'First Class', next: null },
  { min: 3.3, label: 'Upper Second Class', next: 3.7 },
  { min: 3.0, label: 'Second Class', next: 3.3 },
  { min: 2.0, label: 'General', next: 3.0 },
  { min: 0, label: 'Below General', next: 2.0 },
];

export default function GpaSummary({ gpa, semesters }) {
  const maxGPA = 4.0;
  const currentGPA = parseFloat(gpa) || 0;
  
  // Get current class and next target
  const getCurrentClass = (gpaValue) => {
    for (let rule of CGPA_RULES) {
      if (gpaValue >= rule.min) {
        return rule;
      }
    }
    return CGPA_RULES[CGPA_RULES.length - 1];
  };

  const currentClass = getCurrentClass(currentGPA);
  const nextTarget = currentClass.next || maxGPA;
  const targetPercentage = Math.min(currentGPA / nextTarget, 1);
  
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (targetPercentage * circumference);
  
  // Dynamic color based on class
  const getGPAColor = (gpaValue) => {
    if (gpaValue >= 3.7) return { main: "#10b981", light: "#d1fae5", text: "text-emerald-600" }; 
    if (gpaValue >= 3.3) return { main: "#3b82f6", light: "#dbeafe", text: "text-blue-600" };
    if (gpaValue >= 3.0) return { main: "#8b5cf6", light: "#ede9fe", text: "text-violet-600" };
    if (gpaValue >= 2.0) return { main: "#f59e0b", light: "#fef3c7", text: "text-amber-600" };
    return { main: "#ef4444", light: "#fee2e2", text: "text-red-600" };
  };

  const gpaColors = getGPAColor(currentGPA);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-6 lg:p-8 hover:shadow-xl transition-shadow">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="p-1 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="truncate">Academic Performance</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 ml-8 sm:ml-12 line-clamp-1">Your GPA trend over semesters</p>
      </div>

      <div className="flex flex-wrap justify-center flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
        {/* Circular GPA Display */}
        <div className="relative flex-shrink-0 w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
          <svg width="100%" height="100%" viewBox="0 0 160 160" className="transform -rotate-90">
            <defs>
              <linearGradient id="gpaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gpaColors.main} stopOpacity="0.8" />
                <stop offset="100%" stopColor={gpaColors.main} stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="65" stroke="#e5e7eb" strokeWidth="12" fill="none" />
            <circle 
              cx="80" 
              cy="80" 
              r="65" 
              stroke="url(#gpaGradient)"
              strokeWidth="12" 
              fill="none"
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${gpaColors.text} mb-0.5 sm:mb-1`}>
                {currentGPA.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mb-1 sm:mb-2">
                / {maxGPA.toFixed(1)}
              </div>
              <div 
                className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 ${gpaColors.text} rounded-full`} 
                style={{ backgroundColor: gpaColors.light }}
              >
                <span className="hidden sm:inline">{currentClass.label}</span>
                <span className="sm:hidden">
                  {currentClass.label.includes('First') ? 'First' : 
                   currentClass.label.includes('Upper') ? 'Upper 2nd' :
                   currentClass.label.includes('Second') ? '2nd Class' :
                   currentClass.label.includes('General') ? 'General' : 'Below'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Semester Breakdown */}
        <div className="flex-1 w-full">
          <div className="space-y-2 sm:space-y-3">
            {semesters.map((sem, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  sem.current 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm font-medium text-gray-900 flex-1 min-w-0">
                  {sem.current && <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />}
                  <span className="truncate">{sem.label}</span>
                  {sem.current && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-600 text-xs text-white font-semibold whitespace-nowrap ml-auto sm:ml-0">
                      <span className="hidden sm:inline">Current</span>
                      <span className="sm:hidden">•</span>
                    </span>
                  )}
                </span>
                <span className={`text-sm sm:text-base font-bold ${sem.current ? 'text-blue-600' : 'text-gray-700'} ml-2 flex-shrink-0`}>
                  {sem.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mb-2 gap-1 sm:gap-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600 truncate">
              {currentClass.next ? `Next Target: ${currentClass.next.toFixed(1)}` : 'Maximum Achievement'}
            </span>
          </div>
          <span className={`font-semibold ${gpaColors.text} text-right sm:text-left`}>
            {currentClass.next 
              ? `${(targetPercentage * 100).toFixed(0)}% to ${CGPA_RULES.find(r => r.min === currentClass.next)?.label}`
              : 'Top Class!'}
          </span>
        </div>
        <div className="w-full h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-700"
            style={{ 
              width: `${targetPercentage * 100}%`,
              background: `linear-gradient(to right, ${gpaColors.main}, ${gpaColors.main})`
            }}
          />
        </div>
        {currentClass.next && (
          <p className="text-xs text-gray-500 mt-1 sm:mt-2 text-center">
            Need {(currentClass.next - currentGPA).toFixed(2)} more points to reach {CGPA_RULES.find(r => r.min === currentClass.next)?.label}
          </p>
        )}
      </div>
    </div>
  );
}