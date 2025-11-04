import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Download, CheckCircle, AlertCircle, ArrowLeft, Eye, Trash2, Users, Shield, UserCheck, Loader } from "lucide-react";
import * as XLSX from 'xlsx';
import { AdministrationService } from '../services/super-admin/administationService';
import { AdminManagementService } from '../services/super-admin/adminManagementService';
import { showToast } from '../pages/utils/showToast';
import ConfirmDialog from './ConfirmDialog';

const BulkImportAdmins = ({ onBack, onImport, showConfirm }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, success, error
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [importResults, setImportResults] = useState(null); // { created: [], failed: [] }
  const fileInputRef = useRef(null);

  // Required columns for Excel file (only email and lecturerId are mandatory)
  const requiredColumns = [
    'email',
    'lecturerId'
  ];

  // All possible columns for template and processing
  const allColumns = [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'lecturerId',
    'address',
    'dateOfBirth',
    'emergencyContactName',
    'emergencyContactPhone'
  ];

  const sampleData = [
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '0779876543',
      lecturerId: 'L001',
      address: 'Faculty Office 1',
      dateOfBirth: '1985-06-15',
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '0774455665'
    },
    {
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'michael.smith@example.com',
      phone: '0779876544',
      lecturerId: 'L002', 
      address: 'Faculty Office 2',
      dateOfBirth: '1982-09-22',
      emergencyContactName: 'Sarah Smith',
      emergencyContactPhone: '0771122334'
    }
  ];

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await AdministrationService.fetchAllDepartments();
        console.log('Fetched departments:', response); // Debug log
        setDepartments(response || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        showToast('error', 'Error', 'Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admins");
    XLSX.writeFile(wb, "admin_import_template.xlsx");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setUploadStatus('processing');
    setErrors([]);
    setParsedData([]);

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setErrors(['The file appears to be empty or has no data rows.']);
            setUploadStatus('error');
            return;
          }

          // Validate columns
          const fileColumns = Object.keys(jsonData[0] || {});
          const missingColumns = requiredColumns.filter(col => 
            !fileColumns.some(fileCol => 
              fileCol.toLowerCase().replace(/\s+/g, '').includes(col.toLowerCase())
            )
          );

          if (missingColumns.length > 0) {
            setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
            setUploadStatus('error');
            return;
          }

          // Normalize column names and validate data
          const normalizedData = jsonData.map((row, index) => {
            const normalizedRow = {};
            const rowErrors = [];

            // Map columns to expected format
            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
              if (normalizedKey.includes('firstname') || normalizedKey.includes('first')) {
                normalizedRow.firstName = row[key];
              } else if (normalizedKey.includes('lastname') || normalizedKey.includes('last')) {
                normalizedRow.lastName = row[key];
              } else if (normalizedKey.includes('email')) {
                normalizedRow.email = row[key];
              } else if (normalizedKey.includes('phone')) {
                normalizedRow.phone = row[key];
              } else if (normalizedKey.includes('lecturerid') || normalizedKey.includes('lecturer')) {
                normalizedRow.lecturerId = row[key];
              } else if (normalizedKey.includes('address')) {
                normalizedRow.address = row[key];
              } else if (normalizedKey.includes('dateofbirth') || normalizedKey.includes('dob')) {
                normalizedRow.dateOfBirth = row[key];
              } else if (normalizedKey.includes('emergencycontactname')) {
                normalizedRow.emergencyContactName = row[key];
              } else if (normalizedKey.includes('emergencycontactphone')) {
                normalizedRow.emergencyContactPhone = row[key];
              } else if (normalizedKey === 'password') {
                // Bind password if present, else null
                normalizedRow.password = row[key] !== undefined && row[key] !== null && row[key] !== '' ? row[key] : null;
              } else {
                normalizedRow[key] = row[key];
              }
            });

            // Validate required fields (only email and lecturerId are mandatory)
            requiredColumns.forEach(col => {
              if (!normalizedRow[col] || normalizedRow[col].toString().trim() === '') {
                rowErrors.push(`Row ${index + 2}: Missing ${col}`);
              }
            });

            // Email validation
            if (normalizedRow.email) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(normalizedRow.email)) {
                rowErrors.push(`Row ${index + 2}: Invalid email format`);
              }
            }

            // Phone validation
            if (normalizedRow.phone && !/^[\d\s\-\+\(\)]+$/.test(normalizedRow.phone)) {
              rowErrors.push(`Row ${index + 2}: Invalid phone number format`);
            }

            // LecturerId validation
            if (normalizedRow.lecturerId && normalizedRow.lecturerId.toString().trim().length < 2) {
              rowErrors.push(`Row ${index + 2}: Lecturer ID must be at least 2 characters`);
            }

            normalizedRow._rowIndex = index + 2;
            normalizedRow._errors = rowErrors;
            return normalizedRow;
          });

          const allErrors = normalizedData.flatMap(row => row._errors);
          
          if (allErrors.length > 0) {
            setErrors(allErrors.slice(0, 10)); // Show first 10 errors
            setUploadStatus('error');
          } else {
            setUploadStatus('success');
          }

          setParsedData(normalizedData);

        } catch (parseError) {
          setErrors(['Error parsing file. Please make sure it\'s a valid Excel file.']);
          setUploadStatus('error');
        }
      };

      reader.readAsArrayBuffer(selectedFile);

    } catch (error) {
      setErrors(['Error reading file. Please try again.']);
      setUploadStatus('error');
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    if (!selectedDepartment) {
      showToast('error', 'Error', 'Please select a department first');
      return;
    }

    const message = `Are you sure you want to import ${parsedData.length} lecturer accounts?`;
    
    showConfirm('Import Lecturers', message, async () => {
      try {
        setUploadStatus('processing');
        setImportResults(null);
        
        // Prepare data for API with department ID
        let departmentId;
        if (typeof selectedDepartment === 'object' && selectedDepartment.id) {
          departmentId = selectedDepartment.id;
        } else if (typeof selectedDepartment === 'object' && selectedDepartment._id) {
          departmentId = selectedDepartment._id;
        } else {
          departmentId = selectedDepartment;
        }

        console.log('Selected department for import:', selectedDepartment);
        console.log('Using department ID:', departmentId);

        const importData = parsedData.map(lecturer => {
          const obj = {
            firstName: lecturer.firstName,
            lastName: lecturer.lastName,
            email: lecturer.email,
            phone: lecturer.phone,
            lecturerId: lecturer.lecturerId,
            address: lecturer.address,
            dateOfBirth: lecturer.dateOfBirth,
            emergencyContactName: lecturer.emergencyContactName,
            emergencyContactPhone: lecturer.emergencyContactPhone,
            departmentId: departmentId
          };
          // Only include password if present in the row (even if null)
          if ('password' in lecturer) {
            obj.password = lecturer.password;
          }
          return obj;
        });

        console.log('Import payload:', { lecturers: importData });

        const response = await AdminManagementService.bulkCreateAdmins({
          lecturers: importData
        });

        console.log('Bulk import response:', response);

        // Parse the response structure to match component expectations
        const successCount = response.created ? response.created.length : 0;
        const failedCount = response.failed ? response.failed.length : 0;
        const errorMessages = response.failed ? response.failed.map(item => 
          `${item.data ? `${item.data.firstName || ''} ${item.data.lastName || ''}`.trim() : 'Unknown'}: ${item.error}`
        ) : [];

        setImportResults({
          success: successCount,
          failed: failedCount,
          total: parsedData.length,
          details: response.created || [],
          errors: errorMessages
        });

        setUploadStatus('completed');
        
        if (successCount > 0) {
          showToast('success', 'Success', `Successfully imported ${successCount} lecturer accounts!`);
        }
        
        if (failedCount > 0) {
          showToast('warning', 'Warning', `${failedCount} accounts failed to import. Check results for details.`);
        }
        
      } catch (error) {
        console.error('Import error:', error);
        setErrors([error.message || 'Error importing data. Please try again.']);
        setUploadStatus('error');
        showToast('error', 'Error', 'Failed to import lecturer accounts');
      }
    });
  };

  const removeFile = () => {
    setFile(null);
    setParsedData([]);
    setUploadStatus('idle');
    setErrors([]);
    setPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 min-h-screen">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Admin Accounts</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              <span className="hidden sm:inline">Bulk Import Admin Accounts</span>
              <span className="sm:hidden">Import Admins</span>
            </h1>
            <p className="text-purple-100 mt-1 sm:mt-2 text-sm sm:text-base">Upload an Excel file to create multiple admin accounts at once</p>
          </div>

          <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3 lg:mb-4">Import Instructions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Required Columns:</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    {requiredColumns.map(col => (
                      <li key={col} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <h5 className="font-medium text-blue-800 mb-2">Optional Columns:</h5>
                    <ul className="text-xs sm:text-sm text-blue-600 space-y-1">
                      {allColumns.filter(col => !requiredColumns.includes(col)).map(col => (
                        <li key={col} className="flex items-center gap-2">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-blue-400 flex-shrink-0"></div>
                          <span>{col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">File Requirements:</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Excel format (.xlsx, .xls)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>First row should contain headers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Maximum 500 records per import</span>
                      <span className="sm:hidden">Max 500 records</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Valid email addresses required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Unique lecturer ID required</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Department selected from dropdown</span>
                      <span className="sm:hidden">Department required</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg sm:rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-purple-400 bg-purple-50'
                  : file
                  ? 'border-purple-300 bg-purple-25'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {!file ? (
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      <span className="hidden sm:inline">Drop your Excel file here</span>
                      <span className="sm:hidden">Upload Excel file</span>
                    </h3>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                      <span className="hidden sm:inline">or click to browse and select a file</span>
                      <span className="sm:hidden">Click to select file</span>
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Supports: .xlsx, .xls files up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-all">
                      {file.name}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="flex items-center gap-2 mx-auto px-3 sm:px-4 py-2 text-sm sm:text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* Upload Status */}
            {uploadStatus !== 'idle' && (
              <div className="space-y-4">
                {uploadStatus === 'processing' && (
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <span className="text-blue-800 font-medium text-sm sm:text-base">Processing file...</span>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="text-emerald-800 font-medium text-sm sm:text-base">
                          File processed successfully!
                        </span>
                        <p className="text-emerald-700 text-xs sm:text-sm">
                          {parsedData.length} lecturer accounts ready to import
                        </p>
                      </div>
                    </div>

                    {/* Preview Toggle */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Department Selection */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
                        <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3 lg:mb-4">Select Department</h4>
                        <div className="space-y-2">
                          <label className="block text-xs sm:text-sm font-medium text-blue-800">
                            Department *
                          </label>
                          {loadingDepartments ? (
                            <div className="flex items-center gap-2 text-blue-600 text-sm">
                              <Loader className="w-4 h-4 animate-spin" />
                              Loading departments...
                            </div>
                          ) : (
                            <select
                              value={selectedDepartment ? 
                                (typeof selectedDepartment === 'object' ? 
                                  selectedDepartment.id || selectedDepartment._id : selectedDepartment) : ''}
                              onChange={(e) => {
                                const dept = departments.find(d => (d.id || d._id) === e.target.value);
                                setSelectedDepartment(dept || e.target.value);
                              }}
                              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select a department...</option>
                              {departments.map((dept) => (
                                <option key={dept.id || dept._id} value={dept.id || dept._id}>
                                  {dept.name || dept.departmentName || 'Unnamed Department'}
                                </option>
                              ))}
                            </select>
                          )}
                          {!selectedDepartment && (
                            <p className="text-xs sm:text-sm text-blue-600">
                              Please select a department before importing lecturers
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => setPreview(!preview)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          {preview ? 'Hide' : 'Show'} Preview
                        </button>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                          <button
                            onClick={removeFile}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleImport}
                            disabled={!selectedDepartment}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-200 ${
                              selectedDepartment 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Import {parsedData.length} Lecturer Accounts</span>
                            <span className="sm:hidden">Import ({parsedData.length})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Data Preview */}
                    {preview && parsedData.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-100 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Data Preview</h4>
                          <p className="text-xs sm:text-sm text-gray-600">First 5 records</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Lecturer ID</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Phone</th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Emergency Contact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {parsedData.slice(0, 5).map((lecturer, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                    {lecturer.firstName} {lecturer.lastName}
                                  </td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 break-all">{lecturer.email}</td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{lecturer.lecturerId}</td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">{lecturer.phone}</td>
                                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                                    {lecturer.emergencyContactName && lecturer.emergencyContactPhone 
                                      ? `${lecturer.emergencyContactName} (${lecturer.emergencyContactPhone})`
                                      : 'Not provided'
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {parsedData.length > 5 && (
                          <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gray-50 text-xs sm:text-sm text-gray-600 text-center">
                            ... and {parsedData.length - 5} more lecturer accounts
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {uploadStatus === 'completed' && importResults && (
                  <div className="space-y-4">
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-green-800 font-semibold mb-2">Import Completed</h4>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                              <div className="text-sm text-green-700">Successful</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                              <div className="text-sm text-red-700">Failed</div>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                              <div className="text-sm text-blue-700">Total</div>
                            </div>
                          </div>
                          
                          {importResults.failed > 0 && importResults.errors && importResults.errors.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-medium text-red-800 mb-2">Failed Records:</h5>
                              <div className="max-h-32 overflow-y-auto">
                                <ul className="text-sm text-red-700 space-y-1">
                                  {importResults.errors.slice(0, 10).map((error, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-red-500">•</span>
                                      <span>{error}</span>
                                    </li>
                                  ))}
                                  {importResults.errors.length > 10 && (
                                    <li className="text-red-600 font-medium">
                                      ... and {importResults.errors.length - 10} more errors
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => {
                                setFile(null);
                                setParsedData([]);
                                setUploadStatus('idle');
                                setErrors([]);
                                setPreview(false);
                                setImportResults(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Import Another File
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-red-800 font-medium mb-2">Import Failed</h4>
                        <ul className="text-red-700 text-sm space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportAdmins;