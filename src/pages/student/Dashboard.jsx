import { useEffect, useState } from "react";
import {
  GraduationCap,
  Calendar,
  School,
  AlertCircle,
  FileText,
  LayoutDashboard,
  Link,
  Receipt,
  Clock,
  TrendingUp,
  Award,
  Target,
  GroupIcon,
  LucideGroup
} from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import GpaSummary from "../../components/GpaSummary";
import AttendanceOverview from "../../components/AttendanceOverview";
import RecentResultsTable from "../../components/RecentResultsTable";
import NoticeList from "../../components/NoticeList";
import QuickActionCard from "../../components/QuickActionCard";
import DashboardService from "../../services/dashboardService";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
    useEffect(() => {
      const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
      return () => clearInterval(t);
    }, []);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getStudentDashboardSummary();
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract data from API response
  const profile = dashboardData?.profile || {};
  const academic = dashboardData?.academic || {};
  const attendance = dashboardData?.attendance || {};
  const recentResults = dashboardData?.recentResults || [];
  const notices = dashboardData?.notices || [];
  const links = dashboardData?.links || [];
  const upcomingSessions = dashboardData?.upcomingSessions || [];

  // Dashboard cards with real data from API
  const dashboardCards = [
    {
      title: "Current CGPA",
      value: loading ? "Loading..." : (academic.cgpa?.cgpaValue || 0).toFixed(2),
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      change: loading ? "" : `${academic.subjectsCompleted || 0} subjects completed`,
      trend: "up",
      color: "border-l-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50"
    },
    {
      title: "Attendance Rate",
      value: loading ? "Loading..." : `${attendance.rate || 0}%`,
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      change: "Current Semester",
      trend: attendance.rate >= 75 ? "up" : "down",
      color: "border-l-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50"
    },
    {
      title: "Credits Completed",
      value: loading ? "Loading..." : `${academic.creditsCompleted || 0}/${academic.minCreditsToGraduate || 120}`,
      icon: <School className="w-6 h-6 text-violet-600" />,
      change: loading ? "" : `${academic.creditsProgress || 0}% progress`,
      trend: "neutral",
      color: "border-l-violet-600",
      bgGradient: "from-violet-50 to-violet-100/50"
    }
  ];

  // Process GPA data for GpaSummary component
  const getSemesterData = () => {
    const gpaTrend = dashboardData?.academicPerformance?.gpaTrend || [];
    if (gpaTrend.length === 0) {
      return [
        {
          label: "Current CGPA",
          value: (academic.cgpa?.cgpaValue || 0).toFixed(2),
          current: true
        }
      ];
    }
    const semesters = gpaTrend.map(item => ({
      label: item.semesterName || 'N/A',
      value: (item.gpa || 0).toFixed(2),
      current: item.semesterStatus === 'inprogress'
    }));
    semesters.push({
      label: "Overall CGPA",
      value: (academic.cgpa?.cgpaValue || 0).toFixed(2),
      current: false
    });
    return semesters;
  };

  const gpa = loading ? "0.00" : (academic.cgpa?.cgpaValue || 0).toFixed(2);
  const semesters = getSemesterData();

  // Process attendance overview from API
  const getAttendanceSubjects = () => {
    if (!attendance.overview) return [];
    
    return attendance.overview.map(item => {
      const percent = item.attendancePercentage || 0;
      let color = "bg-red-500";
      if (percent >= 75) color = "bg-emerald-500";
      else if (percent >= 60) color = "bg-amber-400";
      
      return {
        name: item.subject?.name || 'Unknown Subject',
        percent: `${percent}%`,
        color: color,
        width: `${percent}%`
      };
    });
  };

  const attendanceSubjects = getAttendanceSubjects();

  // Process recent results from API
  const getFormattedResults = () => {
    return recentResults.map(result => ({
      code: result.subjectCode,
      name: result.subjectName,
      marks: parseInt(result.marks) || 0,
      grade: result.grade,
      gradeBg: getGradeBackground(result.grade),
      gradeText: getGradeTextColor(result.grade),
      credits: result.credits,
      date: result.date ? new Date(result.date).toISOString().split('T')[0] : 'N/A'
    }));
  };

  // Helper functions for grade styling
  const getGradeBackground = (grade) => {
    if (!grade) return 'bg-gray-100';
    if (grade.startsWith('A')) return 'bg-emerald-100';
    if (grade.startsWith('B')) return 'bg-blue-100';
    if (grade.startsWith('C')) return 'bg-amber-100';
    return 'bg-gray-100';
  };

  const getGradeTextColor = (grade) => {
    if (!grade) return 'text-gray-700';
    if (grade.startsWith('A')) return 'text-emerald-700';
    if (grade.startsWith('B')) return 'text-blue-700';
    if (grade.startsWith('C')) return 'text-amber-700';
    return 'text-gray-700';
  };

  const formattedResults = getFormattedResults();

  // Process notices from API
  const getFormattedNotices = () => {
    return notices.slice(0, 3).map(notice => {
      const categoryColors = {
        academic: { iconColor: "text-blue-600", border: "border-blue-200", bg: "bg-gradient-to-br from-blue-50 to-blue-100/30" },
        general: { iconColor: "text-amber-600", border: "border-amber-200", bg: "bg-gradient-to-br from-amber-50 to-amber-100/30" },
        announcement: { iconColor: "text-emerald-600", border: "border-emerald-200", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/30" }
      };
      
      const colors = categoryColors[notice.category] || categoryColors.general;
      const icon = notice.isPinned ? "push_pin" : notice.priority === "high" ? "warning" : "campaign";
      
      const timeAgo = getTimeAgo(new Date(notice.publishDate));
      
      return {
        icon: icon,
        iconColor: colors.iconColor,
        border: colors.border,
        bg: colors.bg,
        title: notice.title,
        desc: notice.excerpt || notice.content.substring(0, 100) + '...',
        time: `Posted ${timeAgo}`
      };
    });
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formattedNotices = getFormattedNotices();

  // Hard-coded quick actions
  const quickActions = [
    {
      icon: <FileText className="w-10 h-10 text-blue-600" />,
      title: "Check Results",
      link: "/student/results",
      linkText: "View Results"
    },
    {
      icon: <Calendar className="w-10 h-10 text-emerald-600" />,
      title: "Attendance",
      link: "/student/attendance",
      linkText: "View Attendance"
    },
    {
      icon: <Receipt className="w-10 h-10 text-amber-600" />,
      title: "Medical Reports",
      link: "/student/medical-reports",
      linkText: "Submit Report"
    },
    {
      icon: <School className="w-10 h-10 text-violet-600" />,
      title: "Enroll Courses",
      link: "/student/register-for-new-course",
      linkText: "Enroll for Courses"
    }
  ];

  // Process special links from API
  const getSpecialLinks = () => {
    return links.map(link => ({
      icon: <Link className="w-5 h-5" />,
      title: link.title,
      description: link.description?.substring(0, 100) + '...',
      link: link.url,
      linkText: "Open Link",
      external: link.openMode === 'newtab',
      category: link.category,
      priority: link.priority
    }));
  };

  const specialLinks = getSpecialLinks();

  // Process upcoming sessions
  const getUpcomingSessions = () => {
    return upcomingSessions.slice(0, 4).map(session => {
      const sessionDate = new Date(session.date);
      return {
        id: session.id,
        subject: session.courseOffering?.subject?.name || 'Unknown Subject',
        topic: session.topic,
        date: sessionDate.toLocaleDateString(),
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: session.location,
        duration: `${session.durationMinutes} min`
      };
    });
  };

  const upcomingSessionsList = getUpcomingSessions();

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/30">
      <div className="max-w-8xl mx-auto p-6 lg:p-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 lg:px-8 py-8 rounded-2xl shadow-xl mb-8 border border-blue-200/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Student Dashboard</h1>
              </div>
              <p className="text-blue-100 text-base lg:text-lg font-medium">
                {loading
                  ? "Loading student information..."
                  : `${profile.studentNo || 'N/A'} - ${profile.name || 'N/A'}`
                }
              </p>
              {/* Align degree program and batch badges horizontally */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {!loading && profile.degreeProgram && (
                  <span className="flex text-sm items-center bg-white px-3 py-1 rounded-full shadow-sm">
                     <GraduationCap className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="">{profile.degreeProgram}</span>
                  </span>
                )}
                {!loading && profile.batch && (
                  <span className="flex text-sm items-center bg-white px-3 py-1 rounded-full shadow-sm">
                    <LucideGroup className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="">Batch {profile.batch}</span>
                  </span>
                )}
                <span className="flex text-sm items-center bg-white px-3 py-1 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 mr-1 text-blue-600" />
                  {currentDateTime.toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",second:"2-digit" })}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-900">
                  Error loading data
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.bgGradient} rounded-xl shadow-lg hover:shadow-xl border-l-4 ${card.color} p-6 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {card.icon}
                </div>
                {card.trend === "up" && <TrendingUp className="w-5 h-5 text-emerald-600" />}
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              <p className="text-sm text-gray-600">{card.change}</p>
            </div>
          ))}
        </div>

        {/* GPA and Attendance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GpaSummary gpa={gpa} semesters={semesters} />
          <AttendanceOverview subjects={attendanceSubjects} />
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessionsList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 mb-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                Upcoming Sessions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessionsList.map((session) => (
                <div key={session.id} className="group border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{session.subject}</h3>
                    <Target className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">📚 {session.topic}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{session.date}</span>
                    <span className="text-gray-400">•</span>
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      📍 {session.location}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      ⏱️ {session.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {formattedResults.length > 0 && (
          <RecentResultsTable results={formattedResults} />
        )}

        {/* Notices */}
        {formattedNotices.length > 0 && (
          <NoticeList notices={formattedNotices} />
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <a
                key={idx}
                href={action.link}
                className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col items-start">
                  <div className="mb-3">
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                  <span className="text-sm text-gray-600 group-hover:text-blue-500 transition-colors">
                    {action.linkText}
                  </span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Special Links */}
        {specialLinks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg">
                <Link className="w-6 h-6 text-white" />
              </div>
              Special Links
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {specialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.link}
                  target={link.external ? "_blank" : "_self"}
                  rel={link.external ? "noopener noreferrer" : ""}
                  className="group relative bg-gradient-to-br from-blue-50 to-violet-50/30 border-2 border-blue-200 rounded-xl p-5 hover:border-violet-400 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
                      <div className="text-violet-600">
                        {link.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                          {link.title}
                        </h3>
                        {link.priority === 'highlight' && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full whitespace-nowrap">
                            Featured
                          </span>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {link.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-violet-600 font-medium group-hover:underline">
                          {link.linkText}
                        </span>
                        {link.external && (
                          <span className="text-violet-600 text-xs">↗</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}