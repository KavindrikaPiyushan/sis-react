import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract results data
 * @param {File} file - Excel file to parse
 * @returns {Promise<Object>} - Parsed data with results array and metadata
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('Excel file must contain at least a header row and one data row');
        }
        
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        // Parse the data based on the headers
        const parsedData = parseExcelData(headers, rows);
        
        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse Excel data based on column structure
 * @param {Array} headers - Header row from Excel
 * @param {Array} rows - Data rows from Excel
 * @returns {Object} - Parsed data with validation info
 */
const parseExcelData = (headers, rows) => {
  // Log original headers for debugging
  console.log('Original headers:', headers);
  
  // Normalize headers (remove spaces, convert to lowercase)
  const normalizedHeaders = headers.map(header => 
    header?.toString().toLowerCase().replace(/\s+/g, '').trim()
  );
  
  console.log('Normalized headers:', normalizedHeaders);
  
  // Identify column structure
  const columnMapping = identifyColumns(normalizedHeaders);
  
  console.log('Column mapping:', columnMapping);
  
  if (!columnMapping.studentNo && columnMapping.studentNo !== 0) {
    const headersList = headers.map((h, i) => `Column ${i + 1}: "${h}"`).join(', ');
    throw new Error(`Student Number column not found. Found columns: ${headersList}. Please ensure you have a column with student numbers (can be named: Student No, Student Number, StudentNo, Registration No, etc.)`);
  }
  
  if (!columnMapping.marks && !columnMapping.grade) {
    const headersList = headers.map((h, i) => `Column ${i + 1}: "${h}"`).join(', ');
    throw new Error(`Either Marks or Grade column is required. Found columns: ${headersList}. Please include a column with marks (0-100) or grades (A+, A, A-, etc.)`);
  }
  
  // Parse rows
  const results = [];
  const errors = [];
  
  rows.forEach((row, index) => {
    try {
      const rowNum = index + 2; // +2 because Excel is 1-indexed and we skipped header
      
      if (!row || row.length === 0 || !row[columnMapping.studentNo]) {
        return; // Skip empty rows
      }
      
      const result = parseRow(row, columnMapping, rowNum);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      errors.push({
        row: index + 2,
        error: error.message
      });
    }
  });
  
  return {
    results,
    errors,
    totalRows: rows.length,
    validRows: results.length,
    columnStructure: columnMapping,
    detectedColumns: {
      studentNo: headers[columnMapping.studentNo],
      marks: columnMapping.marks !== undefined ? headers[columnMapping.marks] : null,
      grade: columnMapping.grade !== undefined ? headers[columnMapping.grade] : null
    }
  };
};

/**
 * Identify column positions based on headers
 * @param {Array} headers - Normalized headers
 * @returns {Object} - Column mapping
 */
const identifyColumns = (headers) => {
  const mapping = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header?.toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    
    // Student Number variations - very flexible matching
    if (normalizedHeader.includes('student') || 
        normalizedHeader.includes('regno') || 
        normalizedHeader.includes('registration') ||
        normalizedHeader.includes('regnum') ||
        normalizedHeader.includes('id') ||
        normalizedHeader.includes('number') ||
        normalizedHeader === 'no' ||
        normalizedHeader === 'num' ||
        normalizedHeader.includes('roll') ||
        normalizedHeader.includes('admission') ||
        normalizedHeader.includes('matric') ||
        normalizedHeader.includes('index')) {
      // Only assign if we haven't found a student column yet, or this one is more specific
      if (!mapping.studentNo || 
          normalizedHeader.includes('student') ||
          normalizedHeader.includes('regno') ||
          normalizedHeader.includes('registration')) {
        mapping.studentNo = index;
      }
    }
    // Marks variations
    else if (normalizedHeader.includes('mark') || 
             normalizedHeader.includes('score') || 
             normalizedHeader.includes('point') || 
             normalizedHeader.includes('total') ||
             normalizedHeader === 'marks' ||
             normalizedHeader === 'mark' ||
             normalizedHeader === 'score' ||
             normalizedHeader === 'points') {
      mapping.marks = index;
    }
    // Grade variations
    else if (normalizedHeader.includes('grade') || 
             normalizedHeader.includes('letter') ||
             normalizedHeader === 'grade' ||
             normalizedHeader === 'lettergrade' ||
             normalizedHeader === 'finalgrade') {
      mapping.grade = index;
    }
  });
  
  // If no student column found by name matching, try to find it by position
  // Often the first column is student number
  if (!mapping.studentNo && headers.length > 0) {
    // Check if first column looks like it could be student numbers
    mapping.studentNo = 0;
  }
  
  return mapping;
};

/**
 * Parse individual row data
 * @param {Array} row - Row data
 * @param {Object} columnMapping - Column positions
 * @param {number} rowNum - Row number for error reporting
 * @returns {Object} - Parsed result object
 */
const parseRow = (row, columnMapping, rowNum) => {
  const studentNo = row[columnMapping.studentNo]?.toString().trim();
  
  if (!studentNo) {
    throw new Error(`Student number is required in row ${rowNum}`);
  }
  
  const result = {
    studentNo: studentNo
  };
  
  // Parse marks if available
  if (columnMapping.marks !== undefined && row[columnMapping.marks] !== undefined && row[columnMapping.marks] !== '') {
    const marks = parseFloat(row[columnMapping.marks]);
    
    if (isNaN(marks)) {
      throw new Error(`Invalid marks value "${row[columnMapping.marks]}" in row ${rowNum}`);
    }
    
    if (marks < 0 || marks > 100) {
      throw new Error(`Marks must be between 0 and 100. Found ${marks} in row ${rowNum}`);
    }
    
    result.marks = marks;
  }
  
  // Parse grade if available
  if (columnMapping.grade !== undefined && row[columnMapping.grade] !== undefined && row[columnMapping.grade] !== '') {
    const grade = row[columnMapping.grade]?.toString().trim().toUpperCase();
    
    if (!isValidGrade(grade)) {
      throw new Error(`Invalid grade "${grade}" in row ${rowNum}. Valid grades: A+, A, A-, B+, B, B-, C+, C, C-, D, F`);
    }
    
    result.grade = grade;
    result.gradePoint = getGradePoint(grade);
  }
  
  // Validate that we have either marks or grade
  if (!result.marks && !result.grade) {
    throw new Error(`Either marks or grade is required in row ${rowNum}`);
  }
  
  return result;
};

/**
 * Validate grade format
 * @param {string} grade - Grade to validate
 * @returns {boolean} - Whether grade is valid
 */
const isValidGrade = (grade) => {
  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
  return validGrades.includes(grade);
};

/**
 * Get grade point for a letter grade
 * @param {string} grade - Letter grade
 * @returns {number} - Grade point value
 */
const getGradePoint = (grade) => {
  const gradePoints = {
    'A+': 4.0,
    'A': 3.8,
    'A-': 3.5,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D': 1.0,
    'F': 0.0
  };
  
  return gradePoints[grade] || 0.0;
};

/**
 * Generate Excel template for results upload
 * @param {Array} studentList - List of students with their details
 * @returns {Blob} - Excel file blob
 */
export const generateExcelTemplate = (studentList = []) => {
  const headers = ['Student No', 'Marks', 'Grade'];
  const data = [headers];
  
  // Add sample rows if student list is provided
  if (studentList.length > 0) {
    studentList.forEach(student => {
      data.push([student.studentNo || student.studentId, '', '']);
    });
  } else {
    // Add sample rows
    data.push(['STU001', '85', '']);
    data.push(['STU002', '', 'A-']);
    data.push(['STU003', '78', 'B+']);
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};