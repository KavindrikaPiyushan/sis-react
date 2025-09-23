import React, { useState } from "react";
import { Plus, Upload, Users, UserCheck, UserX, Clock } from "lucide-react";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";

export default function AdminAccounts() {
  
  const [admins, setAdmins] = useState([
    {
      accId: "ADM001",
      adminId: "ADM2024001",
      adminName: "John Smith",
      email: "john.smith@admin.edu",
      status: "Active",
      role: "Super Admin",
      department: "IT Department",
      lastLogin: "2024-09-19",
    },
    {
      accId: "ADM002",
      adminId: "ADM2024002",
      adminName: "Emma Johnson",
      email: "emma.johnson@admin.edu",
      status: "Active",
      role: "Academic Admin",
      department: "Academic Affairs",
      lastLogin: "2024-09-18",
    },
    {
      accId: "ADM003",
      adminId: "ADM2024003",
      adminName: "Michael Brown",
      email: "michael.brown@admin.edu",
      status: "Inactive",
      role: "System Admin",
      department: "IT Department",
      lastLogin: "2024-08-15",
    },
    {
      accId: "ADM004",
      adminId: "ADM2024004",
      adminName: "Sarah Davis",
      email: "sarah.davis@admin.edu",
      status: "Active",
      role: "Finance Admin",
      department: "Finance",
      lastLogin: "2024-09-19",
    },
    {
      accId: "ADM005",
      adminId: "ADM2024005",
      adminName: "David Wilson",
      email: "david.wilson@admin.edu",
      status: "Active",
      role: "HR Admin",
      department: "Human Resources",
      lastLogin: "2024-09-17",
    },
    {
      accId: "ADM006",
      adminId: "ADM2024006",
      adminName: "Lisa Anderson",
      email: "lisa.anderson@admin.edu",
      status: "Active",
      role: "Academic Admin",
      department: "Academic Affairs",
      lastLogin: "Never",
    },
    {
      accId: "ADM007",
      adminId: "ADM2024007",
      adminName: "James Taylor",
      email: "james.taylor@admin.edu",
      status: "Active",
      role: "Registrar Admin",
      department: "Registrar Office",
      lastLogin: "2024-09-19",
    },
    {
      accId: "ADM008",
      adminId: "ADM2024008",
      adminName: "Mary Martinez",
      email: "mary.martinez@admin.edu",
      status: "Active",
      role: "Library Admin",
      department: "Library Services",
      lastLogin: "2024-09-16",
    },
    {
      accId: "ADM009",
      adminId: "ADM2024009",
      adminName: "Robert Garcia",
      email: "robert.garcia@admin.edu",
      status: "Inactive",
      role: "Facilities Admin",
      department: "Facilities",
      lastLogin: "2024-07-20",
    },
    {
      accId: "ADM010",
      adminId: "ADM2024010",
      adminName: "Jennifer Rodriguez",
      email: "jennifer.rodriguez@admin.edu",
      status: "Active",
      role: "Student Services Admin",
      department: "Student Services",
      lastLogin: "2024-09-18",
    },
  ]);

  const navigate = useNavigate();

  // Navigation functions
  const navigateToCreate = () => {
    navigate("/admin/create-admin-acc");
  };
  const navigateToImport = () => {
    navigate("/admin/bulk-import-admins");
  };

  // Handle form submissions
  const handleSaveAdmin = (adminData) => {
    const newAdmin = {
      accId: `ADM${String(admins.length + 1).padStart(3, "0")}`,
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
      accId: `ADM${String(admins.length + index + 1).padStart(3, "0")}`,
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
    { key: "accId", header: "Account ID" },
    { key: "adminId", header: "Admin ID" },
    { key: "adminName", header: "Admin Name" },
    { key: "role", header: "Role" },
    { key: "department", header: "Department" },
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
      console.log("View admin:", item);
      alert(`Viewing details for ${item.adminName}`);
    },
    onEdit: (item) => {
      console.log("Edit admin:", item);
      alert(`Edit functionality for ${item.adminName} would open here`);
    },
    onDelete: (item) => {
      if (
        window.confirm(`Are you sure you want to delete ${item.adminName}?`)
      ) {
        setAdmins((prev) =>
          prev.filter((admin) => admin.accId !== item.accId)
        );
      }
    },
  };

  // Statistics calculations
  const stats = {
    total: admins.length,
    active: admins.filter((a) => a.status === "Active").length,
    pending: admins.filter((a) => a.status === "Pending").length,
    inactive: admins.filter((a) => a.status === "Inactive").length,
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

      {/* Admin Accounts Table */}
      <DataTable
        title="Administrator Accounts Directory"
        searchPlaceholder="Search admins by name, ID, or email..."
        columns={columns}
        data={admins}
        actions={tableActions}
        itemsPerPage={8}
      /></div>
    </main>
  );
}