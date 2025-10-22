import React, { useState, useEffect } from "react";
import { AttendenceService } from '../../services/attendenceService';
import { AdminService } from '../../services/adminService';
import { showToast } from '../utils/showToast';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../utils/ConfirmDialog';
import { Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight,LayoutDashboard, Upload,Clock ,Award,MapPin , Calendar, Users, BookOpen, CheckCircle, XCircle, AlertCircle, Plus, RefreshCw, Activity } from "lucide-react";

// DataTable Component
const DataTable = ({ 
  columns, 
  data, 
  actions, 
  title = "Data Table",
  searchPlaceholder = "Search...",
  itemsPerPage = 10,
  // Selection props
  selectable = false,
  selected = [],
  onSelectionChange = () => {},
  selectKey = 'id'
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
            <p className="text-sm text-gray-600 mt-1">{filteredData.length} total records</p>
          </div>
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {selectable && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={paginatedData.length > 0 && paginatedData.every(item => selected.includes(item[selectKey]))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // add all visible ids
                        const ids = paginatedData.map(item => item[selectKey]);
                        // merge unique
                        const merged = Array.from(new Set([...(selected || []), ...ids]));
                        onSelectionChange(merged);
                      } else {
                        // remove visible ids
                        const idsToRemove = new Set(paginatedData.map(item => item[selectKey]));
                        const filtered = (selected || []).filter(id => !idsToRemove.has(id));
                        onSelectionChange(filtered);
                      }
                    }}
                  />
                </th>
              )}
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
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="checkbox"
                        checked={(selected || []).includes(item[selectKey])}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onSelectionChange(Array.from(new Set([...(selected || []), item[selectKey]])));
                          } else {
                            onSelectionChange((selected || []).filter(id => id !== item[selectKey]));
                          }
                        }}
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}
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
                  colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} 
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

