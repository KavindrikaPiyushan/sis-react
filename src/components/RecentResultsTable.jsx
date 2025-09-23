import React from "react";

export default function RecentResultsTable({ results }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-900">Recent Results</h3>
        <p className="text-sm text-gray-500">Latest examination results and grades</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 font-bold text-left">Subject Code</th>
              <th className="py-3 px-4 font-bold text-left">Subject Name</th>
              <th className="py-3 px-4 font-bold text-left">Marks</th>
              <th className="py-3 px-4 font-bold text-left">Grade</th>
              <th className="py-3 px-4 font-bold text-left">Credits</th>
              <th className="py-3 px-4 font-bold text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4">{row.code}</td>
                <td className="py-3 px-4">{row.name}</td>
                <td className="py-3 px-4">{row.marks}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded ${row.gradeBg} ${row.gradeText} text-xs font-bold`}>{row.grade}</span>
                </td>
                <td className="py-3 px-4">{row.credits}</td>
                <td className="py-3 px-4">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     
    </div>
  );
}
