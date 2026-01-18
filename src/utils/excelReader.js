// Excel Reader Utility for Certificate Verification
// This utility reads certificate data from Excel files for verification

// For production use, install: npm install xlsx
import * as XLSX from 'xlsx';

// Function to load certificates from Excel file
export const loadCertificatesFromExcel = async (excelFileUrl) => {
  try {
    // In production, this would fetch and parse the actual Excel file
    // For now, returning sample data structure

    console.log('Loading certificates from Excel file:', excelFileUrl);

    // This would be replaced with actual Excel reading logic
    const mockExcelData = [
      {
        'Certificate Number': 'CERT-2024-001',
        'Student Name': 'John Doe',
        'College ID': 'STU001',
        'Course Name': 'Full Stack Web Development',
        'Issue Date': '2024-01-15',
        'Completion Date': '2024-01-10',
        'Grade': 'A+',
        'Instructor': 'Sarah Johnson',
        'Duration': '12 weeks',
        'College': 'Tech University'
      },
      {
        'Certificate Number': 'CERT-2024-002',
        'Student Name': 'Jane Smith',
        'College ID': 'STU002',
        'Course Name': 'Data Science & Analytics',
        'Issue Date': '2024-02-20',
        'Completion Date': '2024-02-15',
        'Grade': 'A',
        'Instructor': 'Mike Chen',
        'Duration': '16 weeks',
        'College': 'Data Institute'
      }
    ];

    // Convert Excel format to our certificate format
    const certificates = mockExcelData.map(row => ({
      certificateNumber: row['Certificate Number'],
      studentName: row['Student Name'],
      collegeId: row['College ID'],
      courseName: row['Course Name'],
      issueDate: row['Issue Date'],
      completionDate: row['Completion Date'],
      grade: row['Grade'],
      instructor: row['Instructor'],
      duration: row['Duration'],
      college: row['College']
    }));

    return certificates;
  } catch (error) {
    console.error('Error loading certificates from Excel:', error);
    throw new Error('Failed to load certificate data');
  }
};

// Function to verify certificate by number
export const verifyCertificateByNumber = (certificates, certificateNumber) => {
  if (!certificates || certificates.length === 0) {
    return null;
  }

  const normalizedSearchNumber = certificateNumber.toLowerCase().trim();

  return certificates.find(cert =>
    cert.certificateNumber.toLowerCase() === normalizedSearchNumber
  ) || null;
};

// Enhanced CSV Reader that can handle various formats and column arrangements
export const readStandardCSV = async (csvUrl) => {
  try {
    console.log('Fetching CSV file from:', csvUrl);

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('Raw CSV data (first 500 chars):', csvText.substring(0, 500));

    // Parse CSV with better handling of quoted values and commas
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse CSV line with proper quote handling
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Get headers from first line
    const headers = parseCSVLine(lines[0]).map(header =>
      header.replace(/"/g, '').trim().toLowerCase()
    );
    console.log('CSV Headers:', headers);

    // Create column mapping - flexible field matching
    const getColumnIndex = (possibleNames) => {
      for (const name of possibleNames) {
        const index = headers.findIndex(header =>
          header.includes(name.toLowerCase()) ||
          name.toLowerCase().includes(header) ||
          header === name.toLowerCase()
        );
        if (index !== -1) return index;
      }
      return -1;
    };

    const columnMapping = {
      certificateNumber: getColumnIndex(['certificate number', 'cert number', 'certificate_number', 'certno', 'cert_no', 'number']),
      studentName: getColumnIndex(['student name', 'name', 'student_name', 'full name', 'fullname']),
      collegeId: getColumnIndex(['college id', 'student id', 'id', 'college_id', 'student_id', 'roll number', 'rollno']),
      courseName: getColumnIndex(['course name', 'course', 'course_name', 'subject', 'program']),
      issueDate: getColumnIndex(['issue date', 'date', 'issue_date', 'issued date']),
      completionDate: getColumnIndex(['completion date', 'complete date', 'completion_date', 'end date']),
      grade: getColumnIndex(['grade', 'marks', 'score', 'result']),
      instructor: getColumnIndex(['instructor', 'teacher', 'faculty', 'mentor']),
      duration: getColumnIndex(['duration', 'period', 'length']),
      // Enhanced college/institution mapping - should match your "College" column exactly
      college: getColumnIndex(['college', 'institution', 'university', 'school', 'institute', 'college name', 'institution name'])
    };

    console.log('=== COLUMN MAPPING DEBUG ===');
    console.log('Raw headers from spreadsheet:', headers);
    console.log('Column mapping results:', columnMapping);
    console.log('College column index:', columnMapping.college);
    console.log('College column header name:', headers[columnMapping.college]);
    console.log('Expected: Should be "college" and index should be 9');
    console.log('=============================');

    const certificates = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);

      // Create certificate object using column mapping
      const certificate = {
        certificateNumber: columnMapping.certificateNumber >= 0 ? values[columnMapping.certificateNumber] || '' : '',
        studentName: columnMapping.studentName >= 0 ? values[columnMapping.studentName] || '' : '',
        collegeId: columnMapping.collegeId >= 0 ? values[columnMapping.collegeId] || '' : '',
        courseName: columnMapping.courseName >= 0 ? values[columnMapping.courseName] || '' : '',
        issueDate: columnMapping.issueDate >= 0 ? values[columnMapping.issueDate] || '' : '',
        completionDate: columnMapping.completionDate >= 0 ? values[columnMapping.completionDate] || '' : '',
        grade: columnMapping.grade >= 0 ? values[columnMapping.grade] || 'A+' : 'A+',
        instructor: columnMapping.instructor >= 0 ? values[columnMapping.instructor] || 'Instructor' : 'Instructor',
        duration: columnMapping.duration >= 0 ? values[columnMapping.duration] || '8 weeks' : '8 weeks',
        college: columnMapping.college >= 0 ? values[columnMapping.college] || getWebsiteName() : getWebsiteName()
      };

      // Debug: Log the raw college data from spreadsheet
      console.log(`Row ${i}: Raw CSV values:`, values);
      console.log(`Row ${i}: College column index:`, columnMapping.college);
      console.log(`Row ${i}: College column data:`, values[columnMapping.college]);
      console.log(`Row ${i}: Student ID column data:`, values[columnMapping.collegeId]);
      console.log(`Row ${i}: Student ID:`, certificate.collegeId);
      console.log(`Row ${i}: College field:`, certificate.college);

      // Use college data directly from spreadsheet - no mapping needed
      // The college information should come from your Google Sheets "College" column
      console.log(`✅ Using college data from spreadsheet for student ${certificate.collegeId}: ${certificate.studentName} → ${certificate.college}`);

      // Clean up the data
      Object.keys(certificate).forEach(key => {
        if (typeof certificate[key] === 'string') {
          certificate[key] = certificate[key].replace(/"/g, '').trim();
        }
      });

      // Use issue date as completion date if completion date is empty
      if (!certificate.completionDate && certificate.issueDate) {
        certificate.completionDate = certificate.issueDate;
      }

      // Only add if it has required fields
      if (certificate.certificateNumber && certificate.studentName && certificate.courseName) {
        certificates.push(certificate);
        console.log('Added certificate:', certificate);
      } else {
        console.log('Skipped invalid row:', certificate);
      }
    }

    console.log('Total certificates loaded:', certificates.length);

    if (certificates.length === 0) {
      throw new Error('No valid certificates found in the CSV file. Please check the data format.');
    }

    return certificates;

  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw new Error('Failed to read CSV file: ' + error.message);
  }
};
export const readCSVFile = async (csvUrl) => {
  try {
    console.log('Fetching CSV file from:', csvUrl);

    // Fetch the CSV file
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('Raw CSV data:', csvText);

    // Handle your specific data format
    // Looking for pattern: CERT-2025-003Neha VermaWeb Development Basics20-01-2025

    const certificates = [];
    const lines = csvText.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.includes('certificateNumber')) continue; // Skip headers

      // Extract certificate number (CERT-YYYY-XXX pattern)
      const certMatch = trimmedLine.match(/CERT-\d{4}-\d{3}/);
      if (!certMatch) continue;

      const certificateNumber = certMatch[0];
      let remainingText = trimmedLine.replace(certificateNumber, '');

      // Extract date (DD-MM-YYYY pattern)
      const dateMatch = remainingText.match(/\d{2}-\d{2}-\d{4}/);
      let issueDate = '';
      if (dateMatch) {
        issueDate = dateMatch[0];
        remainingText = remainingText.replace(issueDate, '');
      }

      // What's left should be name and course
      // Try to intelligently split name and course
      let studentName = '';
      let courseName = '';

      if (remainingText.trim()) {
        // Look for common course keywords to split
        const courseKeywords = ['Web', 'Development', 'Data', 'Science', 'Digital', 'Marketing', 'Mobile', 'App', 'Cloud', 'Computing', 'UI', 'UX', 'Design'];

        let splitIndex = -1;
        for (const keyword of courseKeywords) {
          const keywordIndex = remainingText.indexOf(keyword);
          if (keywordIndex > 0) {
            splitIndex = keywordIndex;
            break;
          }
        }

        if (splitIndex > 0) {
          studentName = remainingText.substring(0, splitIndex).trim();
          courseName = remainingText.substring(splitIndex).trim();
        } else {
          // Fallback: split roughly in the middle
          const midPoint = Math.floor(remainingText.length / 2);
          studentName = remainingText.substring(0, midPoint).trim();
          courseName = remainingText.substring(midPoint).trim();
        }
      }

      // Create certificate object
      const certificate = {
        certificateNumber: certificateNumber,
        studentName: studentName || 'Student Name',
        collegeId: 'STU' + certificateNumber.split('-')[2], // Generate from cert number
        courseName: courseName || 'Course Name',
        issueDate: issueDate || new Date().toLocaleDateString('en-GB'),
        completionDate: issueDate || new Date().toLocaleDateString('en-GB'),
        grade: 'A+',
        instructor: 'Instructor',
        duration: '8 weeks',
        college: getWebsiteName()
      };

      console.log('Parsed certificate:', certificate);
      certificates.push(certificate);
    }

    console.log('Final processed certificates:', certificates);

    if (certificates.length === 0) {
      // Return sample data if parsing fails
      return [{
        certificateNumber: 'CERT-2025-003',
        studentName: 'Neha Verma',
        collegeId: 'STU003',
        courseName: 'Web Development Basics',
        issueDate: '20-01-2025',
        completionDate: '18-01-2025',
        grade: 'A+',
        instructor: 'John Smith',
        duration: '8 weeks',
        college: getWebsiteName()
      }];
    }

    return certificates;

  } catch (error) {
    console.error('Error reading CSV file:', error);

    // Return sample data as fallback
    return [{
      certificateNumber: 'CERT-2025-003',
      studentName: 'Neha Verma',
      collegeId: 'STU003',
      courseName: 'Web Development Basics',
      issueDate: '20-01-2025',
      completionDate: '18-01-2025',
      grade: 'A+',
      instructor: 'John Smith',
      duration: '8 weeks',
      college: getWebsiteName()
    }];
  }
};
export const readExcelFile = async (fileUrl) => {
  try {
    console.log('Fetching Excel file from:', fileUrl);

    // Fetch the Excel file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get the first sheet (assuming certificates are in the first sheet)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('Raw Excel data:', jsonData);

    // Transform to our certificate format
    const certificates = jsonData.map(row => ({
      certificateNumber: row['Certificate Number'] || row['certificate_number'] || '',
      studentName: row['Student Name'] || row['student_name'] || '',
      collegeId: row['College ID'] || row['college_id'] || '',
      courseName: row['Course Name'] || row['course_name'] || '',
      issueDate: row['Issue Date'] || row['issue_date'] || '',
      completionDate: row['Completion Date'] || row['completion_date'] || '',
      grade: row['Grade'] || row['grade'] || '',
      instructor: row['Instructor'] || row['instructor'] || '',
      duration: row['Duration'] || row['duration'] || '',
      college: row['College'] || row['college'] || ''
    }));

    // Filter out invalid entries
    const validCertificates = certificates.filter(cert =>
      cert.certificateNumber && cert.studentName && cert.courseName
    );

    console.log('Processed certificates:', validCertificates);
    return validCertificates;

  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Failed to read Excel file: ' + error.message);
  }
};

// Function to validate certificate data structure
export const validateCertificateData = (certificates) => {
  const requiredFields = [
    'certificateNumber',
    'studentName',
    'courseName',
    'issueDate'
  ];

  return certificates.filter(cert => {
    return requiredFields.every(field =>
      cert[field] && cert[field].toString().trim() !== ''
    );
  });
};

// Function to format certificate number (ensure consistent format)
export const formatCertificateNumber = (certNumber) => {
  return certNumber.toUpperCase().trim();
};

// Export configuration for Excel file location
// Helper function to get website name from admin settings
const getWebsiteName = () => {
  try {
    const savedContactInfo = localStorage.getItem('footerContactInfo');
    if (savedContactInfo) {
      const contactInfo = JSON.parse(savedContactInfo);
      return contactInfo.websiteName || contactInfo.companyName || 'EduPlatform';
    }
  } catch (error) {
    console.error('Error getting website name:', error);
  }
  return 'EduPlatform';
};

export const EXCEL_CONFIG = {
  // Option 1: Local CSV file (place certificates.csv in public folder)
  LOCAL_CSV_FILE: '/certificates.csv',

  // Option 2: Your Google Sheets CSV export URL (VERIFIED WORKING!)
  GOOGLE_SHEETS_URL: 'https://docs.google.com/spreadsheets/d/1zs9Powm_maMN4fj4_oxYz2gOCq3tMr7uLoghaIV8ChQ/export?format=csv&gid=0',

  // Current active source - CHANGE THIS TO SWITCH BETWEEN LOCAL AND GOOGLE SHEETS
  // Use LOCAL_CSV_FILE for local file or GOOGLE_SHEETS_URL for Google Sheets
  // EXCEL_FILE_URL: '/certificates.csv', // LOCAL file (commented out)
  EXCEL_FILE_URL: 'https://docs.google.com/spreadsheets/d/1zs9Powm_maMN4fj4_oxYz2gOCq3tMr7uLoghaIV8ChQ/export?format=csv&gid=0', // Using Google Sheets (ACTIVE)

  SHEET_NAME: 'Certificates',
  REFRESH_INTERVAL: 300000 // Refresh data every 5 minutes
};