// Edit Attendance Modal
const EditAttendanceModal = ({ attendance, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    status: attendance.status || 'present',
    remarks: attendance.remarks || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Attendance</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              {/* <option value="excused">Excused</option> */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              rows="3"
              maxLength="500"
              placeholder="Optional remarks (max 500 characters)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Upload Modal
const BulkUploadModal = ({ session, courseOffering, onSubmit, onCancel, notMarkedStudents = [] }) => {
  const [file, setFile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [parsedRecords, setParsedRecords] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'file'
  // quick add helpers
  const [quickStudentNo, setQuickStudentNo] = useState('');
  const [quickStatus, setQuickStatus] = useState('present');
  const [quickRemarks, setQuickRemarks] = useState('');
  // helper to normalize studentNo from enrollment objects
  const getStudentNo = (s) => {
    if (!s) return '';
    return (s.student?.studentNo || s.studentNo || s.studentId || s.id || '').toString();
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
        setFile(uploadedFile);
    setParsedRecords(null);
    setParseErrors([]);
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const allowedStatuses = ['present', 'absent', 'excused'];
        const rows = [];
        const errors = [];

        json.forEach((row, idx) => {
          // support common header variants
          const studentNo = (row.studentNo || row.StudentNo || row['Student No'] || '').toString().trim();
          const statusRaw = (row.status || row.Status || '').toString().trim();
          const status = statusRaw.toLowerCase();
          const remarks = row.remarks || row.Remarks || '';

          if (!studentNo) {
            errors.push(`Row ${idx + 2}: missing studentNo`);
            return;
          }
          if (!allowedStatuses.includes(status)) {
            errors.push(`Row ${idx + 2}: invalid status '${statusRaw}'`);
            return;
          }

          rows.push({ studentNo, status, remarks });
        });

        setParsedRecords(rows);
        setParseErrors(errors);
        if (errors.length > 0) {
          showToast('warn', 'Parse Warnings', `${errors.length} row(s) had issues and were skipped`);
          console.warn('Bulk upload parse errors:', errors);
        } else {
          showToast('success', 'File Parsed', `${rows.length} record(s) parsed`);
        }
      } catch (err) {
        console.error('Failed to parse file', err);
        showToast('error', 'Parse Error', 'Failed to parse the uploaded file');
        setParseErrors([err.message || 'Unknown error']);
      }
    };

    // read as array buffer for xlsx
    reader.readAsArrayBuffer(uploadedFile);
  };

  const addStudentRow = () => {
    setAttendanceRecords([...attendanceRecords, { studentNo: '', status: 'present', remarks: '' }]);
  };

  const updateStudentRow = (index, field, value) => {
    const updated = [...attendanceRecords];
    updated[index][field] = value;
    setAttendanceRecords(updated);
  };

  const removeStudentRow = (index) => {
    setAttendanceRecords(attendanceRecords.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (uploadMode === 'manual') {
      const validRecords = attendanceRecords.filter(r => r.studentNo.trim());
      if (validRecords.length === 0) {
        showToast('error', 'Validation Error', 'Please add at least one student');
        return;
      }
      const formattedRecords = validRecords.map(r => ({
        ...r,
        classSessionId: session.id,
        courseOfferingId: courseOffering.id
      }));
      onSubmit(formattedRecords);
    } else {
      // file mode: use parsedRecords produced by handleFileUpload
      if (!file || !parsedRecords) {
        showToast('error', 'Validation Error', 'Please select and parse a valid file first');
        return;
      }

      if (parsedRecords.length === 0) {
        showToast('error', 'Validation Error', 'No valid rows found in the uploaded file');
        return;
      }

      const formatted = parsedRecords.map(r => ({
        ...r,
        classSessionId: session.id,
        courseOfferingId: courseOffering.id
      }));
      onSubmit(formatted);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Bulk Upload Attendance</h3>
        <p className="text-sm text-gray-600 mb-6">
          Session: {session.topic} - {new Date(session.date).toLocaleDateString()}
        </p>

        {/* Upload Mode Selector */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setUploadMode('manual')}
            className={`pb-3 px-4 font-medium transition-colors ${
              uploadMode === 'manual'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setUploadMode('file')}
            className={`pb-3 px-4 font-medium transition-colors ${
              uploadMode === 'file'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Excel Upload
          </button>
        </div>

        {uploadMode === 'manual' ? (
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {/* Quick add: select from notMarkedStudents */}
            <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
              {/* filter out already selected students for quick-add */}
              <select
                value={quickStudentNo}
                onChange={(e) => setQuickStudentNo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-1/3 bg-white"
              >
                <option value="">Select student to add</option>
                {(() => {
                  const selectedNos = attendanceRecords.map(r => (r.studentNo || '').toString());
                  return notMarkedStudents
                    .filter(s => !selectedNos.includes(getStudentNo(s)))
                    .map(s => (
                      <option key={getStudentNo(s) || Math.random()} value={getStudentNo(s)}>
                        {((s.student && s.student.user) ? `${s.student.user.firstName} ${s.student.user.lastName}` : (getStudentNo(s))) } ({getStudentNo(s)})
                      </option>
                    ));
                })()}
              </select>
              <select
                value={quickStatus}
                onChange={(e) => setQuickStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-1/6"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                {/* <option value="excused">Excused</option> */}
              </select>
              <input
                type="text"
                placeholder="Remarks (optional)"
                value={quickRemarks}
                onChange={(e) => setQuickRemarks(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none flex-1"
              />
              <button
                onClick={() => {
                  const s = quickStudentNo?.toString().trim();
                  if (!s) { showToast('error', 'Validation', 'Select a student to add'); return; }
                  const allowed = ['present','absent','excused'];
                  if (!allowed.includes(quickStatus)) { showToast('error','Validation','Invalid status'); return; }
                  setAttendanceRecords(prev => ([...prev, { studentNo: s, status: quickStatus, remarks: quickRemarks || '' }]));
                  setQuickStudentNo(''); setQuickRemarks(''); setQuickStatus('present');
                  showToast('success','Added','Student added to manual list');
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >Add</button>
            </div>

            {attendanceRecords.map((record, index) => (
              <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <select
                    value={record.studentNo}
                    onChange={(e) => updateStudentRow(index, 'studentNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-2 bg-white"
                  >
                    <option value="">Select student</option>
                    {(() => {
                      const selectedNos = attendanceRecords.map(r => (r.studentNo || '').toString());
                      return notMarkedStudents
                        .filter(s => {
                          const no = getStudentNo(s);
                          // allow the currently selected value for this row, but exclude other selected students
                          return no === record.studentNo || !selectedNos.includes(no);
                        })
                        .map(s => (
                          <option key={getStudentNo(s) || Math.random()} value={getStudentNo(s)}>
                            {((s.student && s.student.user) ? `${s.student.user.firstName} ${s.student.user.lastName}` : (getStudentNo(s))) } ({getStudentNo(s)})
                          </option>
                        ));
                    })()}
                  </select>
                  <div className="flex gap-2">
                    <select
                      value={record.status}
                      onChange={(e) => updateStudentRow(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      {/* <option value="excused">Excused</option> */}
                    </select>
                    <input
                      type="text"
                      placeholder="Remarks (optional)"
                      value={record.remarks}
                      onChange={(e) => updateStudentRow(index, 'remarks', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeStudentRow(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addStudentRow}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div>
                <label className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Excel or CSV files only</p>
              {file && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  // generate sample CSV on the fly and download
                  const sample = 'studentNo,status,remarks\nS1234567,present,\nS2345678,absent,Medical leave\n';
                  const blob = new Blob([sample], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sample-attendance.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                className="text-sm text-indigo-600 hover:underline"
              >
                Download sample CSV
              </button>
              {parseErrors && parseErrors.length > 0 && (
                <div className="text-sm text-red-600">{parseErrors.length} parse error(s) - check console</div>
              )}
            </div>
            {parsedRecords && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Preview ({parsedRecords.length} rows)</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {parsedRecords.slice(0, 20).map((r, i) => (
                    <li key={i}>{r.studentNo} — {r.status} {r.remarks ? `— ${r.remarks}` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-medium mb-2">Expected Format:</p>
              <p className="text-xs text-blue-700">
                Columns: studentNo, status (present/absent/excused), remarks (optional)
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            Upload Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component

export default function AdminAttendance() {
  const [currentView, setCurrentView] = useState('offerings'); // 'offerings', 'sessions', 'students'
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState([]);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);
  const [showBulkResultModal, setShowBulkResultModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  // Move these hooks to top level to fix hook order error
  const [attendanceTab, setAttendanceTab] = useState('marked');
  const [manualAttendance, setManualAttendance] = useState({ studentNo: '', status: '' });
  const [manualAttendanceLoading, setManualAttendanceLoading] = useState(false);

  const openConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Fetch course offerings with stats
  useEffect(() => {
    fetchCourseOfferings();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch assigned course offerings with full data and stats
  const fetchCourseOfferings = async () => {
    setLoading(true);
    // Use lightweight API for the initial list (faster). The light API returns counts
    // instead of full enrollments/sessions arrays. We'll normalize the shape so the
    // rest of the UI can continue to rely on arrays when needed.
    const res = await AdminService.getLecturerAssignedCoursesLightData();
    if (res.success) {
      const offerings = (res.data || []).map(offering => {
        const enrollmentsArray = Array.isArray(offering.enrollments) ? offering.enrollments : [];
        const sessionsArray = Array.isArray(offering.sessions) ? offering.sessions : [];

        // Fallback to count fields provided by light API
        const totalSessions = sessionsArray.length || offering.sessionsCount || 0;
        const marked = offering.sessionsMarkedCount != null ? offering.sessionsMarkedCount : sessionsArray.filter(s => s.attendanceMarked).length;
        const enrolled = enrollmentsArray.length || offering.enrollmentsCount || 0;

        const attendancePercentage = marked > 0 && offering.presentCount != null && offering.absentCount != null
          ? ((offering.presentCount / (offering.presentCount + offering.absentCount)) * 100).toFixed(1)
          : 0;

        return {
          ...offering,
          enrollments: enrollmentsArray,
          sessions: sessionsArray,
          stats: {
            totalSessions,
            marked,
            notMarked: Math.max(0, totalSessions - marked),
            attendancePercentage,
            enrolled
          }
        };
      });
      setCourseOfferings(offerings);
    } else {
      showToast('error', 'Error', res.message || 'Failed to fetch course offerings');
    }
    setLoading(false);
  };

  // Select an offering: optimistically set using light data then fetch full details
  const handleSelectOffering = async (offeringId) => {
    const light = courseOfferings.find(o => o.id === offeringId);
    if (!light) return;

    // Optimistic UI: set the selected offering using the light payload
    setSelectedOffering(light);
    setSessions(light.sessions || []);
    setCurrentView('sessions');

    try {
      const res = await AdminService.getCourseOfferingDetails(offeringId);
      if (res && res.success && res.data) {
        const details = res.data;
        const fullEnrollments = Array.isArray(details.enrollments) ? details.enrollments : light.enrollments || [];
        const fullSessions = Array.isArray(details.sessions) ? details.sessions : light.sessions || [];

        // Merge into selected offering
        setSelectedOffering(prev => ({
          ...prev,
          enrollments: fullEnrollments,
          sessions: fullSessions
        }));

        // Update sessions list view
        setSessions(fullSessions);

        // Update courseOfferings list with any updated counts if necessary
        setCourseOfferings(prev => prev.map(item => item.id === offeringId ? { ...item, ...light } : item));
      } else {
        showToast('error', 'Failed to load offering details', res?.message || 'Could not fetch offering details');
      }
    } catch (err) {
      console.error('Error fetching offering details:', err);
      showToast('error', 'Error', err?.message || 'Failed to fetch offering details');
    }
  };

  // Fetch students for selected session
  const fetchStudents = async (session, refreshSessions = false) => {
    setLoading(true);
    setSelectedSession(session);
    const res = await AttendenceService.getAllAttendance({
      classSessionId: session.id,
      // courseOfferingId: selectedOffering.id
    });
    if (res.success) {
      setStudents(res.data || []);
    } else {
      showToast('error', 'Error', res.message || 'Failed to fetch attendance records');
    }
    setLoading(false);
    setCurrentView('students');
    // Optionally refresh sessions list after attendance change
    if (refreshSessions && selectedOffering) {
      await refreshSessionsList(selectedOffering.id);
    }
  };

  // Helper to refresh sessions for the selected offering
  const refreshSessionsList = async (offeringId) => {
    try {
      const res = await AdminService.getCourseOfferingDetails(offeringId);
      if (res && res.success && res.data) {
        const fullSessions = Array.isArray(res.data.sessions) ? res.data.sessions : [];
        setSessions(fullSessions);
        // Also update selectedOffering.sessions for consistency
        setSelectedOffering(prev => prev ? { ...prev, sessions: fullSessions } : prev);
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (data) => {
    setLoading(true);
    const res = await AttendenceService.bulkCreateAttendance(data);
    if (res.success) {
      const successCount = res.data?.successCount || 0;
      const failedCount = res.data?.failedCount || 0;
      const failedRecords = res.data?.failedRecords || [];
      showToast('success', 'Success', `Attendance uploaded. ${successCount} succeeded${failedCount ? `, ${failedCount} failed` : ''}`);
      // Refresh the attendance list and sessions so UI reflects newly created records
      try {
        await fetchStudents(selectedSession, true);
        await fetchCourseOfferings();
      } catch (err) {
        console.warn('Failed to refresh students after bulk upload', err);
      }

      if (failedCount > 0) {
        // Keep a reference to failed records and open a modal to surface them
        setBulkUploadResult({ successCount, failedCount, failedRecords });
        setShowBulkResultModal(true);
      }

      setShowBulkUpload(false);
    } else {
      showToast('error', 'Error', res.message || 'Failed to upload attendance');
    }
    setLoading(false);
  };

  // Handle edit attendance
  const handleEdit = (attendance) => {
    setSelectedAttendance(attendance);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data) => {
    setLoading(true);
    const res = await AttendenceService.updateAttendance(selectedAttendance.id, data);
    if (res.success) {
      showToast('success', 'Success', 'Attendance updated successfully');
      await fetchStudents(selectedSession, true);
      await fetchCourseOfferings();
      setShowEditModal(false);
    } else {
      showToast('error', 'Error', res.message || 'Failed to update attendance');
    }
    setLoading(false);
  };

  // Handle delete attendance
  const handleDelete = (attendance) => {
    openConfirm(
      'Delete Attendance',
      'Are you sure you want to delete this attendance record?',
      async () => {
        setLoading(true);
        try {
          const res = await AttendenceService.deleteAttendance(attendance.id);
          if (res && res.success) {
            showToast('success', 'Deleted', res.message || 'Attendance record deleted successfully');
          } else {
            showToast('error', 'Failed', res?.message || 'Failed to delete attendance record');
          }
        } catch (err) {
          showToast('error', 'Error', err?.message || 'Failed to delete attendance record');
        }
  await fetchStudents(selectedSession, true);
  await fetchCourseOfferings();
  setLoading(false);
  closeConfirm();
      }
    );
  };

  const handleBulkDelete = () => {
    if (!selectedAttendanceIds || selectedAttendanceIds.length === 0) {
      showToast('error', 'No Selection', 'Please select at least one attendance record to delete');
      return;
    }
    openConfirm(
      'Delete Attendance Records',
      `Are you sure you want to delete ${selectedAttendanceIds.length} attendance record(s)? This cannot be undone.`,
      async () => {
        setLoading(true);
        try {
          const res = await AttendenceService.bulkDeleteAttendance(selectedAttendanceIds);
          if (res && res.success) {
            showToast('success', 'Deleted', res.message || 'Bulk delete processed');
            // If API returns details about failures, display a summary
            if (res.data && (res.data.failedCount || 0) > 0) {
              const failed = res.data.failedRecords || [];
              showToast('warn', 'Partial Failures', `${res.data.failedCount} record(s) failed to delete`);
              console.warn('Bulk delete failures:', failed);
            }
            // Clear selections
            setSelectedAttendanceIds([]);
          } else {
            showToast('error', 'Failed', res?.message || 'Failed to bulk delete attendance records');
          }
        } catch (err) {
          showToast('error', 'Error', err?.message || 'Failed to bulk delete attendance records');
        }
  await fetchStudents(selectedSession, true);
  await fetchCourseOfferings();
  setLoading(false);
  closeConfirm();
      }
    );
  };
  const [hoveredCard, setHoveredCard] = useState(null);
  const getAttendanceColor = (rate) => {
    if (rate >= 75) return { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-700' };
    if (rate >= 50) return { bg: 'bg-amber-500', ring: 'ring-amber-500/20', text: 'text-amber-700' };
    return { bg: 'bg-rose-500', ring: 'ring-rose-500/20', text: 'text-rose-700' };
  };

  const getGradient = (index) => {
    const gradients = [
      'from-violet-600 via-purple-600 to-fuchsia-600',
      'from-blue-600 via-indigo-600 to-purple-600',
      'from-cyan-600 via-blue-600 to-indigo-600',
      'from-pink-600 via-rose-600 to-red-600'
    ];
    return gradients[index % gradients.length];
  };

  // Course Offerings View
  if (currentView === 'offerings') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 mt-16">
        {/* Header - student dashboard style */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Attendance Dashboard</h1>
              <p className="text-blue-100/90 mt-1">Quickly view, manage, and track attendance for all your assigned courses</p>
              <p className="text-blue-100/80 mt-2 text-sm">{currentDateTime.toLocaleString()}</p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <Calendar className="w-20 h-20 text-blue-100/80 opacity-80" />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={fetchCourseOfferings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow font-semibold hover:bg-blue-700 transition-colors text-sm"
            aria-label="Refresh course offerings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading course offerings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseOfferings.map((offering) => {
            const enrollmentPercent = (offering.stats?.enrolled / offering.capacity) * 100;
            const hasMarkedSessions = (offering.stats?.marked || 0) > 0;
            return (
              <div
                key={offering.id}
                onClick={() => handleSelectOffering(offering.id)}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="h-36 bg-[#4e46e5] rounded-t-2xl p-6 flex flex-col justify-between text-white relative">
                  <div>
                    <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:underline">
                      {offering.subject?.name || 'Course'}
                    </h3>
                    <p className="text-sm opacity-90">{offering.subject?.code} • {offering.batch?.name} • {offering.year}</p>
                  </div>
                  {/* Show attendance percentage only when there are marked sessions */}
                  {(offering.stats?.marked || 0) > 0 ? (
                    <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
                      {(() => {
                        const val = Number(offering.averageAttendanceRate) || 0;
                        const clamped = Math.max(0, Math.min(100, val));
                        const pillClasses = clamped >= 75 ? 'bg-green-100 text-green-800' : (clamped >= 50 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800');
                        // circle with centered percentage
                        return (
                          <>
                            <div className="relative w-12 h-12">
                              <svg viewBox="0 0 36 36" className="w-12 h-12">
                                <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.12)" strokeWidth="3.6" fill="none" />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="15"
                                  stroke="white"
                                  strokeWidth="3.6"
                                  strokeDasharray={`${clamped / 100 * 94} 100`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 18 18)"
                                  style={{ opacity: 0.95 }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs font-semibold text-white/95">{Math.round(clamped)}%</span>
                              </div>
                            </div>

                            <div className={`text-[10px] px-2 py-0.5 rounded-full ${pillClasses} font-semibold`}>Attendance</div>
                          </>
                        );
                      })()}

                    </div>
                  ) : null}

                  {/* Quick Stats Bar */}
                    {hasMarkedSessions && (
                      <div className="flex items-center gap-2 text-xs">
                        <Award className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {offering.stats?.marked}/{offering.stats?.totalSessions} completed
                        </span>
                      </div>
                    )}
                </div>
                
                {/* Stats Section */}
                <div className="p-6 space-y-4">
                  {/* Session Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Session Progress</span>
                      <span className="text-gray-900 font-bold">
                        {offering.stats?.marked || 0}/{offering.stats?.totalSessions || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${((offering.stats?.marked || 0) / (offering.stats?.totalSessions || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Enrolled (compact) */}
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px] text-blue-700 font-medium">Enrolled</span>
                      </div>
                      <div className="text-lg font-bold text-blue-700">{offering.stats?.enrolled || 0}</div>
                    </div>

                    {/* Total Sessions (compact) */}
                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-100 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-[11px] text-purple-700 font-medium">Sessions</span>
                      </div>
                      <div className="text-lg font-bold text-purple-700">{offering.stats?.totalSessions || 0}</div>
                    </div>

                    {/* Marked Sessions (compact) */}
                    <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] text-emerald-700 font-medium">Marked</span>
                      </div>
                      <div className="text-lg font-bold text-emerald-700">{offering.stats?.marked || 0}</div>
                    </div>

                    {/* Not Marked (compact) */}
                    <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-[11px] text-amber-700 font-medium">Pending</span>
                      </div>
                      <div className="text-lg font-bold text-amber-700">{offering.stats?.notMarked || 0}</div>
                    </div>
                  </div>

                  {/* Enrollment Bar */}
                  {/* <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                      <span className="font-medium">Capacity</span>
                      <span className="font-bold text-gray-900">
                        {offering.stats?.enrolled || 0} / {offering.capacity}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          enrollmentPercent >= 90
                            ? 'bg-gradient-to-r from-rose-500 to-red-500'
                            : enrollmentPercent >= 70
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, enrollmentPercent)}%` }}
                      ></div>
                    </div>
                  </div> */}
                </div>
              </div>
            );
          })}
          </div>
        )}

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.onConfirm && confirmDialog.onConfirm(); closeConfirm(); }}
          onCancel={closeConfirm}
        />
      </main>
    );
  }

  // Sessions View
  if (currentView === 'sessions' && selectedOffering) {
    // Modern session cards UI
return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      {/* Header Section with Glassmorphism */}
      <div className="mb-8 backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
        <button
          onClick={() => setCurrentView('offerings')}
          className="flex items-center gap-2 text-indigo-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Course Offerings</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Class Sessions</h1>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                {selectedOffering.subject?.code}
              </span>
              <span className="text-lg font-medium">{selectedOffering.subject?.name}</span>
              <span className="text-gray-400">•</span>
              <span>{selectedOffering.batch?.name}</span>
              <span className="text-gray-400">•</span>
              <span>{selectedOffering.year}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{sessions.length} Sessions</span>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => {
          const present = session.presentCount || 0;
          const absent = session.absentCount || 0;
          const total = present + absent;
          const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
          
          return (
            <div
              key={session.id}
              onClick={() => fetchStudents(session)}
              className="relative cursor-pointer"
            >
              {/* Card */}
              <div className="relative backdrop-blur-xl bg-white/80 rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900 pr-4">
                      {session.topic || 'Session'}
                    </h4>
                    
                    {/* Attendance Circle */}
                    {total > 0 ? (
                      <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                            className={`transition-all duration-1000 ${
                              percentage >= 75 ? 'text-green-500' :
                              percentage >= 50 ? 'text-amber-500' : 'text-rose-500'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-sm font-bold ${
                            percentage >= 75 ? 'text-green-600' :
                            percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {Math.round(Number(percentage))}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 text-xs font-medium">
                        No data
                      </div>
                    )}
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">
                        {new Date(session.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        {new Date(session.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{session.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="font-medium">{session.durationMinutes} minutes</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    {session.attendanceMarked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Attendance Marked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 border border-green-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Present</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{present}</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-3 border border-red-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Absent</span>
                      </div>
                      <div className="text-2xl font-bold text-red-700">{absent}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {total > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentage >= 75 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            percentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                            'bg-gradient-to-r from-rose-400 to-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 font-medium">Attendance Rate</span>
                        <span className="text-xs text-gray-700 font-bold">{percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
  }

  // Students/Attendance View
  if (currentView === 'students' && selectedSession && selectedOffering) {
    // Get all enrolled students for this offering
    const enrolledStudents = (selectedOffering.enrollments || []).filter(e => e.status === 'active');
    // Attendance records from API
    const attendanceRecords = students;
    // Map: studentId -> attendance record
    const attendanceMap = {};
    attendanceRecords.forEach(r => { attendanceMap[r.studentId] = r; });
    // Marked: students with attendance record
    const markedStudents = enrolledStudents.filter(e => attendanceMap[e.studentId]);
    // Not marked: enrolled students without attendance record
    const notMarkedStudents = enrolledStudents.filter(e => !attendanceMap[e.studentId]);
    console.log('Enrolled:', enrolledStudents.length, 'Marked:', markedStudents.length, 'Not Marked:', notMarkedStudents);

    // Stats
    const presentCount = markedStudents.filter(e => attendanceMap[e.studentId]?.status === 'present').length;
    const absentCount = markedStudents.filter(e => attendanceMap[e.studentId]?.status === 'absent').length;
    const excusedCount = markedStudents.filter(e => attendanceMap[e.studentId]?.status === 'excused').length;
    const totalEnrolled = enrolledStudents.length;
    const attendancePercentage = markedStudents.length > 0 ? ((presentCount / markedStudents.length) * 100).toFixed(1) : 0;

    // Manual mark handler
    const handleManualAttendanceSubmit = async (e) => {
      e.preventDefault();
      setManualAttendanceLoading(true);
      const student = notMarkedStudents.find(s => s.student.studentNo === manualAttendance.studentNo);
      if (!student) {
        showToast('error', 'Error', 'Student not found');
        setManualAttendanceLoading(false);
        return;
      }
      const res = await AttendenceService.bulkCreateAttendance([
        {
          studentNo: student.student?.studentNo || student.studentNo,
          classSessionId: selectedSession.id,
          courseOfferingId: selectedOffering.id,
          status: manualAttendance.status,
          remarks: '',
        }
      ]);
      if (res.success) {
        showToast('success', 'Success', 'Attendance marked');
        await fetchStudents(selectedSession, true); // refresh students and sessions
        await fetchCourseOfferings(); // refresh course offerings list
        setManualAttendance({ studentNo: '', status: '' });
      } else {
        showToast('error', 'Error', res.message || 'Failed to mark attendance');
      }
      setManualAttendanceLoading(false);
    };

    // Columns for DataTable
    const markedColumns = [
      { key: 'studentNo', header: 'Student No', render: (v, row) => row.student?.studentNo || v },
      { key: 'student', header: 'Name', render: (v, row) => (row.student?.user?.firstName + ' ' + row.student?.user?.lastName) || '-' },
      { key: 'status', header: 'Status', render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'present' ? 'bg-green-100 text-green-800' :
          value === 'excused' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value?.toUpperCase()}
        </span>
      ) },
      { key: 'remarks', header: 'Remarks' },
      { key: 'markedAt', header: 'Marked At', render: (value) => value ? new Date(value).toLocaleString() : '-' }
    ];
    const notMarkedColumns = [
      { key: 'studentId', header: 'Student No', render: (v, row) => row.student?.studentNo || v },
      { key: 'student', header: 'Name', render: (v, row) => (row.student?.user?.firstName + ' ' + row.student?.user?.lastName) || '-' },
    ];

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        {/* Header Section with Glassmorphism */}
          <div className="mb-8 backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/20">
          <button
            onClick={() => setCurrentView('sessions')}
            className="flex items-center gap-2 text-indigo-600 mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Sessions</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Student Attendance</h1>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                  {selectedSession.topic}
                </span>
                <span className="text-lg font-medium">
                  {new Date(selectedSession.date).toLocaleDateString()}
                </span>
                <span className="text-gray-400">•</span>
                <span>{selectedSession.location}</span>
                <span className="text-gray-400">•</span>
                <span>{selectedSession.durationMinutes} min</span>
              </div>
            </div>
            
          </div>

          {/* Action bar for student attendance */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Bulk Upload</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnrolled}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Marked</p>
                <p className="text-2xl font-bold text-green-600">{markedStudents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <XCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Not Marked</p>
                <p className="text-2xl font-bold text-orange-600">{notMarkedStudents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${attendancePercentage >= 75 ? 'bg-green-100' : 'bg-orange-100'}`}>
                <BookOpen className={`w-6 h-6 ${attendancePercentage >= 75 ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                {markedStudents.length > 0 ? (
                  <p className={`text-2xl font-bold ${attendancePercentage >= 75 ? 'text-green-600' : 'text-orange-600'}`}>{attendancePercentage}%</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-400">—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${attendanceTab === 'marked' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setAttendanceTab('marked')}
          >
            Attendance Marked ({markedStudents.length})
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${attendanceTab === 'notMarked' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setAttendanceTab('notMarked')}
          >
            Not Marked ({notMarkedStudents.length})
          </button>
        </div>
        <div className="bg-white rounded-b-xl shadow p-4">
          {attendanceTab === 'marked' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    disabled={selectedAttendanceIds.length === 0}
                  >
                    Delete Selected ({selectedAttendanceIds.length})
                  </button>
                </div>
              </div>
              <DataTable
                title="Attendance Marked"
                columns={markedColumns}
                data={markedStudents.map(e => ({ ...attendanceMap[e.studentId], student: e.student }))}
                actions={{
                  onEdit: handleEdit,
                  onDelete: handleDelete
                }}
                searchPlaceholder="Search by student ID or name..."
                selectable={true}
                selected={selectedAttendanceIds}
                onSelectionChange={setSelectedAttendanceIds}
                selectKey={'id'}
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Mark Attendance Manually</h2>
                <form onSubmit={handleManualAttendanceSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                  <select
                    className="border rounded px-3 py-2"
                    value={manualAttendance.studentNo}
                    onChange={e => setManualAttendance({ ...manualAttendance, studentNo: e.target.value })}
                    required
                  >
                    <option value="">Select Student</option>
                    {notMarkedStudents.map(student => (
                      <option key={student.student.studentNo} value={student.student.studentNo}>
                        {student.student?.user?.firstName + ' ' + student.student?.user?.lastName || student.studentId} ({student.student?.studentNo || ''})
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-3 py-2"
                    value={manualAttendance.status}
                    onChange={e => setManualAttendance({ ...manualAttendance, status: e.target.value })}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    {/* <option value="excused">Excused</option> */}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    disabled={manualAttendanceLoading}
                  >
                    {manualAttendanceLoading ? 'Marking...' : 'Mark Attendance'}
                  </button>
                </form>
              </div>
              <DataTable
                title="Not Marked Students"
                columns={notMarkedColumns}
                data={notMarkedStudents}
                searchPlaceholder="Search by student ID or name..."
              />
            </>
          )}
        </div>

        {showBulkUpload && (
          <BulkUploadModal
            session={selectedSession}
            courseOffering={selectedOffering}
            onSubmit={handleBulkUpload}
            onCancel={() => setShowBulkUpload(false)}
            notMarkedStudents={notMarkedStudents}
          />
        )}

        {/* Bulk upload result modal: shows failedRecords and allows download */}
        {showBulkResultModal && bulkUploadResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Upload Results</h3>
              <p className="text-sm text-gray-600 mb-4">{bulkUploadResult.successCount} succeeded, {bulkUploadResult.failedCount} failed.</p>
              {bulkUploadResult.failedCount > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Failed Records (first 20)</p>
                  <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50 text-sm text-gray-700">
                    <ul className="space-y-2">
                      {bulkUploadResult.failedRecords.slice(0,20).map((r, i) => (
                        <li key={i}><span className="font-medium">{r.studentNo}</span> — {r.status} — {r.reason || r.error || '-'}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-4">
                {bulkUploadResult.failedCount > 0 && (
                  <button
                    onClick={() => {
                      // generate CSV for failed records and download
                      const rows = bulkUploadResult.failedRecords || [];
                      const headers = ['studentNo','status','remarks','classSessionId','courseOfferingId','reason'];
                      const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => {
                        const v = r[h] ?? r[h] === 0 ? r[h] : (r[h] || '');
                        // escape quotes
                        return '"' + String(v).replace(/"/g, '""') + '"';
                      }).join(','))).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'failed-attendance-records.csv';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    Download Failed Records
                  </button>
                )}
                <button
                  onClick={() => { setShowBulkResultModal(false); setBulkUploadResult(null); }}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedAttendance && (
          <EditAttendanceModal
            attendance={selectedAttendance}
            onSave={handleSaveEdit}
            onCancel={() => setShowEditModal(false)}
          />
        )}

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.onConfirm && confirmDialog.onConfirm(); closeConfirm(); }}
          onCancel={closeConfirm}
        />
      </main>
    );
  }

  return null;
}