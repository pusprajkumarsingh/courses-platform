// Google Sheets API integration for feedback management
const GOOGLE_SHEETS_API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.REACT_APP_FEEDBACK_SPREADSHEET_ID;
const SHEET_NAME = 'Feedback';

class GoogleSheetsAPI {
  constructor() {
    this.baseURL = 'https://sheets.googleapis.com/v4/spreadsheets';
  }

  // Submit feedback to Google Sheets
  async submitFeedback(feedbackData) {
    try {
      const timestamp = new Date().toISOString();
      const values = [
        [
          timestamp,
          feedbackData.name,
          feedbackData.email,
          feedbackData.type,
          feedbackData.course,
          feedbackData.rating,
          feedbackData.message,
          'pending' // status
        ]
      ];

      const response = await fetch(
        `${this.baseURL}/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch feedback from Google Sheets
  async getFeedback() {
    try {
      const response = await fetch(
        `${this.baseURL}/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rows = result.values || [];
      
      // Skip header row and convert to objects
      const feedback = rows.slice(1).map((row, index) => ({
        id: index + 1,
        timestamp: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        type: row[3] || 'student',
        course: row[4] || '',
        rating: parseInt(row[5]) || 5,
        message: row[6] || '',
        status: row[7] || 'pending'
      }));

      return { success: true, data: feedback };
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get random feedback for display
  async getRandomFeedback(count = 6, type = null) {
    try {
      const result = await this.getFeedback();
      if (!result.success) {
        return result;
      }

      let feedback = result.data;
      
      // Filter by type if specified
      if (type) {
        feedback = feedback.filter(item => item.type === type);
      }

      // Filter out feedback with low ratings or inappropriate content
      feedback = feedback.filter(item => 
        item.rating >= 4 && 
        item.status !== 'rejected' &&
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

  // Initialize the spreadsheet with headers (run once)
  async initializeSpreadsheet() {
    try {
      const headers = [
        'Timestamp',
        'Name',
        'Email',
        'Type',
        'Course',
        'Rating',
        'Message',
        'Status'
      ];

      const response = await fetch(
        `${this.baseURL}/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:H1?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [headers]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true, message: 'Spreadsheet initialized successfully' };
    } catch (error) {
      console.error('Error initializing spreadsheet:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleSheetsAPI();