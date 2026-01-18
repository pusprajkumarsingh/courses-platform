// Google Sheets Data API for shared content management
// This utility handles reading and writing data to Google Sheets for shared content

class GoogleSheetsDataAPI {
    constructor() {
        this.baseURL = 'https://docs.google.com/spreadsheets/d/';
        this.csvExportSuffix = '/export?format=csv&gid=';
    }

    // Convert Google Sheets URL to CSV export URL
    convertToCSVURL(sheetURL, gid = '0') {
        try {
            if (!sheetURL || !sheetURL.includes('docs.google.com/spreadsheets')) {
                return null;
            }

            // Extract spreadsheet ID
            const match = sheetURL.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) return null;

            const spreadsheetId = match[1];
            return `${this.baseURL}${spreadsheetId}${this.csvExportSuffix}${gid}`;
        } catch (error) {
            console.error('Error converting to CSV URL:', error);
            return null;
        }
    }

    // Parse CSV data into JSON
    parseCSV(csvText) {
        try {
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length < 2) return [];

            const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    data.push(row);
                }
            }

            return data;
        } catch (error) {
            console.error('Error parsing CSV:', error);
            return [];
        }
    }

    // Parse a single CSV line handling quoted values
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

    // Fetch data from Google Sheets
    async fetchSheetData(sheetURL, gid = '0') {
        try {
            const csvURL = this.convertToCSVURL(sheetURL, gid);
            if (!csvURL) {
                throw new Error('Invalid Google Sheets URL');
            }

            const response = await fetch(csvURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }

    // Course data specific methods
    async fetchCourses(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            return data.map(row => ({
                id: row.id || Date.now() + Math.random(),
                title: row.title || '',
                description: row.description || '',
                price: row.price || '',
                duration: row.duration || '',
                level: row.level || 'Beginner',
                category: row.category || 'programming',
                imageUrl: row.imageUrl || '',
                instructor: row.instructor || '',
                rating: parseFloat(row.rating) || 0,
                students: parseInt(row.students) || 0,
                features: this.parseFeatures(row.features || ''),
                showAllFeatures: false
            }));
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    }

    // Team members data specific methods
    async fetchTeamMembers(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            return data.map(row => ({
                id: row.id || Date.now() + Math.random(),
                name: row.name || '',
                position: row.position || '',
                description: row.description || '',
                imageUrl: row.imageUrl || '',
                email: row.email || '',
                linkedin: row.linkedin || ''
            }));
        } catch (error) {
            console.error('Error fetching team members:', error);
            return [];
        }
    }

    // Gallery items data specific methods
    async fetchGalleryItems(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            return data.map(row => ({
                id: row.id || Date.now() + Math.random(),
                title: row.title || '',
                description: row.description || '',
                category: row.category || 'events',
                imageUrl: row.imageUrl || ''
            }));
        } catch (error) {
            console.error('Error fetching gallery items:', error);
            return [];
        }
    }

    // Home page content specific methods
    async fetchHomePageContent(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            if (data.length === 0) return null;

            // Assuming the first row contains the home page content
            const row = data[0];
            return {
                hero: {
                    title: row.heroTitle || 'Welcome to EduPlatform',
                    subtitle: row.heroSubtitle || 'Transform your career with our professional courses.',
                    primaryButtonText: row.heroPrimaryButton || 'Explore Courses',
                    secondaryButtonText: row.heroSecondaryButton || 'Verify Certificate'
                },
                features: {
                    sectionTitle: row.featuresSectionTitle || 'Why Choose Us?',
                    feature1: {
                        icon: row.feature1Icon || '🎓',
                        title: row.feature1Title || 'Expert Instructors',
                        description: row.feature1Description || 'Learn from industry professionals.'
                    },
                    feature2: {
                        icon: row.feature2Icon || '📜',
                        title: row.feature2Title || 'Certified Courses',
                        description: row.feature2Description || 'Get recognized certificates.'
                    },
                    feature3: {
                        icon: row.feature3Icon || '💻',
                        title: row.feature3Title || 'Online Learning',
                        description: row.feature3Description || 'Study at your own pace.'
                    }
                },
                popularCourses: {
                    sectionTitle: row.popularCoursesSectionTitle || 'Popular Courses',
                    showCount: parseInt(row.popularCoursesShowCount) || 6,
                    viewAllButtonText: row.popularCoursesViewAllButton || 'View All Courses'
                },
                impact: {
                    sectionTitle: row.impactSectionTitle || 'Our Impact',
                    showSection: row.impactShowSection !== 'false'
                }
            };
        } catch (error) {
            console.error('Error fetching home page content:', error);
            return null;
        }
    }

    // Footer contact info specific methods
    async fetchFooterContactInfo(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            if (data.length === 0) return null;

            const row = data[0];
            return {
                email: row.email || '',
                phone: row.phone || '',
                address: row.address || '',
                companyName: row.companyName || '',
                tagline: row.tagline || '',
                stayUpdatedTitle: row.stayUpdatedTitle || 'Stay Updated',
                stayUpdatedDescription: row.stayUpdatedDescription || 'Get the latest updates about our courses.',
                websiteName: row.websiteName || 'EduPlatform',
                websiteTitle: row.websiteTitle || 'EduPlatform - Professional Courses',
                welcomeMessage: row.welcomeMessage || 'Welcome to EduPlatform',
                copyrightText: row.copyrightText || '© 2024 EduPlatform. All rights reserved.'
            };
        } catch (error) {
            console.error('Error fetching footer contact info:', error);
            return null;
        }
    }

    // Social media links specific methods
    async fetchSocialMediaLinks(sheetURL) {
        try {
            const data = await this.fetchSheetData(sheetURL);
            if (data.length === 0) return null;

            const row = data[0];
            return {
                facebook: row.facebook || '',
                twitter: row.twitter || '',
                instagram: row.instagram || '',
                linkedin: row.linkedin || '',
                youtube: row.youtube || '',
                whatsapp: row.whatsapp || ''
            };
        } catch (error) {
            console.error('Error fetching social media links:', error);
            return null;
        }
    }

    // Parse features string into array
    parseFeatures(featuresString) {
        if (!featuresString) return [''];
        
        try {
            // Try to parse as JSON array first
            return JSON.parse(featuresString);
        } catch {
            // If not JSON, split by delimiter
            return featuresString.split('|').map(f => f.trim()).filter(f => f);
        }
    }

    // Convert features array to string for storage
    stringifyFeatures(featuresArray) {
        return featuresArray.filter(f => f.trim()).join('|');
    }

    // Validate Google Sheets URL
    isValidGoogleSheetsURL(url) {
        return url && url.includes('docs.google.com/spreadsheets');
    }

    // Get instructions for setting up Google Sheets
    getSetupInstructions() {
        return {
            courses: {
                headers: ['id', 'title', 'description', 'price', 'duration', 'level', 'category', 'imageUrl', 'instructor', 'rating', 'students', 'features'],
                description: 'Create a Google Sheet with these column headers for course data'
            },
            teamMembers: {
                headers: ['id', 'name', 'position', 'description', 'imageUrl', 'email', 'linkedin'],
                description: 'Create a Google Sheet with these column headers for team member data'
            },
            galleryItems: {
                headers: ['id', 'title', 'description', 'category', 'imageUrl'],
                description: 'Create a Google Sheet with these column headers for gallery items'
            },
            homePageContent: {
                headers: ['heroTitle', 'heroSubtitle', 'heroPrimaryButton', 'heroSecondaryButton', 'featuresSectionTitle', 'feature1Icon', 'feature1Title', 'feature1Description', 'feature2Icon', 'feature2Title', 'feature2Description', 'feature3Icon', 'feature3Title', 'feature3Description', 'popularCoursesSectionTitle', 'popularCoursesShowCount', 'popularCoursesViewAllButton', 'impactSectionTitle', 'impactShowSection'],
                description: 'Create a Google Sheet with these column headers for home page content (single row)'
            },
            footerContactInfo: {
                headers: ['email', 'phone', 'address', 'companyName', 'tagline', 'stayUpdatedTitle', 'stayUpdatedDescription', 'websiteName', 'websiteTitle', 'welcomeMessage', 'copyrightText'],
                description: 'Create a Google Sheet with these column headers for footer contact info (single row)'
            },
            socialMediaLinks: {
                headers: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'whatsapp'],
                description: 'Create a Google Sheet with these column headers for social media links (single row)'
            }
        };
    }
}

export default GoogleSheetsDataAPI;