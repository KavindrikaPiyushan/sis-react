import React from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

export default function DashboardCard({ title, value, icon, change, trend, color }) {
  return (
    <div className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
        <div>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-sm flex items-center">
        {trend === "up" && <TrendingUp className="w-4 h-4 mr-1 text-green-600" />}
        {trend === "down" && <TrendingDown className="w-4 h-4 mr-1 text-red-600" />}
        {trend === "neutral" && <Clock className="w-4 h-4 mr-1 text-gray-600" />}
        <span className={
          trend === "up"
            ? "text-green-600"
            : trend === "down"
            ? "text-red-600"
            : "text-gray-600"
        }>
          {change}
        </span>
      </div>
    </div>
  );
}
