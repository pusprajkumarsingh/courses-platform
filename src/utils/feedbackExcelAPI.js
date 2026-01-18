// Excel/Google Sheets API for feedback management with dual sheet support
import ConfigLogger from './configLogger';

class FeedbackExcelAPI {
  constructor() {
    // URLs for reading and writing to Excel sheets
    this.READ_SHEET_URL = ''; // For fetching existing feedback data
    this.WRITE_SHEET_URL = ''; // For storing new feedback data
    this.SHEET_NAME = 'Feedback';
    
    // Load settings on initialization
    this.loadStoredSettings();
  }

  // Load all stored settings including URLs
  loadStoredSettings() {
    const settings = ConfigLogger.getAdminSettings();
    this.READ_SHEET_URL = settings.readSheetURL || '';
    this.WRITE_SHEET_URL = settings.writeSheetURL || '';
    
    console.log('Loaded stored settings:', {
      readURL: this.READ_SHEET_URL ? 'configured' : 'not set',
      writeURL: this.WRITE_SHEET_URL ? 'configured' : 'not set'
    });
    
    return settings;
  }

  // Set the Excel sheet URL for reading feedback data
  setReadSheetURL(url) {
    const oldUrl = this.READ_SHEET_URL;
    this.READ_SHEET_URL = url;
    
    // Save to admin settings
    ConfigLogger.saveAdminSettings({ readSheetURL: url });
    
    // Log the change
    ConfigLogger.logExcelURLChange('read', url, oldUrl);
    
    console.log('Read sheet URL updated and logged:', url);
    return { success: true, message: 'Read sheet URL updated and logged' };
  }

  // Set the Excel sheet URL for writing feedback data
  setWriteSheetURL(url) {
    const oldUrl = this.WRITE_SHEET_URL;
    this.WRITE_SHEET_URL = url;
    
    // Save to admin settings
    ConfigLogger.saveAdminSettings({ writeSheetURL: url });
    
    // Log the change
    ConfigLogger.logExcelURLChange('write', url, oldUrl);
    
    console.log('Write sheet URL updated and logged:', url);
    return { success: true, message: 'Write sheet URL updated and logged' };
  }

  // Get stored URLs from settings (not localStorage directly)
  loadStoredURLs() {
    const settings = this.loadStoredSettings();
    return {
      readURL: this.READ_SHEET_URL,
      writeURL: this.WRITE_SHEET_URL
    };
  }

