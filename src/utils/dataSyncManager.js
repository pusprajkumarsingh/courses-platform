// Data Synchronization Manager
// Handles syncing between localStorage and Google Sheets

import GoogleSheetsDataAPI from './googleSheetsDataAPI';

class DataSyncManager {
    constructor() {
        this.sheetsAPI = new GoogleSheetsDataAPI();
        this.syncEnabled = false;
        this.sheetURLs = this.loadSheetURLs();
    }

    // Load Google Sheets URLs from localStorage
    loadSheetURLs() {
        try {
            const urls = localStorage.getItem('googleSheetsURLs');
            return urls ? JSON.parse(urls) : {
                courses: '',
                teamMembers: '',
                galleryItems: '',
                homePageContent: '',
                footerContactInfo: '',
                socialMediaLinks: ''
            };
        } catch (error) {
            console.error('Error loading sheet URLs:', error);
            return {};
        }
    }

    // Save Google Sheets URLs to localStorage
    saveSheetURLs(urls) {
        try {
            this.sheetURLs = { ...this.sheetURLs, ...urls };
            localStorage.setItem('googleSheetsURLs', JSON.stringify(this.sheetURLs));
        } catch (error) {
            console.error('Error saving sheet URLs:', error);
        }
    }

    // Enable/disable sync
    setSyncEnabled(enabled) {
        this.syncEnabled = enabled;
        localStorage.setItem('dataSyncEnabled', enabled.toString());
    }

    // Check if sync is enabled
    isSyncEnabled() {
        const saved = localStorage.getItem('dataSyncEnabled');
        return saved === 'true';
    }

    // Sync courses data
    async syncCourses() {
        try {
            if (!this.sheetURLs.courses || !this.isSyncEnabled()) {
                return this.loadLocalCourses();
            }

            console.log('Syncing courses from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchCourses(this.sheetURLs.courses);
            
            if (sheetData.length > 0) {
                // Save to localStorage as backup
                localStorage.setItem('courses', JSON.stringify(sheetData));
                console.log(`Synced ${sheetData.length} courses from Google Sheets`);
                return sheetData;
            } else {
                // Fallback to localStorage
                return this.loadLocalCourses();
            }
        } catch (error) {
            console.error('Error syncing courses:', error);
            // Fallback to localStorage on error
            return this.loadLocalCourses();
        }
    }

    // Sync team members data
    async syncTeamMembers() {
        try {
            if (!this.sheetURLs.teamMembers || !this.isSyncEnabled()) {
                return this.loadLocalTeamMembers();
            }

            console.log('Syncing team members from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchTeamMembers(this.sheetURLs.teamMembers);
            
            if (sheetData.length > 0) {
                localStorage.setItem('teamMembers', JSON.stringify(sheetData));
                console.log(`Synced ${sheetData.length} team members from Google Sheets`);
                return sheetData;
            } else {
                return this.loadLocalTeamMembers();
            }
        } catch (error) {
            console.error('Error syncing team members:', error);
            return this.loadLocalTeamMembers();
        }
    }

    // Sync gallery items data
    async syncGalleryItems() {
        try {
            if (!this.sheetURLs.galleryItems || !this.isSyncEnabled()) {
                return this.loadLocalGalleryItems();
            }

            console.log('Syncing gallery items from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchGalleryItems(this.sheetURLs.galleryItems);
            
            if (sheetData.length > 0) {
                localStorage.setItem('galleryItems', JSON.stringify(sheetData));
                console.log(`Synced ${sheetData.length} gallery items from Google Sheets`);
                return sheetData;
            } else {
                return this.loadLocalGalleryItems();
            }
        } catch (error) {
            console.error('Error syncing gallery items:', error);
            return this.loadLocalGalleryItems();
        }
    }

    // Sync home page content
    async syncHomePageContent() {
        try {
            if (!this.sheetURLs.homePageContent || !this.isSyncEnabled()) {
                return this.loadLocalHomePageContent();
            }

            console.log('Syncing home page content from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchHomePageContent(this.sheetURLs.homePageContent);
            
            if (sheetData) {
                localStorage.setItem('homePageContent', JSON.stringify(sheetData));
                console.log('Synced home page content from Google Sheets');
                return sheetData;
            } else {
                return this.loadLocalHomePageContent();
            }
        } catch (error) {
            console.error('Error syncing home page content:', error);
            return this.loadLocalHomePageContent();
        }
    }

    // Sync footer contact info
    async syncFooterContactInfo() {
        try {
            if (!this.sheetURLs.footerContactInfo || !this.isSyncEnabled()) {
                return this.loadLocalFooterContactInfo();
            }

            console.log('Syncing footer contact info from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchFooterContactInfo(this.sheetURLs.footerContactInfo);
            
            if (sheetData) {
                localStorage.setItem('footerContactInfo', JSON.stringify(sheetData));
                console.log('Synced footer contact info from Google Sheets');
                return sheetData;
            } else {
                return this.loadLocalFooterContactInfo();
            }
        } catch (error) {
            console.error('Error syncing footer contact info:', error);
            return this.loadLocalFooterContactInfo();
        }
    }

    // Sync social media links
    async syncSocialMediaLinks() {
        try {
            if (!this.sheetURLs.socialMediaLinks || !this.isSyncEnabled()) {
                return this.loadLocalSocialMediaLinks();
            }

            console.log('Syncing social media links from Google Sheets...');
            const sheetData = await this.sheetsAPI.fetchSocialMediaLinks(this.sheetURLs.socialMediaLinks);
            
            if (sheetData) {
                localStorage.setItem('socialMediaLinks', JSON.stringify(sheetData));
                console.log('Synced social media links from Google Sheets');
                return sheetData;
            } else {
                return this.loadLocalSocialMediaLinks();
            }
        } catch (error) {
            console.error('Error syncing social media links:', error);
            return this.loadLocalSocialMediaLinks();
        }
    }

    // Load local data methods (fallbacks)
    loadLocalCourses() {
        try {
            const courses = localStorage.getItem('courses');
            return courses ? JSON.parse(courses) : [];
        } catch (error) {
            console.error('Error loading local courses:', error);
            return [];
        }
    }

    loadLocalTeamMembers() {
        try {
            const teamMembers = localStorage.getItem('teamMembers');
            return teamMembers ? JSON.parse(teamMembers) : [];
        } catch (error) {
            console.error('Error loading local team members:', error);
            return [];
        }
    }

    loadLocalGalleryItems() {
        try {
            const galleryItems = localStorage.getItem('galleryItems');
            return galleryItems ? JSON.parse(galleryItems) : [];
        } catch (error) {
            console.error('Error loading local gallery items:', error);
            return [];
        }
    }

    loadLocalHomePageContent() {
        try {
            const content = localStorage.getItem('homePageContent');
            return content ? JSON.parse(content) : null;
        } catch (error) {
            console.error('Error loading local home page content:', error);
            return null;
        }
    }

    loadLocalFooterContactInfo() {
        try {
            const info = localStorage.getItem('footerContactInfo');
            return info ? JSON.parse(info) : null;
        } catch (error) {
            console.error('Error loading local footer contact info:', error);
            return null;
        }
    }

    loadLocalSocialMediaLinks() {
        try {
            const links = localStorage.getItem('socialMediaLinks');
            return links ? JSON.parse(links) : null;
        } catch (error) {
            console.error('Error loading local social media links:', error);
            return null;
        }
    }

    // Sync all data
    async syncAllData() {
        try {
            console.log('Starting full data sync...');
            
            const results = await Promise.allSettled([
                this.syncCourses(),
                this.syncTeamMembers(),
                this.syncGalleryItems(),
                this.syncHomePageContent(),
                this.syncFooterContactInfo(),
                this.syncSocialMediaLinks()
            ]);

            const syncResults = {
                courses: results[0].status === 'fulfilled' ? results[0].value : [],
                teamMembers: results[1].status === 'fulfilled' ? results[1].value : [],
                galleryItems: results[2].status === 'fulfilled' ? results[2].value : [],
                homePageContent: results[3].status === 'fulfilled' ? results[3].value : null,
                footerContactInfo: results[4].status === 'fulfilled' ? results[4].value : null,
                socialMediaLinks: results[5].status === 'fulfilled' ? results[5].value : null
            };

            console.log('Full data sync completed');
            return syncResults;
        } catch (error) {
            console.error('Error during full sync:', error);
            throw error;
        }
    }

    // Get sync status
    getSyncStatus() {
        return {
            enabled: this.isSyncEnabled(),
            urls: this.sheetURLs,
            hasValidURLs: Object.values(this.sheetURLs).some(url => 
                this.sheetsAPI.isValidGoogleSheetsURL(url)
            )
        };
    }

    // Get setup instructions
    getSetupInstructions() {
        return this.sheetsAPI.getSetupInstructions();
    }
}

export default DataSyncManager;