// Google Sheets Write API for admin updates
// This utility handles writing data back to Google Sheets so all users see changes

class GoogleSheetsWriteAPI {
    constructor() {
        this.baseURL = 'https://script.google.com/macros/s/';
    }

    // Convert data to Google Sheets format
    formatDataForSheets(data, type) {
        switch (type) {
            case 'courses':
                return data.map(course => [
                    course.id || Date.now() + Math.random(),
                    course.title || '',
                    course.description || '',
                    course.price || '',
                    course.duration || '',
                    course.level || 'Beginner',
                    course.category || 'programming',
                    course.imageUrl || '',
                    course.instructor || '',
                    course.rating || 0,
                    course.students || 0,
                    this.stringifyFeatures(course.features || [])
                ]);

            case 'teamMembers':
                return data.map(member => [
                    member.id || Date.now() + Math.random(),
                    member.name || '',
                    member.position || '',
                    member.description || '',
                    member.imageUrl || '',
                    member.email || '',
                    member.linkedin || ''
                ]);

            case 'galleryItems':
                return data.map(item => [
                    item.id || Date.now() + Math.random(),
                    item.title || '',
                    item.description || '',
                    item.category || 'events',
                    item.imageUrl || ''
                ]);

            case 'homePageContent':
                const content = data;
                return [[
                    content.hero?.title || 'Welcome to EduPlatform',
                    content.hero?.subtitle || 'Transform your career with professional courses',
                    content.hero?.primaryButtonText || 'Explore Courses',
                    content.hero?.secondaryButtonText || 'Verify Certificate',
                    content.features?.sectionTitle || 'Why Choose Us?',
                    content.features?.feature1?.icon || '🎓',
                    content.features?.feature1?.title || 'Expert Instructors',
                    content.features?.feature1?.description || 'Learn from industry professionals',
                    content.features?.feature2?.icon || '📜',
                    content.features?.feature2?.title || 'Certified Courses',
                    content.features?.feature2?.description || 'Get recognized certificates',
                    content.features?.feature3?.icon || '💻',
                    content.features?.feature3?.title || 'Online Learning',
                    content.features?.feature3?.description || 'Study at your own pace',
                    content.popularCourses?.sectionTitle || 'Popular Courses',
                    content.popularCourses?.showCount || 6,
                    content.popularCourses?.viewAllButtonText || 'View All Courses',
                    content.impact?.sectionTitle || 'Our Impact',
                    content.impact?.showSection !== false ? 'true' : 'false'
                ]];

            case 'footerContactInfo':
                return [[
                    data.email || '',
                    data.phone || '',
                    data.address || '',
                    data.companyName || '',
                    data.tagline || '',
                    data.stayUpdatedTitle || 'Stay Updated',
                    data.stayUpdatedDescription || 'Get latest updates',
                    data.websiteName || 'EduPlatform',
                    data.websiteTitle || 'EduPlatform - Professional Courses',
                    data.welcomeMessage || 'Welcome to EduPlatform',
                    data.copyrightText || '© 2024 EduPlatform. All rights reserved.'
                ]];

            case 'socialMediaLinks':
                return [[
                    data.facebook || '',
                    data.twitter || '',
                    data.instagram || '',
                    data.linkedin || '',
                    data.youtube || '',
                    data.whatsapp || ''
                ]];

            default:
                return [];
        }
    }

    // Convert features array to string for storage
    stringifyFeatures(featuresArray) {
        if (!Array.isArray(featuresArray)) return '';
        return featuresArray.filter(f => f && f.trim()).join('|');
    }

    // Generate Google Apps Script code for writing to sheets
    generateAppsScriptCode() {
        return `
// Google Apps Script for EduPlatform Data Management
// Deploy this as a web app with execute permissions for "Anyone"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetType = data.sheetType;
    const sheetData = data.data;
    const spreadsheetId = data.spreadsheetId;
    
    if (!spreadsheetId || !sheetType || !sheetData) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'Missing required parameters'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getActiveSheet();
    
    // Clear existing data (except headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clear();
    }
    
    // Add new data
    if (sheetData.length > 0) {
      const range = sheet.getRange(2, 1, sheetData.length, sheetData[0].length);
      range.setValues(sheetData);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data updated successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('EduPlatform Data API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
`;
    }

    // Write data to Google Sheets via Apps Script
    async writeToSheet(data, sheetType, appsScriptUrl, spreadsheetId) {
        try {
            if (!appsScriptUrl || !spreadsheetId) {
                throw new Error('Apps Script URL and Spreadsheet ID are required');
            }

            const formattedData = this.formatDataForSheets(data, sheetType);
            
            const payload = {
                sheetType: sheetType,
                data: formattedData,
                spreadsheetId: spreadsheetId
            };

            const response = await fetch(appsScriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Unknown error occurred');
            }

            return result;
        } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            throw error;
        }
    }

    // Extract spreadsheet ID from Google Sheets URL
    extractSpreadsheetId(url) {
        try {
            const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : null;
        } catch (error) {
            console.error('Error extracting spreadsheet ID:', error);
            return null;
        }
    }

    // Validate Apps Script URL
    isValidAppsScriptUrl(url) {
        return url && url.includes('script.google.com/macros/s/') && url.includes('/exec');
    }

    // Get setup instructions for Google Apps Script
    getAppsScriptSetupInstructions() {
        return {
            steps: [
                '1. Go to https://script.google.com/',
                '2. Create a new project',
                '3. Replace the default code with the generated code',
                '4. Save the project',
                '5. Deploy as web app with execute permissions for "Anyone"',
                '6. Copy the web app URL and paste it in admin settings'
            ],
            code: this.generateAppsScriptCode(),
            permissions: 'Execute the app as: Me, Who has access to the app: Anyone'
        };
    }
}

export default GoogleSheetsWriteAPI;