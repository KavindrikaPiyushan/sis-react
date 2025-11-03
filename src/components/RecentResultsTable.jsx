import React from "react";
import { FileText, Calendar, Award, Hash, BookOpen, Target } from "lucide-react";

export default function RecentResultsTable({ results }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
      <div className="mb-4 sm:mb-6 border-b pb-3 sm:pb-4">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="p-1 sm:p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span>Recent Results</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-12">Latest examination results and grades</p>
      </div>
      
      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-3 sm:space-y-4">
        {results.map((row, idx) => (
          <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{row.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Hash className="w-3 h-3 flex-shrink-0" />
                  {row.code}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <span className={`inline-block px-2 py-1 rounded-full ${row.gradeBg} ${row.gradeText} text-xs font-bold`}>
                  {row.grade}
                </span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">{row.marks}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Award className="w-3 h-3 flex-shrink-0" />
                <span>{row.credits} Credits</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{row.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="py-3 px-4 font-bold text-left text-gray-700">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Subject Code
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-left text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Subject Name
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-left text-gray-700">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Marks
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-left text-gray-700">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Grade
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-left text-gray-700">Credits</th>
              <th className="py-3 px-4 font-bold text-left text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-900">{row.code}</td>
                <td className="py-3 px-4 text-gray-700">{row.name}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{row.marks}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-3 py-1 rounded-full ${row.gradeBg} ${row.gradeText} text-xs font-bold`}>
                    {row.grade}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">{row.credits}</td>
                <td className="py-3 px-4 text-gray-600">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
