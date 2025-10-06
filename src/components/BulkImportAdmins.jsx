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

        const importData = parsedData.map(lecturer => ({
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
        }));

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
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Accounts
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Bulk Import Lecturer Accounts
            </h1>
            <p className="text-purple-100 mt-2">Upload an Excel file to create multiple lecturer accounts at once</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Import Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Required Columns:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {requiredColumns.map(col => (
                      <li key={col} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <h5 className="font-medium text-blue-800 mb-2">Optional Columns:</h5>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {allColumns.filter(col => !requiredColumns.includes(col)).map(col => (
                        <li key={col} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-blue-400"></div>
                          {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">File Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Excel format (.xlsx, .xls)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      First row should contain headers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Maximum 500 records per import
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Valid email addresses required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Unique lecturer ID required
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Department selected from dropdown
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
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
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Drop your Excel file here
                    </h3>
                    <p className="text-gray-600 mt-2">
                      or click to browse and select a file
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports: .xlsx, .xls files up to 10MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {file.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="flex items-center gap-2 mx-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-800 font-medium">Processing file...</span>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-emerald-800 font-medium">
                          File processed successfully!
                        </span>
                        <p className="text-emerald-700 text-sm">
                          {parsedData.length} lecturer accounts ready to import
                        </p>
                      </div>
                    </div>

                    {/* Preview Toggle */}
                    <div className="space-y-6">
                      {/* Department Selection */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4">Select Department</h4>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-blue-800">
                            Department *
                          </label>
                          {loadingDepartments ? (
                            <div className="flex items-center gap-2 text-blue-600">
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
                              className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <p className="text-sm text-blue-600">
                              Please select a department before importing lecturers
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setPreview(!preview)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          {preview ? 'Hide' : 'Show'} Preview
                        </button>
                        <div className="flex gap-3">
                          <button
                            onClick={removeFile}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleImport}
                            disabled={!selectedDepartment}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                              selectedDepartment 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <UserCheck className="w-5 h-5" />
                            Import {parsedData.length} Lecturer Accounts
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Data Preview */}
                    {preview && parsedData.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">Data Preview</h4>
                          <p className="text-sm text-gray-600">First 5 records</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lecturer ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Emergency Contact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {parsedData.slice(0, 5).map((lecturer, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {lecturer.firstName} {lecturer.lastName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{lecturer.email}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{lecturer.lecturerId}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{lecturer.phone}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
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
                          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 text-center">
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