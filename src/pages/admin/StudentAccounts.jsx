import React, { useState } from "react";
import { Plus, Upload, Users, UserCheck, UserX, Clock } from "lucide-react";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";

export default function StudentAccounts() {
  
  const [students, setStudents] = useState([
    {
      accId: "ACC001",
      studentId: "STU2024001",
      studentName: "John Smith",
      email: "john.smith@email.com",
      status: "Active",
      program: "Computer Science",
      year: "2nd Year",
    },
    {
      accId: "ACC002",
      studentId: "STU2024002",
      studentName: "Emma Johnson",
      email: "emma.johnson@email.com",
      status: "Active",
      program: "Business Admin",
      year: "1st Year",
    },
    {
      accId: "ACC003",
      studentId: "STU2024003",
      studentName: "Michael Brown",
      email: "michael.brown@email.com",
      status: "Inactive",
      program: "Engineering",
      year: "3rd Year",
    },
    {
      accId: "ACC004",
      studentId: "STU2024004",
      studentName: "Sarah Davis",
      email: "sarah.davis@email.com",
      status: "Active",
      program: "Medicine",
      year: "1st Year",
    },
    {
      accId: "ACC005",
      studentId: "STU2024005",
      studentName: "David Wilson",
      email: "david.wilson@email.com",
      status: "Active",
      program: "Liberal Arts",
      year: "2nd Year",
    },
    {
      accId: "ACC006",
      studentId: "STU2024006",
      studentName: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      status: "Active",
      program: "Computer Science",
      year: "1st Year",
    },
    {
      accId: "ACC007",
      studentId: "STU2024007",
      studentName: "James Taylor",
      email: "james.taylor@email.com",
      status: "Active",
      program: "Business Admin",
      year: "4th Year",
    },
    {
      accId: "ACC008",
      studentId: "STU2024008",
      studentName: "Mary Martinez",
      email: "mary.martinez@email.com",
      status: "Active",
      program: "Engineering",
      year: "2nd Year",
    },
    {
      accId: "ACC009",
      studentId: "STU2024009",
      studentName: "Robert Garcia",
      email: "robert.garcia@email.com",
      status: "Inactive",
      program: "Medicine",
      year: "3rd Year",
    },
    {
      accId: "ACC010",
      studentId: "STU2024010",
      studentName: "Jennifer Rodriguez",
      email: "jennifer.rodriguez@email.com",
      status: "Active",
      program: "Liberal Arts",
      year: "1st Year",
    },
  ]);

  const navigate = useNavigate();

  // Navigation functions
  const navigateToCreate = () => {
    navigate("/admin/create-student-acc");
  };
  const navigateToImport = () => {
    
    navigate("/admin/bulk-import-students");
  };

  

  // Handle form submissions
  const handleSaveStudent = (studentData) => {
    const newStudent = {
      accId: `ACC${String(students.length + 1).padStart(3, "0")}`,
      studentId: studentData.studentId,
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      status: "Active",
      program: studentData.program,
      year: studentData.year,
    };

    setStudents((prev) => [...prev, newStudent]);
    
  };

  const handleBulkImport = (importedData) => {
    const newStudents = importedData.map((student, index) => ({
      accId: `ACC${String(students.length + index + 1).padStart(3, "0")}`,
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      status: "Active",
      program: student.program,
      year: student.year || "1st Year",
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    
  };

  // Table configuration
  const columns = [
    { key: "accId", header: "Account ID" },
    { key: "studentId", header: "Student ID" },
    { key: "studentName", header: "Student Name" },
    { key: "program", header: "Program" },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "Active"
              ? "bg-emerald-100 text-emerald-800"
              : value === "Inactive"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const tableActions = {
    onView: (item) => {
      console.log("View student:", item);
      alert(`Viewing details for ${item.studentName}`);
    },
    onEdit: (item) => {
      console.log("Edit student:", item);
      alert(`Edit functionality for ${item.studentName} would open here`);
    },
    onDelete: (item) => {
      if (
        window.confirm(`Are you sure you want to delete ${item.studentName}?`)
      ) {
        setStudents((prev) =>
          prev.filter((student) => student.accId !== item.accId)
        );
      }
    },
  };

  // Statistics calculations
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "Active").length,
    pending: students.filter((s) => s.status === "Pending").length,
    inactive: students.filter((s) => s.status === "Inactive").length,
  };



  // Main view
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Account Management
            </h1>
            <p className="text-gray-600">
              Manage student accounts, create new accounts, and import bulk data
            </p>
          </div>
        </div>
      

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div
          onClick={navigateToCreate}
          className="group bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl p-4 shadow-xl border border-indigo-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1">Create Student Account</h2>
            <p className="text-indigo-100 mb-3 leading-relaxed text-xs">
              Add a new student with academic details
            </p>
            <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg text-xs">
              <Plus className="w-3 h-3" />
              Create Student
            </div>
          </div>
        </div>

        <div
          onClick={navigateToImport}
          className="group bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-xl p-4 shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1">Bulk Import Students</h2>
            <p className="text-emerald-100 mb-3 leading-relaxed text-xs">
              Import CSV/Excel files efficiently
            </p>
            <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg text-xs">
              <Upload className="w-3 h-3" />
              Import Students
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Students
              </p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                All registered students
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Students
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.active}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently enrolled</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-4 rounded-full">
              <UserCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

       

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Inactive Students
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactive}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Not currently enrolled
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Student Accounts Table */}
      <DataTable
        title="Student Accounts Directory"
        searchPlaceholder="Search students by name, ID, or email..."
        columns={columns}
        data={students}
        actions={tableActions}
        itemsPerPage={8}
      /></div>
    </main>
  );
}
