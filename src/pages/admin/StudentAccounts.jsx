import React, { useState, useEffect } from "react";
import { Plus, Upload, Users, UserCheck, UserX, Clock } from "lucide-react";
import DataTable from "../../components/DataTable";
import StudentManagementService from "../../services/super-admin/studentManagementService";
import { showToast } from "../utils/showToast.jsx";
import CommonDataService from "../../services/common/commonDataService";
import { useNavigate } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent.jsx";


export default function StudentAccounts({ showConfirm }) {
  // Table actions (including delete with confirm)
  const handleConfirmDelete = async (item) => {
    if (!item) return;
    try {
      console.log("Deleting student:", item);
      const response = await StudentManagementService.deleteStudent(item.id);
      if (response && response.success) {
        showToast("success", "Deleted", `Student ${item.studentName} deleted successfully.`);
        // Update UI by filtering out the deleted student using the correct id field
        setStudents((prev) => prev.filter((student) => student.id !== item.id));
        // Also update stats
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          active: item.status === "Active" ? prev.active - 1 : prev.active,
          inactive: item.status === "Inactive" ? prev.inactive - 1 : prev.inactive
        }));
      } else {
        const errorMsg = response?.message || (response?.errors?.[0]?.message) || "Failed to delete student.";
        showToast("error", "Error", errorMsg);
      }
    } catch (error) {
      let errorMsg = "Failed to delete student.";
      if (error?.response?.data) {
        errorMsg = error.response.data.message || (error.response.data.errors?.[0]?.message) || errorMsg;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      showToast("error", "Error", errorMsg);
    }
  };

  const tableActions = {
    onView: (item) => {
      console.log("View student:", item);
      navigate("/admin/create-student-acc", { state: { batchPrograms, student: item._apiStudent, readOnly: true } });
    },
    onEdit: (item) => {
  console.log("Edit student:", item);
  navigate("/admin/create-student-acc", { state: { batchPrograms, student: item._apiStudent } });
    },
    onDelete: (item) => {
      showConfirm(
        "Delete Student Account",
        `Are you sure you want to delete ${item.studentName}?`,
        () => handleConfirmDelete(item)
      );
    },
  };
  
  const [students, setStudents] = useState([]);
  const [batchPrograms, setBatchPrograms] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0); // total count from API meta
  const [totalPages, setTotalPages] = useState(1); // total pages from API meta

        const formatDate = (iso) => {
          if (!iso) return "";
          const d = new Date(iso);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().slice(0, 10);
        };

  // Fetch batch programs first, then fetch students only after batch programs are loaded
  useEffect(() => {
    let isMounted = true;
    // Use AbortController to cancel previous inflight requests if component unmounts or search/page changes
    const controller = new AbortController();
    async function fetchBatchProgramsAndStudents() {
      setLoading(true);
      setError(null);
      try {
        const batchResponse = await CommonDataService.getAllBatchPrograms({ options: { signal: controller.signal } });
        let batchList = [];
        if (batchResponse && batchResponse.success) {
          batchList = batchResponse.data || [];
          if (isMounted) setBatchPrograms(batchList);
        } else {
          console.error("Failed to fetch batch programs:", batchResponse);
        }

        // Now fetch students after batch programs are loaded
        const studentResponse = await StudentManagementService.getAllStudents({ limit: itemsPerPage, page, search: searchQuery, options: { signal: controller.signal } });
        if (studentResponse && studentResponse.success && studentResponse.data) {
          const apiStudents = studentResponse.data.students || [];
          // Map and normalize
          const mappedStudents = apiStudents.map((student, idx) => {
            let programName = "-";
            let programId = student.profile?.batchId || "";
            if (programId && Array.isArray(batchList)) {
              const batch = batchList.find(b => b.id === programId);
              if (batch && batch.name) programName = batch.name;
            }
            return {
              id: student.id,
              studentNo: student.studentNo || student.profile?.studentNo,
              studentName: student.profile?.fullName || `${student.firstName} ${student.lastName}`,
              email: student.email,
              phone: student.phone || "-",
              gender: student.gender || "-",
              status: student.profile?.status ? (student.profile.status === "active" ? "Active" : "Inactive") : "Unknown",
              program: programId,
              programName,
              year: "-",
              _apiStudent: {
                ...student,
                program: programId,
                dateOfBirth: formatDate(student.dateOfBirth || student.profile?.dateOfBirth || ""),
                parentName: student.parentName || student.profile?.parentName || "",
                studentNo: student.studentNo || student.profile?.studentNo || "",
                parentPhone: student.parentPhone || student.profile?.parentPhone || "",
                emergencyContact: student.emergencyContactName || student.profile?.emergencyContactName || "",
                emergencyPhone: student.emergencyContactPhone || student.profile?.emergencyContactPhone || "",
                uniRegistrationDate: formatDate(student.uniRegistrationDate || student.profile?.uniRegistrationDate || ""),
              }
            };
          });
          if (isMounted) {
            setStudents(mappedStudents);
            setStats(studentResponse.data.stats || { total: mappedStudents.length, active: 0, inactive: 0 });
            // Set pagination meta from API response
            const meta = studentResponse.data.meta || {};
            setTotalCount(typeof meta.totalCount === 'number' ? meta.totalCount : (studentResponse.data.total || studentResponse.data.stats?.total || mappedStudents.length));
            setTotalPages(typeof meta.totalPages === 'number' ? meta.totalPages : Math.ceil((studentResponse.data.total || mappedStudents.length) / itemsPerPage));
            setPage(typeof meta.currentPage === 'number' ? meta.currentPage : page);
          }
        } else {
          setError((studentResponse && studentResponse.message) || "Failed to fetch students");
        }
      } catch (err) {
        // If aborted, ignore
        if (err.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          setError(err.message || "API error");
        }
      }
      if (isMounted) setLoading(false);
    }

    fetchBatchProgramsAndStudents();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, itemsPerPage, searchQuery]);

  // Debounce search input to avoid rapid API requests
  const searchDebounceRef = React.useRef(null);
  const handleDebouncedSearch = (q) => {
    // Clear any pending debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    // Delay updating the actual searchQuery which triggers the effect
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(q);
      setPage(1); // Reset to first page when searching
    }, 450); // 450ms debounce
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);


  const navigate = useNavigate();

  // Navigation functions

  const navigateToCreate = () => {
    navigate("/admin/create-student-acc", { state: { batchPrograms } });
  };
  const navigateToImport = () => {
    navigate("/admin/bulk-import-students", { state: { batchPrograms } });
  };

  

  // Handle form submissions
  const handleSaveStudent = (studentData) => {
    const newStudent = {
      studentNo: studentData.studentNo,
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      email: studentData.email,
      phone: studentData.phone,
      gender: studentData.gender,
      status: "Active",
      program: studentData.program,
      year: studentData.year,
    };

    setStudents((prev) => [...prev, newStudent]);
    
  };

  const handleBulkImport = (importedData) => {
    const newStudents = importedData.map((student, index) => ({
      studentNo: student.studentNo,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      status: "Active",
      program: student.program,
      year: student.year || "1st Year",
    }));

    setStudents((prev) => [...prev, ...newStudents]);
    
  };

  // Table configuration
  const columns = [
  { key: "studentNo", header: "Student No" },
  { key: "studentName", header: "Student Name" },
  { key: "programName", header: "Batch" },
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



  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // ...existing code...



  // Main view
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70  min-h-screen">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Account Management</h1>
            <p className="text-gray-600">Manage student accounts, create new accounts, and import bulk data</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div onClick={navigateToCreate} className="group bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl p-4 shadow-xl border border-indigo-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="text-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-1">Create Student Account</h2>
              <p className="text-indigo-100 mb-3 leading-relaxed text-xs">Add a new student with academic details</p>
              <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg text-xs">
                <Plus className="w-3 h-3" />
                Create Student
              </div>
            </div>
          </div>
          <div onClick={navigateToImport} className="group bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-xl p-4 shadow-xl border border-emerald-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="text-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-1">Bulk Import Students</h2>
              <p className="text-emerald-100 mb-3 leading-relaxed text-xs">Import CSV/Excel files efficiently</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All registered students</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Inactive Students</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
                <p className="text-xs text-gray-500 mt-1">Not currently enrolled</p>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading/Error State */}
        
          <>
            <DataTable
              title="Student Accounts Directory"
              searchPlaceholder="Search students by name, ID, or email..."
              columns={columns}
              data={students}
              actions={tableActions}
              itemsPerPage={itemsPerPage}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onSearch={(q) => {
                // When search occurs, the debounced function will reset to first page
                handleDebouncedSearch(q);
              }}
              searchValue={searchQuery}
              loading={loading}
              
            />
          </>
        
      </div>
    </main>
  );
}