import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Download, CheckCircle, AlertCircle, ArrowLeft, Eye, Trash2, Users } from "lucide-react";
import * as XLSX from 'xlsx';
import { AdministrationService } from '../services/super-admin/administationService';
import { StudentManagementService } from '../services/super-admin/studentManagementService';
import { showToast } from '../pages/utils/showToast';
import ConfirmDialog from './ConfirmDialog';

const BulkImportStudents = ({ onBack, onImport, showConfirm }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, success, error
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [importResults, setImportResults] = useState(null); // { created: [], failed: [] }
  const fileInputRef = useRef(null);

  const requiredColumns = [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'studentId',
    'address',
    'dateOfBirth'
  ];

  const sampleData = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '0771234567',
      studentId: 'STU2024001',
      address: '123 Main St, Colombo',
      dateOfBirth: '2000-01-15'
    },
    {
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@email.com',
      phone: '0771234568',
      studentId: 'STU2024002',
      address: '456 Oak Ave, Kandy',
      dateOfBirth: '1999-05-20'
    }
  ];

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        const response = await AdministrationService.fetchAllBatches();
        console.log('Fetched batches:', response); // Debug log
        setBatches(response || []);
      } catch (error) {
        console.error('Error fetching batches:', error);
        showToast('error', 'Error', 'Failed to load batches');
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_import_template.xlsx");
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
              } else if (normalizedKey.includes('studentid') || normalizedKey.includes('student')) {
                normalizedRow.studentId = row[key];
              } else if (normalizedKey.includes('address')) {
                normalizedRow.address = row[key];
              } else if (normalizedKey.includes('dateofbirth') || normalizedKey.includes('birthdate') || normalizedKey.includes('dob')) {
                normalizedRow.dateOfBirth = row[key];
              }
            });

            // Validate required fields
            requiredColumns.forEach(col => {
              if (!normalizedRow[col] || normalizedRow[col].toString().trim() === '') {
                rowErrors.push(`Row ${index + 2}: Missing ${col}`);
              }
            });

            // Email validation (required field)
            if (normalizedRow.email) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(normalizedRow.email)) {
                rowErrors.push(`Row ${index + 2}: Invalid email format`);
              }
            } else {
              rowErrors.push(`Row ${index + 2}: Email is required`);
            }

            // Student ID validation (required field)
            if (!normalizedRow.studentId || normalizedRow.studentId.toString().trim() === '') {
              rowErrors.push(`Row ${index + 2}: Student ID is required`);
            }

            // Date format validation
            if (normalizedRow.dateOfBirth) {
              const dateValue = normalizedRow.dateOfBirth;
              let formattedDate = '';
              
              // Handle Excel date formats
              if (typeof dateValue === 'number') {
                // Excel serial date
                const excelDate = new Date((dateValue - (25567 + 1)) * 86400 * 1000);
                formattedDate = excelDate.toISOString().split('T')[0];
              } else if (typeof dateValue === 'string') {
                // String date - try to parse
                const parsedDate = new Date(dateValue);
                if (!isNaN(parsedDate.getTime())) {
                  formattedDate = parsedDate.toISOString().split('T')[0];
                } else {
                  rowErrors.push(`Row ${index + 2}: Invalid date format for dateOfBirth`);
                }
              }
              
              normalizedRow.dateOfBirth = formattedDate;
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
    if (parsedData.length === 0) {
      showToast('error', 'Error', 'No data to import');
      return;
    }

    if (!selectedBatch) {
      showToast('error', 'Error', 'Please select a batch for the students');
      return;
    }

    // Show confirmation dialog
    if (showConfirm) {
      showConfirm(
        'Confirm Bulk Import',
        `Are you sure you want to import ${parsedData.length} students into the selected batch? This action cannot be undone.`,
        async () => {
          await performImport();
        }
      );
    } else {
      await performImport();
    }
  };

  const performImport = async () => {
    try {
      setUploadStatus('processing');
      setImportResults(null);
      
      console.log('Selected batch ID:', selectedBatch); // Debug log
      
      // Format data for API
      const studentsData = {
        students: parsedData.map(student => ({
          firstName: student.firstName?.toString().trim(),
          lastName: student.lastName?.toString().trim(),
          email: student.email?.toString().trim().toLowerCase(),
          phone: student.phone?.toString().trim(),
          studentId: student.studentId?.toString().trim(),
          address: student.address?.toString().trim(),
          dateOfBirth: student.dateOfBirth,
          batchId: selectedBatch
        }))
      };
      
      console.log('Sending students data:', studentsData); // Debug log
      
      // Call the bulk import API
      const response = await StudentManagementService.bulkCreateStudents(studentsData);
      
      if (response && response.success) {
        const { created = [], failed = [] } = response;
        setImportResults({ created, failed });
        
        setUploadStatus('completed'); // Change to 'completed' to show results
        
        if (created.length > 0 && failed.length === 0) {
          // All students imported successfully
          showToast('success', 'Success', `Successfully imported ${created.length} student accounts!`);
        } else if (created.length > 0 && failed.length > 0) {
          // Partial success
          showToast('success', 'Partial Success', `${created.length} students imported successfully, ${failed.length} failed.`);
        } else if (failed.length > 0) {
          // All failed
          showToast('error', 'Import Failed', `All ${failed.length} students failed to import.`);
        }
        
        if (onImport && created.length > 0) {
          onImport(created);
        }
      } else {
        throw new Error(response?.message || 'Import failed');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setErrors([error.message || 'Error importing data. Please try again.']);
      setUploadStatus('error');
      setImportResults(null);
      showToast('error', 'Import Failed', error.message || 'Failed to import students');
    }
  };

  const removeFile = () => {
    setFile(null);
    setParsedData([]);
    setUploadStatus('idle');
    setErrors([]);
    setPreview(false);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen ">
      <div >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Student Accounts
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Bulk Import Students</h1>
            <p className="text-emerald-100 mt-2">Upload an Excel file to create multiple student accounts at once</p>
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
                        {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </li>
                    ))}
                  </ul>
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
                      Maximum 1000 records per import
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Valid email addresses required
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

            {/* Batch Selection */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Select Batch</h3>
              <p className="text-yellow-800 text-sm mb-4">
                All imported students will be assigned to the selected batch. Please choose a batch before uploading the file.
              </p>
              <div className="max-w-md">
                {loadingBatches ? (
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading batches...</span>
                  </div>
                ) : (
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                    required
                  >
                    <option value="">Select a batch...</option>
                    {batches.map((batch) => {
                      // Handle different possible ID field names
                      const batchId = batch._id || batch.id || batch.batchId;
                      console.log('Batch object:', batch, 'Using ID:', batchId); // Debug log
                      return (
                        <option key={batchId} value={batchId}>
                          {batch.name} - {batch.year}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-50'
                  : file
                  ? 'border-emerald-300 bg-emerald-25'
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
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-emerald-600" />
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
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-emerald-600" />
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

                {(uploadStatus === 'success' || uploadStatus === 'completed') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-emerald-800 font-medium">
                          File processed successfully!
                        </span>
                        <p className="text-emerald-700 text-sm">
                          {parsedData.length} students ready to import
                        </p>
                      </div>
                    </div>

                    {/* Show import actions only if not completed */}
                    {uploadStatus === 'success' && (
                      <>
                        {/* Import Actions */}
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
                              disabled={!selectedBatch || uploadStatus === 'processing'}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                                !selectedBatch || uploadStatus === 'processing'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                              }`}
                            >
                              {uploadStatus === 'processing' ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Users className="w-5 h-5" />
                                  Import {parsedData.length} Students
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Batch Selection Warning */}
                        {!selectedBatch && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-amber-600" />
                              <span className="text-amber-800 font-medium">
                                Please select a batch before importing students.
                              </span>
                            </div>
                          </div>
                        )}

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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {parsedData.slice(0, 5).map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {student.firstName} {student.lastName}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{student.email}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{student.studentId}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{student.phone}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{student.address}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {parsedData.length > 5 && (
                              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                                ... and {parsedData.length - 5} more students
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Import Results */}
                    {importResults && (
                      <div className="space-y-4">
                        {/* Compact Summary */}
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-green-800 font-semibold mb-2">Import Completed</h4>
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                                  <div className="text-2xl font-bold text-green-600">{importResults.created.length}</div>
                                  <div className="text-sm text-green-700">Successful</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                                  <div className="text-2xl font-bold text-red-600">{importResults.failed.length}</div>
                                  <div className="text-sm text-red-700">Failed</div>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                                  <div className="text-2xl font-bold text-blue-600">{importResults.created.length + importResults.failed.length}</div>
                                  <div className="text-sm text-blue-700">Total</div>
                                </div>
                              </div>
                              
                              {importResults.failed.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-red-800 mb-2">Failed Records:</h5>
                                  <div className="max-h-32 overflow-y-auto">
                                    <ul className="text-sm text-red-700 space-y-1">
                                      {importResults.failed.slice(0, 10).map((failure, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-red-500">•</span>
                                          <span>
                                            {failure.student ? `${failure.student.firstName} ${failure.student.lastName}` : `Row ${index + 1}`}: {failure.error || failure.message || 'Unknown error'}
                                          </span>
                                        </li>
                                      ))}
                                      {importResults.failed.length > 10 && (
                                        <li className="text-red-600 font-medium">
                                          ... and {importResults.failed.length - 10} more errors
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
                                    setSelectedBatch('');
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
                                <button
                                  onClick={onBack}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                                >
                                  Back to Student Accounts
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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

export default BulkImportStudents;