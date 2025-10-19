


import { useEffect, useState } from "react";
import {
  GraduationCap,
  Calendar,
  School,
  AlertCircle,
  FileText,
  LayoutDashboard,
  Link,
  Receipt
} from "lucide-react";
import DashboardCard from "../../components/DashboardCard";
import GpaSummary from "../../components/GpaSummary";
import AttendanceOverview from "../../components/AttendanceOverview";
import RecentResultsTable from "../../components/RecentResultsTable";
import NoticeList from "../../components/NoticeList";
import QuickActionCard from "../../components/QuickActionCard";
import LoadingComponent from "../../components/LoadingComponent";
import StudentService from "../../services/studentService";

export default function StudentDashboard() {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());
  const [gpaData, setGpaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchGPAData();
  }, []);

  const fetchGPAData = async () => {
    try {
      setLoading(true);
      const response = await StudentService.getStudentGPA();
      if (response.success) {
        setGpaData(response.data);
      } else {
        setError(response.message || 'Failed to fetch GPA data');
      }
    } catch (err) {
      setError('Failed to fetch GPA data');
      console.error('Error fetching GPA data:', err);
    } finally {
      setLoading(false);
    }
  };

  

  // Calculate dashboard data from API response
  const currentGPA = gpaData?.gpa || 0;
  const totalCredits = gpaData?.totalCredits || 0;
  const totalSubjects = gpaData?.totalSubjects || 0;
  const studentInfo = gpaData?.student;

  // Dashboard cards with real data
  const dashboardCards = [
    {
      title: "Current GPA",
      value: loading ? "Loading..." : currentGPA.toFixed(2),
      icon: <GraduationCap className="w-6 h-6 text-blue-900" />,
      change: loading ? "" : `${totalSubjects} subjects completed`,
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
      value: loading ? "Loading..." : `${totalCredits}/120`,
      icon: <School className="w-6 h-6 text-blue-900" />,
      change: loading ? "" : `${Math.round((totalCredits/120) * 100)}% progress`,
      trend: "neutral",
      color: "border-l-blue-900"
    }
  ];

  // Process semester data from API results
  const getSemesterData = () => {
    if (!gpaData?.results) return [{ label: "Current", value: currentGPA.toFixed(2) }];
    
    const semesterGroups = {};
    gpaData.results.forEach(result => {
      const semesterKey = `${result.semester} ${result.year}`;
      if (!semesterGroups[semesterKey]) {
        semesterGroups[semesterKey] = [];
      }
      semesterGroups[semesterKey].push(result);
    });

    // Calculate GPA for each semester
    const semesters = Object.keys(semesterGroups).map(semester => {
      const results = semesterGroups[semester];
      const totalCredits = results.reduce((sum, r) => sum + r.credits, 0);
      const totalGradePoints = results.reduce((sum, r) => sum + (parseFloat(r.gradePoint) * r.credits), 0);
      const semesterGPA = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
      
      return {
        label: semester,
        value: semesterGPA.toFixed(2)
      };
    });

    // Add overall GPA as current
    semesters.push({
      label: "Overall",
      value: currentGPA.toFixed(2)
    });

    return semesters;
  };

  const gpa = loading ? "0.00" : currentGPA.toFixed(2);
  const semesters = getSemesterData();

  const attendanceSubjects = [
    { name: "Research Project I", percent: "92%", color: "bg-green-500", width: "92%" },
    { name: "Research Project II", percent: "85%", color: "bg-green-500", width: "85%" },
    { name: "Capstone Project", percent: "78%", color: "bg-yellow-400", width: "78%" },
    { name: "Professional Ethics and Human Value", percent: "88%", color: "bg-green-500", width: "88%" },
    { name: "Industrial Operations Management", percent: "75%", color: "bg-yellow-400", width: "75%" },
    { name: "Entrepreneurship", percent: "90%", color: "bg-green-500", width: "90%" }
  ];


  // Process recent results from API data
  const getRecentResults = () => {
    if (!gpaData?.results) return [];
    
    // Sort results by date (most recent first) and take top 9
    return gpaData.results
      .map(result => ({
        code: result.courseCode,
        name: result.courseName,
        marks: parseInt(result.marks),
        grade: result.grade,
        gradeBg: getGradeBackground(result.grade),
        gradeText: getGradeTextColor(result.grade),
        credits: result.credits,
        date: new Date().toISOString().split('T')[0] // Using current date since API doesn't provide exam date
      }))
      .slice(0, 9); // Limit to 9 results like the original
  };

  // Helper functions for grade styling
  const getGradeBackground = (grade) => {
    if (grade.startsWith('A')) return 'bg-green-100';
    if (grade.startsWith('B')) return 'bg-lime-100';
    if (grade.startsWith('C')) return 'bg-yellow-100';
    return 'bg-gray-100';
  };

  const getGradeTextColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-700';
    if (grade.startsWith('B')) return 'text-lime-700';
    if (grade.startsWith('C')) return 'text-yellow-700';
    return 'text-gray-700';
  };

  const recentResults = getRecentResults();


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
      title: "Special Links",
      link: "special-links.html",
      linkText: "Special Links"
    }
  ];

  // ...existing code...
  if (loading && !error) {
    // Show page-level loader while fetching GPA data
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto p-8">
          <LoadingComponent message="Loading student dashboard..." />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto p-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Student Dashboard</h1>
            <p className="text-blue-100 mt-2">
              {loading
                ? "Loading student information..."
                : `${studentInfo?.studentNo || 'N/A'} - ${studentInfo?.user?.firstName || ''} ${studentInfo?.user?.lastName || ''} - Computer Science`
              }
            </p>

            <p className="text-blue-100/90 mt-1 text-sm">{dateTime}</p>
          </div>
          <div className="hidden md:block">
            <LayoutDashboard size={48} className="text-blue-200" />
          </div>

        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </div>

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
