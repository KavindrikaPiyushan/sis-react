import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Receipt, 
  Megaphone, 
  GraduationCap, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Check
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dashboardCards = [
    {
      title: "Pending Medical Reports",
      value: 3,
      icon: <FileText className="w-6 h-6" />,
      change: "2 new today",
      trend: "up",
      color: "border-l-blue-500"
    },
    {
      title: "Pending Payment Receipts",
      value: 5,
      icon: <Receipt className="w-6 h-6" />,
      change: "3 less than yesterday",
      trend: "down",
      color: "border-l-green-500"
    },
    {
      title: "Active Notices",
      value: 12,
      icon: <Megaphone className="w-6 h-6" />,
      change: "2 expiring soon",
      trend: "neutral",
      color: "border-l-yellow-500"
    },
    {
      title: "Total Students",
      value: 248,
      icon: <Users className="w-6 h-6" />,
      change: "8 new registrations",
      trend: "up",
      color: "border-l-purple-500"
    }
  ];

  const recentActivities = [
    {
      time: "10:30 AM",
      activity: "Medical report submitted",
      user: "John Doe (TG/2021/001)",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      time: "10:15 AM",
      activity: "Payment receipt uploaded",
      user: "Jane Smith (TG/2021/002)",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800"
    },
    {
      time: "09:45 AM",
      activity: "Attendance marked for CS101",
      user: "Dr. Perera",
      status: "Completed",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      time: "09:30 AM",
      activity: "Results updated for CS102",
      user: "Prof. Silva",
      status: "Completed",
      statusColor: "bg-green-100 text-green-800"
    },
    {
      time: "09:00 AM",
      activity: "New notice published",
      user: "Admin",
      status: "Published",
      statusColor: "bg-blue-100 text-blue-800"
    }
  ];

  const quickActions = [
    {
      title: "Update Results",
      description: "Add or modify student examination results",
      icon: <GraduationCap className="w-12 h-12 text-blue-500" />,
      link: "results.html"
    },
    {
      title: "Mark Attendance",
      description: "Record student attendance for classes",
      icon: <Calendar className="w-12 h-12 text-green-500" />,
      link: "attendance.html"
    },
    {
      title: "Create Notice",
      description: "Publish announcements for students",
      icon: <Megaphone className="w-12 h-12 text-yellow-500" />,
      link: "notices.html"
    }
  ];

  const attendanceData = [
    { week: 'Week 1', attendance: 85 },
    { week: 'Week 2', attendance: 88 },
    { week: 'Week 3', attendance: 82 },
    { week: 'Week 4', attendance: 87 }
  ];

  const gpaDistribution = [
    { name: 'A (3.7-4.0)', value: 45, color: '#4CAF50' },
    { name: 'B (3.0-3.6)', value: 78, color: '#8BC34A' },
    { name: 'C (2.0-2.9)', value: 89, color: '#FFC107' },
    { name: 'D (1.0-1.9)', value: 23, color: '#FF9800' },
    { name: 'F (0-0.9)', value: 13, color: '#F44336' }
  ];

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-0">Welcome to the Faculty of Technology Student Information System</p>
          <div className="flex items-center mt-4">
            <span className="text-sm text-gray-500">
              {currentDateTime.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <div key={index} className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${card.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {card.title}
                </h3>
                <div className="text-blue-600">
                  {card.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {card.value}
              </div>
              <div className="text-sm flex items-center">
                {card.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                {card.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                {card.trend === 'neutral' && <Clock className="w-4 h-4 mr-1" />}
                <span className={`${
                  card.trend === 'up' ? 'text-green-600' : 
                  card.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Trends Chart */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Attendance Trends</h3>
              <p className="text-sm text-gray-600">Weekly attendance percentage over the last month</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Attendance']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPA Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">GPA Distribution</h3>
              <p className="text-sm text-gray-600">Current semester grade distribution</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gpaDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {gpaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Students']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
            <p className="text-sm text-gray-600">Latest system activities and pending items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.activity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${activity.statusColor}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        {activity.status === 'Pending' && (
                          <button className="text-green-600 hover:text-green-800 p-1 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md">
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {action.icon}
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  {action.title === 'Update Results' ? 'Go to Results' : 
                   action.title === 'Mark Attendance' ? 'Mark Attendance' : 'Create Notice'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;