  // Submit feedback to Excel sheet (Google Apps Script endpoint)
  async submitFeedback(feedbackData) {
    try {
      // Always reload settings before submission to get latest URLs
      this.loadStoredSettings();
      
      const timestamp = new Date().toISOString();
      const feedbackEntry = {
        timestamp,
        name: feedbackData.name,
        email: feedbackData.email,
        type: feedbackData.type,
        course: feedbackData.course,
        rating: feedbackData.rating,
        message: feedbackData.message,
        status: 'pending'
      };

      console.log('Current WRITE_SHEET_URL:', this.WRITE_SHEET_URL);

      // Try to submit to Excel sheet if write URL is configured
      if (this.WRITE_SHEET_URL && this.WRITE_SHEET_URL.trim()) {
        try {
          console.log('Submitting to Excel sheet:', this.WRITE_SHEET_URL);

          // Use form submission method to bypass CORS completely
          const formData = new FormData();
          formData.append('data', JSON.stringify(feedbackEntry));

          try {
            const response = await fetch(this.WRITE_SHEET_URL, {
              method: 'POST',
              body: formData
            });

            console.log('✅ Form data sent to Apps Script successfully');
            console.log('Data sent:', feedbackEntry);
            console.log('Check your Google Sheet and Apps Script Executions to verify the data was saved');

          } catch (error) {
            console.log('Request sent but response blocked by CORS (this is normal)');
            console.log('Data sent:', feedbackEntry);
            console.log('Check your Google Sheet to verify the data was saved');
          }

          console.log('Feedback submitted to Excel sheet');

          // Also store locally as backup
          const existingFeedback = this.getLocalFeedback();
          existingFeedback.push(feedbackEntry);
          localStorage.setItem('feedbackData', JSON.stringify(existingFeedback));

          return { success: true, data: feedbackEntry, method: 'excel' };
        } catch (error) {
          console.error('Failed to submit to Excel sheet:', error);
          // Fall back to local storage
        }
      } else {
        console.warn('No WRITE_SHEET_URL configured, storing locally only');
      }

      // Store locally if Excel submission failed or not configured
      const existingFeedback = this.getLocalFeedback();
      existingFeedback.push(feedbackEntry);
      localStorage.setItem('feedbackData', JSON.stringify(existingFeedback));

      console.log('Feedback stored locally:', feedbackEntry);
      return { success: true, data: feedbackEntry, method: 'local' };
    } catch (error) {
      console.error('Error storing feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get feedback from Excel sheet
  async getFeedback() {
    try {
      // Load stored URLs if not already loaded
      if (!this.READ_SHEET_URL) {
        const urls = this.loadStoredURLs();
        console.log('Loaded URLs from localStorage:', urls);
      }

      // First try to get from Excel sheet if read URL is configured
      if (this.READ_SHEET_URL && this.READ_SHEET_URL.trim()) {
        try {
          console.log('Fetching from Excel sheet:', this.READ_SHEET_URL);
          const response = await fetch(this.READ_SHEET_URL);

          if (response.ok) {
            const text = await response.text();
            console.log('Excel sheet response length:', text.length);

            // Check if we got valid CSV data
            if (text && !text.includes('<html>') && !text.includes('<!DOCTYPE')) {
              const feedback = this.parseCSVFeedback(text);
              console.log('Parsed feedback from Excel:', feedback.length, 'entries');
              return { success: true, data: feedback, source: 'excel' };
            } else {
              console.error('Received HTML instead of CSV data from Excel sheet');
            }
          } else {
            console.error('Excel sheet fetch failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Could not fetch from Excel sheet:', error);
        }
      } else {
        console.log('No read sheet URL configured, using local storage');
      }

      // Fallback to localStorage
      console.log('Using local storage data');
      const localFeedback = this.getLocalFeedback();
      return { success: true, data: localFeedback, source: 'local' };
    } catch (error) {
      console.error('Error getting feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse CSV feedback data from Excel sheet with better error handling
  parseCSVFeedback(csvText) {
    try {
      // Check if the response is HTML instead of CSV
      if (csvText.includes('<html>') || csvText.includes('<script>') || csvText.includes('<!DOCTYPE')) {
        console.error('Received HTML instead of CSV data');
        return [];
      }

      const lines = csvText.split('\n');
      const feedback = [];

      // Skip header row and empty lines
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.includes('<') && !line.includes('function')) { // Skip HTML/JS lines
          const columns = this.parseCSVLine(line);
          
          // More flexible validation - only require minimum essential fields
          if (columns.length >= 3) { // At least 3 columns (timestamp, name, email)
            const name = columns[1] ? columns[1].replace(/"/g, '').trim() : '';
            const email = columns[2] ? columns[2].replace(/"/g, '').trim() : '';
            const ratingValue = columns[5] ? parseInt(columns[5]) : 5; // Default to 5 if missing
            
            // Only require name and email to be non-empty
            if (name && email) {
              // Ensure rating is valid, default to 5 if invalid
              const rating = (ratingValue >= 1 && ratingValue <= 5) ? ratingValue : 5;
              
              feedback.push({
                id: i,
                timestamp: columns[0] || new Date().toISOString(),
                name: name,
                email: email,
                type: (columns[3] === 'faculty') ? 'faculty' : 'student',
                course: columns[4] ? columns[4].replace(/"/g, '').trim() : 'General',
                rating: rating,
                message: columns[6] ? columns[6].replace(/"/g, '').trim() : 'No message provided',
                status: columns[7] || 'pending'
              });
            } else {
              console.warn(`Skipping row ${i}: Missing required name or email`);
            }
          } else {
            console.warn(`Skipping row ${i}: Insufficient columns (${columns.length})`);
          }
        }
      }

      console.log(`Successfully parsed ${feedback.length} feedback entries from CSV`);
      return feedback;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return [];
    }
  }

  // Simple CSV line parser
  parseCSVLine(line) {
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
  }

  // Get feedback from localStorage with validation
  getLocalFeedback() {
    try {
      const stored = localStorage.getItem('feedbackData');
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Validate and filter out corrupted entries
      const validFeedback = parsed.filter(item => {
        return (
          item &&
          typeof item === 'object' &&
          item.name &&
          item.email &&
          item.course &&
          item.rating >= 1 &&
          item.rating <= 5 &&
          item.message &&
          !item.name.includes('function') &&
          !item.name.includes('<') &&
          !item.email.includes('function') &&
          !item.email.includes('<')
        );
      });

      // If we filtered out corrupted data, save the clean version
      if (validFeedback.length !== parsed.length) {
        localStorage.setItem('feedbackData', JSON.stringify(validFeedback));
        console.log(`Cleaned ${parsed.length - validFeedback.length} corrupted entries`);
      }

      return validFeedback;
    } catch (error) {
      console.error('Error reading local feedback, clearing corrupted data:', error);
      localStorage.removeItem('feedbackData');
      return [];
    }
  }

  // Get random feedback for display
  async getRandomFeedback(count = 6, type = null) {
    try {
      let result;
      
      if (type === 'faculty') {
        // Load faculty feedback from separate sheet
        result = await this.getFacultyFeedback();
      } else {
        // Load student feedback from main sheet
        result = await this.getFeedback();
      }
      
      if (!result.success) {
        return result;
      }

      let feedback = result.data;

      // Filter by type if specified (for student feedback)
      if (type && type !== 'faculty') {
        feedback = feedback.filter(item => item.type === type);
      }

      // Filter out feedback with low ratings
      feedback = feedback.filter(item =>
        item.rating >= 4 &&
        item.message &&
        item.message.length > 10
      );

      // Shuffle and get random items
      const shuffled = feedback.sort(() => 0.5 - Math.random());
      const randomFeedback = shuffled.slice(0, count);

      return { success: true, data: randomFeedback };
    } catch (error) {
      console.error('Error getting random feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get faculty feedback from separate Excel sheet
  async getFacultyFeedback() {
    try {
      // Load faculty URLs from localStorage
      const facultyReadURL = localStorage.getItem('facultyReadSheetURL');
      
      if (facultyReadURL && facultyReadURL.trim()) {
        try {
          console.log('Fetching faculty feedback from Excel sheet:', facultyReadURL);
          const response = await fetch(facultyReadURL);

          if (response.ok) {
            const text = await response.text();
            console.log('Faculty Excel sheet response length:', text.length);

            // Check if we got valid CSV data
            if (text && !text.includes('<html>') && !text.includes('<!DOCTYPE')) {
              const feedback = this.parseCSVFeedback(text);
              // Ensure all feedback is marked as faculty type
              const facultyFeedback = feedback.map(f => ({ ...f, type: 'faculty' }));
              console.log('Parsed faculty feedback from Excel:', facultyFeedback.length, 'entries');
              return { success: true, data: facultyFeedback, source: 'excel' };
            } else {
              console.error('Received HTML instead of CSV data from faculty Excel sheet');
            }
          } else {
            console.error('Faculty Excel sheet fetch failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Could not fetch from faculty Excel sheet:', error);
        }
      } else {
        console.log('No faculty read sheet URL configured');
      }

      // Fallback to empty array if no faculty sheet configured
      return { success: true, data: [], source: 'none' };
    } catch (error) {
      console.error('Error getting faculty feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit faculty feedback to separate Excel sheet
  async submitFacultyFeedback(feedbackData) {
    try {
      const timestamp = new Date().toISOString();
      const feedbackEntry = {
        timestamp,
        name: feedbackData.name,
        email: feedbackData.email,
        type: 'faculty',
        course: feedbackData.course,
        rating: feedbackData.rating,
        message: feedbackData.message,
        status: 'pending'
      };

      // Get faculty write URL
      const facultyWriteURL = localStorage.getItem('facultyWriteSheetURL');

      // Try to submit to faculty Excel sheet if write URL is configured
      if (facultyWriteURL && facultyWriteURL.trim()) {
        try {
          console.log('Submitting faculty feedback to Excel sheet:', facultyWriteURL);

          // For Google Apps Script endpoint
          const response = await fetch(facultyWriteURL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackEntry)
          });

          console.log('Faculty feedback submitted to Excel sheet');
          return { success: true, data: feedbackEntry, method: 'excel' };
        } catch (error) {
          console.error('Failed to submit faculty feedback to Excel sheet:', error);
        }
      }

      // If no faculty sheet configured, fall back to main feedback system
      return await this.submitFeedback(feedbackData);
    } catch (error) {
      console.error('Error storing faculty feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Export feedback data as CSV for manual upload to Excel
  exportFeedbackAsCSV() {
    try {
      const feedback = this.getLocalFeedback();

      if (feedback.length === 0) {
        return { success: false, error: 'No feedback data to export' };
      }

      // Create CSV content
      const headers = ['Timestamp', 'Name', 'Email', 'Type', 'Course', 'Rating', 'Message', 'Status'];
      let csvContent = headers.join(',') + '\n';

      feedback.forEach(item => {
        const row = [
          item.timestamp,
          `"${item.name}"`,
          item.email,
          item.type,
          `"${item.course}"`,
          item.rating,
          `"${item.message.replace(/"/g, '""')}"`, // Escape quotes
          item.status
        ];
        csvContent += row.join(',') + '\n';
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Feedback exported successfully' };
    } catch (error) {
      console.error('Error exporting feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear local feedback data
  clearLocalFeedback() {
    try {
      localStorage.removeItem('feedbackData');
      console.log('Local feedback data cleared');
      return { success: true, message: 'Local feedback data cleared' };
    } catch (error) {
      console.error('Error clearing local feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Force clear all corrupted data and reset system
  forceResetSystem() {
    try {
      // Clear only feedback data, NOT the Excel sheet URLs
      localStorage.removeItem('feedbackData');
      
      // Don't clear the Excel sheet URLs - they should persist
      // localStorage.removeItem('feedbackReadURL');
      // localStorage.removeItem('feedbackWriteURL');

      console.log('Feedback data cleared, Excel URLs preserved');
      return { success: true, message: 'Feedback data cleared, Excel URLs preserved' };
    } catch (error) {
      console.error('Error clearing feedback data:', error);
      return { success: false, error: error.message };
    }
  }

  // Set the Excel sheet URL
  setFeedbackSheetURL(url) {
    this.FEEDBACK_SHEET_URL = url;
    return { success: true, message: 'Feedback sheet URL updated' };
  }

  // Get statistics from feedback data
  async getFeedbackStats() {
    try {
      const result = await this.getFeedback();
      if (!result.success) {
        return result;
      }

      const feedback = result.data;
      const totalFeedback = feedback.length;
      const studentFeedback = feedback.filter(f => f.type === 'student').length;
      const facultyFeedback = feedback.filter(f => f.type === 'faculty').length;
      const averageRating = totalFeedback > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
        : 0;

      return {
        success: true,
        data: {
          total: totalFeedback,
          student: studentFeedback,
          faculty: facultyFeedback,
          averageRating: parseFloat(averageRating)
        }
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FeedbackExcelAPI();