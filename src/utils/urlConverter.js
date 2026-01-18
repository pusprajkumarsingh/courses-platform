/**
 * Utility functions to convert Excel/Google Sheets URLs to CSV format
 */

/**
 * Convert Google Sheets URL to CSV export URL
 * @param {string} url - Original Google Sheets URL
 * @returns {string} - CSV export URL
 */
export const convertGoogleSheetsToCSV = (url) => {
  try {
    // Check if it's already a CSV export URL
    if (url.includes('/export?format=csv')) {
      return url;
    }

    // Extract sheet ID and GID from Google Sheets URL
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    
    if (!sheetIdMatch) {
      throw new Error('Invalid Google Sheets URL');
    }

    const sheetId = sheetIdMatch[1];
    const gid = gidMatch ? gidMatch[1] : '0'; // Default to first sheet if no GID

    // Construct CSV export URL
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  } catch (error) {
    console.error('Error converting Google Sheets URL to CSV:', error);
    return url; // Return original URL if conversion fails
  }
};

/**
 * Auto-detect and convert various spreadsheet URLs to CSV
 * @param {string} url - Original spreadsheet URL
 * @returns {string} - CSV export URL
 */
export const convertToCSV = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Google Sheets
  if (url.includes('docs.google.com/spreadsheets')) {
    return convertGoogleSheetsToCSV(url);
  }

  // Already a CSV file
  if (url.endsWith('.csv')) {
    return url;
  }

  // Excel Online (Microsoft)
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    console.warn('Excel Online URLs cannot be directly converted to CSV. Please download and upload as CSV.');
    return url;
  }

  // Return original URL if no conversion needed
  return url;
};

/**
 * Validate if URL is a valid CSV source
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid CSV source
 */
export const isValidCSVSource = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Google Sheets CSV export
  if (url.includes('docs.google.com/spreadsheets') && url.includes('export?format=csv')) {
    return true;
  }

  // Direct CSV file
  if (url.endsWith('.csv')) {
    return true;
  }

  // Raw CSV content (like GitHub raw files)
  if (url.includes('raw.githubusercontent.com') && url.endsWith('.csv')) {
    return true;
  }

  return false;
};

/**
 * Get user-friendly instructions for URL conversion
 * @param {string} url - Original URL
 * @returns {string} - Instructions for conversion
 */
export const getConversionInstructions = (url) => {
  if (!url) {
    return 'Please provide a valid spreadsheet URL';
  }

  if (url.includes('docs.google.com/spreadsheets')) {
    if (url.includes('/edit')) {
      return 'Google Sheets URL detected. Will auto-convert to CSV format.';
    } else if (url.includes('export?format=csv')) {
      return 'Valid Google Sheets CSV export URL.';
    }
  }

  if (url.endsWith('.csv')) {
    return 'Valid CSV file URL.';
  }

  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    return 'Excel Online detected. Please download as CSV and upload to a public location.';
  }

  return 'Please ensure the URL points to a Google Sheets document or CSV file.';
};

export default {
  convertGoogleSheetsToCSV,
  convertToCSV,
  isValidCSVSource,
  getConversionInstructions
};