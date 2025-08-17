


import { useEffect, useState } from "react";
import {
  GraduationCap,
  Calendar,
  School,
  AlertCircle,
  FileText,
  Link,
  Receipt
} from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import GpaSummary from "../../components/GpaSummary";
import AttendanceOverview from "../../components/AttendanceOverview";
import RecentResultsTable from "../../components/RecentResultsTable";
import NoticeList from "../../components/NoticeList";
import QuickActionCard from "../../components/QuickActionCard";

export default function StudentDashboard() {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // ...existing code...
  const dashboardCards = [
    {
      title: "Current GPA",
      value: "3.65",
      icon: <GraduationCap className="w-6 h-6 text-blue-900" />,
      change: "+0.12 from last semester",
      trend: "up",
      color: "border-l-blue-900"
    },
    {
      title: "Attendance Rate",
      value: "87%",
      icon: <Calendar className="w-6 h-6 text-blue-900" />,
      change: "This semester",
      trend: "neutral",
      color: "border-l-blue-900"
    },
    {
      title: "Credits Completed",
      value: "78/120",
      icon: <School className="w-6 h-6 text-blue-900" />,
      change: "65% progress",
      trend: "neutral",
      color: "border-l-blue-900"
    },
    {
      title: "Pending Items",
      value: "2",
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
      change: "Requires attention",
      trend: "down",
      color: "border-l-red-600"
    }
  ];

  const gpa = "3.65";
  const semesters = [
    { label: "Semester 1", value: "3.2" },
    { label: "Semester 2", value: "3.4" },
    { label: "Semester 3", value: "3.8" },
    { label: "Current", value: "3.65" }
  ];

  const attendanceSubjects = [
    { name: "Computer Networks", percent: "92%", color: "bg-green-500", width: "92%" },
    { name: "Database Systems", percent: "85%", color: "bg-green-500", width: "85%" },
    { name: "Software Engineering", percent: "78%", color: "bg-yellow-400", width: "78%" },
    { name: "Web Technologies", percent: "90%", color: "bg-green-500", width: "90%" }
  ];

  const recentResults = [
    {
      code: "CS301",
      name: "Computer Networks",
      marks: 85,
      grade: "A",
      gradeBg: "bg-green-100",
      gradeText: "text-green-700",
      credits: 3,
      date: "2025-01-10"
    },
    {
      code: "CS302",
      name: "Database Systems",
      marks: 78,
      grade: "B+",
      gradeBg: "bg-lime-100",
      gradeText: "text-lime-700",
      credits: 3,
      date: "2025-01-08"
    },
    {
      code: "CS303",
      name: "Software Engineering",
      marks: 82,
      grade: "A-",
      gradeBg: "bg-green-100",
      gradeText: "text-green-700",
      credits: 4,
      date: "2025-01-05"
    },
    {
      code: "CS304",
      name: "Web Technologies",
      marks: 88,
      grade: "A",
      gradeBg: "bg-green-100",
      gradeText: "text-green-700",
      credits: 3,
      date: "2025-01-03"
    }
  ];

  const notices = [
    {
      icon: "campaign",
      iconColor: "text-blue-900",
      border: "border-blue-900",
      bg: "bg-blue-50",
      title: "Mid-Semester Examination Schedule",
      desc: "The mid-semester examination will be held from March 15-22, 2025. Check the detailed schedule...",
      time: "Posted 2 days ago"
    },
    {
      icon: "warning",
      iconColor: "text-yellow-500",
      border: "border-yellow-400",
      bg: "bg-yellow-50",
      title: "Registration Deadline Reminder",
      desc: "Reminder: Course registration for next semester closes on February 28, 2025...",
      time: "Posted 1 week ago"
    },
    {
      icon: "celebration",
      iconColor: "text-green-600",
      border: "border-green-500",
      bg: "bg-green-50",
      title: "Dean's List Recognition",
      desc: "Congratulations to students who made it to the Dean's List for exceptional academic performance...",
      time: "Posted 2 weeks ago"
    }
  ];

  const quickActions = [
    {
      icon: <FileText className="w-12 h-12 text-blue-900 mb-2" />,
      title: "Check Results",
      link: "results.html",
      linkText: "View Results"
    },
    {
      icon: <Calendar className="w-12 h-12 text-green-600 mb-2" />,
      title: "Attendance",
      link: "attendance.html",
      linkText: "View Attendance"
    },
    {
      icon: <Receipt className="w-12 h-12 text-yellow-500 mb-2" />,
      title: "Medical Reports",
      link: "medical-reports.html",
      linkText: "Submit Report"
    },
    {
      icon: <Link className="w-12 h-12 text-blue-500 mb-2" />,
      title: "Useful Links",
      link: "useful-links.html",
      linkText: "Quick Links"
    }
  ];

  // ...existing code...
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600 mb-0">TG/2021/001 - John Doe - Computer Science</p>
          <div className="flex items-center mt-4">
            <span className="text-sm text-gray-500">{dateTime}</span>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </div>

        {/* Quick Access Section */}
        {/* Quick Access Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GpaSummary gpa={gpa} semesters={semesters} />
          <AttendanceOverview subjects={attendanceSubjects} />
        </div>

  <RecentResultsTable results={recentResults} />

  <NoticeList notices={notices} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, idx) => (
            <QuickActionCard key={idx} {...action} />
          ))}
        </div>
      </div>
    </main>
  );
}
