import React, { useState, useEffect } from "react";
import { Plus, Upload, Users, UserCheck, UserX, Clock } from "lucide-react";
import DataTable from "../../components/DataTable";
import AdminManagementService from "../../services/super-admin/adminManagementService";
import AdministrationService from "../../services/super-admin/administationService";
import { showToast } from "../utils/showToast.jsx";
import { useNavigate } from "react-router-dom";

export default function AdminAccounts({ showConfirm }) {
  // Table actions (including delete with confirm)
  const handleConfirmDelete = async (item) => {
    if (!item) return;
    try {
      console.log("Deleting admin:", item);
      const response = await AdminManagementService.deleteAdmin(item.id);
      if (response && response.success) {
        showToast("success", "Deleted", `Admin ${item.adminName} deleted successfully.`);
        // Update UI by filtering out the deleted admin using the correct id field
        setAdmins((prev) => prev.filter((admin) => admin.id !== item.id));
        // Also update stats
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
          active: item.status === "Active" ? prev.active - 1 : prev.active,
          inactive: item.status === "Inactive" ? prev.inactive - 1 : prev.inactive
        }));
      } else {
        const errorMsg = response?.message || (response?.errors?.[0]?.message) || "Failed to delete admin.";
        showToast("error", "Error", errorMsg);
      }
    } catch (error) {
      let errorMsg = "Failed to delete admin.";
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
      console.log("View admin:", item);
      navigate("/admin/create-admin-acc", { state: { departments, admin: item._apiAdmin, readOnly: true } });
    },
    onEdit: (item) => {
      console.log("Edit admin:", item);
      navigate("/admin/create-admin-acc", { state: { departments, admin: item._apiAdmin } });
    },
    onDelete: (item) => {
      showConfirm(
        "Delete Admin Account",
        `Are you sure you want to delete ${item.adminName}?`,
        () => handleConfirmDelete(item)
      );
    },
  };
  
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
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

  // Fetch departments first, then fetch admins only after departments are loaded
  useEffect(() => {
    let isMounted = true;
    // Use AbortController to cancel previous inflight requests if component unmounts or search/page changes
    const controller = new AbortController();
    
    async function fetchDepartmentsAndAdmins() {
      setLoading(true);
      setError(null);
      try {
        // Fetch departments first
        console.log("Fetching departments...");
        let departmentList = [];
        
        try {
          const departmentResponse = await AdministrationService.fetchAllDepartments({ options: { signal: controller.signal } });
          console.log("Department response received:", departmentResponse);
          
          // Check if response has success property
          if (departmentResponse && departmentResponse.success && departmentResponse.data) {
            departmentList = Array.isArray(departmentResponse.data) ? departmentResponse.data : [];
            console.log("Departments loaded successfully:", departmentList);
          }
          // Check if response is directly an array (different API format)
          else if (Array.isArray(departmentResponse)) {
            departmentList = departmentResponse;
            console.log("Departments loaded directly as array:", departmentList);
          }
          // Check if response has data property without success
          else if (departmentResponse && departmentResponse.data && Array.isArray(departmentResponse.data)) {
            departmentList = departmentResponse.data;
            console.log("Departments loaded from data property:", departmentList);
          }
          else {
            console.error("Unexpected department response format:", departmentResponse);
            departmentList = [];
          }
        } catch (error) {
          // If aborted, ignore
          if (error.name === 'AbortError') {
            console.log('Department request aborted');
            return;
          }
          console.error("Error fetching departments:", error);
          departmentList = [];
        }
        
        if (isMounted) setDepartments(departmentList);
        console.log("Final department list set:", departmentList);

        // Now fetch admins after departments are loaded
        console.log("Fetching admins with departments:", departmentList);
        const adminResponse = await AdminManagementService.getAllAdmins({ 
          limit: itemsPerPage, 
          page, 
          search: searchQuery,
          options: { signal: controller.signal } 
        });
        console.log("Admin response:", adminResponse);
        
        if (adminResponse && adminResponse.success && adminResponse.data) {
          // Handle different possible API response structures
          let apiAdmins = [];
          if (Array.isArray(adminResponse.data)) {
            apiAdmins = adminResponse.data;
          } else if (Array.isArray(adminResponse.data.lecturers)) {
            apiAdmins = adminResponse.data.lecturers;
          } else if (Array.isArray(adminResponse.data.admins)) {
            apiAdmins = adminResponse.data.admins;
          } else if (Array.isArray(adminResponse.data.users)) {
            apiAdmins = adminResponse.data.users;
          } else {
            console.warn("API response data is not an array:", adminResponse.data);
            apiAdmins = [];
          }
          
          console.log("API Admins (processed):", apiAdmins);
          
          // Create a department lookup map for faster access
          const departmentMap = {};
          if (Array.isArray(departmentList)) {
            departmentList.forEach(dept => {
              departmentMap[dept.id] = dept.name;
            });
          }
          console.log("Department lookup map:", departmentMap);
          
          if (apiAdmins.length > 0) {
            const mappedAdmins = apiAdmins.map((admin, idx) => {
              console.log("Processing admin:", admin.firstName, admin.lastName);
              
              // Get departmentId from profile or admin object
              let departmentId = admin.profile?.departmentId || admin.departmentId || "";
              console.log("Admin departmentId:", departmentId);
              
              // Find matching department using the map
              let departmentName = "-";
              if (departmentId && departmentMap[departmentId]) {
                departmentName = departmentMap[departmentId];
                console.log("Mapped department:", departmentId, "->", departmentName);
              } else {
                console.log("No department found for ID:", departmentId);
              }
              
              return {
                id: admin.id || admin._id,
                adminId: admin.profile?.lecturerId || admin.lecturerId || admin.adminId || `ADM${idx + 1}`,
                adminName: admin.profile?.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.name || `Admin ${idx + 1}`,
                email: admin.email || `admin${idx + 1}@example.com`,
                status: admin.profile?.status ? (admin.profile.status === "active" ? "Active" : "Inactive") : (admin.isActive ? "Active" : "Inactive"),
                role: admin.role || "Lecturer",
                department: departmentId, // For form select
                departmentName, // For table display
                lastLogin: formatDate(admin.lastLoginAt) || "Never",
                _apiAdmin: {
                  ...admin,
                  departmentId: departmentId, // Use departmentId for consistency
                  dateOfBirth: formatDate(admin.dateOfBirth || admin.profile?.dateOfBirth || ""),
                  adminId: admin.profile?.lecturerId || admin.lecturerId || admin.adminId || "",
                  emergencyContact: admin.profile?.emergencyContactName || admin.emergencyContactName || "",
                  emergencyPhone: admin.profile?.emergencyContactPhone || admin.emergencyContactPhone || "",
                }
              };
            });
            
            console.log("Mapped admins:", mappedAdmins);
            
            if (isMounted) {
              setAdmins(mappedAdmins);
              // Use stats from API if available, otherwise calculate from mapped data
              const apiStats = adminResponse.data.stats || {};
              setStats({
                total: apiStats.total || mappedAdmins.length,
                active: apiStats.active || mappedAdmins.filter(a => a.status === "Active").length,
                inactive: apiStats.inactive || mappedAdmins.filter(a => a.status === "Inactive").length
              });
              
              // Set pagination meta from API response
              const meta = adminResponse.data.meta || {};
              setTotalCount(typeof meta.totalCount === 'number' ? meta.totalCount : (adminResponse.data.total || apiStats.total || mappedAdmins.length));
              setTotalPages(typeof meta.totalPages === 'number' ? meta.totalPages : Math.ceil((adminResponse.data.total || mappedAdmins.length) / itemsPerPage));
              setPage(typeof meta.currentPage === 'number' ? meta.currentPage : page);
            }
          } else {
            console.log("No admins found in API response");
            if (isMounted) {
              setAdmins([]);
              setStats({ total: 0, active: 0, inactive: 0 });
              setTotalCount(0);
              setTotalPages(1);
            }
          }
        } else {
          console.log("No admin data found");
          if (isMounted) {
            setAdmins([]);
            setStats({ total: 0, active: 0, inactive: 0 });
            setTotalCount(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        // If aborted, ignore
        if (err.name === 'AbortError') {
          console.log('Request aborted');
        } else {
          console.error("Error in fetchDepartmentsAndAdmins:", err);
          setError(err.message || "API error");
          
          if (isMounted) {
            setAdmins([]);
            setStats({ total: 0, active: 0, inactive: 0 });
          }
        }
      }
      if (isMounted) setLoading(false);
    }
    
    fetchDepartmentsAndAdmins();
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
    navigate("/admin/create-admin-acc", { state: { departments } });
  };
  const navigateToImport = () => {
    navigate("/admin/bulk-import-admins", { state: { departments } });
  };

  // Handle form submissions
  const handleSaveAdmin = (adminData) => {
    const newAdmin = {
      adminId: adminData.adminId,
      adminName: `${adminData.firstName} ${adminData.lastName}`,
      email: adminData.email,
      status: "Pending",
      role: adminData.role,
      department: adminData.department,
      lastLogin: "Never",
    };

    setAdmins((prev) => [...prev, newAdmin]);
  };

  const handleBulkImport = (importedData) => {
    const newAdmins = importedData.map((admin, index) => ({
      adminId: admin.adminId,
      adminName: `${admin.firstName} ${admin.lastName}`,
      email: admin.email,
      status: "Pending",
      role: admin.role || "System Admin",
      department: admin.department || "General",
      lastLogin: "Never",
    }));

    setAdmins((prev) => [...prev, ...newAdmins]);
  };

  // Table configuration
  const columns = [
    { key: "adminId", header: "Lecturer ID" },
    { key: "adminName", header: "Lecturer Name" },
    { key: "role", header: "Role" },
    { key: "departmentName", header: "Department" },
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

  // Main view
  return (
    <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
      {/* Header Section */}
       <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center pb-6 lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Account Management
            </h1>
            <p className="text-gray-600">
              Manage administrator accounts, create new admin accounts, and import bulk data
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
            <h2 className="text-lg font-bold mb-1">Create Admin Account</h2>
            <p className="text-indigo-100 mb-3 leading-relaxed text-xs">
              Add a new administrator with role permissions
            </p>
            <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg text-xs">
              <Plus className="w-3 h-3" />
              Create Admin
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
            <h2 className="text-lg font-bold mb-1">Bulk Import Admins</h2>
            <p className="text-emerald-100 mb-3 leading-relaxed text-xs">
              Import CSV/Excel files efficiently
            </p>
            <div className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium shadow-lg text-xs">
              <Upload className="w-3 h-3" />
              Import Admins
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
                Total Admins
              </p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                All administrator accounts
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
                Active Admins
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {stats.active}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
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
                Inactive Admins
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactive}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Deactivated accounts
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-pink-100 p-4 rounded-full">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

        {/* Loading/Error State */}
        <>
          {/* Admin Accounts Table */}
          <DataTable
            title="Administrator Accounts Directory"
            searchPlaceholder="Search admins by name, ID, or email..."
            columns={columns}
            data={admins}
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