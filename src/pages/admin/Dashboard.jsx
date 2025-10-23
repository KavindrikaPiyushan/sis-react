import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
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
  Bell,
  ExternalLink,
  Award,
  Activity,
  MapPin,
  CheckCircle,
} from "lucide-react";
import LoadingComponent from "../../components/LoadingComponent";
import { LinksService } from "../../services/common/linksService";
import AdminService from "../../services/adminService";
import noticesService from "../../services/admin/noticesService";
import UtilService from "../../services/super-admin/utilService";
import DashboardService from "../../services/dashboardService";


const AdminDashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [userRole, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Super admin stats
  const [stats, setStats] = useState({
    paymentApprovals: 0,
    notices: 0,
    links: 0,
    logs: [],
  });

  // Lecturer dashboard data
  const [lecturerData, setLecturerData] = useState(null);

  // Set userRole only once on mount
  useEffect(() => {
    if (userRole) return;
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setRole(userData?.role || "lecturer"); // Default to lecturer for demo
  }, [userRole]);

  // Fetch data based on role
  useEffect(() => {
    if (!userRole) return;
    
    setLoading(true);
    
    if (userRole === "super_admin") {
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
    } else if (userRole === "admin") {
      setTimeout(async () => {
        const res = await DashboardService.getLecturerDashboardSummary();
        setLecturerData(res.data);
        setLoading(false);
      }, 500);
    } else {
      // Admin role
      setLoading(false);
    }
  }, [userRole]);

  if (!userRole || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{!userRole ? "Determining user role..." : "Loading dashboard data..."}</p>
        </div>
      </div>
    );
  }

  // ==================== LECTURER DASHBOARD ====================
  if (userRole === "admin") {
    const { profile, courses, medicalReports, attendance, results, students, notices, links, upcomingSessions } = lecturerData;
    
    const attendancePercentage = attendance.overall.total > 0
      ? ((attendance.overall.present / attendance.overall.total) * 100).toFixed(1)
      : 0;

    const attendanceChartData = attendance.subjectWise.map(item => ({
      subject: item.subject.code,
      present: item.stats.present,
      absent: item.stats.absent,
      excused: item.stats.excused,
    }));

    const medicalReportsData = [
      { name: "Approved", value: medicalReports.approved, color: "#10B981" },
      { name: "Pending", value: medicalReports.pending, color: "#F59E0B" },
      { name: "Rejected", value: medicalReports.rejected, color: "#EF4444" },
    ].filter(item => item.value > 0);

    const summaryCards = [
      { title: "Active Courses", value: courses.count, icon: <BookOpen className="w-6 h-6" />, color: "border-l-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
      { title: "Total Students", value: students.total, icon: <Users className="w-6 h-6" />, color: "border-l-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-600", subtitle: `${students.active} active` },
      { title: "Medical Reports", value: medicalReports.total, icon: <FileText className="w-6 h-6" />, color: "border-l-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-600", subtitle: `${medicalReports.pending} pending review` },
      { title: "Attendance Rate", value: `${attendancePercentage}%`, icon: <CheckCircle className="w-6 h-6" />, color: "border-l-green-500", bgColor: "bg-green-50", textColor: "text-green-600", subtitle: `${attendance.overall.present}/${attendance.overall.total} present` },
    ];

    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 bg-gradient-to-br from-blue-50 via-white to-blue-100 ">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Gradient Header - Results style */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Lecturer Dashboard</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <UserCog className="w-4 h-4 mr-1 text-blue-600" />
                  {profile.name || 'N/A'}
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <BookOpen className="w-4 h-4 mr-1 text-blue-600" />
                  ID: {profile.lecturerId || 'N/A'}
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <Layers className="w-4 h-4 mr-1 text-blue-600" />
                  {profile.department || 'N/A'}
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 mr-1 text-blue-600" />
                  {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",second:"2-digit" })}
                </span>
                <span className={`flex items-center px-3 py-1 rounded-full shadow-sm ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>Status: {profile.status}</span>
              </div>
            </div>
            <div className="hidden md:block">
              <GraduationCap size={48} className="text-blue-200" />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((card, index) => (
              <div key={index} className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${card.color} hover:shadow-lg transition-shadow duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{card.title}</h3>
                  <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>{card.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                {card.subtitle && <p className="text-sm text-gray-600">{card.subtitle}</p>}
              </div>
            ))}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="p-6 text-white">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 mr-3" />
                <h3 className="text-2xl font-bold">Upcoming Sessions</h3>
              </div>
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{session.topic}</h4>
                        <p className="text-sm text-white/90 mb-2">{session.courseOffering.subject.name} ({session.courseOffering.year})</p>
                        <div className="flex items-center text-sm text-white/80">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(session.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          <span className="mx-2">•</span>
                          {session.durationMinutes} mins
                          <span className="mx-2">•</span>
                          <MapPin className="w-4 h-4 mr-1" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
                <p className="text-sm text-gray-600">Subject-wise attendance breakdown for active semesters</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceChartData}>
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="present" fill="#10B981" name="Present" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="excused" fill="#F59E0B" name="Excused" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Medical Reports Status</h3>
                <p className="text-sm text-gray-600">Current status distribution</p>
              </div>
              <div className="p-6">
                {medicalReportsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={medicalReportsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {medicalReportsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">No medical reports to display</div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Results Overview</h3>
              <p className="text-sm text-gray-600">Student performance metrics for active semesters</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{results.entered}</div>
                  <div className="text-sm text-gray-600">Results Entered</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-gray-900">{results.overallGPA.average.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Average GPA</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">{results.overallGPA.max.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Highest GPA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notices and Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{notice.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${notice.priority === "high" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{notice.priority}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notice.excerpt}</p>
                    <div className="text-xs text-gray-500">{new Date(notice.publishDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {links.map((link) => (
                  <a key={link.id} href={link.url} target={link.openMode === "newtab" ? "_blank" : "_self"} rel="noopener noreferrer" className="block p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{link.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">{link.category}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-blue-600 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== SUPER ADMIN DASHBOARD ====================
  if (userRole === "super_admin") {
    // Improved card styles and layout
    const noticesCard = {
      title: "Notices",
      value: stats.notices?.total ?? 0,
      icon: <Megaphone className="w-8 h-8 text-indigo-500 bg-indigo-100 p-1 rounded-full" />,
      color: "border-l-indigo-500",
      bg: "bg-indigo-50",
      details: stats.notices && typeof stats.notices === 'object' ? [
        { label: 'Published', value: stats.notices?.published ?? 0 },
        { label: 'Draft', value: stats.notices?.draft ?? 0 },
        { label: 'Archived', value: stats.notices?.archived ?? 0 },
        { label: 'Unread', value: stats.notices?.unread ?? 0 },
      ] : [],
    };

    const specialLinksCard = {
      title: "Special Links",
      value: stats.links?.total ?? 0,
      icon: <List className="w-8 h-8 text-gray-500 bg-gray-100 p-1 rounded-full" />,
      color: "border-l-gray-500",
      bg: "bg-gray-50",
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
        icon: <Receipt className="w-8 h-8 text-green-500 bg-green-100 p-1 rounded-full" />,
        color: "border-l-green-500",
        bg: "bg-green-50"
      },
      noticesCard,
      specialLinksCard,
    ];

    const quickActions = [
      { title: "Create Students", description: "Add or manage student accounts", icon: <Users className="w-10 h-10 text-green-500 bg-green-100 p-1 rounded-full" />, link: "/admin/student-accounts", color: "bg-green-50 hover:bg-green-100" },
      { title: "Create Admins", description: "Add or manage admin accounts", icon: <UserCog className="w-10 h-10 text-blue-500 bg-blue-100 p-1 rounded-full" />, link: "/admin/admin-accounts", color: "bg-blue-50 hover:bg-blue-100" },
      { title: "Payment Approvals", description: "Review payment receipts", icon: <Receipt className="w-10 h-10 text-indigo-500 bg-indigo-100 p-1 rounded-full" />, link: "/admin/payment-approvals", color: "bg-indigo-50 hover:bg-indigo-100" },
      { title: "Create Notice", description: "Publish announcements", icon: <Megaphone className="w-10 h-10 text-yellow-500 bg-yellow-100 p-1 rounded-full" />, link: "/admin/notices", color: "bg-yellow-50 hover:bg-yellow-100" }
    ];

    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
        <div className="p-6 max-w-8xl mx-auto">
          {/* Gradient Header - Results style */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Super Admin Dashboard</h1>
              <p className="text-blue-100 mt-2">Welcome to the Faculty of Technology Student Information System</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <UserCog className="w-4 h-4 mr-1 text-blue-600" />
                  Super Admin
                </span>
                <span className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 mr-1 text-blue-600" />
                  {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" ,second:"2-digit"})}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <GraduationCap size={48} className="text-blue-200" />
            </div>
          </div>

          {/* Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {superAdminCards.map((card, index) => (
              <div key={index} className={`relative rounded-2xl p-7 shadow-lg border-l-8 ${card.color} ${card.bg} group transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl`}>
                <div className="flex items-center gap-4 mb-4">
                  <div>{card.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</div>
                  </div>
                </div>
                {card.details && card.details.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.title === 'Notices' ? (
                      <>
                        {card.details.map((d, i) => {
                          let badgeColor = '';
                          let icon = null;
                          if (d.label === 'Published') {
                            badgeColor = 'bg-green-100 text-green-700 border-green-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
                          } else if (d.label === 'Draft') {
                            badgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h4v4" /></svg>;
                          } else if (d.label === 'Archived') {
                            badgeColor = 'bg-gray-200 text-gray-700 border-gray-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" /></svg>;
                          } else if (d.label === 'Unread') {
                            badgeColor = 'bg-blue-100 text-blue-700 border-blue-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>;
                          }
                          return (
                            <span key={i} className={`inline-flex items-center border px-3 py-1 rounded-full font-semibold text-xs ${badgeColor}`}>
                              {icon}{d.label}: <span className="ml-1 font-bold">{d.value ?? 0}</span>
                            </span>
                          );
                        })}
                      </>
                    ) : card.title === 'Special Links' ? (
                      <>
                        {card.details.map((d, i) => {
                          let badgeColor = '';
                          let icon = null;
                          if (d.label === 'Active') {
                            badgeColor = 'bg-green-100 text-green-700 border-green-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>;
                          } else if (d.label === 'Inactive') {
                            badgeColor = 'bg-gray-200 text-gray-700 border-gray-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
                          } else if (d.label === 'Total Views') {
                            badgeColor = 'bg-blue-100 text-blue-700 border-blue-300';
                            icon = <svg className="inline w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>;
                          }
                          return (
                            <span key={i} className={`inline-flex items-center border px-3 py-1 rounded-full font-semibold text-xs ${badgeColor}`}>
                              {icon}{d.label}: <span className="ml-1 font-bold">{d.value ?? 0}</span>
                            </span>
                          );
                        })}
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-700 w-full">
                        {card.details.map((d, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="font-medium">{d.label}</span>
                            <span className="font-bold text-gray-900">{d.value ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity text-6xl pointer-events-none select-none">#</div>
              </div>
            ))}
          </div> */}

          {/* Quick Actions */}
          <div className="w-full flex flex-wrap justify-center items-stretch gap-7 mb-12 py-10">
            {quickActions.map((action, index) => (
              <div key={index} className={`rounded-2xl shadow-md flex-1 min-w-[220px] max-w-[260px] h-[240px] flex flex-col items-center ${action.color} transition-all duration-300 hover:shadow-xl`} style={{ flexBasis: "20%", flexGrow: 0, flexShrink: 1 }}>
                <div className="p-6 text-center flex flex-col items-center h-full justify-between w-full">
                  <div className="flex flex-col items-center flex-grow w-full">
                    <div className="flex justify-center mb-4">{action.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  </div>
                  <a href={action.link} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors inline-block shadow-md" style={{ marginTop: "auto" }}>
                    {action.title}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Logs Section */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-2xl mb-10 border border-blue-100 mx-10">
            <div className="p-6 border-b border-blue-200 rounded-t-2xl bg-gradient-to-r from-blue-500/80 to-blue-400/80 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <svg className="w-6 h-6 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Recent System Logs
                </h3>
                <p className="text-sm text-blue-100 mt-1">Latest system activities and events</p>
              </div>
              <div className="hidden md:block text-blue-100/80 font-mono text-xs">Showing last {stats.logs.length} logs</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-b-2xl overflow-hidden">
                <thead className="bg-blue-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Module</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Entity</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700 uppercase tracking-wider">IP Address</th>
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
                    let statusIcon = null;
                    if (log.status === 'success') statusIcon = <svg className="inline w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
                    else if (log.status === 'failure') statusIcon = <svg className="inline w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
                    return (
                      <tr key={idx} className={`${rowBg} hover:bg-blue-200/60 transition-colors duration-200`}>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 font-medium max-w-[140px] truncate">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[120px] truncate">{userDisplay}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate">{log.action || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate">{log.module || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[90px] truncate">{log.entity || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[80px] truncate">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${log.status === 'success' ? 'bg-green-100 text-green-700' : log.status === 'failure' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {statusIcon}{log.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[180px] truncate">{log.description || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-blue-900 max-w-[110px] truncate">{log.ipAddress || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    );
  }

};

export default AdminDashboard;