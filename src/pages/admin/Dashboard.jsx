import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
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
  Check,
  BookOpen,
  Layers,
  BookMarked,
  ListChecks,
  UserCog,
  List,
  LayoutDashboard,
} from "lucide-react";
import LoadingComponent from "../../components/LoadingComponent";
import HeaderBar from '../../components/HeaderBar';
import { LinksService } from "../../services/common/linksService";
import AdminService from "../../services/adminService";
import noticesService from "../../services/admin/noticesService";
import UtilService from "../../services/super-admin/utilService";
import { AdminManagementService } from "../../services/super-admin/adminManagementService";
import { StudentManagementService } from "../../services/super-admin/studentManagementService";
import { AdministrationService } from "../../services/super-admin/administationService";

const AdminDashboard = () => {
  // Timestamp provided by HeaderBar component

  const [userRole, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // Super admin stats
  const [stats, setStats] = useState({
    paymentApprovals: 0,
    notices: 0,
    links: 0,
    logs: [],
  });

  // Set userRole only once on mount
  useEffect(() => {
    if (userRole) return;
    const userData = JSON.parse(localStorage.getItem("userData"));
    setRole(userData?.role);
  }, [userRole]);


  useEffect(() => {
    if (!userRole || userRole !== "super_admin") return;
    setLoading(true);
    Promise.all([
      AdminService.getPaymentApprovals(),
      noticesService.getStats().catch(e => {
        console.error('noticesService.getStats() error:', e);
        return { data: {} };
      }),
      LinksService.getStatistics().catch(e => {
        console.error('LinksService.getStatistics() error:', e);
        return { data: {} };
      }),
      new UtilService().getLogs(),
    ]).then(([
      paymentApprovalsRes,
      noticesStats,
      linksStatsRes,
      logsRes,
    ]) => {
      const linksStats = linksStatsRes?.data || {};
      setStats({
        paymentApprovals: paymentApprovalsRes?.data?.filter?.(p => p.status === "pending")?.length || 0,
        notices: noticesStats || {},
        links: linksStats,
        logs: logsRes?.data?.slice?.(0, 5) || [],
      });
    }).finally(() => setLoading(false));
  }, [userRole]);

 

  // Debug: log notices stats
  // Debug: log notices stats only once after fetch
  useEffect(() => {
    if (userRole === "super_admin" && Object.keys(stats.notices || {}).length > 0) {
      console.log('Dashboard Notices Stats:', stats.notices);
    }
  }, [userRole, stats.notices]);

  // If userRole has not been determined yet, show loader (placed after all hooks to keep hook order stable)
  if (!userRole) {
    return <LoadingComponent message={"Determining user role..."} />;
  }

  // Dashboard cards for both admin and super_admin
  const noticesCard = {
    title: "Notices",
    value: stats.notices?.total ?? 0,
    icon: <Megaphone className="w-6 h-6" />, color: "border-l-indigo-500",
    details: stats.notices && typeof stats.notices === 'object' ? [
      { label: 'Published', value: stats.notices?.published ?? 0 },
      { label: 'Draft', value: stats.notices?.draft ?? 0 },
      { label: 'Archived', value: stats.notices?.archived ?? 0 },
      { label: 'Unread', value: stats.notices?.unread ?? 0 },
    ] : [],
  };

  // Special Links card with more details
  const specialLinksCard = {
    title: "Special Links",
    value: stats.links?.total ?? 0,
    icon: <List className="w-6 h-6" />, color: "border-l-gray-500",
    details: stats.links && typeof stats.links === 'object' ? [
      { label: 'Active', value: stats.links?.active ?? 0 },
      { label: 'Inactive', value: stats.links?.inactive ?? 0 },
      { label: 'Total Views', value: stats.links?.totalViews ?? 0 },
    ] : [],
  };

  const superAdminCards = [
    {
      title: "Pending Payment Approvals",
      value: stats.paymentApprovals ?? 0,
      icon: <Receipt className="w-6 h-6" />, color: "border-l-green-500",
    },
    noticesCard,
    specialLinksCard,
  ];

  const allDashboardCards = [
    {
      title: "Pending Medical Reports",
      value: 3,
      icon: <FileText className="w-6 h-6" />,
      change: "2 new today",
      trend: "up",
      color: "border-l-blue-500",
    },
    {
      title: "Active Notices",
      value: 12,
      icon: <Megaphone className="w-6 h-6" />,
      change: "2 expiring soon",
      trend: "neutral",
      color: "border-l-yellow-500",
    },
    {
      title: "Total Students",
      value: 248,
      icon: <Users className="w-6 h-6" />,
      change: "8 new registrations",
      trend: "up",
      color: "border-l-purple-500",
    },
  ];

  const quickActions = userRole === "super_admin"
    ? [
        {
          title: "Create Students",
          description: "Add or manage student accounts",
          icon: <Users className="w-12 h-12 text-green-500" />,
          link: "/admin/student-accounts",
        },
        {
          title: "Create Admins",
          description: "Add or manage admin accounts",
          icon: <UserCog className="w-12 h-12 text-blue-500" />,
          link: "/admin/admin-accounts",
        },
        {
          title: "Payment Approvals",
          description: "Review payment receipts",
          icon: <Receipt className="w-12 h-12 text-indigo-500" />,
          link: "/admin/payment-approvals",
        },
        {
          title: "Create Notice",
          description: "Publish announcements",
          icon: <Megaphone className="w-12 h-12 text-yellow-500" />,
          link: "/admin/notices",
        }
      ]
    : [
        {
          title: "Update Results",
          description: "Add or modify student examination results",
          icon: <GraduationCap className="w-12 h-12 text-blue-500" />,
          link: "/admin/results",
        },
        {
          title: "Mark Attendance",
          description: "Record student attendance for classes",
          icon: <Calendar className="w-12 h-12 text-green-500" />,
          link: "/admin/attendance",
        },
        {
          title: "Create Notice",
          description: "Publish announcements for students",
          icon: <Megaphone className="w-12 h-12 text-yellow-500" />,
          link: "/admin/notices",
        },
        {
          title: "Medical Approvals",
          description: "Approve or review medical reports",
          icon: <FileText className="w-12 h-12 text-blue-400" />,
          link: "/admin/medical-approvals",
        }
      ];

  const attendanceData = [
    { week: "Week 1", attendance: 85 },
    { week: "Week 2", attendance: 88 },
    { week: "Week 3", attendance: 82 },
    { week: "Week 4", attendance: 87 },
  ];

  const gpaDistribution = [
    { name: "A (3.7-4.0)", value: 45, color: "#4CAF50" },
    { name: "B (3.0-3.6)", value: 78, color: "#8BC34A" },
    { name: "C (2.0-2.9)", value: 89, color: "#FFC107" },
    { name: "D (1.0-1.9)", value: 23, color: "#FF9800" },
    { name: "F (0-0.9)", value: 13, color: "#F44336" },
  ];

  // Render
  if (userRole === "super_admin") {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70">
        <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Super Admin Dashboard</h1>
                <p className="text-blue-100 mt-2">Welcome to the Faculty of Technology Student Information System</p>
                <div className="flex items-center mt-4">
                  <span className="text-sm text-blue-100">{currentDateTime.toLocaleString()}</span>
                </div>
              </div>
              <div className="hidden md:block">
                <LayoutDashboard size={48} className="text-blue-200" />
              </div>
            </div>
          {loading ? (
            <LoadingComponent message={"Loading dashboard data..."} />
          ) : (
            <>
                          {/* Super Admin Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {superAdminCards.map((card, index) => (
                  <div key={index} className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${card.color}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{card.title}</h3>
                      <div className="text-blue-600">{card.icon}</div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{card.value}</div>
                    {card.details && card.details.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                        {card.details.map((d, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{d.label}</span>
                            <span className="font-semibold text-gray-800">{d.value ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Quick Actions for Super Admin (same UI as admin) */}
              <div className="w-full flex flex-wrap justify-center items-center gap-6 mb-8">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md flex-1 min-w-[220px] max-w-[260px] h-[240px] flex flex-col items-center"
                    style={{ flexBasis: "20%", flexGrow: 0, flexShrink: 1 }}
                  >
                    <div className="p-6 text-center flex flex-col items-center h-full justify-between w-full">
                      <div className="flex flex-col items-center flex-grow w-full">
                        <div className="flex justify-center mb-4">{action.icon}</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {action.description}
                        </p>
                      </div>
                      <a
                        href={action.link}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
                        style={{ marginTop: "auto" }}
                      >
                        {action.title === "Update Results"
                          ? "Go to Results"
                          : action.title === "Mark Attendance"
                          ? "Mark Attendance"
                          : "Create Notice"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent System Logs */}
              <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-2xl mb-10 border border-blue-100 animate-fadein">
                <div className="p-6 border-b border-blue-200 rounded-t-2xl bg-gradient-to-r from-blue-500/80 to-blue-400/80">
                  <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    <svg className="w-6 h-6 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Recent System Logs
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">Latest system activities and events</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm rounded-b-2xl overflow-hidden">
                    <thead className="bg-blue-100 sticky top-0 z-10 rounded-t-2xl">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider rounded-tl-2xl">Time</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Module</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Entity</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider rounded-tr-2xl">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.logs.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-6 text-blue-400">No logs found.</td></tr>
                      )}
                      {stats.logs.map((log, idx) => {
                        const user = log.user || {};
                        const userDisplay = user.firstName || user.lastName ? `${user.firstName||''} ${user.lastName||''}`.trim() : (user.username || user.email || '-');
                        const rowBg = idx % 2 === 0 ? 'bg-white/80' : 'bg-blue-50/80';
                        // Status icon
                        let statusIcon = null;
                        if (log.status === 'success') statusIcon = <svg className="inline w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
                        else if (log.status === 'failure') statusIcon = <svg className="inline w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
                        return (
                          <tr key={idx} className={`${rowBg} hover:bg-blue-200/60 transition-colors duration-200 animate-fadein`} style={{borderRadius: '0.75rem'}}>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 font-medium max-w-[140px] truncate" title={log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[120px] truncate" title={userDisplay}>{userDisplay}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate" title={log.action || '-'}>{log.action || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate" title={log.module || '-'}>{log.module || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate" title={log.entity || '-'}>{log.entity || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[80px] truncate" title={log.status || '-'}>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : log.status === 'failure' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                {statusIcon}{log.status || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[180px] truncate" title={log.description || '-'}>{log.description || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[110px] truncate" title={log.ipAddress || '-'}>{log.ipAddress || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>
      </main>
    );
  }

  // Admin dashboard summary cards (for admin, not super_admin)
  const dashboardCards = [
    {
      title: "Pending Medical Reports",
      value: 3,
      icon: <FileText className="w-6 h-6" />,
      change: "2 new today",
      trend: "up",
      color: "border-l-blue-500",
    },
    {
      title: "Active Notices",
      value: 12,
      icon: <Megaphone className="w-6 h-6" />,
      change: "2 expiring soon",
      trend: "neutral",
      color: "border-l-yellow-500",
    },
    {
      title: "Total Students",
      value: 248,
      icon: <Users className="w-6 h-6" />,
      change: "8 new registrations",
      trend: "up",
      color: "border-l-purple-500",
    },
  ];

  // Only show admin dashboard for admin (not super_admin)
  if (userRole === "admin") {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70">
        <div className="p-6">
          {/* Page Header */}
          {/* Page Header (styled like student dashboard) */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Admin Dashboard</h1>
              <p className="text-blue-100 mt-2">Welcome to the Faculty of Technology Student Information System</p>
              <div className="flex items-center mt-4">
                <span className="text-sm text-blue-100">{currentDateTime.toLocaleString()}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <LayoutDashboard size={48} className="text-blue-200" />
            </div>
          </div>

          {/* Dashboard Summary Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8`}
          >
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${card.color}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {card.title}
                  </h3>
                  <div className="text-blue-600">{card.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {card.value}
                </div>
                <div className="text-sm flex items-center">
                  {card.trend === "up" && <TrendingUp className="w-4 h-4 mr-1" />}
                  {card.trend === "down" && (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {card.trend === "neutral" && <Clock className="w-4 h-4 mr-1" />}
                  <span
                    className={`$ {
                      card.trend === "up"
                        ? "text-green-600"
                        : card.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
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
                <h3 className="text-lg font-medium text-gray-900">
                  Attendance Trends
                </h3>
                <p className="text-sm text-gray-600">
                  Weekly attendance percentage over the last month
                </p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Attendance"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPA Distribution Chart */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  GPA Distribution
                </h3>
                <p className="text-sm text-gray-600">
                  Current semester grade distribution
                </p>
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
                      formatter={(value, name) => [value, "Students"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: "#374151", fontSize: "12px" }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="w-full flex flex-wrap justify-center items-center gap-6 mb-8">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md flex-1 min-w-[220px] max-w-[260px] h-[230px] flex flex-col items-center"
                style={{ flexBasis: "20%", flexGrow: 0, flexShrink: 1 }}
              >
                <div className="p-6 text-center flex flex-col items-center h-full justify-between w-full">
                  <div className="flex flex-col items-center flex-grow w-full">
                    <div className="flex justify-center mb-4">{action.icon}</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {action.description}
                    </p>
                  </div>
                  <a
                    href={action.link}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-block"
                    style={{ marginTop: "auto" }}
                  >
                    {action.title === "Update Results"
                      ? "Go to Results"
                      : action.title === "Mark Attendance"
                      ? "Mark Attendance"
                      : "Create Notice"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Default fallback (empty)
  return null;
};

export default AdminDashboard;
