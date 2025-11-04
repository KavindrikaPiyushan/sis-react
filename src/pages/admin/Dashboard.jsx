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
  XCircle,
} from "lucide-react";
import LoadingComponent from "../../components/LoadingComponent";
import { LinksService } from "../../services/common/linksService";
import AdminService from "../../services/adminService";
import noticesService from "../../services/admin/noticesService";
import UtilService from "../../services/super-admin/utilService";
import DashboardService from "../../services/dashboardService";
import { usePaymentStatsContext } from "../../contexts/PaymentStatsContext";
import { systemInfo } from "../../config/systemInfo";


const AdminDashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { pendingCount } = usePaymentStatsContext();

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
          noticesStats,
          linksStatsRes,
          logsRes,
        ]) => {
          const linksStats = linksStatsRes?.data || {};
          setStats({
            paymentApprovals: pendingCount, // Use from context
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

    // Defensive: handle null/undefined for GPA
    const avgGPA = results?.overallGPA?.average != null ? Number(results.overallGPA.average).toFixed(2) : 'N/A';
    const maxGPA = results?.overallGPA?.max != null ? Number(results.overallGPA.max).toFixed(2) : 'N/A';

    const summaryCards = [
      { title: "Active Courses", value: courses.count, icon: <BookOpen className="w-6 h-6" />, color: "border-l-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
      { title: "Total Students", value: students.total, icon: <Users className="w-6 h-6" />, color: "border-l-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-600", subtitle: `${students.active} active` },
      { title: "Medical Reports", value: medicalReports.total, icon: <FileText className="w-6 h-6" />, color: "border-l-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-600", subtitle: `${medicalReports.pending} pending review` },
      { title: "Attendance Rate", value: `${attendancePercentage}%`, icon: <CheckCircle className="w-6 h-6" />, color: "border-l-green-500", bgColor: "bg-green-50", textColor: "text-green-600", subtitle: `${attendance.overall.present}/${attendance.overall.total} present` },
    ];

    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Gradient Header - Results style */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 rounded-xl lg:rounded-2xl shadow-lg mb-6 lg:mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-1 tracking-tight">Lecturer Dashboard</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600 mt-2 lg:mt-3">
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                  <UserCog className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">{profile.name || 'N/A'}</span>
                </span>
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600 flex-shrink-0" />
                  <span className="truncate">ID: {profile.lecturerId || 'N/A'}</span>
                </span>
                <span className="flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600 flex-shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{profile.department || 'N/A'}</span>
                </span>
                <span className="hidden sm:flex items-center bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-600 flex-shrink-0" />
                  <span className="hidden lg:inline">{currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",second:"2-digit" })}</span>
                  <span className="lg:hidden">{currentDateTime.toLocaleDateString()}</span>
                </span>
                <span className={`flex items-center px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm ${profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  <span className="hidden sm:inline">Status: </span>{profile.status}
                </span>
              </div>
            </div>
            <div className="hidden md:block lg:block">
              <GraduationCap size={32} className="text-blue-200 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            {summaryCards.map((card, index) => (
              <div key={index} className={`bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-md border-l-4 ${card.color} hover:shadow-lg transition-shadow duration-300`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 lg:mb-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 sm:mb-0 leading-tight">{card.title}</h3>
                  <div className={`${card.bgColor} ${card.textColor} p-1.5 sm:p-2 lg:p-3 rounded-lg self-start sm:self-auto`}>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                      {card.icon}
                    </div>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
                {card.subtitle && <p className="text-xs sm:text-sm text-gray-600 leading-tight">{card.subtitle}</p>}
              </div>
            ))}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl lg:rounded-2xl shadow-xl mb-6 lg:mb-8 overflow-hidden">
            <div className="p-4 sm:p-5 lg:p-6 text-white">
              <div className="flex items-center mb-3 sm:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Upcoming Sessions</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-white/20 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base sm:text-lg mb-1">{session.topic}</h4>
                        <p className="text-sm text-white/90 mb-2">{session.courseOffering.subject.name} ({session.courseOffering.year})</p>
                        <div className="flex flex-wrap items-center text-xs sm:text-sm text-white/80 gap-1 sm:gap-2">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="whitespace-nowrap">{new Date(session.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">{session.durationMinutes} mins</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{session.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Attendance Overview</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Subject-wise attendance breakdown for active semesters</p>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={attendanceChartData}>
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend />
                    <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="excused" fill="#F59E0B" name="Excused" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Medical Reports Status</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Current status distribution</p>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                {medicalReportsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={medicalReportsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {medicalReportsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">No medical reports to display</div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-lg shadow-md mb-6 lg:mb-8">
            <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Results Overview</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Student performance metrics for active semesters</p>
            </div>
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{results.entered}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Results Entered</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{avgGPA}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Average GPA</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{maxGPA}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Highest GPA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notices and Links */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Notices</h3>
                </div>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{notice.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap self-start ${notice.priority === "high" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{notice.priority}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{notice.excerpt}</p>
                    <div className="text-xs text-gray-500">{new Date(notice.publishDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Links</h3>
                </div>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                {links.map((link) => (
                  <a key={link.id} href={link.url} target={link.openMode === "newtab" ? "_blank" : "_self"} rel="noopener noreferrer" className="block p-3 sm:p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">{link.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded truncate">{link.category}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 ml-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
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
    // Enhanced card designs with better information architecture
    const superAdminCards = [
      {
        title: "Payment Approvals",
        subtitle: "Pending review queue",
        value: pendingCount || 0,
        icon: <Receipt className="w-8 h-8 text-white" />,
        gradientFrom: "from-emerald-500",
        gradientTo: "to-green-600",
        bgPattern: "bg-green-50",
        link: "/admin/payment-approvals",
        metrics: [
          { label: "Today", value: "12" },
          { label: "This Week", value: "45" },
          { label: "Avg. Time", value: "2h" }
        ]
      },
      {
        title: "Notice Management",
        subtitle: "Content & announcements",
        value: stats.notices?.total ?? 0,
        icon: <Megaphone className="w-8 h-8 text-white" />,
        gradientFrom: "from-blue-500",
        gradientTo: "to-indigo-600",
        bgPattern: "bg-blue-50",
        link: "/admin/notices",
        metrics: [
          { label: "Published", value: stats.notices?.published ?? 0 },
          { label: "Draft", value: stats.notices?.draft ?? 0 },
          { label: "Priority", value: stats.notices?.priority ?? 0 }
        ]
      },
      {
        title: "Special Links",
        subtitle: "Quick access resources",
        value: stats.links?.total ?? 0,
        icon: <ExternalLink className="w-8 h-8 text-white" />,
        gradientFrom: "from-purple-500",
        gradientTo: "to-violet-600",
        bgPattern: "bg-purple-50",
        link: "/admin/special-links",
        metrics: [
          { label: "Active", value: stats.links?.active ?? 0 },
          { label: "Views", value: stats.links?.totalViews ?? 0 },
          { label: "Categories", value: "8" }
        ]
      }
    ];

    const quickActions = [
      { title: "Create Students", description: "Add or manage student accounts", icon: <Users className="w-10 h-10 text-green-500 bg-green-100 p-1 rounded-full" />, link: "/admin/student-accounts", color: "bg-green-50 hover:bg-green-100" },
      { title: "Create Admins", description: "Add or manage admin accounts", icon: <UserCog className="w-10 h-10 text-blue-500 bg-blue-100 p-1 rounded-full" />, link: "/admin/admin-accounts", color: "bg-blue-50 hover:bg-blue-100" },
      { title: "Payment Approvals", description: "Review payment receipts", icon: <Receipt className="w-10 h-10 text-indigo-500 bg-indigo-100 p-1 rounded-full" />, link: "/admin/payment-approvals", color: "bg-indigo-50 hover:bg-indigo-100" },
      { title: "Create Notice", description: "Publish announcements", icon: <Megaphone className="w-10 h-10 text-yellow-500 bg-yellow-100 p-1 rounded-full" />, link: "/admin/notices", color: "bg-yellow-50 hover:bg-yellow-100" }
    ];

    return (
      <main className="flex-1 ml-0 mt-8 lg:mt-16 transition-all duration-300 lg:ml-70 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6 max-w-8xl mx-auto">
          {/* Enhanced Header with Better Design */}
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

          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 lg:mb-8">
            {superAdminCards.map((card, index) => (
              <a key={index} href={card.link} className="group block">
                <div className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${card.bgPattern}`}>
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
                        <p className="text-white/80 text-sm">{card.subtitle}</p>
                      </div>
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {card.icon}
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-4">
                      <div className="text-4xl font-bold text-white mb-2">{card.value}</div>
                      <div className="inline-flex items-center text-white/90 text-sm group-hover:text-white transition-colors">
                        <span>Manage</span>
                        <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* System Health Panel */}
          {/* <div className="mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                    <p className="text-gray-600 text-sm">Real-time monitoring</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
                    <div className="text-sm text-gray-600">Server Status</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Connected</div>
                    <div className="text-sm text-gray-600">Database</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">247</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Admin Tools & Quick Actions */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Administrative Tools</h2>
                    <p className="text-indigo-100 text-sm mt-1">Manage your system with these essential tools</p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <a key={index} href={action.link} className="group">
                      <div className="relative rounded-lg border-2 border-gray-200 p-4 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 group-hover:to-indigo-50">
                        <div className="text-center">
                          <div className="flex justify-center mb-3">
                            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              {action.icon}
                            </div>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                            {action.description}
                          </p>
                          <div className="inline-flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700 transition-colors">
                            Access Tool
                            <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Logs Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent System Logs</h3>
                    <p className="text-sm text-gray-600">Latest system activities and events</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {stats.logs.length} recent entries
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {stats.logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No logs found</h4>
                  <p className="text-gray-500">System logs will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.logs.map((log, idx) => {
                    const user = log.user || {};
                    const userDisplay = user.firstName || user.lastName ? `${user.firstName||''} ${user.lastName||''}`.trim() : (user.username || user.email || 'Unknown User');
                    
                    let statusConfig = {
                      icon: <Clock className="w-4 h-4" />,
                      bgColor: 'bg-gray-100',
                      textColor: 'text-gray-600',
                      borderColor: 'border-gray-200'
                    };
                    
                    if (log.status === 'success') {
                      statusConfig = {
                        icon: <CheckCircle className="w-4 h-4" />,
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-700',
                        borderColor: 'border-green-200'
                      };
                    } else if (log.status === 'failure') {
                      statusConfig = {
                        icon: <XCircle className="w-4 h-4" />,
                        bgColor: 'bg-red-100',
                        textColor: 'text-red-700',
                        borderColor: 'border-red-200'
                      };
                    }
                    
                    return (
                      <div key={idx} className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${statusConfig.borderColor} hover:border-blue-300`}>
                        <div className="flex items-start justify-between space-x-4">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} flex-shrink-0`}>
                              {statusConfig.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {log.action || 'System Action'}
                                </h4>
                                {log.module && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {log.module}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {log.description || 'No description available'}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{userDisplay}</span>
                                </div>
                                {log.entity && (
                                  <div className="flex items-center space-x-1">
                                    <FileText className="w-3 h-3" />
                                    <span>{log.entity}</span>
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{log.ipAddress}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                              {statusConfig.icon}
                              <span className="ml-1 capitalize">{log.status || 'pending'}</span>
                            </div>
                            <time className="text-xs text-gray-500">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 'Unknown time'}
                            </time>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {stats.logs.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {stats.logs.length} most recent entries
                    </p>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      View all logs →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information Footer */}
          <div className="mt-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl shadow-lg text-white overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <h4 className="text-lg font-semibold mb-2 flex items-center justify-center md:justify-start">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    {systemInfo.organization.name}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {systemInfo.organization.description}
                  </p>
                </div>
                
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2">System Information</h4>
                  <div className="space-y-1 text-sm text-slate-300">
                    <div>Version: {systemInfo.system.name} {systemInfo.system.version}</div>
                    <div>Environment: {systemInfo.system.environment}</div>
                    <div>Last Updated: {systemInfo.system.lastUpdated}</div>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <h4 className="text-lg font-semibold mb-2">Support & Contact</h4>
                  <div className="space-y-1 text-sm text-slate-300">
                    <div>IT Support: {systemInfo.support.itSupport}</div>
                    <div>System Admin: {systemInfo.support.systemAdmin}</div>
                    <div>Emergency: {systemInfo.support.emergency}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

};

export default AdminDashboard;