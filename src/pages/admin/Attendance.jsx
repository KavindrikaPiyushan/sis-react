import React, { useState } from "react";
import { Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, Upload, Calendar, Users, BookOpen, X, Download, FileText } from "lucide-react";

// DataTable Component with enhanced filtering
const DataTable = ({ 
  columns, 
  data, 
  actions, 
  title = "Data Table",
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilter = true,
  itemsPerPage = 10,
  filterOptions = null,
  onFilterChange = null 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({});

  const applyFilters = (item) => {
    // Apply search filter
    const matchesSearch = Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (!matchesSearch) return false;

    // Apply custom filters
    if (filterOptions && Object.keys(filters).length > 0) {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        return item[key] === value;
      });
    }

    return true;
  };

  const filteredData = data.filter(applyFilters);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            currentPage === i
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredData.length} total records
            </p>
          </div>
          
          {(showSearch || showFilter) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full sm:w-64 bg-white shadow-sm"
                  />
                </div>
              )}
              
              {showFilter && filterOptions && (
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter</span>
                  </button>
                  
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                      <div className="p-4 space-y-4">
                        {filterOptions.map((option) => (
                          <div key={option.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {option.label}
                            </label>
                            <select
                              value={filters[option.key] || 'all'}
                              onChange={(e) => handleFilterChange(option.key, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                            >
                              <option value="all">All {option.label}</option>
                              {option.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setFilters({});
                            setShowFilterMenu(false);
                          }}
                          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-all duration-200">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center gap-1">
                        {actions.onView && (
                          <button
                            onClick={() => actions.onView(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {actions.onEdit && (
                          <button
                            onClick={() => actions.onEdit(item)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            onClick={() => actions.onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
            <span className="font-medium">{filteredData.length}</span> results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            {renderPaginationButtons()}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

// Upload Form Component
const UploadAttendanceForm = ({ module, onSubmit, onCancel }) => {
  const [uploadForm, setUploadForm] = useState({
    batch: '',
    date: '',
    file: null
  });

  const batches = ["Batch A", "Batch B", "Batch C", "Batch D"];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadForm({ ...uploadForm, file });
  };

  const handleSubmit = () => {
    if (uploadForm.batch && uploadForm.date && uploadForm.file) {
      onSubmit(uploadForm);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center`}>
          <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Upload Attendance</h2>
          <p className="text-gray-600">Upload attendance file for {module.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={uploadForm.batch}
              onChange={(e) => setUploadForm({ ...uploadForm, batch: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Choose a batch</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={uploadForm.date}
              onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-600"> or drag and drop</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Excel files only (.xlsx, .xls)</p>
            {uploadForm.file && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {uploadForm.file.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            disabled={!uploadForm.batch || !uploadForm.date || !uploadForm.file}
          >
            Upload Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Attendance Component
export default function Attendance() {
  const [currentView, setCurrentView] = useState('modules'); // 'modules', 'module-detail', 'attendance-detail'
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Sample modules data
  const modules = [
    { id: 1, name: "Web Development", code: "WD101", students: 45, color: "from-blue-500 to-blue-600" },
    { id: 2, name: "Data Science", code: "DS201", students: 38, color: "from-green-500 to-green-600" },
    { id: 3, name: "Mobile App Development", code: "MAD301", students: 32, color: "from-purple-500 to-purple-600" },
    { id: 4, name: "Machine Learning", code: "ML401", students: 28, color: "from-orange-500 to-orange-600" },
    { id: 5, name: "Database Management", code: "DB101", students: 42, color: "from-red-500 to-red-600" },
    { id: 6, name: "UI/UX Design", code: "UX201", students: 35, color: "from-pink-500 to-pink-600" }
  ];

  // Sample attendance records
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      moduleId: 1,
      module: "Web Development",
      batch: "Batch A",
      date: "2024-01-15",
      totalStudents: 45,
      present: 42,
      absent: 3,
      percentage: 93.3,
      uploadedBy: "John Doe",
      uploadedAt: "2024-01-15 09:30 AM"
    },
    {
      id: 2,
      moduleId: 1,
      module: "Web Development",
      batch: "Batch B",
      date: "2024-01-14",
      totalStudents: 45,
      present: 40,
      absent: 5,
      percentage: 88.9,
      uploadedBy: "Jane Smith",
      uploadedAt: "2024-01-14 10:15 AM"
    },
    {
      id: 3,
      moduleId: 2,
      module: "Data Science",
      batch: "Batch A",
      date: "2024-01-13",
      totalStudents: 38,
      present: 35,
      absent: 3,
      percentage: 92.1,
      uploadedBy: "Mike Johnson",
      uploadedAt: "2024-01-13 11:00 AM"
    }
  ]);

  // Sample detailed attendance data
  const detailedAttendanceData = {
    1: [
      { id: "S001", name: "Alice Johnson", email: "alice@example.com", status: "Present", timeIn: "09:00 AM" },
      { id: "S002", name: "Bob Wilson", email: "bob@example.com", status: "Present", timeIn: "09:05 AM" },
      { id: "S003", name: "Carol Davis", email: "carol@example.com", status: "Absent", timeIn: "-" },
      { id: "S004", name: "David Brown", email: "david@example.com", status: "Present", timeIn: "08:58 AM" },
      { id: "S005", name: "Eva Martinez", email: "eva@example.com", status: "Present", timeIn: "09:02 AM" }
    ],
    2: [
      { id: "S006", name: "Frank Wilson", email: "frank@example.com", status: "Present", timeIn: "09:10 AM" },
      { id: "S007", name: "Grace Lee", email: "grace@example.com", status: "Absent", timeIn: "-" },
      { id: "S008", name: "Henry Davis", email: "henry@example.com", status: "Present", timeIn: "09:15 AM" },
      { id: "S009", name: "Ivy Chen", email: "ivy@example.com", status: "Present", timeIn: "09:00 AM" }
    ]
  };

  const attendanceColumns = [
    { key: "batch", header: "Batch" },
    { key: "date", header: "Date" },
    { key: "totalStudents", header: "Total Students" },
    { key: "present", header: "Present" },
    { key: "absent", header: "Absent" },
    {
      key: "percentage",
      header: "Attendance %",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value >= 90 ? 'bg-green-100 text-green-800' : 
          value >= 75 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {value.toFixed(1)}%
        </span>
      )
    },
    { key: "uploadedBy", header: "Uploaded By" },
    { key: "uploadedAt", header: "Uploaded At" }
  ];

  const detailColumns = [
    { key: "id", header: "Student ID" },
    { key: "name", header: "Student Name" },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: "timeIn", header: "Time In" }
  ];

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentView('module-detail');
  };

  const handleUploadSubmit = (formData) => {
    const newRecord = {
      id: attendanceRecords.length + 1,
      moduleId: selectedModule.id,
      module: selectedModule.name,
      batch: formData.batch,
      date: formData.date,
      totalStudents: selectedModule.students,
      present: Math.floor(Math.random() * selectedModule.students * 0.2) + Math.floor(selectedModule.students * 0.8),
      absent: 0,
      uploadedBy: "Current User",
      uploadedAt: new Date().toLocaleString()
    };
    
    newRecord.absent = newRecord.totalStudents - newRecord.present;
    newRecord.percentage = (newRecord.present / newRecord.totalStudents) * 100;
    
    setAttendanceRecords([...attendanceRecords, newRecord]);
    setShowUploadForm(false);
  };

  const handleViewAttendance = (record) => {
    setSelectedAttendanceRecord(record);
    setCurrentView('attendance-detail');
  };

  const getModuleAttendanceRecords = () => {
    return attendanceRecords.filter(record => record.moduleId === selectedModule?.id);
  };

  const getFilterOptions = () => {
    const moduleRecords = getModuleAttendanceRecords();
    const batches = [...new Set(moduleRecords.map(record => record.batch))];
    const dates = [...new Set(moduleRecords.map(record => record.date))];
    
    return [
      {
        key: 'batch',
        label: 'Batch',
        options: batches
      },
      {
        key: 'date',
        label: 'Date',
        options: dates
      }
    ];
  };

  const attendanceActions = {
    onView: handleViewAttendance
  };

  // Modules Overview Page
  if (currentView === 'modules') {
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600">Manage student attendance across all modules</p>
          </div>

          {/* Module Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Module</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div 
                    className={`h-32 bg-gradient-to-r ${module.color} p-6 flex flex-col justify-between text-white`}
                    onClick={() => handleModuleSelect(module)}
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-1">{module.name}</h3>
                      <p className="text-sm opacity-90">{module.code}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{module.students} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">
                          {attendanceRecords.filter(r => r.moduleId === module.id).length} Records
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Module Detail Page
  if (currentView === 'module-detail' && selectedModule) {
    const moduleAttendanceRecords = getModuleAttendanceRecords();
    
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setCurrentView('modules')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Modules
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedModule.name}</h1>
              <p className="text-gray-600 mt-1">
                {selectedModule.code} • {selectedModule.students} Students
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {showUploadForm ? 'Cancel Upload' : 'Upload Attendance'}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <UploadAttendanceForm
              module={selectedModule}
              onSubmit={handleUploadSubmit}
              onCancel={() => setShowUploadForm(false)}
            />
          )}

          {/* Attendance Records Table */}
          <DataTable
            title={`${selectedModule.name} Attendance Records`}
            columns={attendanceColumns}
            data={moduleAttendanceRecords}
            actions={attendanceActions}
            searchPlaceholder="Search attendance records..."
            filterOptions={getFilterOptions()}
          />
        </div>
      </main>
    );
  }

  // Attendance Detail Page
  if (currentView === 'attendance-detail' && selectedAttendanceRecord) {
    const detailData = detailedAttendanceData[selectedAttendanceRecord.id] || [];
    
    return (
      <main className="flex-1 ml-0 mt-16 transition-all duration-300 lg:ml-70 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setCurrentView('module-detail')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to {selectedModule.name}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Details</h1>
              <p className="text-gray-600 mt-1">
                {selectedAttendanceRecord.module} - {selectedAttendanceRecord.batch} - {selectedAttendanceRecord.date}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Attendance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedAttendanceRecord.totalStudents}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{selectedAttendanceRecord.present}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{selectedAttendanceRecord.absent}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    selectedAttendanceRecord.percentage >= 90 ? 'bg-green-100' :
                    selectedAttendanceRecord.percentage >= 75 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      selectedAttendanceRecord.percentage >= 90 ? 'text-green-600' :
                      selectedAttendanceRecord.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Attendance %</p>
                    <p className={`text-2xl font-bold ${
                      selectedAttendanceRecord.percentage >= 90 ? 'text-green-600' :
                      selectedAttendanceRecord.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedAttendanceRecord.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Student Attendance Details Table */}
          <DataTable
            title={`Student Attendance - ${selectedAttendanceRecord.batch} (${selectedAttendanceRecord.date})`}
            columns={detailColumns}
            data={detailData}
            searchPlaceholder="Search students..."
            filterOptions={[
              {
                key: 'status',
                label: 'Status',
                options: ['Present', 'Absent']
              }
            ]}
          />
        </div>
      </main>
    );
  }

  return null;
}