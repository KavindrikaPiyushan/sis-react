import React, { useState, useRef } from "react";
import { Upload, FileText, Download, CheckCircle, AlertCircle, ArrowLeft, Eye, Trash2, Users } from "lucide-react";
import * as XLSX from 'xlsx';

const BulkImportStudents = ({ onBack, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, success, error
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef(null);

  const requiredColumns = [
    'firstName',
    'lastName', 
    'email',
    'phone',
    'studentId',
    'program'
  ];

  const sampleData = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '123-456-7890',
      studentId: 'STU2024001',
      program: 'Computer Science',
      year: '1st Year',
      dateOfBirth: '2000-01-15',
      gender: 'Male',
      address: '123 Main St',
      city: 'New York',
      state: 'NY'
    },
    {
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@email.com',
      phone: '123-456-7891',
      studentId: 'STU2024002',
      program: 'Business Administration',
      year: '2nd Year',
      dateOfBirth: '1999-05-20',
      gender: 'Female',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA'
    }
  ];

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
              } else if (normalizedKey.includes('program')) {
                normalizedRow.program = row[key];
              } else {
                normalizedRow[key] = row[key];
              }
            });

            // Validate required fields
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

    try {
      setUploadStatus('processing');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onImport) {
        onImport(parsedData);
      }
      
      alert(`Successfully imported ${parsedData.length} student accounts!`);
      
      // Reset form
      setFile(null);
      setParsedData([]);
      setUploadStatus('idle');
      
    } catch (error) {
      setErrors(['Error importing data. Please try again.']);
      setUploadStatus('error');
    }
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

                {uploadStatus === 'success' && (
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

                    {/* Preview Toggle */}
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
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                        >
                          <Users className="w-5 h-5" />
                          Import {parsedData.length} Students
                        </button>
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Program</th>
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
                                  <td className="px-4 py-3 text-sm text-gray-900">{student.program}</td>
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