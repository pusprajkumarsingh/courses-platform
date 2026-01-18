import React, { useState, useEffect } from 'react';
import { EXCEL_CONFIG, readStandardCSV } from '../utils/excelReader';
import FeedbackExcelAPI from '../utils/feedbackExcelAPI';
import ConfigLogger from '../utils/configLogger';
import AdminCard, { StatusIndicator, FormSection, StatsGrid, ActionButtons } from '../components/AdminCard';
import { convertToCSV, getConversionInstructions } from '../utils/urlConverter';
import DataSyncManager from '../utils/dataSyncManager';
import '../components/AdminCard.css';

const AdminSimple = () => {
    // Basic state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    
    // Admin Password Management state
    const [adminCredentials, setAdminCredentials] = useState({
        username: 'admin',
        password: 'admin'
    });
    const [newCredentialsForm, setNewCredentialsForm] = useState({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [credentialsUpdateStatus, setCredentialsUpdateStatus] = useState('');
    
    // Recovery code state
    const [recoveryCode, setRecoveryCode] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordForm, setForgotPasswordForm] = useState({
        recoveryCode: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    
    // Password visibility state
    const [showPasswords, setShowPasswords] = useState({
        loginPassword: false,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
        displayPassword: false,
        forgotNewPassword: false,
        forgotConfirmPassword: false
    });
    const [excelData, setExcelData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [certificateTemplate, setCertificateTemplate] = useState(null);
    const [templateUploadStatus, setTemplateUploadStatus] = useState('');

    // Certificate Data Management state
    const [certificateDataURL, setCertificateDataURL] = useState('');
    const [certificateUrlUpdateStatus, setCertificateUrlUpdateStatus] = useState('');
    const [certificatePage, setCertificatePage] = useState(1);
    const [certificateItemsPerPage] = useState(10);
    const [certificateSearchTerm, setCertificateSearchTerm] = useState('');
    const [certificateStats, setCertificateStats] = useState({
        totalCertificates: 0,
        recentCertificates: 0,
        courseBreakdown: {},
        gradeDistribution: {}
    });

    // Course Enrollment Form Configuration state
    const [enrollmentFormConfig, setEnrollmentFormConfig] = useState({
        primaryFormURL: '',
        backupFormURL: '',
        formType: 'google_form',
        isEnabled: true,
        requirePaymentScreenshot: true,
        autoApproval: false,
        customFields: []
    });
    const [enrollmentFormUpdateStatus, setEnrollmentFormUpdateStatus] = useState('');

    // Feedback data state
    const [feedbackData, setFeedbackData] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState(null);
    const [readSheetURL, setReadSheetURL] = useState('');
    const [writeSheetURL, setWriteSheetURL] = useState('');
    const [urlUpdateStatus, setUrlUpdateStatus] = useState('');

    // Faculty feedback state
    const [facultyReadSheetURL, setFacultyReadSheetURL] = useState('');
    const [facultyUrlUpdateStatus, setFacultyUrlUpdateStatus] = useState('');
    const [facultyFeedbackData, setFacultyFeedbackData] = useState([]);
    const [facultyFeedbackLoading, setFacultyFeedbackLoading] = useState(false);
    const [facultyFeedbackError, setFacultyFeedbackError] = useState(null);

    // Feedback pagination state
    const [feedbackPage, setFeedbackPage] = useState(1);
    const [facultyFeedbackPage, setFacultyFeedbackPage] = useState(1);
    const [feedbackItemsPerPage] = useState(10);

    // Feedback statistics state
    const [feedbackStats, setFeedbackStats] = useState({
        totalStudentFeedback: 0,
        totalFacultyFeedback: 0,
        averageStudentRating: 0,
        averageFacultyRating: 0,
        recentFeedbackCount: 0
    });

    // Public Feedback Statistics (displayed on website)
    const [publicFeedbackStats, setPublicFeedbackStats] = useState({
        averageRating: '4.8/5',
        averageRatingDescription: 'Based on 1,200+ student reviews',
        satisfactionRate: '96%',
        satisfactionRateDescription: 'Students would recommend our courses',
        responseTime: '24hrs',
        responseTimeDescription: 'Average time to address feedback'
    });
    const [publicStatsUpdateStatus, setPublicStatsUpdateStatus] = useState('');

    // Gallery management state
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryAchievements, setGalleryAchievements] = useState({
        studentsGraduated: '',
        industryEvents: '',
        jobPlacementRate: ''
    });
    const [galleryForm, setGalleryForm] = useState({
        title: '',
        description: '',
        category: 'events',
        imageUrl: ''
    });
    const [galleryUpdateStatus, setGalleryUpdateStatus] = useState('');
    const [editingGalleryItem, setEditingGalleryItem] = useState(null);
    // Course management state
    const [courses, setCourses] = useState([]);
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        level: 'Beginner',
        category: 'programming',
        imageUrl: '',
        instructor: '',
        rating: '',
        students: '',
        features: ['']
    });
    const [courseUpdateStatus, setCourseUpdateStatus] = useState('');
    const [editingCourse, setEditingCourse] = useState(null);

    // Course statistics state
    const [courseStats, setCourseStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        averageRating: 0,
        totalCategories: 0
    });

    // Category management state
    const [courseCategories, setCourseCategories] = useState([]);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });
    const [categoryUpdateStatus, setCategoryUpdateStatus] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    // Team Management state
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamForm, setTeamForm] = useState({
        name: '',
        position: '',
        description: '',
        imageUrl: '',
        email: '',
        linkedin: ''
    });
    const [teamUpdateStatus, setTeamUpdateStatus] = useState('');
    const [editingTeamMember, setEditingTeamMember] = useState(null);

    // About Us Content Management state
    const [aboutUsContent, setAboutUsContent] = useState({
        mission: {
            paragraph1: '',
            paragraph2: ''
        },
        vision: {
            paragraph1: '',
            paragraph2: ''
        },
        values: [
            {
                id: 1,
                title: 'Excellence',
                icon: '🎯',
                description: ''
            },
            {
                id: 2,
                title: 'Accessibility',
                icon: '🤝',
                description: ''
            },
            {
                id: 3,
                title: 'Innovation',
                icon: '🚀',
                description: ''
            }
        ]
    });
    const [aboutUsUpdateStatus, setAboutUsUpdateStatus] = useState('');

    // Social Media Management state
    const [socialMediaLinks, setSocialMediaLinks] = useState({
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        whatsapp: ''
    });
    const [socialMediaUpdateStatus, setSocialMediaUpdateStatus] = useState('');

    // Footer Contact Information Management state
    const [footerContactInfo, setFooterContactInfo] = useState({
        email: '',
        phone: '',
        address: '',
        companyName: '',
        tagline: '',
        stayUpdatedTitle: 'Stay Updated',
        stayUpdatedDescription: 'Get the latest updates about our courses and certifications',
        websiteName: 'EduPlatform',
        websiteTitle: 'EduPlatform - Professional Courses',
        welcomeMessage: 'Welcome to EduPlatform',
        copyrightText: '© 2024 EduPlatform. All rights reserved.'
    });
    const [footerContactUpdateStatus, setFooterContactUpdateStatus] = useState('');

    // Payment Settings Management state
    const [paymentSettings, setPaymentSettings] = useState({
        phonePeUpiId: '',
        gPayUpiId: '',
        generalUpiId: '',
        paymentEnabled: false,
        paymentInstructions: ''
    });
    const [paymentSettingsUpdateStatus, setPaymentSettingsUpdateStatus] = useState('');

    // Home Page Content Management state
    const [homePageContent, setHomePageContent] = useState({
        hero: {
            title: 'Welcome to EduPlatform',
            subtitle: 'Transform your career with our professional courses. Learn from industry experts and get certified.',
            primaryButtonText: 'Explore Courses',
            secondaryButtonText: 'Verify Certificate'
        },
        features: {
            sectionTitle: 'Why Choose Us?',
            feature1: {
                icon: '🎓',
                title: 'Expert Instructors',
                description: 'Learn from industry professionals with years of real-world experience.'
            },
            feature2: {
                icon: '📜',
                title: 'Certified Courses',
                description: 'Get recognized certificates that boost your career prospects.'
            },
            feature3: {
                icon: '💻',
                title: 'Online Learning',
                description: 'Study at your own pace with our flexible online platform.'
            }
        },
        popularCourses: {
            sectionTitle: 'Popular Courses',
            showCount: 6,
            viewAllButtonText: 'View All Courses'
        },
        impact: {
            sectionTitle: 'Our Impact',
            showSection: true
        }
    });
    const [homePageUpdateStatus, setHomePageUpdateStatus] = useState('');

    // Impact Statistics Management state
    const [impactStats, setImpactStats] = useState({
        totalCourses: {
            value: 25,
            label: 'Courses Available',
            show: true
        },
        totalStudents: {
            value: 5000,
            label: 'Students Enrolled',
            show: true
        },
        averageRating: {
            value: 4.8,
            label: 'Average Rating',
            show: true
        },
        totalCategories: {
            value: 8,
            label: 'Course Categories',
            show: true
        },
        successRate: {
            value: 95,
            label: 'Success Rate',
            show: false
        },
        certificates: {
            value: 4500,
            label: 'Certificates Issued',
            show: false
        }
    });
    const [impactStatsUpdateStatus, setImpactStatsUpdateStatus] = useState('');

    // Google Sheets Data Sync Management state
    const [dataSyncManager] = useState(() => new DataSyncManager());
    const [googleSheetsURLs, setGoogleSheetsURLs] = useState({
        courses: '',
        teamMembers: '',
        galleryItems: '',
        homePageContent: '',
        footerContactInfo: '',
        socialMediaLinks: ''
    });
    const [dataSyncEnabled, setDataSyncEnabled] = useState(false);
    const [syncStatus, setSyncStatus] = useState('');
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [syncInProgress, setSyncInProgress] = useState(false);

    // Check if already logged in on component mount
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken === 'authenticated') {
            setIsLoggedIn(true);
            loadCertificateDataURL();
            loadCertificates();
        }
        
        // Load admin credentials
        loadAdminCredentials();
        loadRecoveryCode();
        
        // Initialize Google Sheets sync
        initializeGoogleSheetsSync();
    }, []);

    // Load admin credentials from localStorage
    const loadAdminCredentials = () => {
        try {
            const savedCredentials = localStorage.getItem('adminCredentials');
            if (savedCredentials) {
                setAdminCredentials(JSON.parse(savedCredentials));
            } else {
                // If no saved credentials, ensure we have default credentials
                const defaultCredentials = {
                    username: 'admin',
                    password: 'admin'
                };
                setAdminCredentials(defaultCredentials);
                // Save default credentials to localStorage for consistency
                localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
            }
        } catch (error) {
            console.error('Error loading admin credentials:', error);
            // On error, reset to default credentials
            const defaultCredentials = {
                username: 'admin',
                password: 'admin'
            };
            setAdminCredentials(defaultCredentials);
            localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
        }
    };

    // Load recovery code from localStorage
    const loadRecoveryCode = () => {
        try {
            const savedRecoveryCode = localStorage.getItem('adminRecoveryCode');
            if (savedRecoveryCode) {
                setRecoveryCode(savedRecoveryCode);
            } else {
                // Generate initial recovery code if none exists
                generateRecoveryCode();
            }
        } catch (error) {
            console.error('Error loading recovery code:', error);
        }
    };

    // Generate 12-character recovery code with alphabets, numbers, and special characters
    const generateRecoveryCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        
        // Ensure at least one of each type
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*';
        
        // Add one of each type
        result += uppercase[Math.floor(Math.random() * uppercase.length)];
        result += lowercase[Math.floor(Math.random() * lowercase.length)];
        result += numbers[Math.floor(Math.random() * numbers.length)];
        result += special[Math.floor(Math.random() * special.length)];
        
        // Fill remaining 8 characters randomly
        for (let i = 4; i < 12; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Shuffle the result to randomize positions
        result = result.split('').sort(() => Math.random() - 0.5).join('');
        
        setRecoveryCode(result);
        localStorage.setItem('adminRecoveryCode', result);
        return result;
    };

    // Initialize Google Sheets sync
    const initializeGoogleSheetsSync = () => {
        try {
            // Load saved Google Sheets URLs
            const savedURLs = dataSyncManager.loadSheetURLs();
            setGoogleSheetsURLs(savedURLs);
            
            // Load sync enabled status
            const syncEnabled = dataSyncManager.isSyncEnabled();
            setDataSyncEnabled(syncEnabled);
            
            // Load last sync time
            const lastSync = localStorage.getItem('lastSyncTime');
            if (lastSync) {
                setLastSyncTime(new Date(lastSync));
            }
        } catch (error) {
            console.error('Error initializing Google Sheets sync:', error);
        }
    };

    // Update Google Sheets URLs
    const updateGoogleSheetsURLs = (newURLs) => {
        try {
            dataSyncManager.saveSheetURLs(newURLs);
            setGoogleSheetsURLs(prev => ({ ...prev, ...newURLs }));
            setSyncStatus('Google Sheets URLs updated successfully!');
            setTimeout(() => setSyncStatus(''), 3000);
        } catch (error) {
            console.error('Error updating Google Sheets URLs:', error);
            setSyncStatus('Error updating Google Sheets URLs');
            setTimeout(() => setSyncStatus(''), 3000);
        }
    };

    // Toggle data sync
    const toggleDataSync = (enabled) => {
        try {
            dataSyncManager.setSyncEnabled(enabled);
            setDataSyncEnabled(enabled);
            setSyncStatus(enabled ? 'Data sync enabled!' : 'Data sync disabled');
            setTimeout(() => setSyncStatus(''), 3000);
        } catch (error) {
            console.error('Error toggling data sync:', error);
            setSyncStatus('Error updating sync settings');
            setTimeout(() => setSyncStatus(''), 3000);
        }
    };

    // Perform full data sync
    const performFullSync = async () => {
        if (syncInProgress) return;
        
        try {
            setSyncInProgress(true);
            setSyncStatus('Syncing data from Google Sheets...');
            
            const syncResults = await dataSyncManager.syncAllData();
            
            // Update local state with synced data
            if (syncResults.courses.length > 0) {
                setCourses(syncResults.courses);
            }
            if (syncResults.teamMembers.length > 0) {
                setTeamMembers(syncResults.teamMembers);
            }
            if (syncResults.galleryItems.length > 0) {
                setGalleryItems(syncResults.galleryItems);
            }
            if (syncResults.homePageContent) {
                setHomePageContent(syncResults.homePageContent);
            }
            if (syncResults.footerContactInfo) {
                setFooterContactInfo(syncResults.footerContactInfo);
            }
            if (syncResults.socialMediaLinks) {
                setSocialMediaLinks(syncResults.socialMediaLinks);
            }
            
            // Update last sync time
            const now = new Date();
            setLastSyncTime(now);
            localStorage.setItem('lastSyncTime', now.toISOString());
            
            setSyncStatus('Data sync completed successfully!');
            setTimeout(() => setSyncStatus(''), 5000);
        } catch (error) {
            console.error('Error during full sync:', error);
            setSyncStatus('Error during data sync. Check console for details.');
            setTimeout(() => setSyncStatus(''), 5000);
        } finally {
            setSyncInProgress(false);
        }
    };

    // Test Google Sheets URL
    const testGoogleSheetsURL = (url, type) => {
        if (!url) {
            setSyncStatus('Please enter a URL to test');
            setTimeout(() => setSyncStatus(''), 3000);
            return;
        }
        
        if (!dataSyncManager.sheetsAPI.isValidGoogleSheetsURL(url)) {
            setSyncStatus('Invalid Google Sheets URL format');
            setTimeout(() => setSyncStatus(''), 3000);
            return;
        }
        
        // Open URL in new tab for testing
        window.open(url, '_blank');
        setSyncStatus(`Testing ${type} Google Sheets URL...`);
        setTimeout(() => setSyncStatus(''), 3000);
    };

    // Load all data when logged in
    useEffect(() => {
        if (isLoggedIn) {
            setTimeout(() => {
                try {
                    loadFeedbackData();
                    loadFacultyFeedbackData();
                    loadFeedbackURLs();
                    loadPublicFeedbackStats();
                    loadCertificateTemplate();
                    loadEnrollmentFormConfig();
                    loadGalleryData();
                    loadCoursesData();
                    loadCourseCategories();
                    loadTeamMembers();
                    loadAboutUsContent();
                    loadSocialMediaLinks();
                    loadFooterContactInfo();
                    loadPaymentSettings();
                    loadHomePageContent();
                    loadImpactStats();
                    updateCourseStatsFromCourses();
                } catch (error) {
                    console.error('Error loading admin data:', error);
                }
            }, 100);
        }
    }, [isLoggedIn]);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');

        if (loginForm.username === adminCredentials.username && loginForm.password === adminCredentials.password) {
            setIsLoggedIn(true);
            localStorage.setItem('adminToken', 'authenticated');
            loadCertificates();
        } else {
            setLoginError('Invalid username or password');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('adminToken');
        setExcelData([]);
        setLoginForm({ username: '', password: '' });
    };

    // Admin Password Management functions
    const updateAdminCredentials = () => {
        // Validate current password
        if (newCredentialsForm.currentPassword !== adminCredentials.password) {
            setCredentialsUpdateStatus('Current password is incorrect');
            setTimeout(() => setCredentialsUpdateStatus(''), 3000);
            return;
        }

        // Validate new password confirmation
        if (newCredentialsForm.newPassword !== newCredentialsForm.confirmPassword) {
            setCredentialsUpdateStatus('New passwords do not match');
            setTimeout(() => setCredentialsUpdateStatus(''), 3000);
            return;
        }

        // Validate new password length
        if (newCredentialsForm.newPassword.length < 6) {
            setCredentialsUpdateStatus('Password must be at least 6 characters');
            setTimeout(() => setCredentialsUpdateStatus(''), 3000);
            return;
        }

        // Validate new username
        if (!newCredentialsForm.newUsername.trim()) {
            setCredentialsUpdateStatus('Username cannot be empty');
            setTimeout(() => setCredentialsUpdateStatus(''), 3000);
            return;
        }

        // Update credentials
        const newCredentials = {
            username: newCredentialsForm.newUsername.trim(),
            password: newCredentialsForm.newPassword
        };

        setAdminCredentials(newCredentials);
        localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
        
        setCredentialsUpdateStatus('Admin credentials updated successfully! Recovery code remains the same.');

        // Clear form
        setNewCredentialsForm({
            currentPassword: '',
            newUsername: '',
            newPassword: '',
            confirmPassword: ''
        });

        setTimeout(() => setCredentialsUpdateStatus(''), 3000);
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Handle forgot password
    const handleForgotPassword = (e) => {
        e.preventDefault();
        setForgotPasswordError('');

        // Validate recovery code
        if (forgotPasswordForm.recoveryCode !== recoveryCode) {
            setForgotPasswordError('Invalid recovery code. Please check and try again.');
            return;
        }

        // Validate new password
        if (forgotPasswordForm.newPassword.length < 6) {
            setForgotPasswordError('Password must be at least 6 characters long.');
            return;
        }

        // Validate password confirmation
        if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
            setForgotPasswordError('Passwords do not match.');
            return;
        }

        // Validate username
        if (!forgotPasswordForm.newUsername.trim()) {
            setForgotPasswordError('Username cannot be empty.');
            return;
        }

        // Update credentials
        const newCredentials = {
            username: forgotPasswordForm.newUsername.trim(),
            password: forgotPasswordForm.newPassword
        };

        setAdminCredentials(newCredentials);
        localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));

        // Generate new recovery code for security
        const newRecoveryCode = generateRecoveryCode();

        // Show success message
        alert(`✅ PASSWORD RESET SUCCESSFUL!\n\nNew Recovery Code: ${newRecoveryCode}\n\n⚠️ IMPORTANT:\n• Your old recovery code is no longer valid\n• Write down this new recovery code and store it safely\n• You'll need this code for future password recovery\n\nClick OK to login with your new credentials.`);

        // Reset form and close modal
        setForgotPasswordForm({
            recoveryCode: '',
            newUsername: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowForgotPassword(false);
        setForgotPasswordError('');
    };

    const loadCertificates = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);
            
            // Use certificate data URL if available, otherwise fallback to default
            const certificateURL = certificateDataURL || EXCEL_CONFIG.EXCEL_FILE_URL;
            const certificates = await readStandardCSV(certificateURL);
            setExcelData(certificates);
            setLastUpdated(new Date());
            updateCertificateStats(certificates);
        } catch (error) {
            console.error('Failed to load certificates:', error);
            setLoadError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCertificateDataURL = () => {
        try {
            const savedURL = localStorage.getItem('certificateDataURL');
            if (savedURL) {
                setCertificateDataURL(savedURL);
            }
        } catch (error) {
            console.error('Error loading certificate data URL:', error);
        }
    };

    const loadCertificateTemplate = () => {
        try {
            const settings = ConfigLogger.getAdminSettings();
            if (settings.certificateTemplate) {
                setCertificateTemplate(settings.certificateTemplate);
            }
        } catch (error) {
            console.error('Error loading certificate template:', error);
        }
    };

    const updateCertificateDataURL = () => {
        if (certificateDataURL.trim()) {
            // Auto-convert to CSV format if it's a Google Sheets URL
            const csvURL = convertToCSV(certificateDataURL.trim());
            
            // Validate URL format (should be CSV export URL)
            if (!csvURL.includes('docs.google.com') && !csvURL.includes('.csv')) {
                setCertificateUrlUpdateStatus('Please enter a valid Google Sheets CSV export URL');
                setTimeout(() => setCertificateUrlUpdateStatus(''), 3000);
                return;
            }

            // Update the URL field with converted CSV URL
            setCertificateDataURL(csvURL);
            localStorage.setItem('certificateDataURL', csvURL);
            setCertificateUrlUpdateStatus('Certificate database URL updated and converted to CSV format!');
            
            // Reload certificates with new URL
            loadCertificates();
        } else {
            setCertificateUrlUpdateStatus('Please enter a valid certificate database URL');
        }
        setTimeout(() => setCertificateUrlUpdateStatus(''), 3000);
    };

    const testCertificateURL = () => {
        if (certificateDataURL.trim()) {
            window.open(certificateDataURL, '_blank');
            setCertificateUrlUpdateStatus('Certificate database URL opened for testing');
        } else {
            setCertificateUrlUpdateStatus('Please set certificate database URL first');
        }
        setTimeout(() => setCertificateUrlUpdateStatus(''), 3000);
    };

    const updateCertificateStats = (certificates) => {
        const totalCertificates = certificates.length;
        
        // Count recent certificates (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentCertificates = certificates.filter(cert => {
            if (!cert.issueDate) return false;
            const issueDate = new Date(cert.issueDate);
            return issueDate >= thirtyDaysAgo;
        }).length;

        // Course breakdown
        const courseBreakdown = {};
        certificates.forEach(cert => {
            const course = cert.courseName || 'Unknown';
            courseBreakdown[course] = (courseBreakdown[course] || 0) + 1;
        });

        // Grade distribution
        const gradeDistribution = {};
        certificates.forEach(cert => {
            const grade = cert.grade || 'Unknown';
            gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        });

        setCertificateStats({
            totalCertificates,
            recentCertificates,
            courseBreakdown,
            gradeDistribution
        });
    };

    const exportCertificateData = () => {
        try {
            if (excelData.length === 0) {
                setCertificateUrlUpdateStatus('No certificate data to export');
                setTimeout(() => setCertificateUrlUpdateStatus(''), 3000);
                return;
            }

            const headers = ['Certificate Number', 'Student Name', 'College ID', 'Course Name', 'Issue Date', 'Completion Date', 'Grade', 'Instructor', 'Duration', 'College'];
            const csvContent = [
                headers.join(','),
                ...excelData.map(cert => [
                    cert.certificateNumber || '',
                    cert.studentName || '',
                    cert.collegeId || '',
                    cert.courseName || '',
                    cert.issueDate || '',
                    cert.completionDate || '',
                    cert.grade || '',
                    cert.instructor || '',
                    cert.duration || '',
                    cert.college || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `certificates_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setCertificateUrlUpdateStatus('Certificate data exported successfully!');
        } catch (error) {
            setCertificateUrlUpdateStatus(`Export failed: ${error.message}`);
        }
        setTimeout(() => setCertificateUrlUpdateStatus(''), 3000);
    };

    // Certificate pagination and search functions
    const getFilteredCertificates = () => {
        if (!certificateSearchTerm.trim()) {
            return excelData;
        }
        
        const searchTerm = certificateSearchTerm.toLowerCase();
        return excelData.filter(cert => 
            (cert.certificateNumber || '').toLowerCase().includes(searchTerm) ||
            (cert.studentName || '').toLowerCase().includes(searchTerm) ||
            (cert.courseName || '').toLowerCase().includes(searchTerm) ||
            (cert.collegeId || '').toLowerCase().includes(searchTerm)
        );
    };

    const getPaginatedCertificates = () => {
        const filtered = getFilteredCertificates();
        const startIndex = (certificatePage - 1) * certificateItemsPerPage;
        const endIndex = startIndex + certificateItemsPerPage;
        return filtered.slice(startIndex, endIndex);
    };

    const getCertificateTotalPages = () => {
        const filtered = getFilteredCertificates();
        return Math.ceil(filtered.length / certificateItemsPerPage);
    };

    const refreshData = () => {
        loadCertificates();
    };
    // Certificate Template Management functions
    const handleTemplateUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setTemplateUploadStatus('Please select an image file (PNG, JPG, etc.)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setTemplateUploadStatus('File size too large. Please select an image under 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                setCertificateTemplate(imageUrl);
                
                // Save to ConfigLogger instead of direct localStorage
                const currentSettings = ConfigLogger.getAdminSettings();
                const updatedSettings = {
                    ...currentSettings,
                    certificateTemplate: imageUrl
                };
                ConfigLogger.saveAdminSettings(updatedSettings);
                
                setTemplateUploadStatus('Certificate template uploaded successfully!');
                setTimeout(() => setTemplateUploadStatus(''), 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeTemplate = () => {
        setCertificateTemplate(null);
        
        // Remove from ConfigLogger instead of direct localStorage
        const currentSettings = ConfigLogger.getAdminSettings();
        const updatedSettings = {
            ...currentSettings,
            certificateTemplate: null
        };
        ConfigLogger.saveAdminSettings(updatedSettings);
        
        setTemplateUploadStatus('Certificate template removed.');
        setTimeout(() => setTemplateUploadStatus(''), 3000);
    };

    // Course Enrollment Form Configuration functions
    const updateEnrollmentFormConfig = () => {
        if (enrollmentFormConfig.isEnabled && enrollmentFormConfig.formType === 'google_form') {
            if (!enrollmentFormConfig.primaryFormURL.trim()) {
                setEnrollmentFormUpdateStatus('Please enter a primary form URL when enrollment is enabled');
                setTimeout(() => setEnrollmentFormUpdateStatus(''), 3000);
                return;
            }
        }
        localStorage.setItem('enrollmentFormConfig', JSON.stringify(enrollmentFormConfig));
        setEnrollmentFormUpdateStatus('Enrollment form configuration updated successfully!');
        setTimeout(() => setEnrollmentFormUpdateStatus(''), 3000);
    };

    const toggleEnrollmentForm = () => {
        setEnrollmentFormConfig({
            ...enrollmentFormConfig,
            isEnabled: !enrollmentFormConfig.isEnabled
        });
    };

    const updateFormType = (newType) => {
        setEnrollmentFormConfig({
            ...enrollmentFormConfig,
            formType: newType
        });
    };

    const updateFormField = (field, value) => {
        setEnrollmentFormConfig({
            ...enrollmentFormConfig,
            [field]: value
        });
    };

    const testEnrollmentForm = () => {
        if (enrollmentFormConfig.primaryFormURL.trim()) {
            window.open(enrollmentFormConfig.primaryFormURL, '_blank');
            setEnrollmentFormUpdateStatus('Enrollment form opened for testing');
        } else {
            setEnrollmentFormUpdateStatus('Please set enrollment form URL first');
        }
        setTimeout(() => setEnrollmentFormUpdateStatus(''), 3000);
    };

    const resetEnrollmentFormConfig = () => {
        if (window.confirm('Are you sure you want to reset the enrollment form configuration?')) {
            const defaultConfig = {
                primaryFormURL: '',
                backupFormURL: '',
                formType: 'google_form',
                isEnabled: true,
                requirePaymentScreenshot: true,
                autoApproval: false,
                customFields: []
            };
            setEnrollmentFormConfig(defaultConfig);
            localStorage.setItem('enrollmentFormConfig', JSON.stringify(defaultConfig));
            setEnrollmentFormUpdateStatus('Enrollment form configuration reset to defaults');
            setTimeout(() => setEnrollmentFormUpdateStatus(''), 3000);
        }
    };

    const loadEnrollmentFormConfig = () => {
        try {
            const savedConfig = localStorage.getItem('enrollmentFormConfig');
            if (savedConfig) {
                setEnrollmentFormConfig(JSON.parse(savedConfig));
            }
        } catch (error) {
            console.error('Error loading enrollment form configuration:', error);
        }
    };
    // Feedback Management functions
    const loadFeedbackData = async () => {
        setFeedbackLoading(true);
        setFeedbackError(null);
        try {
            const result = await FeedbackExcelAPI.getFeedback();
            if (result.success) {
                setFeedbackData(result.data);
                updateFeedbackStats(result.data, facultyFeedbackData);
            } else {
                setFeedbackError(result.error);
            }
        } catch (error) {
            setFeedbackError(error.message);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const loadFeedbackURLs = () => {
        try {
            const urls = FeedbackExcelAPI.loadStoredURLs();
            setReadSheetURL(urls.readURL || '');
            setWriteSheetURL(urls.writeURL || '');
            
            const facultyURL = localStorage.getItem('facultyReadSheetURL') || '';
            setFacultyReadSheetURL(facultyURL);
        } catch (error) {
            console.error('Error loading feedback URLs:', error);
        }
    };

    const updateReadSheetURL = () => {
        if (readSheetURL.trim()) {
            FeedbackExcelAPI.setReadSheetURL(readSheetURL);
            setUrlUpdateStatus('Student feedback read URL updated successfully!');
            loadFeedbackData();
        } else {
            setUrlUpdateStatus('Please enter a valid read sheet URL');
        }
        setTimeout(() => setUrlUpdateStatus(''), 3000);
    };

    const updateWriteSheetURL = () => {
        if (writeSheetURL.trim()) {
            FeedbackExcelAPI.setWriteSheetURL(writeSheetURL);
            setUrlUpdateStatus('Feedback form URL updated successfully!');
        } else {
            setUrlUpdateStatus('Please enter a valid feedback form URL');
        }
        setTimeout(() => setUrlUpdateStatus(''), 3000);
    };

    const testFeedbackForm = () => {
        if (writeSheetURL.trim()) {
            window.open(writeSheetURL, '_blank');
            setUrlUpdateStatus('Feedback form opened for testing');
        } else {
            setUrlUpdateStatus('Please set feedback form URL first');
        }
        setTimeout(() => setUrlUpdateStatus(''), 3000);
    };

    const exportStudentFeedback = () => {
        try {
            if (feedbackData.length === 0) {
                setUrlUpdateStatus('No student feedback data to export');
                setTimeout(() => setUrlUpdateStatus(''), 3000);
                return;
            }

            const headers = ['Timestamp', 'Name', 'Email', 'Course', 'Rating', 'Message', 'Status'];
            const csvContent = [
                headers.join(','),
                ...feedbackData.map(row => [
                    row.timestamp || '',
                    row.name || '',
                    row.email || '',
                    row.course || '',
                    row.rating || '',
                    `"${(row.message || '').replace(/"/g, '""')}"`,
                    row.status || 'pending'
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `student_feedback_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setUrlUpdateStatus('Student feedback exported successfully!');
        } catch (error) {
            setUrlUpdateStatus(`Export failed: ${error.message}`);
        }
        setTimeout(() => setUrlUpdateStatus(''), 3000);
    };

    // Faculty Feedback functions
    const loadFacultyFeedbackData = async () => {
        setFacultyFeedbackLoading(true);
        setFacultyFeedbackError(null);
        try {
            if (!facultyReadSheetURL.trim()) {
                setFacultyFeedbackError('Faculty read sheet URL not configured');
                return;
            }

            // Use the same CSV reading logic but with faculty URL
            const response = await fetch(facultyReadSheetURL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim());

            if (lines.length <= 1) {
                setFacultyFeedbackData([]);
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                if (values.length >= headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header.toLowerCase()] = values[index] || '';
                    });

                    // Convert to standard format
                    const feedback = {
                        id: i,
                        timestamp: row.timestamp || '',
                        name: row.name || '',
                        email: row.email || '',
                        type: 'faculty',
                        course: row.course || '',
                        rating: parseInt(row.rating) || 5,
                        message: row.message || '',
                        status: row.status || 'approved'
                    };

                    data.push(feedback);
                }
            }

            setFacultyFeedbackData(data);
            updateFeedbackStats(feedbackData, data);
        } catch (error) {
            setFacultyFeedbackError(error.message);
        } finally {
            setFacultyFeedbackLoading(false);
        }
    };

    const updateFacultyReadSheetURL = () => {
        if (facultyReadSheetURL.trim()) {
            localStorage.setItem('facultyReadSheetURL', facultyReadSheetURL);
            setFacultyUrlUpdateStatus('Faculty read sheet URL updated successfully!');
            loadFacultyFeedbackData();
        } else {
            setFacultyUrlUpdateStatus('Please enter a valid faculty read sheet URL');
        }
        setTimeout(() => setFacultyUrlUpdateStatus(''), 3000);
    };

    const exportFacultyFeedback = () => {
        try {
            if (facultyFeedbackData.length === 0) {
                setFacultyUrlUpdateStatus('No faculty feedback data to export');
                setTimeout(() => setFacultyUrlUpdateStatus(''), 3000);
                return;
            }

            const headers = ['Timestamp', 'Name', 'Email', 'Course', 'Rating', 'Message', 'Status'];
            const csvContent = [
                headers.join(','),
                ...facultyFeedbackData.map(row => [
                    row.timestamp || '',
                    row.name || '',
                    row.email || '',
                    row.course || '',
                    row.rating || '',
                    `"${(row.message || '').replace(/"/g, '""')}"`,
                    row.status || 'approved'
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `faculty_feedback_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setFacultyUrlUpdateStatus('Faculty feedback exported successfully!');
        } catch (error) {
            setFacultyUrlUpdateStatus(`Export failed: ${error.message}`);
        }
        setTimeout(() => setFacultyUrlUpdateStatus(''), 3000);
    };

    // Feedback Statistics functions
    const updateFeedbackStats = (studentData = [], facultyData = []) => {
        const totalStudentFeedback = studentData.length;
        const totalFacultyFeedback = facultyData.length;
        
        const averageStudentRating = studentData.length > 0 
            ? (studentData.reduce((sum, item) => sum + (item.rating || 0), 0) / studentData.length).toFixed(1)
            : 0;
            
        const averageFacultyRating = facultyData.length > 0 
            ? (facultyData.reduce((sum, item) => sum + (item.rating || 0), 0) / facultyData.length).toFixed(1)
            : 0;

        // Count recent feedback (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentFeedbackCount = [...studentData, ...facultyData].filter(item => {
            if (!item.timestamp) return false;
            const feedbackDate = new Date(item.timestamp);
            return feedbackDate >= thirtyDaysAgo;
        }).length;

        setFeedbackStats({
            totalStudentFeedback,
            totalFacultyFeedback,
            averageStudentRating: parseFloat(averageStudentRating),
            averageFacultyRating: parseFloat(averageFacultyRating),
            recentFeedbackCount
        });
    };

    // Pagination functions
    const getPaginatedData = (data, page, itemsPerPage) => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (dataLength, itemsPerPage) => {
        return Math.ceil(dataLength / itemsPerPage);
    };

    // Public Feedback Statistics Management functions
    const loadPublicFeedbackStats = () => {
        try {
            const savedStats = localStorage.getItem('publicFeedbackStats');
            if (savedStats) {
                setPublicFeedbackStats(JSON.parse(savedStats));
            }
        } catch (error) {
            console.error('Error loading public feedback stats:', error);
        }
    };

    const updatePublicFeedbackStats = () => {
        try {
            localStorage.setItem('publicFeedbackStats', JSON.stringify(publicFeedbackStats));
            setPublicStatsUpdateStatus('Public feedback statistics updated successfully!');
            setTimeout(() => setPublicStatsUpdateStatus(''), 3000);
        } catch (error) {
            setPublicStatsUpdateStatus('Error updating public feedback statistics');
            setTimeout(() => setPublicStatsUpdateStatus(''), 3000);
        }
    };

    const resetPublicFeedbackStats = () => {
        if (window.confirm('Are you sure you want to reset the public feedback statistics to default values?')) {
            const defaultStats = {
                averageRating: '4.8/5',
                averageRatingDescription: 'Based on 1,200+ student reviews',
                satisfactionRate: '96%',
                satisfactionRateDescription: 'Students would recommend our courses',
                responseTime: '24hrs',
                responseTimeDescription: 'Average time to address feedback'
            };
            setPublicFeedbackStats(defaultStats);
            localStorage.setItem('publicFeedbackStats', JSON.stringify(defaultStats));
            setPublicStatsUpdateStatus('Public feedback statistics reset to defaults');
            setTimeout(() => setPublicStatsUpdateStatus(''), 3000);
        }
    };

    const autoCalculateStats = () => {
        if (feedbackData.length === 0) {
            setPublicStatsUpdateStatus('No feedback data available for auto-calculation');
            setTimeout(() => setPublicStatsUpdateStatus(''), 3000);
            return;
        }

        const totalFeedback = feedbackData.length + facultyFeedbackData.length;
        const totalRating = [...feedbackData, ...facultyFeedbackData].reduce((sum, item) => sum + (item.rating || 0), 0);
        const avgRating = totalFeedback > 0 ? (totalRating / totalFeedback).toFixed(1) : 0;
        
        // Calculate satisfaction rate (4+ star ratings)
        const satisfiedCount = [...feedbackData, ...facultyFeedbackData].filter(item => (item.rating || 0) >= 4).length;
        const satisfactionRate = totalFeedback > 0 ? Math.round((satisfiedCount / totalFeedback) * 100) : 0;

        const calculatedStats = {
            averageRating: `${avgRating}/5`,
            averageRatingDescription: `Based on ${totalFeedback}+ reviews`,
            satisfactionRate: `${satisfactionRate}%`,
            satisfactionRateDescription: 'Students would recommend our courses',
            responseTime: publicFeedbackStats.responseTime, // Keep existing response time
            responseTimeDescription: publicFeedbackStats.responseTimeDescription
        };

        setPublicFeedbackStats(calculatedStats);
        setPublicStatsUpdateStatus('Statistics auto-calculated from feedback data');
        setTimeout(() => setPublicStatsUpdateStatus(''), 3000);
    };
    // Gallery management functions
    const loadGalleryData = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedGalleryItems = await dataSyncManager.syncGalleryItems();
                setGalleryItems(syncedGalleryItems);
                
                // Gallery achievements are still stored locally for now
                const savedAchievements = localStorage.getItem('galleryAchievements');
                if (savedAchievements) {
                    setGalleryAchievements(JSON.parse(savedAchievements));
                }
            } else {
                // Load from localStorage
                const savedGalleryItems = localStorage.getItem('galleryItems');
                const savedAchievements = localStorage.getItem('galleryAchievements');
                if (savedGalleryItems) {
                    setGalleryItems(JSON.parse(savedGalleryItems));
                }
                if (savedAchievements) {
                    setGalleryAchievements(JSON.parse(savedAchievements));
                }
            }
        } catch (error) {
            console.error('Error loading gallery data:', error);
            // Fallback to localStorage on error
            try {
                const savedGalleryItems = localStorage.getItem('galleryItems');
                const savedAchievements = localStorage.getItem('galleryAchievements');
                if (savedGalleryItems) {
                    setGalleryItems(JSON.parse(savedGalleryItems));
                }
                if (savedAchievements) {
                    setGalleryAchievements(JSON.parse(savedAchievements));
                }
            } catch (fallbackError) {
                console.error('Error loading fallback gallery data:', fallbackError);
            }
        }
    };

    const addGalleryItem = () => {
        if (!galleryForm.title.trim() || !galleryForm.description.trim()) {
            setGalleryUpdateStatus('Please fill in all required fields');
            setTimeout(() => setGalleryUpdateStatus(''), 3000);
            return;
        }
        const newItem = {
            id: Date.now(),
            title: galleryForm.title.trim(),
            description: galleryForm.description.trim(),
            category: galleryForm.category,
            imageUrl: galleryForm.imageUrl.trim()
        };
        const updatedItems = [...galleryItems, newItem];
        setGalleryItems(updatedItems);
        localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
        setGalleryForm({ title: '', description: '', category: 'events', imageUrl: '' });
        setGalleryUpdateStatus('Gallery item added successfully!');
        setTimeout(() => setGalleryUpdateStatus(''), 3000);
    };

    const editGalleryItem = (item) => {
        setEditingGalleryItem(item.id);
        setGalleryForm({
            title: item.title,
            description: item.description,
            category: item.category,
            imageUrl: item.imageUrl || ''
        });
    };

    const updateGalleryItem = () => {
        if (!galleryForm.title.trim() || !galleryForm.description.trim()) {
            setGalleryUpdateStatus('Please fill in all required fields');
            setTimeout(() => setGalleryUpdateStatus(''), 3000);
            return;
        }
        const updatedItems = galleryItems.map(item =>
            item.id === editingGalleryItem
                ? {
                    ...item,
                    title: galleryForm.title.trim(),
                    description: galleryForm.description.trim(),
                    category: galleryForm.category,
                    imageUrl: galleryForm.imageUrl.trim()
                }
                : item
        );
        setGalleryItems(updatedItems);
        localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
        setEditingGalleryItem(null);
        setGalleryForm({ title: '', description: '', category: 'events', imageUrl: '' });
        setGalleryUpdateStatus('Gallery item updated successfully!');
        setTimeout(() => setGalleryUpdateStatus(''), 3000);
    };

    const deleteGalleryItem = (id) => {
        if (window.confirm('Are you sure you want to delete this gallery item?')) {
            const updatedItems = galleryItems.filter(item => item.id !== id);
            setGalleryItems(updatedItems);
            localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
            setGalleryUpdateStatus('Gallery item deleted successfully!');
            setTimeout(() => setGalleryUpdateStatus(''), 3000);
        }
    };

    const updateAchievements = () => {
        localStorage.setItem('galleryAchievements', JSON.stringify(galleryAchievements));
        setGalleryUpdateStatus('Achievements updated successfully!');
        setTimeout(() => setGalleryUpdateStatus(''), 3000);
    };
    // Course management functions (simplified)
    const loadCoursesData = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedCourses = await dataSyncManager.syncCourses();
                setCourses(syncedCourses);
            } else {
                // Load from localStorage
                const savedCourses = localStorage.getItem('coursesData');
                if (savedCourses) {
                    setCourses(JSON.parse(savedCourses));
                }
            }
        } catch (error) {
            console.error('Error loading courses data:', error);
            // Fallback to localStorage on error
            try {
                const savedCourses = localStorage.getItem('coursesData');
                if (savedCourses) {
                    setCourses(JSON.parse(savedCourses));
                }
            } catch (fallbackError) {
                console.error('Error loading fallback courses data:', fallbackError);
            }
        }
    };

    // Helper function to get category display name
    const getCategoryDisplayName = (categoryId) => {
        const categoryMap = {
            'programming': 'Programming',
            'data-science': 'Data Science',
            'marketing': 'Marketing',
            'design': 'Design',
            'cloud': 'Cloud Computing',
            'communication': 'Communication',
            'language': 'Language',
            'professional': 'Professional Skills',
            'business': 'Business',
            'english': 'English',
            'soft-skills': 'Soft Skills'
        };
        return categoryMap[categoryId] || categoryId?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Course';
    };

    // Auto-categorization function
    const getAutoCategoryFromTitle = (title) => {
        const titleLower = title.toLowerCase();
        
        // Professional courses
        if (titleLower.includes('professional') || titleLower.startsWith('professional')) {
            return 'professional';
        }
        
        // Data Science courses
        if (titleLower.includes('data science') || titleLower.includes('machine learning') || 
            titleLower.includes('analytics') || titleLower.includes('sql') || titleLower.includes('python')) {
            return 'data-science';
        }
        
        // Programming courses
        if (titleLower.includes('programming') || titleLower.includes('coding') || 
            titleLower.includes('javascript') || titleLower.includes('java') || 
            titleLower.includes('development') || titleLower.includes('algorithm')) {
            return 'programming';
        }
        
        // Design courses
        if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
            return 'design';
        }
        
        // Marketing courses
        if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('social media')) {
            return 'marketing';
        }
        
        // Business courses
        if (titleLower.includes('business') || titleLower.includes('management') || titleLower.includes('entrepreneur')) {
            return 'business';
        }
        
        // Communication/English courses
        if (titleLower.includes('english') || titleLower.includes('communication') || titleLower.includes('speaking')) {
            return 'english';
        }
        
        // Default to programming if no match
        return 'programming';
    };

    const addCourse = () => {
        if (!courseForm.title.trim() || !courseForm.description.trim() || !courseForm.price.trim()) {
            setCourseUpdateStatus('Please fill in all required fields (title, description, price)');
            setTimeout(() => setCourseUpdateStatus(''), 3000);
            return;
        }
        
        // Auto-detect category from title
        const autoCategory = getAutoCategoryFromTitle(courseForm.title);
        
        const newCourse = {
            id: Date.now(),
            title: courseForm.title.trim(),
            description: courseForm.description.trim(),
            price: parseFloat(courseForm.price) || 0,
            duration: courseForm.duration.trim(),
            level: courseForm.level,
            category: autoCategory, // Use auto-detected category
            imageUrl: courseForm.imageUrl.trim(),
            instructor: courseForm.instructor.trim(),
            rating: parseFloat(courseForm.rating) || 0,
            students: parseInt(courseForm.students) || 0,
            features: courseForm.features.filter(f => f.trim() !== '')
        };
        const updatedCourses = [...courses, newCourse];
        setCourses(updatedCourses);
        localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
        setCourseForm({
            title: '', description: '', price: '', duration: '', level: 'Beginner',
            category: 'programming', imageUrl: '', instructor: '', rating: '', students: '', features: ['']
        });
        setCourseUpdateStatus(`Course added successfully! Auto-categorized as: ${getCategoryDisplayName(autoCategory)}`);
        setTimeout(() => setCourseUpdateStatus(''), 4000);
    };

    const editCourse = (course) => {
        setEditingCourse(course.id);
        setCourseForm({
            title: course.title,
            description: course.description,
            price: course.price.toString(),
            duration: course.duration,
            level: course.level,
            category: course.category,
            imageUrl: course.imageUrl || '',
            instructor: course.instructor || '',
            rating: course.rating ? course.rating.toString() : '',
            students: course.students ? course.students.toString() : '',
            features: course.features.length > 0 ? course.features : ['']
        });
    };

    const updateCourse = () => {
        if (!courseForm.title.trim() || !courseForm.description.trim() || !courseForm.price.trim()) {
            setCourseUpdateStatus('Please fill in all required fields (title, description, price)');
            setTimeout(() => setCourseUpdateStatus(''), 3000);
            return;
        }
        
        // Auto-detect category from title
        const autoCategory = getAutoCategoryFromTitle(courseForm.title);
        
        const updatedCourses = courses.map(course =>
            course.id === editingCourse
                ? {
                    ...course,
                    title: courseForm.title.trim(),
                    description: courseForm.description.trim(),
                    price: parseFloat(courseForm.price) || 0,
                    duration: courseForm.duration.trim(),
                    level: courseForm.level,
                    category: autoCategory, // Use auto-detected category
                    imageUrl: courseForm.imageUrl.trim(),
                    instructor: courseForm.instructor.trim(),
                    rating: parseFloat(courseForm.rating) || 0,
                    students: parseInt(courseForm.students) || 0,
                    features: courseForm.features.filter(f => f.trim() !== '')
                }
                : course
        );
        setCourses(updatedCourses);
        localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
        setEditingCourse(null);
        setCourseForm({
            title: '', description: '', price: '', duration: '', level: 'Beginner',
            category: 'programming', imageUrl: '', instructor: '', rating: '', students: '', features: ['']
        });
        setCourseUpdateStatus(`Course updated successfully! Auto-categorized as: ${getCategoryDisplayName(autoCategory)}`);
        setTimeout(() => setCourseUpdateStatus(''), 4000);
    };

    const deleteCourse = (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            const updatedCourses = courses.filter(course => course.id !== id);
            setCourses(updatedCourses);
            localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
            setCourseUpdateStatus('Course deleted successfully!');
            setTimeout(() => setCourseUpdateStatus(''), 3000);
        }
    };
    // Simplified load functions for other sections
    const updateCourseStatsFromCourses = () => {
        console.log('Updating course stats from courses:', courses);
        
        const totalCourses = courses.length;
        const totalStudents = courses.reduce((sum, course) => sum + (parseInt(course.students) || 0), 0);
        const averageRating = courses.length > 0
            ? (courses.reduce((sum, course) => sum + (parseFloat(course.rating) || 0), 0) / courses.length).toFixed(1)
            : 0;
        
        // Get unique categories from courses
        const categories = [...new Set(courses.map(course => course.category).filter(cat => cat))];
        const totalCategories = categories.length;
        
        const newStats = {
            totalCourses,
            totalStudents,
            averageRating: parseFloat(averageRating),
            totalCategories
        };
        
        console.log('Calculated stats:', newStats);
        setCourseStats(newStats);
        localStorage.setItem('courseStats', JSON.stringify(newStats));
        
        return newStats;
    };

    const loadCourseCategories = () => {
        try {
            const savedCategories = localStorage.getItem('courseCategories');
            if (savedCategories) {
                setCourseCategories(JSON.parse(savedCategories));
            }
        } catch (error) {
            console.error('Error loading course categories:', error);
        }
    };

    // Category Management functions
    const addCategory = () => {
        if (!categoryForm.name.trim()) {
            setCategoryUpdateStatus('Please enter a category name');
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
            return;
        }

        // Check for duplicate category names
        const existingCategory = courseCategories.find(cat => 
            cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
        );
        
        if (existingCategory) {
            setCategoryUpdateStatus('Category with this name already exists');
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
            return;
        }

        const newCategory = {
            id: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim()
        };

        const updatedCategories = [...courseCategories, newCategory];
        setCourseCategories(updatedCategories);
        localStorage.setItem('courseCategories', JSON.stringify(updatedCategories));

        setCategoryForm({ name: '', description: '' });
        setCategoryUpdateStatus('Category added successfully!');
        setTimeout(() => setCategoryUpdateStatus(''), 3000);
    };

    const editCategory = (category) => {
        setEditingCategory(category.id);
        setCategoryForm({
            name: category.name,
            description: category.description
        });
    };

    const updateCategory = () => {
        if (!categoryForm.name.trim()) {
            setCategoryUpdateStatus('Please enter a category name');
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
            return;
        }

        // Check for duplicate names (excluding current category)
        const existingCategory = courseCategories.find(cat => 
            cat.id !== editingCategory && 
            cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase()
        );
        
        if (existingCategory) {
            setCategoryUpdateStatus('Category with this name already exists');
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
            return;
        }

        const updatedCategories = courseCategories.map(category =>
            category.id === editingCategory
                ? {
                    ...category,
                    name: categoryForm.name.trim(),
                    description: categoryForm.description.trim()
                }
                : category
        );

        setCourseCategories(updatedCategories);
        localStorage.setItem('courseCategories', JSON.stringify(updatedCategories));

        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
        setCategoryUpdateStatus('Category updated successfully!');
        setTimeout(() => setCategoryUpdateStatus(''), 3000);
    };

    const deleteCategory = (categoryId) => {
        // Check if any courses use this category
        const coursesUsingCategory = courses.filter(course => course.category === categoryId);
        
        if (coursesUsingCategory.length > 0) {
            setCategoryUpdateStatus(`Cannot delete category. ${coursesUsingCategory.length} course(s) are using this category.`);
            setTimeout(() => setCategoryUpdateStatus(''), 5000);
            return;
        }

        if (window.confirm('Are you sure you want to delete this category?')) {
            const updatedCategories = courseCategories.filter(category => category.id !== categoryId);
            setCourseCategories(updatedCategories);
            localStorage.setItem('courseCategories', JSON.stringify(updatedCategories));

            setCategoryUpdateStatus('Category deleted successfully!');
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
        }
    };

    const cancelCategoryEdit = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
    };

    const createDefaultCategories = () => {
        if (window.confirm('This will create default course categories. Continue?')) {
            const defaultCategories = [
                { id: 'programming', name: 'Programming', description: 'Web development, mobile apps, and software engineering' },
                { id: 'data-science', name: 'Data Science', description: 'Analytics, machine learning, and data visualization' },
                { id: 'design', name: 'Design', description: 'UI/UX design, graphic design, and creative skills' },
                { id: 'marketing', name: 'Marketing', description: 'Digital marketing, social media, and business growth' },
                { id: 'business', name: 'Business', description: 'Entrepreneurship, management, and professional skills' }
            ];

            // Merge with existing categories (avoid duplicates)
            const existingIds = courseCategories.map(cat => cat.id);
            const newCategories = defaultCategories.filter(cat => !existingIds.includes(cat.id));
            
            if (newCategories.length === 0) {
                setCategoryUpdateStatus('All default categories already exist');
                setTimeout(() => setCategoryUpdateStatus(''), 3000);
                return;
            }

            const updatedCategories = [...courseCategories, ...newCategories];
            setCourseCategories(updatedCategories);
            localStorage.setItem('courseCategories', JSON.stringify(updatedCategories));

            setCategoryUpdateStatus(`Added ${newCategories.length} default categories!`);
            setTimeout(() => setCategoryUpdateStatus(''), 3000);
        }
    };

    const loadTeamMembers = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedTeamMembers = await dataSyncManager.syncTeamMembers();
                setTeamMembers(syncedTeamMembers);
            } else {
                // Load from localStorage
                const savedTeamMembers = localStorage.getItem('teamMembers');
                if (savedTeamMembers) {
                    setTeamMembers(JSON.parse(savedTeamMembers));
                }
            }
        } catch (error) {
            console.error('Error loading team members:', error);
            // Fallback to localStorage on error
            try {
                const savedTeamMembers = localStorage.getItem('teamMembers');
                if (savedTeamMembers) {
                    setTeamMembers(JSON.parse(savedTeamMembers));
                }
            } catch (fallbackError) {
                console.error('Error loading fallback team members:', fallbackError);
            }
        }
    };

    // About Us Content Management functions
    const loadAboutUsContent = () => {
        try {
            const savedAboutUsContent = localStorage.getItem('aboutUsContent');
            if (savedAboutUsContent) {
                setAboutUsContent(JSON.parse(savedAboutUsContent));
            } else {
                // Set default content if none exists
                const defaultContent = {
                    mission: {
                        paragraph1: 'At our institution, our mission is to provide industry-oriented training for B.Tech students that prepares them for real-world corporate challenges. We aim to bridge the gap between academic knowledge and practical application through hands-on learning and real-time exposure.',
                        paragraph2: 'We focus on delivering training guided by experienced corporate professionals, helping students build strong technical foundations, practical skills, and career readiness.'
                    },
                    vision: {
                        paragraph1: 'Our vision is to become a trusted training institute that transforms engineering students into skilled, confident, and job-ready professionals.',
                        paragraph2: 'We envision a future where students are not just degree holders but industry-ready individuals who can adapt, perform, and grow in real corporate environments.'
                    },
                    values: [
                        {
                            id: 1,
                            title: 'Excellence',
                            icon: '🎯',
                            description: 'We maintain high standards in training quality, curriculum design, and student mentorship to ensure meaningful learning outcomes.'
                        },
                        {
                            id: 2,
                            title: 'Accessibility',
                            icon: '🤝',
                            description: 'We believe true learning comes from real-world experience. Our training emphasizes hands-on practice, live projects, and industry use cases.'
                        },
                        {
                            id: 3,
                            title: 'Innovation',
                            icon: '🚀',
                            description: 'We continuously update our curriculum based on current corporate trends, tools, and technologies to keep students job-ready.'
                        }
                    ]
                };
                setAboutUsContent(defaultContent);
                localStorage.setItem('aboutUsContent', JSON.stringify(defaultContent));
            }
        } catch (error) {
            console.error('Error loading about us content:', error);
        }
    };

    const updateAboutUsContent = () => {
        try {
            localStorage.setItem('aboutUsContent', JSON.stringify(aboutUsContent));
            setAboutUsUpdateStatus('About Us content updated successfully!');
            setTimeout(() => setAboutUsUpdateStatus(''), 3000);
        } catch (error) {
            setAboutUsUpdateStatus('Error updating About Us content');
            setTimeout(() => setAboutUsUpdateStatus(''), 3000);
        }
    };

    const updateMission = (field, value) => {
        setAboutUsContent({
            ...aboutUsContent,
            mission: {
                ...aboutUsContent.mission,
                [field]: value
            }
        });
    };

    const updateVision = (field, value) => {
        setAboutUsContent({
            ...aboutUsContent,
            vision: {
                ...aboutUsContent.vision,
                [field]: value
            }
        });
    };

    const updateValue = (valueId, field, value) => {
        setAboutUsContent({
            ...aboutUsContent,
            values: aboutUsContent.values.map(val =>
                val.id === valueId ? { ...val, [field]: value } : val
            )
        });
    };

    // Team Management functions
    const addTeamMember = () => {
        if (!teamForm.name.trim() || !teamForm.position.trim() || !teamForm.description.trim()) {
            setTeamUpdateStatus('Please fill in all required fields (name, position, description)');
            setTimeout(() => setTeamUpdateStatus(''), 3000);
            return;
        }

        const newMember = {
            id: Date.now(),
            name: teamForm.name.trim(),
            position: teamForm.position.trim(),
            description: teamForm.description.trim(),
            imageUrl: teamForm.imageUrl.trim(),
            email: teamForm.email.trim(),
            linkedin: teamForm.linkedin.trim()
        };

        const updatedMembers = [...teamMembers, newMember];
        setTeamMembers(updatedMembers);
        localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));

        setTeamForm({
            name: '',
            position: '',
            description: '',
            imageUrl: '',
            email: '',
            linkedin: ''
        });

        setTeamUpdateStatus('Team member added successfully!');
        setTimeout(() => setTeamUpdateStatus(''), 3000);
    };

    const editTeamMember = (member) => {
        setEditingTeamMember(member.id);
        setTeamForm({
            name: member.name,
            position: member.position,
            description: member.description,
            imageUrl: member.imageUrl || '',
            email: member.email || '',
            linkedin: member.linkedin || ''
        });
    };

    const updateTeamMember = () => {
        if (!teamForm.name.trim() || !teamForm.position.trim() || !teamForm.description.trim()) {
            setTeamUpdateStatus('Please fill in all required fields (name, position, description)');
            setTimeout(() => setTeamUpdateStatus(''), 3000);
            return;
        }

        const updatedMembers = teamMembers.map(member =>
            member.id === editingTeamMember
                ? {
                    ...member,
                    name: teamForm.name.trim(),
                    position: teamForm.position.trim(),
                    description: teamForm.description.trim(),
                    imageUrl: teamForm.imageUrl.trim(),
                    email: teamForm.email.trim(),
                    linkedin: teamForm.linkedin.trim()
                }
                : member
        );

        setTeamMembers(updatedMembers);
        localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));

        setEditingTeamMember(null);
        setTeamForm({
            name: '',
            position: '',
            description: '',
            imageUrl: '',
            email: '',
            linkedin: ''
        });

        setTeamUpdateStatus('Team member updated successfully!');
        setTimeout(() => setTeamUpdateStatus(''), 3000);
    };

    const deleteTeamMember = (id) => {
        if (window.confirm('Are you sure you want to delete this team member?')) {
            const updatedMembers = teamMembers.filter(member => member.id !== id);
            setTeamMembers(updatedMembers);
            localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
            setTeamUpdateStatus('Team member deleted successfully!');
            setTimeout(() => setTeamUpdateStatus(''), 3000);
        }
    };

    const loadSocialMediaLinks = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedLinks = await dataSyncManager.syncSocialMediaLinks();
                if (syncedLinks) {
                    setSocialMediaLinks(syncedLinks);
                }
            } else {
                // Load from localStorage
                const savedLinks = localStorage.getItem('socialMediaLinks');
                if (savedLinks) {
                    setSocialMediaLinks(JSON.parse(savedLinks));
                }
            }
        } catch (error) {
            console.error('Error loading social media links:', error);
            // Fallback to localStorage on error
            try {
                const savedLinks = localStorage.getItem('socialMediaLinks');
                if (savedLinks) {
                    setSocialMediaLinks(JSON.parse(savedLinks));
                }
            } catch (fallbackError) {
                console.error('Error loading fallback social media links:', fallbackError);
            }
        }
    };

    const loadFooterContactInfo = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedContactInfo = await dataSyncManager.syncFooterContactInfo();
                if (syncedContactInfo) {
                    setFooterContactInfo(syncedContactInfo);
                }
            } else {
                // Load from localStorage
                const savedContactInfo = localStorage.getItem('footerContactInfo');
                if (savedContactInfo) {
                    const contactInfo = JSON.parse(savedContactInfo);
                    // Merge with defaults to ensure all fields exist
                    const completeContactInfo = {
                        email: contactInfo.email || '',
                        phone: contactInfo.phone || '',
                        address: contactInfo.address || '',
                        companyName: contactInfo.companyName || '',
                        tagline: contactInfo.tagline || '',
                        stayUpdatedTitle: contactInfo.stayUpdatedTitle || 'Stay Updated',
                        stayUpdatedDescription: contactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications',
                        websiteName: contactInfo.websiteName || 'EduPlatform',
                        websiteTitle: contactInfo.websiteTitle || 'EduPlatform - Professional Courses',
                        welcomeMessage: contactInfo.welcomeMessage || 'Welcome to EduPlatform',
                        copyrightText: contactInfo.copyrightText || '© 2024 EduPlatform. All rights reserved.'
                    };
                    setFooterContactInfo(completeContactInfo);
                }
            }
        } catch (error) {
            console.error('Error loading footer contact info:', error);
            // Fallback to localStorage on error
            try {
                const savedContactInfo = localStorage.getItem('footerContactInfo');
                if (savedContactInfo) {
                    const contactInfo = JSON.parse(savedContactInfo);
                    const completeContactInfo = {
                        email: contactInfo.email || '',
                        phone: contactInfo.phone || '',
                        address: contactInfo.address || '',
                        companyName: contactInfo.companyName || '',
                        tagline: contactInfo.tagline || '',
                        stayUpdatedTitle: contactInfo.stayUpdatedTitle || 'Stay Updated',
                        stayUpdatedDescription: contactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications',
                        websiteName: contactInfo.websiteName || 'EduPlatform',
                        websiteTitle: contactInfo.websiteTitle || 'EduPlatform - Professional Courses',
                        welcomeMessage: contactInfo.welcomeMessage || 'Welcome to EduPlatform',
                        copyrightText: contactInfo.copyrightText || '© 2024 EduPlatform. All rights reserved.'
                    };
                    setFooterContactInfo(completeContactInfo);
                }
            } catch (fallbackError) {
                console.error('Error loading fallback footer contact info:', fallbackError);
            }
        }
    };

    // Social Media Management functions
    const updateSocialMediaLinks = () => {
        // Validate URLs
        const urlPattern = /^https?:\/\/.+/;
        const errors = [];

        Object.entries(socialMediaLinks).forEach(([platform, url]) => {
            if (url.trim() && !urlPattern.test(url.trim())) {
                errors.push(`Invalid ${platform} URL format`);
            }
        });

        if (errors.length > 0) {
            setSocialMediaUpdateStatus(`Validation errors: ${errors.join(', ')}`);
            setTimeout(() => setSocialMediaUpdateStatus(''), 5000);
            return;
        }

        // Clean and save social media links
        const cleanedLinks = {};
        Object.entries(socialMediaLinks).forEach(([platform, url]) => {
            cleanedLinks[platform] = url.trim();
        });

        setSocialMediaLinks(cleanedLinks);
        localStorage.setItem('socialMediaLinks', JSON.stringify(cleanedLinks));

        setSocialMediaUpdateStatus('Social media links updated successfully!');
        setTimeout(() => setSocialMediaUpdateStatus(''), 3000);
    };

    const updateFooterContactInfo = () => {
        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errors = [];

        const email = footerContactInfo.email || '';
        if (email.trim() && !emailPattern.test(email.trim())) {
            errors.push('Invalid email format');
        }

        if (errors.length > 0) {
            setFooterContactUpdateStatus(`Error: ${errors.join(', ')}`);
            setTimeout(() => setFooterContactUpdateStatus(''), 3000);
            return;
        }

        // Clean and save contact information with safe property access
        const cleanedContactInfo = {
            email: (footerContactInfo.email || '').trim(),
            phone: (footerContactInfo.phone || '').trim(),
            address: (footerContactInfo.address || '').trim(),
            companyName: (footerContactInfo.companyName || '').trim(),
            tagline: (footerContactInfo.tagline || '').trim(),
            stayUpdatedTitle: (footerContactInfo.stayUpdatedTitle || 'Stay Updated').trim(),
            stayUpdatedDescription: (footerContactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications').trim(),
            websiteName: (footerContactInfo.websiteName || 'EduPlatform').trim(),
            websiteTitle: (footerContactInfo.websiteTitle || 'EduPlatform - Professional Courses').trim(),
            welcomeMessage: (footerContactInfo.welcomeMessage || 'Welcome to EduPlatform').trim(),
            copyrightText: (footerContactInfo.copyrightText || '© 2024 EduPlatform. All rights reserved.').trim()
        };

        localStorage.setItem('footerContactInfo', JSON.stringify(cleanedContactInfo));
        setFooterContactUpdateStatus('Website branding and footer content updated successfully!');
        
        // Dispatch custom event to update other components in real-time
        window.dispatchEvent(new CustomEvent('brandingUpdated'));
        
        setTimeout(() => setFooterContactUpdateStatus(''), 3000);
    };

    const loadPaymentSettings = () => {
        try {
            const savedPaymentSettings = localStorage.getItem('paymentSettings');
            if (savedPaymentSettings) {
                setPaymentSettings(JSON.parse(savedPaymentSettings));
            }
        } catch (error) {
            console.error('Error loading payment settings:', error);
        }
    };

    // Home Page Content Management functions
    const loadHomePageContent = async () => {
        try {
            if (dataSyncEnabled) {
                // Try to sync from Google Sheets first
                const syncedContent = await dataSyncManager.syncHomePageContent();
                if (syncedContent) {
                    setHomePageContent(syncedContent);
                }
            } else {
                // Load from localStorage
                const savedHomePageContent = localStorage.getItem('homePageContent');
                if (savedHomePageContent) {
                    setHomePageContent(JSON.parse(savedHomePageContent));
                }
            }
        } catch (error) {
            console.error('Error loading home page content:', error);
            // Fallback to localStorage on error
            try {
                const savedHomePageContent = localStorage.getItem('homePageContent');
                if (savedHomePageContent) {
                    setHomePageContent(JSON.parse(savedHomePageContent));
                }
            } catch (fallbackError) {
                console.error('Error loading fallback home page content:', fallbackError);
            }
        }
    };

    const updateHomePageContent = () => {
        // Validate required fields
        if (!homePageContent.hero.title.trim()) {
            setHomePageUpdateStatus('Hero title is required');
            setTimeout(() => setHomePageUpdateStatus(''), 3000);
            return;
        }

        if (!homePageContent.features.sectionTitle.trim()) {
            setHomePageUpdateStatus('Features section title is required');
            setTimeout(() => setHomePageUpdateStatus(''), 3000);
            return;
        }

        // Clean and save home page content
        const cleanedContent = {
            hero: {
                title: homePageContent.hero.title.trim(),
                subtitle: homePageContent.hero.subtitle.trim(),
                primaryButtonText: homePageContent.hero.primaryButtonText.trim(),
                secondaryButtonText: homePageContent.hero.secondaryButtonText.trim()
            },
            features: {
                sectionTitle: homePageContent.features.sectionTitle.trim(),
                feature1: {
                    icon: homePageContent.features.feature1.icon.trim(),
                    title: homePageContent.features.feature1.title.trim(),
                    description: homePageContent.features.feature1.description.trim()
                },
                feature2: {
                    icon: homePageContent.features.feature2.icon.trim(),
                    title: homePageContent.features.feature2.title.trim(),
                    description: homePageContent.features.feature2.description.trim()
                },
                feature3: {
                    icon: homePageContent.features.feature3.icon.trim(),
                    title: homePageContent.features.feature3.title.trim(),
                    description: homePageContent.features.feature3.description.trim()
                }
            },
            popularCourses: {
                sectionTitle: homePageContent.popularCourses.sectionTitle.trim(),
                showCount: parseInt(homePageContent.popularCourses.showCount) || 6,
                viewAllButtonText: homePageContent.popularCourses.viewAllButtonText.trim()
            },
            impact: {
                sectionTitle: homePageContent.impact.sectionTitle.trim(),
                showSection: homePageContent.impact.showSection
            }
        };

        localStorage.setItem('homePageContent', JSON.stringify(cleanedContent));
        setHomePageUpdateStatus('Home page content updated successfully!');
        
        // Dispatch custom event to update Home page in real-time
        window.dispatchEvent(new CustomEvent('homePageUpdated'));
        
        setTimeout(() => setHomePageUpdateStatus(''), 3000);
    };

    const resetHomePageContent = () => {
        if (window.confirm('Are you sure you want to reset home page content to defaults?')) {
            const defaultContent = {
                hero: {
                    title: 'Welcome to EduPlatform',
                    subtitle: 'Transform your career with our professional courses. Learn from industry experts and get certified.',
                    primaryButtonText: 'Explore Courses',
                    secondaryButtonText: 'Verify Certificate'
                },
                features: {
                    sectionTitle: 'Why Choose Us?',
                    feature1: {
                        icon: '🎓',
                        title: 'Expert Instructors',
                        description: 'Learn from industry professionals with years of real-world experience.'
                    },
                    feature2: {
                        icon: '📜',
                        title: 'Certified Courses',
                        description: 'Get recognized certificates that boost your career prospects.'
                    },
                    feature3: {
                        icon: '💻',
                        title: 'Online Learning',
                        description: 'Study at your own pace with our flexible online platform.'
                    }
                },
                popularCourses: {
                    sectionTitle: 'Popular Courses',
                    showCount: 6,
                    viewAllButtonText: 'View All Courses'
                },
                impact: {
                    sectionTitle: 'Our Impact',
                    showSection: true
                }
            };
            
            setHomePageContent(defaultContent);
            localStorage.setItem('homePageContent', JSON.stringify(defaultContent));
            setHomePageUpdateStatus('Home page content reset to defaults!');
            
            // Dispatch custom event to update Home page in real-time
            window.dispatchEvent(new CustomEvent('homePageUpdated'));
            
            setTimeout(() => setHomePageUpdateStatus(''), 3000);
        }
    };

    // Impact Statistics Management functions
    const loadImpactStats = () => {
        try {
            const savedImpactStats = localStorage.getItem('impactStats');
            if (savedImpactStats) {
                setImpactStats(JSON.parse(savedImpactStats));
            }
        } catch (error) {
            console.error('Error loading impact stats:', error);
        }
    };

    const updateImpactStats = () => {
        // Validate that at least one stat is enabled
        const enabledStats = Object.values(impactStats).filter(stat => stat.show);
        if (enabledStats.length === 0) {
            setImpactStatsUpdateStatus('Please enable at least one statistic to display');
            setTimeout(() => setImpactStatsUpdateStatus(''), 3000);
            return;
        }

        // Clean and save impact statistics
        const cleanedStats = {};
        Object.keys(impactStats).forEach(key => {
            cleanedStats[key] = {
                value: parseFloat(impactStats[key].value) || 0,
                label: impactStats[key].label.trim(),
                show: impactStats[key].show
            };
        });

        localStorage.setItem('impactStats', JSON.stringify(cleanedStats));
        setImpactStatsUpdateStatus('Impact statistics updated successfully!');
        
        // Dispatch custom event to update Home page in real-time
        window.dispatchEvent(new CustomEvent('impactStatsUpdated'));
        
        setTimeout(() => setImpactStatsUpdateStatus(''), 3000);
    };

    const resetImpactStats = () => {
        if (window.confirm('Are you sure you want to reset impact statistics to defaults?')) {
            const defaultStats = {
                totalCourses: {
                    value: 25,
                    label: 'Courses Available',
                    show: true
                },
                totalStudents: {
                    value: 5000,
                    label: 'Students Enrolled',
                    show: true
                },
                averageRating: {
                    value: 4.8,
                    label: 'Average Rating',
                    show: true
                },
                totalCategories: {
                    value: 8,
                    label: 'Course Categories',
                    show: true
                },
                successRate: {
                    value: 95,
                    label: 'Success Rate',
                    show: false
                },
                certificates: {
                    value: 4500,
                    label: 'Certificates Issued',
                    show: false
                }
            };
            
            setImpactStats(defaultStats);
            localStorage.setItem('impactStats', JSON.stringify(defaultStats));
            setImpactStatsUpdateStatus('Impact statistics reset to defaults!');
            
            // Dispatch custom event to update Home page in real-time
            window.dispatchEvent(new CustomEvent('impactStatsUpdated'));
            
            setTimeout(() => setImpactStatsUpdateStatus(''), 3000);
        }
    };
    // Login Form Component
    if (!isLoggedIn) {
        return (
            <div>
                <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                    <div className="container">
                        <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>🔐 Admin Login</h2>
                            
                            <form onSubmit={handleLogin}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Username:</label>
                                    <input
                                        type="text"
                                        value={loginForm.username}
                                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                        className="admin-input"
                                        required
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Password:</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.loginPassword ? "text" : "password"}
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            className="admin-input"
                                            required
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('loginPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                            title={showPasswords.loginPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.loginPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                
                                {loginError && (
                                    <StatusIndicator status={loginError} />
                                )}
                                
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        marginBottom: '15px'
                                    }}
                                >
                                    Login
                                </button>
                                
                                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#007bff',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        🔑 Forgot Password?
                                    </button>
                                </div>
                            </form>
                            
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Reset to default credentials (admin/admin)? This will overwrite any custom credentials.')) {
                                            const defaultCredentials = {
                                                username: 'admin',
                                                password: 'admin'
                                            };
                                            setAdminCredentials(defaultCredentials);
                                            localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
                                            setLoginError('');
                                            alert('Credentials reset to default: admin/admin');
                                        }
                                    }}
                                    style={{
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '30px',
                            position: 'relative',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}>
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordError('');
                                    setForgotPasswordForm({
                                        recoveryCode: '',
                                        newUsername: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                ×
                            </button>

                            <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                                🔑 Reset Password
                            </h2>

                            <form onSubmit={handleForgotPassword}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Recovery Code:
                                    </label>
                                    <input
                                        type="text"
                                        value={forgotPasswordForm.recoveryCode}
                                        onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, recoveryCode: e.target.value})}
                                        placeholder="Enter your 12-character recovery code"
                                        className="admin-input"
                                        required
                                        maxLength="12"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        New Username:
                                    </label>
                                    <input
                                        type="text"
                                        value={forgotPasswordForm.newUsername}
                                        onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, newUsername: e.target.value})}
                                        placeholder="Enter new username"
                                        className="admin-input"
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        New Password:
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.forgotNewPassword ? "text" : "password"}
                                            value={forgotPasswordForm.newPassword}
                                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, newPassword: e.target.value})}
                                            placeholder="Enter new password (min 6 characters)"
                                            className="admin-input"
                                            required
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('forgotNewPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                        >
                                            {showPasswords.forgotNewPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                        Confirm New Password:
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.forgotConfirmPassword ? "text" : "password"}
                                            value={forgotPasswordForm.confirmPassword}
                                            onChange={(e) => setForgotPasswordForm({...forgotPasswordForm, confirmPassword: e.target.value})}
                                            placeholder="Confirm new password"
                                            className="admin-input"
                                            required
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('forgotConfirmPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                        >
                                            {showPasswords.forgotConfirmPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>

                                {forgotPasswordError && (
                                    <div style={{
                                        padding: '10px',
                                        background: '#f8d7da',
                                        color: '#721c24',
                                        borderRadius: '5px',
                                        marginBottom: '20px',
                                        fontSize: '0.9rem'
                                    }}>
                                        ⚠️ {forgotPasswordError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔐 Reset Password
                                </button>
                            </form>

                            <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <strong>💡 Need Help?</strong><br />
                                • Enter your 12-character recovery code<br />
                                • Choose a new username and password<br />
                                • A new recovery code will be generated after reset
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    // Admin Dashboard Component
    return (
        <div>
            <section className="section">
                <div className="container">
                    {/* Admin Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h1 className="section-title" style={{ margin: '0' }}>🔐 Admin Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Logout
                        </button>
                    </div>

                    {/* Database Status */}
                    <AdminCard 
                        title="Database Status" 
                        icon="📊"
                        headerActions={
                            <ActionButtons 
                                buttons={[
                                    {
                                        label: isLoading ? 'Refreshing...' : 'Refresh Data',
                                        icon: '🔄',
                                        onClick: refreshData,
                                        disabled: isLoading,
                                        variant: 'primary'
                                    }
                                ]}
                            />
                        }
                    >
                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Data Source',
                                    value: 'Google Sheets Database'
                                },
                                {
                                    label: 'Certificates Loaded',
                                    value: excelData.length
                                },
                                {
                                    label: 'Last Updated',
                                    value: lastUpdated ? lastUpdated.toLocaleString() : 'Not loaded'
                                },
                                {
                                    label: 'Connection Status',
                                    value: isLoading ? '🔄 Loading...' : loadError ? '❌ Error' : '✅ Connected'
                                }
                            ]}
                        />
                        
                        {loadError && (
                            <div style={{ 
                                background: '#f8d7da', 
                                color: '#721c24', 
                                padding: '20px', 
                                borderRadius: '10px', 
                                marginTop: '20px',
                                border: '1px solid #f5c6cb'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>⚠️ Connection Error</h4>
                                <p style={{ margin: '0 0 10px 0' }}><strong>Error:</strong> {loadError}</p>
                                <p style={{ margin: '0' }}>Please check your Google Sheets permissions and try refreshing the data.</p>
                            </div>
                        )}
                    </AdminCard>

                    {/* Admin Password Management */}
                    <AdminCard title="Admin Password Management" icon="🔐" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Change Admin Credentials">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Update your admin username and password for enhanced security.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Current Password:</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.currentPassword ? "text" : "password"}
                                            value={newCredentialsForm.currentPassword}
                                            onChange={(e) => setNewCredentialsForm({...newCredentialsForm, currentPassword: e.target.value})}
                                            placeholder="Enter current password"
                                            className="admin-input"
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('currentPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                            title={showPasswords.currentPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.currentPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Username:</label>
                                    <input
                                        type="text"
                                        value={newCredentialsForm.newUsername}
                                        onChange={(e) => setNewCredentialsForm({...newCredentialsForm, newUsername: e.target.value})}
                                        placeholder="Enter new username"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password:</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.newPassword ? "text" : "password"}
                                            value={newCredentialsForm.newPassword}
                                            onChange={(e) => setNewCredentialsForm({...newCredentialsForm, newPassword: e.target.value})}
                                            placeholder="Enter new password (min 6 characters)"
                                            className="admin-input"
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('newPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                            title={showPasswords.newPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.newPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm New Password:</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPasswords.confirmPassword ? "text" : "password"}
                                            value={newCredentialsForm.confirmPassword}
                                            onChange={(e) => setNewCredentialsForm({...newCredentialsForm, confirmPassword: e.target.value})}
                                            placeholder="Confirm new password"
                                            className="admin-input"
                                            style={{ paddingRight: '45px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirmPassword')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                color: '#666',
                                                padding: '5px'
                                            }}
                                            title={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.confirmPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <ActionButtons buttons={[
                                {
                                    label: 'Update Credentials',
                                    icon: '🔐',
                                    onClick: updateAdminCredentials,
                                    variant: 'primary'
                                },
                                {
                                    label: 'Generate New Recovery Code',
                                    icon: '�',
                                    onClick: () => {
                                        if (window.confirm('⚠️ WARNING: Generating a new recovery code will make your current recovery code invalid!\n\nAre you sure you want to continue? Make sure to save the new code safely.')) {
                                            const newCode = generateRecoveryCode();
                                            setCredentialsUpdateStatus(`✅ New recovery code generated: ${newCode}\n\n⚠️ IMPORTANT: Your old recovery code is no longer valid. Save this new code safely!`);
                                            setTimeout(() => setCredentialsUpdateStatus(''), 8000);
                                        }
                                    },
                                    variant: 'warning'
                                },
                                {
                                    label: 'Clear Form',
                                    icon: '🗑️',
                                    onClick: () => setNewCredentialsForm({
                                        currentPassword: '',
                                        newUsername: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    }),
                                    variant: 'secondary'
                                }
                            ]} />

                            <StatusIndicator status={credentialsUpdateStatus} />

                            {/* Current Credentials Info */}
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <h4 style={{ marginBottom: '10px', color: '#495057' }}>Current Admin Credentials</h4>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    <p><strong>Username:</strong> {adminCredentials.username}</p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <strong>Password:</strong> 
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {showPasswords.displayPassword ? adminCredentials.password : '•'.repeat(adminCredentials.password.length)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('displayPassword')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                color: '#666',
                                                padding: '2px'
                                            }}
                                            title={showPasswords.displayPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPasswords.displayPassword ? '🙈' : '👁️'}
                                        </button>
                                    </p>
                                </div>
                            </div>

                            {/* Recovery Code Display */}
                            <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                                <h4 style={{ marginBottom: '10px', color: '#856404' }}>🔑 Recovery Code</h4>
                                <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                                    <p style={{ marginBottom: '10px' }}>
                                        <strong>Current Recovery Code:</strong> 
                                        <span style={{ 
                                            fontFamily: 'monospace', 
                                            fontSize: '1.1rem', 
                                            background: '#fff', 
                                            padding: '4px 8px', 
                                            borderRadius: '4px',
                                            marginLeft: '10px',
                                            border: '1px solid #ddd'
                                        }}>
                                            {recoveryCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(recoveryCode);
                                                setCredentialsUpdateStatus('Recovery code copied to clipboard!');
                                                setTimeout(() => setCredentialsUpdateStatus(''), 2000);
                                            }}
                                            style={{
                                                marginLeft: '10px',
                                                padding: '4px 8px',
                                                background: '#ffc107',
                                                color: '#212529',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                            title="Copy to clipboard"
                                        >
                                            📋 Copy
                                        </button>
                                    </p>
                                    <p style={{ margin: '0', fontSize: '0.85rem' }}>
                                        <strong>⚠️ Important:</strong> Save this code safely! You'll need it to reset your password if you forget it.
                                    </p>
                                </div>
                            </div>

                            {/* Security Tips */}
                            <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                                <h4 style={{ marginBottom: '10px', color: '#856404' }}>🔒 Security Tips</h4>
                                <ul style={{ margin: '0', fontSize: '0.85rem', color: '#856404' }}>
                                    <li>Use a strong password with at least 6 characters</li>
                                    <li>Choose a unique username that's not easily guessable</li>
                                    <li>Change your credentials regularly</li>
                                    <li>Don't share your admin credentials with anyone</li>
                                    <li>Log out when you're done using the admin panel</li>
                                </ul>
                            </div>
                        </FormSection>
                    </AdminCard>

                    {/* Google Sheets Data Sync Configuration */}
                    <AdminCard title="Google Sheets Data Sync" icon="📊" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Data Sync Configuration">
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🔄 Shared Data Management</h4>
                                <p style={{ margin: '0', fontSize: '0.9rem', color: '#1565c0' }}>
                                    Enable Google Sheets sync to share data across all users. When enabled, all visitors will see the same content when you update it from the admin panel.
                                </p>
                            </div>

                            {/* Sync Enable/Disable */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={dataSyncEnabled}
                                        onChange={(e) => toggleDataSync(e.target.checked)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <span style={{ fontWeight: 'bold' }}>Enable Google Sheets Data Sync</span>
                                </label>
                                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0' }}>
                                    When enabled, data will be loaded from Google Sheets instead of local storage
                                </p>
                            </div>

                            {/* Sync Status */}
                            {syncStatus && <StatusIndicator status={syncStatus} />}

                            {/* Last Sync Time */}
                            {lastSyncTime && (
                                <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                                    Last sync: {lastSyncTime.toLocaleString()}
                                </div>
                            )}

                            {/* Sync Actions */}
                            <ActionButtons
                                buttons={[
                                    {
                                        text: syncInProgress ? 'Syncing...' : '🔄 Sync All Data',
                                        onClick: performFullSync,
                                        disabled: !dataSyncEnabled || syncInProgress,
                                        primary: true
                                    }
                                ]}
                            />
                        </FormSection>

                        {/* Google Sheets URLs Configuration */}
                        <FormSection title="Google Sheets URLs">
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📋 Setup Instructions</h4>
                                <ol style={{ margin: '0', fontSize: '0.85rem', color: '#856404' }}>
                                    <li>Create Google Sheets with the required column headers</li>
                                    <li>Make sure the sheets are publicly viewable (Share → Anyone with the link can view)</li>
                                    <li>Copy the Google Sheets URLs and paste them below</li>
                                    <li>Enable data sync and click "Sync All Data"</li>
                                </ol>
                            </div>

                            {/* Courses Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Courses Data Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.courses}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, courses: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.courses, 'Courses')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Headers: id, title, description, price, duration, level, category, imageUrl, instructor, rating, students, features
                                </small>
                            </div>

                            {/* Team Members Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Team Members Data Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.teamMembers}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, teamMembers: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.teamMembers, 'Team Members')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Headers: id, name, position, description, imageUrl, email, linkedin
                                </small>
                            </div>

                            {/* Gallery Items Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Gallery Items Data Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.galleryItems}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, galleryItems: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.galleryItems, 'Gallery Items')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Headers: id, title, description, category, imageUrl
                                </small>
                            </div>

                            {/* Home Page Content Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Home Page Content Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.homePageContent}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, homePageContent: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.homePageContent, 'Home Page Content')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Single row with headers: heroTitle, heroSubtitle, heroPrimaryButton, heroSecondaryButton, etc.
                                </small>
                            </div>

                            {/* Footer Contact Info Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Footer Contact Info Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.footerContactInfo}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, footerContactInfo: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.footerContactInfo, 'Footer Contact Info')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Single row with headers: email, phone, address, companyName, tagline, websiteName, etc.
                                </small>
                            </div>

                            {/* Social Media Links Sheet URL */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Social Media Links Sheet URL:
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={googleSheetsURLs.socialMediaLinks}
                                        onChange={(e) => setGoogleSheetsURLs(prev => ({ ...prev, socialMediaLinks: e.target.value }))}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="admin-input"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={() => testGoogleSheetsURL(googleSheetsURLs.socialMediaLinks, 'Social Media Links')}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Test
                                    </button>
                                </div>
                                <small style={{ color: '#666' }}>
                                    Single row with headers: facebook, twitter, instagram, linkedin, youtube, whatsapp
                                </small>
                            </div>

                            {/* Save URLs Button */}
                            <ActionButtons
                                buttons={[
                                    {
                                        text: '💾 Save Google Sheets URLs',
                                        onClick: () => updateGoogleSheetsURLs(googleSheetsURLs),
                                        primary: true
                                    }
                                ]}
                            />
                        </FormSection>
                    </AdminCard>

                    {/* Certificate Management */}
                    <AdminCard title="Certificate Management" icon="🎓" collapsible={true} defaultExpanded={false}>
                        {/* Certificate Database Configuration */}
                        <FormSection title="Certificate Database Configuration">
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Certificate Database URL:</label>
                                <input
                                    type="url"
                                    value={certificateDataURL}
                                    onChange={(e) => setCertificateDataURL(e.target.value)}
                                    placeholder="Google Sheets CSV export URL for certificate data"
                                    className="admin-input"
                                />
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    CSV export URL from Google Sheets containing certificate data (Certificate Number, Student Name, Course, etc.)
                                </small>
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: 'Update Database URL',
                                        icon: '🔗',
                                        onClick: updateCertificateDataURL,
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'Test URL',
                                        icon: '🔍',
                                        onClick: testCertificateURL,
                                        variant: 'secondary'
                                    },
                                    {
                                        label: 'Refresh Data',
                                        icon: '🔄',
                                        onClick: refreshData,
                                        disabled: isLoading,
                                        variant: 'success'
                                    },
                                    {
                                        label: 'Export CSV',
                                        icon: '📥',
                                        onClick: exportCertificateData,
                                        variant: 'info'
                                    }
                                ]}
                            />
                        </FormSection>

                        {/* Certificate Statistics */}
                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Total Certificates',
                                    value: certificateStats.totalCertificates
                                },
                                {
                                    label: 'Recent (30 days)',
                                    value: certificateStats.recentCertificates
                                },
                                {
                                    label: 'Unique Courses',
                                    value: Object.keys(certificateStats.courseBreakdown).length
                                },
                                {
                                    label: 'Database Status',
                                    value: isLoading ? '🔄 Loading...' : loadError ? '❌ Error' : '✅ Connected'
                                }
                            ]}
                        />

                        {/* Certificate Data Display */}
                        <FormSection title="Certificate Data">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0 }}>Certificate Records ({getFilteredCertificates().length} total)</h4>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={certificateSearchTerm}
                                        onChange={(e) => {
                                            setCertificateSearchTerm(e.target.value);
                                            setCertificatePage(1); // Reset to first page when searching
                                        }}
                                        placeholder="Search certificates..."
                                        className="admin-input"
                                        style={{ width: '200px' }}
                                    />
                                </div>
                            </div>

                            {loadError && (
                                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                                    ❌ {loadError}
                                </div>
                            )}

                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Loading certificate data...
                                </div>
                            ) : excelData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No certificate data available. Check your Google Sheets URL.
                                </div>
                            ) : (
                                <>
                                    <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        {getPaginatedCertificates().map((cert, index) => (
                                            <div key={cert.certificateNumber || index} style={{ 
                                                padding: '15px', 
                                                borderBottom: '1px solid #eee',
                                                background: index % 2 === 0 ? '#f9f9f9' : 'white'
                                            }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'start' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{cert.certificateNumber || 'No Certificate Number'}</h5>
                                                        <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>{cert.studentName || 'Unknown Student'}</p>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>ID: {cert.collegeId || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>{cert.courseName || 'Unknown Course'}</p>
                                                        <p style={{ margin: '0 0 3px 0', color: '#666', fontSize: '0.9rem' }}>
                                                            Grade: <span style={{ 
                                                                color: cert.grade === 'A+' ? '#28a745' : cert.grade === 'A' ? '#17a2b8' : '#6c757d',
                                                                fontWeight: 'bold'
                                                            }}>{cert.grade || 'N/A'}</span>
                                                        </p>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Duration: {cert.duration || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>
                                                            <strong>Issued:</strong> {cert.issueDate || 'N/A'}
                                                        </p>
                                                        <p style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>
                                                            <strong>Completed:</strong> {cert.completionDate || 'N/A'}
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '0.9rem' }}>
                                                            <strong>Instructor:</strong> {cert.instructor || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Certificate Pagination */}
                                    {getCertificateTotalPages() > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                            <button
                                                onClick={() => setCertificatePage(Math.max(1, certificatePage - 1))}
                                                disabled={certificatePage === 1}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: certificatePage === 1 ? '#f5f5f5' : 'white',
                                                    cursor: certificatePage === 1 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                ← Previous
                                            </button>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                                Page {certificatePage} of {getCertificateTotalPages()}
                                            </span>
                                            <button
                                                onClick={() => setCertificatePage(Math.min(getCertificateTotalPages(), certificatePage + 1))}
                                                disabled={certificatePage === getCertificateTotalPages()}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: certificatePage === getCertificateTotalPages() ? '#f5f5f5' : 'white',
                                                    cursor: certificatePage === getCertificateTotalPages() ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </FormSection>

                        {/* Course and Grade Analytics */}
                        {Object.keys(certificateStats.courseBreakdown).length > 0 && (
                            <FormSection title="Analytics">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h5 style={{ marginBottom: '10px' }}>Top Courses</h5>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {Object.entries(certificateStats.courseBreakdown)
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 10)
                                                .map(([course, count]) => (
                                                    <div key={course} style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        padding: '5px 0',
                                                        borderBottom: '1px solid #eee'
                                                    }}>
                                                        <span style={{ fontSize: '0.9rem' }}>{course}</span>
                                                        <span style={{ fontWeight: 'bold', color: '#007bff' }}>{count}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 style={{ marginBottom: '10px' }}>Grade Distribution</h5>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {Object.entries(certificateStats.gradeDistribution)
                                                .sort(([,a], [,b]) => b - a)
                                                .map(([grade, count]) => (
                                                    <div key={grade} style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        padding: '5px 0',
                                                        borderBottom: '1px solid #eee'
                                                    }}>
                                                        <span style={{ fontSize: '0.9rem' }}>{grade}</span>
                                                        <span style={{ 
                                                            fontWeight: 'bold', 
                                                            color: grade === 'A+' ? '#28a745' : grade === 'A' ? '#17a2b8' : '#6c757d'
                                                        }}>{count}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </FormSection>
                        )}

                        <StatusIndicator status={certificateUrlUpdateStatus} />
                    </AdminCard>

                    {/* Certificate Template Management */}
                    <AdminCard 
                        title="Certificate Template Management" 
                        icon="🎨"
                        collapsible={true}
                        defaultExpanded={false}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                            <FormSection title="Upload Certificate Design">
                                <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                                    Upload your certificate template image. The system will automatically add student names and certificate numbers to your design.
                                </p>

                                <div style={{ marginBottom: '20px' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleTemplateUpload}
                                        className="admin-input"
                                        style={{
                                            border: '2px dashed #ddd',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>

                                <StatusIndicator status={templateUploadStatus} />

                                {certificateTemplate && (
                                    <ActionButtons 
                                        buttons={[
                                            {
                                                label: 'Remove Template',
                                                icon: '🗑️',
                                                onClick: removeTemplate,
                                                variant: 'danger'
                                            }
                                        ]}
                                    />
                                )}
                            </FormSection>

                            <FormSection title="Current Template Preview">
                                {certificateTemplate ? (
                                    <div style={{ border: '2px solid #ddd', borderRadius: '10px', padding: '10px', background: '#f8f9fa' }}>
                                        <img
                                            src={certificateTemplate}
                                            alt="Certificate Template"
                                            style={{
                                                width: '100%',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                                borderRadius: '5px'
                                            }}
                                        />
                                        <p style={{ textAlign: 'center', marginTop: '10px', color: '#28a745', fontSize: '0.9rem' }}>
                                            ✅ Template loaded successfully
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        border: '2px dashed #ddd',
                                        borderRadius: '10px',
                                        padding: '40px',
                                        textAlign: 'center',
                                        color: '#666',
                                        background: '#f8f9fa'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                                        <p>No template uploaded</p>
                                        <p style={{ fontSize: '0.8rem' }}>Upload an image to see preview</p>
                                    </div>
                                )}
                            </FormSection>
                        </div>

                        <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Template Guidelines:</h4>
                            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.9rem', color: '#666' }}>
                                <li>Use high-resolution images (recommended: 800x600px or larger)</li>
                                <li>Leave space in the center for student names</li>
                                <li>Supported formats: PNG, JPG, JPEG, GIF</li>
                                <li>Maximum file size: 5MB</li>
                                <li>The system will overlay text on your design automatically</li>
                            </ul>
                        </div>
                    </AdminCard>
                    {/* Gallery Management */}
                    <AdminCard 
                        title="Gallery Management" 
                        icon="🖼️"
                        collapsible={true}
                        defaultExpanded={false}
                    >
                        <FormSection title="Add Gallery Item">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
                                    <input
                                        type="text"
                                        value={galleryForm.title}
                                        onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                                        placeholder="Gallery item title"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
                                    <select
                                        value={galleryForm.category}
                                        onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                                        className="admin-select"
                                    >
                                        <option value="events">Events</option>
                                        <option value="students">Students</option>
                                        <option value="facilities">Facilities</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                                <textarea
                                    value={galleryForm.description}
                                    onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})}
                                    placeholder="Gallery item description"
                                    className="admin-textarea"
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Image URL:</label>
                                <input
                                    type="url"
                                    value={galleryForm.imageUrl}
                                    onChange={(e) => setGalleryForm({...galleryForm, imageUrl: e.target.value})}
                                    placeholder="https://example.com/image.jpg"
                                    className="admin-input"
                                />
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: editingGalleryItem ? 'Update Item' : 'Add Item',
                                        icon: editingGalleryItem ? '✏️' : '➕',
                                        onClick: editingGalleryItem ? updateGalleryItem : addGalleryItem,
                                        variant: 'primary'
                                    },
                                    ...(editingGalleryItem ? [{
                                        label: 'Cancel Edit',
                                        icon: '❌',
                                        onClick: () => {
                                            setEditingGalleryItem(null);
                                            setGalleryForm({ title: '', description: '', category: 'events', imageUrl: '' });
                                        },
                                        variant: 'secondary'
                                    }] : [])
                                ]}
                            />
                        </FormSection>

                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Total Gallery Items',
                                    value: galleryItems.length
                                },
                                {
                                    label: 'Events',
                                    value: galleryItems.filter(item => item.category === 'events').length
                                },
                                {
                                    label: 'Students',
                                    value: galleryItems.filter(item => item.category === 'students').length
                                },
                                {
                                    label: 'Facilities',
                                    value: galleryItems.filter(item => item.category === 'facilities').length
                                }
                            ]}
                        />

                        <StatusIndicator status={galleryUpdateStatus} />

                        {galleryItems.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ marginBottom: '15px' }}>Current Gallery Items</h4>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {galleryItems.slice(0, 5).map(item => (
                                        <div key={item.id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '10px', 
                                            border: '1px solid #e9ecef', 
                                            borderRadius: '5px', 
                                            marginBottom: '10px' 
                                        }}>
                                            <div>
                                                <strong>{item.title}</strong>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    {item.category} • {item.description.substring(0, 50)}...
                                                </div>
                                            </div>
                                            <ActionButtons 
                                                buttons={[
                                                    {
                                                        label: 'Edit',
                                                        icon: '✏️',
                                                        onClick: () => editGalleryItem(item),
                                                        variant: 'info'
                                                    },
                                                    {
                                                        label: 'Delete',
                                                        icon: '🗑️',
                                                        onClick: () => deleteGalleryItem(item.id),
                                                        variant: 'danger'
                                                    }
                                                ]}
                                            />
                                        </div>
                                    ))}
                                    {galleryItems.length > 5 && (
                                        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                                            ... and {galleryItems.length - 5} more items
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </AdminCard>

                    {/* Gallery Achievements Management */}
                    <AdminCard title="Gallery Achievements" icon="🏆" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Achievement Statistics">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Students Graduated:</label>
                                    <input
                                        type="text"
                                        value={galleryAchievements.studentsGraduated}
                                        onChange={(e) => setGalleryAchievements({ ...galleryAchievements, studentsGraduated: e.target.value })}
                                        placeholder="e.g., 5000+"
                                        className="admin-input"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Industry Events:</label>
                                    <input
                                        type="text"
                                        value={galleryAchievements.industryEvents}
                                        onChange={(e) => setGalleryAchievements({ ...galleryAchievements, industryEvents: e.target.value })}
                                        placeholder="e.g., 50+"
                                        className="admin-input"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Placement Rate:</label>
                                    <input
                                        type="text"
                                        value={galleryAchievements.jobPlacementRate}
                                        onChange={(e) => setGalleryAchievements({ ...galleryAchievements, jobPlacementRate: e.target.value })}
                                        placeholder="e.g., 95%"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: 'Update Achievements',
                                        icon: '💾',
                                        onClick: updateAchievements,
                                        variant: 'success'
                                    }
                                ]}
                            />
                        </FormSection>

                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Students Graduated',
                                    value: galleryAchievements.studentsGraduated || 'Not set'
                                },
                                {
                                    label: 'Industry Events',
                                    value: galleryAchievements.industryEvents || 'Not set'
                                },
                                {
                                    label: 'Job Placement Rate',
                                    value: galleryAchievements.jobPlacementRate || 'Not set'
                                }
                            ]}
                        />

                        <StatusIndicator status={galleryUpdateStatus} />
                    </AdminCard>

                    {/* Course Management */}
                    <AdminCard title="Course Management" icon="📚" collapsible={true} defaultExpanded={false}>
                        {/* Course Form */}
                        <FormSection title={editingCourse ? "Edit Course" : "Add New Course"}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Course Title *:</label>
                                    <input
                                        type="text"
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                                        placeholder="Course title"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (₹) *:</label>
                                    <input
                                        type="number"
                                        value={courseForm.price}
                                        onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                                        placeholder="Course price"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Duration:</label>
                                    <input
                                        type="text"
                                        value={courseForm.duration}
                                        onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                                        placeholder="e.g., 12 weeks"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Level:</label>
                                    <select
                                        value={courseForm.level}
                                        onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                                        className="admin-select"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category:</label>
                                    <select
                                        value={courseForm.category}
                                        onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                                        className="admin-select"
                                    >
                                        <option value="programming">Programming</option>
                                        <option value="data-science">Data Science</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="design">Design</option>
                                        <option value="cloud">Cloud Computing</option>
                                        <option value="communication">Communication</option>
                                        <option value="language">Language</option>
                                        <option value="professional">Professional Skills</option>
                                        <option value="business">Business</option>
                                        <option value="english">English</option>
                                        <option value="soft-skills">Soft Skills</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Instructor:</label>
                                    <input
                                        type="text"
                                        value={courseForm.instructor}
                                        onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                                        placeholder="Instructor name"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rating (0-5):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={courseForm.rating}
                                        onChange={(e) => setCourseForm({...courseForm, rating: e.target.value})}
                                        placeholder="4.2"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Students Enrolled:</label>
                                    <input
                                        type="number"
                                        value={courseForm.students}
                                        onChange={(e) => setCourseForm({...courseForm, students: e.target.value})}
                                        placeholder="Number of students"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Course Description *:</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                                    placeholder="Course description"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Course Image URL:</label>
                                <input
                                    type="url"
                                    value={courseForm.imageUrl}
                                    onChange={(e) => setCourseForm({...courseForm, imageUrl: e.target.value})}
                                    placeholder="https://example.com/course-image.jpg"
                                    className="admin-input"
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Course Features:</label>
                                {courseForm.features.map((feature, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => {
                                                const newFeatures = [...courseForm.features];
                                                newFeatures[index] = e.target.value;
                                                setCourseForm({...courseForm, features: newFeatures});
                                            }}
                                            placeholder={`Feature ${index + 1}`}
                                            className="admin-input"
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newFeatures = courseForm.features.filter((_, i) => i !== index);
                                                setCourseForm({...courseForm, features: newFeatures});
                                            }}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCourseForm({...courseForm, features: [...courseForm.features, '']})}
                                    style={{
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 15px',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    + Add Feature
                                </button>
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: editingCourse ? 'Update Course' : 'Add Course',
                                        icon: editingCourse ? '✏️' : '➕',
                                        onClick: editingCourse ? updateCourse : addCourse,
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'Re-categorize All Courses',
                                        icon: '🏷️',
                                        onClick: () => {
                                            if (window.confirm('This will automatically re-categorize all courses based on their titles. Continue?')) {
                                                const updatedCourses = courses.map(course => ({
                                                    ...course,
                                                    category: getAutoCategoryFromTitle(course.title)
                                                }));
                                                setCourses(updatedCourses);
                                                localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
                                                setCourseUpdateStatus(`Re-categorized ${courses.length} courses successfully!`);
                                                setTimeout(() => setCourseUpdateStatus(''), 4000);
                                            }
                                        },
                                        variant: 'info'
                                    },
                                    ...(editingCourse ? [{
                                        label: 'Cancel Edit',
                                        icon: '❌',
                                        onClick: () => {
                                            setEditingCourse(null);
                                            setCourseForm({
                                                title: '', description: '', price: '', duration: '', level: 'Beginner',
                                                category: 'programming', imageUrl: '', instructor: '', rating: '', students: '', features: ['']
                                            });
                                        },
                                        variant: 'secondary'
                                    }] : [])
                                ]}
                            />
                        </FormSection>

                        {/* Course Statistics */}
                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Total Courses',
                                    value: courseStats.totalCourses
                                },
                                {
                                    label: 'Total Students',
                                    value: courseStats.totalStudents.toLocaleString()
                                },
                                {
                                    label: 'Average Rating',
                                    value: courseStats.averageRating > 0 ? `${courseStats.averageRating}/5` : 'N/A'
                                },
                                {
                                    label: 'Categories',
                                    value: courseStats.totalCategories
                                }
                            ]}
                        />

                        <StatusIndicator status={courseUpdateStatus} />

                        {/* Course List */}
                        {courses.length > 0 && (
                            <FormSection title="Current Courses">
                                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {courses.map(course => (
                                        <div key={course.id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'flex-start', 
                                            padding: '15px', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '5px', 
                                            marginBottom: '10px',
                                            background: 'white'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', alignItems: 'start' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{course.title}</h5>
                                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>
                                                            {course.description.length > 100 
                                                                ? course.description.substring(0, 100) + '...' 
                                                                : course.description}
                                                        </p>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                            <span style={{ marginRight: '15px' }}>📚 {course.category}</span>
                                                            <span style={{ marginRight: '15px' }}>⏱️ {course.duration}</span>
                                                            <span>📊 {course.level}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>
                                                            <strong>Price:</strong> ₹{course.price}
                                                        </p>
                                                        <p style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>
                                                            <strong>Rating:</strong> {course.rating ? `${course.rating}/5` : 'N/A'}
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '0.9rem' }}>
                                                            <strong>Students:</strong> {course.students || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>
                                                            <strong>Instructor:</strong> {course.instructor || 'N/A'}
                                                        </p>
                                                        <p style={{ margin: '0', fontSize: '0.9rem' }}>
                                                            <strong>Features:</strong> {course.features.length} items
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                                                <button
                                                    onClick={() => editCourse(course)}
                                                    style={{
                                                        background: '#ffc107',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteCourse(course.id)}
                                                    style={{
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FormSection>
                        )}
                    </AdminCard>

                    {/* Course Statistics Management */}
                    <AdminCard title="Course Statistics Management" icon="📊" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Manage Course Statistics">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Control the statistics displayed on the Courses page. These numbers will be shown to visitors.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Courses:</label>
                                    <input
                                        type="number"
                                        value={courseStats.totalCourses}
                                        onChange={(e) => setCourseStats({...courseStats, totalCourses: parseInt(e.target.value) || 0})}
                                        placeholder="e.g., 25"
                                        className="admin-input"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Students:</label>
                                    <input
                                        type="number"
                                        value={courseStats.totalStudents}
                                        onChange={(e) => setCourseStats({...courseStats, totalStudents: parseInt(e.target.value) || 0})}
                                        placeholder="e.g., 5000"
                                        className="admin-input"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Average Rating:</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={courseStats.averageRating}
                                        onChange={(e) => setCourseStats({...courseStats, averageRating: parseFloat(e.target.value) || 0})}
                                        placeholder="e.g., 4.8"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Categories:</label>
                                    <input
                                        type="number"
                                        value={courseStats.totalCategories}
                                        onChange={(e) => setCourseStats({...courseStats, totalCategories: parseInt(e.target.value) || 0})}
                                        placeholder="e.g., 8"
                                        className="admin-input"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <ActionButtons buttons={[
                                {
                                    label: 'Refresh Data',
                                    icon: '🔄',
                                    onClick: () => {
                                        // Reload courses data first
                                        loadCoursesData();
                                        loadCourseCategories();
                                        
                                        // Then recalculate statistics
                                        setTimeout(() => {
                                            updateCourseStatsFromCourses();
                                            setCourseUpdateStatus('Data refreshed and statistics recalculated from current courses!');
                                            setTimeout(() => setCourseUpdateStatus(''), 3000);
                                        }, 100);
                                    },
                                    variant: 'success'
                                },
                                {
                                    label: 'Update Statistics',
                                    onClick: () => {
                                        try {
                                            localStorage.setItem('courseStats', JSON.stringify(courseStats));
                                            setCourseUpdateStatus('Course statistics updated successfully!');
                                            setTimeout(() => setCourseUpdateStatus(''), 3000);
                                        } catch (error) {
                                            setCourseUpdateStatus(`Error updating statistics: ${error.message}`);
                                            setTimeout(() => setCourseUpdateStatus(''), 3000);
                                        }
                                    },
                                    variant: 'primary'
                                },
                                {
                                    label: 'Reset to Defaults',
                                    onClick: () => {
                                        if (window.confirm('Are you sure you want to reset statistics to default values?')) {
                                            const defaultStats = {
                                                totalCourses: 6,
                                                totalStudents: 6740,
                                                averageRating: 4.8,
                                                totalCategories: 5
                                            };
                                            setCourseStats(defaultStats);
                                            localStorage.setItem('courseStats', JSON.stringify(defaultStats));
                                            setCourseUpdateStatus('Course statistics reset to defaults!');
                                            setTimeout(() => setCourseUpdateStatus(''), 3000);
                                        }
                                    },
                                    variant: 'secondary'
                                },
                                {
                                    label: 'Auto-Calculate from Courses',
                                    onClick: () => {
                                        updateCourseStatsFromCourses();
                                        setCourseUpdateStatus('Statistics auto-calculated from current courses!');
                                        setTimeout(() => setCourseUpdateStatus(''), 3000);
                                    },
                                    variant: 'info'
                                }
                            ]} />

                            {/* Current Statistics Preview */}
                            <FormSection title="Current Statistics Preview">
                                <div style={{ marginBottom: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px', fontSize: '0.9rem' }}>
                                    <strong>Debug Info:</strong> Found {courses.length} courses in system
                                    {courses.length > 0 && (
                                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#666' }}>
                                            Sample course: {courses[0]?.title} (Students: {courses[0]?.students}, Rating: {courses[0]?.rating})
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '15px',
                                    padding: '20px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', color: '#007bff', fontWeight: 'bold' }}>
                                            {courseStats.totalCourses || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Courses</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', color: '#007bff', fontWeight: 'bold' }}>
                                            {courseStats.totalStudents ? courseStats.totalStudents.toLocaleString() : 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Students Enrolled</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', color: '#007bff', fontWeight: 'bold' }}>
                                            {courseStats.averageRating ? `${courseStats.averageRating}/5` : 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Average Rating</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', color: '#007bff', fontWeight: 'bold' }}>
                                            {courseStats.totalCategories}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Categories</div>
                                    </div>
                                </div>
                                <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                                    This is how the statistics will appear on the Courses page
                                </p>
                            </FormSection>

                            <StatusIndicator status={courseUpdateStatus} />
                        </FormSection>
                    </AdminCard>

                    {/* Category Management */}
                    <AdminCard title="Category Management" icon="🏷️" collapsible={true} defaultExpanded={false}>
                        <FormSection title={editingCategory ? "Edit Category" : "Add New Category"}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category Name:</label>
                                    <input
                                        type="text"
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                        placeholder="e.g., Programming, Design, Marketing"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                                    <input
                                        type="text"
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                        placeholder="Brief description of the category"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <ActionButtons
                                buttons={[
                                    {
                                        label: editingCategory ? 'Update Category' : 'Add Category',
                                        icon: editingCategory ? '✏️' : '➕',
                                        onClick: editingCategory ? updateCategory : addCategory,
                                        variant: 'primary'
                                    },
                                    ...(editingCategory ? [{
                                        label: 'Cancel Edit',
                                        icon: '❌',
                                        onClick: cancelCategoryEdit,
                                        variant: 'secondary'
                                    }] : [])
                                ]}
                                status={categoryUpdateStatus}
                            />
                        </FormSection>

                        {courseCategories.length > 0 && (
                            <FormSection title="Existing Categories">
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {courseCategories.map(category => (
                                        <div key={category.id} style={{
                                            padding: '15px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            backgroundColor: editingCategory === category.id ? '#f0f9ff' : 'white'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>
                                                        {category.name}
                                                    </h4>
                                                    <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                                                        {category.description || 'No description'}
                                                    </p>
                                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                        ID: {category.id} | 
                                                        Courses using this category: {courses.filter(course => course.category === category.id).length}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                                                    <button
                                                        onClick={() => editCategory(category)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCategory(category.id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </FormSection>
                        )}

                        <FormSection title="Category Management Tips">
                            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Tips:</h4>
                                <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px', color: '#1e40af' }}>
                                    <li>Category names should be clear and descriptive</li>
                                    <li>Categories cannot be deleted if courses are using them</li>
                                    <li>Category IDs are auto-generated from names (lowercase, hyphenated)</li>
                                    <li>Categories appear as filter buttons on the Courses page</li>
                                </ul>
                                
                                {courseCategories.length === 0 && (
                                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #bfdbfe' }}>
                                        <p style={{ margin: '0 0 10px 0', color: '#1e40af', fontWeight: 'bold' }}>
                                            🚀 Quick Start:
                                        </p>
                                        <button
                                            onClick={createDefaultCategories}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✨ Create Default Categories
                                        </button>
                                    </div>
                                )}
                            </div>
                        </FormSection>
                    </AdminCard>

                    {/* Course Enrollment Form Configuration */}
                    <AdminCard title="Course Enrollment Form Configuration" icon="📝" collapsible={true} defaultExpanded={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '0.9rem', color: enrollmentFormConfig.isEnabled ? '#28a745' : '#dc3545' }}>
                                    {enrollmentFormConfig.isEnabled ? '✅ Enabled' : '❌ Disabled'}
                                </span>
                                <button
                                    onClick={toggleEnrollmentForm}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: enrollmentFormConfig.isEnabled ? '#dc3545' : '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {enrollmentFormConfig.isEnabled ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>

                        {/* Form Type Selection */}
                        <FormSection title="Form Type Configuration">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    padding: '10px', 
                                    border: '2px solid', 
                                    borderColor: enrollmentFormConfig.formType === 'google_form' ? '#007bff' : '#dee2e6', 
                                    borderRadius: '6px', 
                                    backgroundColor: enrollmentFormConfig.formType === 'google_form' ? '#e3f2fd' : 'white' 
                                }}>
                                    <input
                                        type="radio"
                                        name="formType"
                                        value="google_form"
                                        checked={enrollmentFormConfig.formType === 'google_form'}
                                        onChange={(e) => updateFormType(e.target.value)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#495057' }}>Google Forms</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Use Google Forms for enrollment</div>
                                    </div>
                                </label>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    padding: '10px', 
                                    border: '2px solid', 
                                    borderColor: enrollmentFormConfig.formType === 'custom_form' ? '#007bff' : '#dee2e6', 
                                    borderRadius: '6px', 
                                    backgroundColor: enrollmentFormConfig.formType === 'custom_form' ? '#e3f2fd' : 'white' 
                                }}>
                                    <input
                                        type="radio"
                                        name="formType"
                                        value="custom_form"
                                        checked={enrollmentFormConfig.formType === 'custom_form'}
                                        onChange={(e) => updateFormType(e.target.value)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#495057' }}>Custom Form</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Built-in enrollment form</div>
                                    </div>
                                </label>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer', 
                                    padding: '10px', 
                                    border: '2px solid', 
                                    borderColor: enrollmentFormConfig.formType === 'external_link' ? '#007bff' : '#dee2e6', 
                                    borderRadius: '6px', 
                                    backgroundColor: enrollmentFormConfig.formType === 'external_link' ? '#e3f2fd' : 'white' 
                                }}>
                                    <input
                                        type="radio"
                                        name="formType"
                                        value="external_link"
                                        checked={enrollmentFormConfig.formType === 'external_link'}
                                        onChange={(e) => updateFormType(e.target.value)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#495057' }}>External Link</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Redirect to external site</div>
                                    </div>
                                </label>
                            </div>
                        </FormSection>

                        {/* Form URLs Configuration */}
                        <FormSection title="Form URLs Configuration">
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Primary Form URL *
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="url"
                                        value={enrollmentFormConfig.primaryFormURL}
                                        onChange={(e) => updateFormField('primaryFormURL', e.target.value)}
                                        placeholder={
                                            enrollmentFormConfig.formType === 'google_form' 
                                                ? "https://forms.gle/YOUR_FORM_ID or https://docs.google.com/forms/d/YOUR_FORM_ID/viewform"
                                                : enrollmentFormConfig.formType === 'external_link'
                                                ? "https://your-enrollment-site.com/enroll"
                                                : "Leave empty for built-in form"
                                        }
                                        disabled={enrollmentFormConfig.formType === 'custom_form'}
                                        className="admin-input"
                                        style={{
                                            flex: 1,
                                            backgroundColor: enrollmentFormConfig.formType === 'custom_form' ? '#f8f9fa' : 'white'
                                        }}
                                    />
                                    <button
                                        onClick={testEnrollmentForm}
                                        disabled={!enrollmentFormConfig.primaryFormURL.trim() || enrollmentFormConfig.formType === 'custom_form'}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: enrollmentFormConfig.primaryFormURL.trim() && enrollmentFormConfig.formType !== 'custom_form' ? 'pointer' : 'not-allowed',
                                            fontSize: '0.9rem',
                                            opacity: !enrollmentFormConfig.primaryFormURL.trim() || enrollmentFormConfig.formType === 'custom_form' ? 0.6 : 1
                                        }}
                                    >
                                        🔗 Test
                                    </button>
                                    <button
                                        onClick={() => {
                                            const embeddedUrl = enrollmentFormConfig.primaryFormURL.includes('docs.google.com/forms') 
                                                ? enrollmentFormConfig.primaryFormURL.replace('/viewform', '/viewform?embedded=true').replace('?embedded=true?embedded=true', '?embedded=true')
                                                : enrollmentFormConfig.primaryFormURL + (enrollmentFormConfig.primaryFormURL.includes('?') ? '&embedded=true' : '?embedded=true');
                                            console.log('Testing embedded URL:', embeddedUrl);
                                            window.open(embeddedUrl, '_blank');
                                        }}
                                        disabled={!enrollmentFormConfig.primaryFormURL.trim() || enrollmentFormConfig.formType === 'custom_form'}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: enrollmentFormConfig.primaryFormURL.trim() && enrollmentFormConfig.formType !== 'custom_form' ? 'pointer' : 'not-allowed',
                                            fontSize: '0.9rem',
                                            opacity: !enrollmentFormConfig.primaryFormURL.trim() || enrollmentFormConfig.formType === 'custom_form' ? 0.6 : 1,
                                            marginLeft: '5px'
                                        }}
                                    >
                                        🔍 Test Embedded
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    Backup Form URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={enrollmentFormConfig.backupFormURL}
                                    onChange={(e) => updateFormField('backupFormURL', e.target.value)}
                                    placeholder="Backup enrollment form URL (used if primary fails)"
                                    disabled={enrollmentFormConfig.formType === 'custom_form'}
                                    className="admin-input"
                                    style={{
                                        backgroundColor: enrollmentFormConfig.formType === 'custom_form' ? '#f8f9fa' : 'white'
                                    }}
                                />
                            </div>
                        </FormSection>

                        {/* Form Settings */}
                        <FormSection title="Form Settings">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={enrollmentFormConfig.requirePaymentScreenshot}
                                        onChange={(e) => updateFormField('requirePaymentScreenshot', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Require Payment Screenshot</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Students must upload payment proof</div>
                                    </div>
                                </label>
                                
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={enrollmentFormConfig.autoApproval}
                                        onChange={(e) => updateFormField('autoApproval', e.target.checked)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Auto-Approval</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Automatically approve enrollments</div>
                                    </div>
                                </label>
                            </div>
                        </FormSection>

                        {/* Action Buttons */}
                        <ActionButtons 
                            buttons={[
                                {
                                    label: 'Save Configuration',
                                    icon: '💾',
                                    onClick: updateEnrollmentFormConfig,
                                    variant: 'success'
                                },
                                {
                                    label: 'Reset to Defaults',
                                    icon: '🔄',
                                    onClick: resetEnrollmentFormConfig,
                                    variant: 'warning'
                                }
                            ]}
                        />

                        <StatusIndicator status={enrollmentFormUpdateStatus} />

                        {/* Current Configuration Summary */}
                        <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <h4 style={{ marginBottom: '15px', color: '#495057' }}>📊 Current Configuration Summary</h4>
                            <StatsGrid 
                                stats={[
                                    {
                                        label: 'Status',
                                        value: enrollmentFormConfig.isEnabled ? '✅ Enabled' : '❌ Disabled'
                                    },
                                    {
                                        label: 'Form Type',
                                        value: enrollmentFormConfig.formType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    },
                                    {
                                        label: 'Payment Screenshot',
                                        value: enrollmentFormConfig.requirePaymentScreenshot ? '✅ Required' : '❌ Optional'
                                    },
                                    {
                                        label: 'Auto-Approval',
                                        value: enrollmentFormConfig.autoApproval ? '✅ Enabled' : '❌ Disabled'
                                    }
                                ]}
                            />
                        </div>

                        {/* Setup Instructions */}
                        <div style={{ marginTop: '20px', padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3' }}>
                            <h4 style={{ marginBottom: '15px', color: '#1565c0' }}>📋 Setup Guide</h4>
                            <div style={{ fontSize: '0.9rem', color: '#1565c0' }}>
                                {enrollmentFormConfig.formType === 'google_form' && (
                                    <>
                                        <p><strong>📝 Google Forms Setup:</strong></p>
                                        <ol style={{ margin: '5px 0 15px 20px' }}>
                                            <li>Go to <a href="https://forms.google.com" target="_blank" rel="noopener noreferrer">forms.google.com</a></li>
                                            <li>Create a new form titled "Course Enrollment Form"</li>
                                            <li>Add fields: Name, Email, Phone, Course Selection, Payment Method, Transaction ID</li>
                                            <li>Add file upload for payment screenshot (if required)</li>
                                            <li><strong>IMPORTANT:</strong> Click the "Send" button → "Link" tab → Copy the URL</li>
                                            <li>Paste the URL in the "Primary Form URL" field above</li>
                                        </ol>
                                        
                                        <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' }}>🚨 Common Issues & Solutions:</p>
                                            <ul style={{ margin: '0', fontSize: '0.85rem', color: '#856404' }}>
                                                <li><strong>Form not loading:</strong> Make sure the form is set to "Anyone with the link can respond"</li>
                                                <li><strong>"Refused to connect" error:</strong> Google blocks iframe embedding - this is normal!</li>
                                                <li><strong>Blank iframe:</strong> Try using the direct form link instead of the shortened forms.gle link</li>
                                                <li><strong>Access denied:</strong> Check if the form requires sign-in (disable this setting)</li>
                                                <li><strong>Still not working:</strong> Use "External Link" mode instead to redirect users</li>
                                            </ul>
                                        </div>
                                        
                                        <div style={{ marginTop: '10px', padding: '15px', background: '#e8f5e8', borderRadius: '6px', border: '1px solid #4caf50' }}>
                                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '0.9rem' }}>✅ Recommended Solution:</p>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#2e7d32' }}>
                                                Since Google Forms often block embedding, we recommend using <strong>"External Link"</strong> mode instead. 
                                                This will redirect users directly to your Google Form in a new tab, which always works reliably.
                                            </p>
                                            <button
                                                onClick={() => updateFormType('external_link')}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#4caf50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                🔄 Switch to External Link Mode
                                            </button>
                                        </div>
                                        
                                        <div style={{ marginTop: '10px', padding: '15px', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #2196f3' }}>
                                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '0.9rem' }}>🎯 Smart Enrollment Mode:</p>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#1565c0' }}>
                                                The system will automatically handle Google Forms embedding issues and provide users with multiple options to access your form.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    updateFormType('google_form');
                                                    updateEnrollmentFormConfig();
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#2196f3',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                🎯 Use Smart Google Forms Mode
                                            </button>
                                        </div>
                                        
                                        <div style={{ marginTop: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #2196f3' }}>
                                            <p style={{ margin: '0', fontWeight: 'bold', color: '#1565c0', fontSize: '0.9rem' }}>📝 URL Format Examples:</p>
                                            <ul style={{ margin: '5px 0 0 15px', fontSize: '0.8rem', color: '#1565c0', fontFamily: 'monospace' }}>
                                                <li>https://docs.google.com/forms/d/1ABC123.../viewform</li>
                                                <li>https://forms.gle/ABC123</li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                                
                                {enrollmentFormConfig.formType === 'custom_form' && (
                                    <>
                                        <p><strong>🛠️ Custom Form Setup:</strong></p>
                                        <ul style={{ margin: '5px 0 15px 20px' }}>
                                            <li>Uses the built-in enrollment form modal</li>
                                            <li>Automatically handles course information</li>
                                            <li>Supports payment screenshot uploads</li>
                                            <li>Data stored in browser localStorage</li>
                                            <li>No external form configuration needed</li>
                                        </ul>
                                    </>
                                )}
                                
                                {enrollmentFormConfig.formType === 'external_link' && (
                                    <>
                                        <p><strong>🔗 External Link Setup:</strong></p>
                                        <ul style={{ margin: '5px 0 15px 20px' }}>
                                            <li>Redirects students to your external enrollment system</li>
                                            <li>Can be any website or enrollment platform</li>
                                            <li>Useful for integration with existing systems</li>
                                            <li>Configure the URL above to point to your system</li>
                                        </ul>
                                    </>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' }}>💡 Pro Tips:</p>
                                <ul style={{ margin: '0', fontSize: '0.85rem', color: '#856404' }}>
                                    <li>Test your form configuration before going live</li>
                                    <li>Enable payment screenshot requirement for paid courses</li>
                                    <li>Use backup URL for redundancy</li>
                                    <li>Regularly monitor enrollment submissions</li>
                                </ul>
                            </div>
                        </div>
                    </AdminCard>

                    {/* About Us Content Management */}
                    <AdminCard title="About Us Content" icon="📖" collapsible={true} defaultExpanded={false}>
                        {/* Mission Section */}
                        <FormSection title="Our Mission">
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mission Paragraph 1:</label>
                                <textarea
                                    value={aboutUsContent.mission.paragraph1}
                                    onChange={(e) => updateMission('paragraph1', e.target.value)}
                                    placeholder="Enter first paragraph of mission statement"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mission Paragraph 2:</label>
                                <textarea
                                    value={aboutUsContent.mission.paragraph2}
                                    onChange={(e) => updateMission('paragraph2', e.target.value)}
                                    placeholder="Enter second paragraph of mission statement"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>
                        </FormSection>

                        {/* Vision Section */}
                        <FormSection title="Our Vision">
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vision Paragraph 1:</label>
                                <textarea
                                    value={aboutUsContent.vision.paragraph1}
                                    onChange={(e) => updateVision('paragraph1', e.target.value)}
                                    placeholder="Enter first paragraph of vision statement"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vision Paragraph 2:</label>
                                <textarea
                                    value={aboutUsContent.vision.paragraph2}
                                    onChange={(e) => updateVision('paragraph2', e.target.value)}
                                    placeholder="Enter second paragraph of vision statement"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>
                        </FormSection>

                        {/* Values Section */}
                        <FormSection title="Our Values">
                            {aboutUsContent.values.map((value, index) => (
                                <div key={value.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <h4 style={{ marginBottom: '10px' }}>Value {index + 1}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
                                            <input
                                                type="text"
                                                value={value.title}
                                                onChange={(e) => updateValue(value.id, 'title', e.target.value)}
                                                placeholder="Value title"
                                                className="admin-input"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Icon:</label>
                                            <input
                                                type="text"
                                                value={value.icon}
                                                onChange={(e) => updateValue(value.id, 'icon', e.target.value)}
                                                placeholder="Emoji icon (e.g., 🎯)"
                                                className="admin-input"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                                        <textarea
                                            value={value.description}
                                            onChange={(e) => updateValue(value.id, 'description', e.target.value)}
                                            placeholder="Value description"
                                            className="admin-textarea"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            ))}
                        </FormSection>

                        <ActionButtons 
                            buttons={[
                                {
                                    label: 'Update About Us Content',
                                    icon: '💾',
                                    onClick: updateAboutUsContent,
                                    variant: 'success'
                                }
                            ]}
                        />

                        <StatusIndicator status={aboutUsUpdateStatus} />
                    </AdminCard>

                    {/* Team Management */}
                    <AdminCard title="Team Management" icon="👥" collapsible={true} defaultExpanded={false}>
                        <FormSection title={editingTeamMember ? "Edit Team Member" : "Add New Team Member"}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name *:</label>
                                    <input
                                        type="text"
                                        value={teamForm.name}
                                        onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                                        placeholder="Team member name"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Position *:</label>
                                    <input
                                        type="text"
                                        value={teamForm.position}
                                        onChange={(e) => setTeamForm({...teamForm, position: e.target.value})}
                                        placeholder="Job position/title"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                                    <input
                                        type="email"
                                        value={teamForm.email}
                                        onChange={(e) => setTeamForm({...teamForm, email: e.target.value})}
                                        placeholder="Email address"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>LinkedIn URL:</label>
                                    <input
                                        type="url"
                                        value={teamForm.linkedin}
                                        onChange={(e) => setTeamForm({...teamForm, linkedin: e.target.value})}
                                        placeholder="LinkedIn profile URL"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Image URL:</label>
                                <input
                                    type="url"
                                    value={teamForm.imageUrl}
                                    onChange={(e) => setTeamForm({...teamForm, imageUrl: e.target.value})}
                                    placeholder="Profile image URL"
                                    className="admin-input"
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *:</label>
                                <textarea
                                    value={teamForm.description}
                                    onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                                    placeholder="Brief description about the team member"
                                    className="admin-textarea"
                                    rows="3"
                                />
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: editingTeamMember ? 'Update Team Member' : 'Add Team Member',
                                        icon: editingTeamMember ? '✏️' : '➕',
                                        onClick: editingTeamMember ? updateTeamMember : addTeamMember,
                                        variant: 'primary'
                                    },
                                    ...(editingTeamMember ? [{
                                        label: 'Cancel Edit',
                                        icon: '❌',
                                        onClick: () => {
                                            setEditingTeamMember(null);
                                            setTeamForm({
                                                name: '',
                                                position: '',
                                                description: '',
                                                imageUrl: '',
                                                email: '',
                                                linkedin: ''
                                            });
                                        },
                                        variant: 'secondary'
                                    }] : [])
                                ]}
                            />
                        </FormSection>

                        <StatsGrid 
                            stats={[
                                {
                                    label: 'Total Team Members',
                                    value: teamMembers.length
                                },
                                {
                                    label: 'Members with Email',
                                    value: teamMembers.filter(member => member.email).length
                                },
                                {
                                    label: 'Members with LinkedIn',
                                    value: teamMembers.filter(member => member.linkedin).length
                                }
                            ]}
                        />

                        <StatusIndicator status={teamUpdateStatus} />

                        {teamMembers.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ marginBottom: '15px' }}>Current Team Members</h4>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {teamMembers.map(member => (
                                        <div key={member.id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '15px', 
                                            border: '1px solid #ddd', 
                                            borderRadius: '5px', 
                                            marginBottom: '10px',
                                            background: 'white'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <h5 style={{ margin: '0 0 5px 0' }}>{member.name}</h5>
                                                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>{member.position}</p>
                                                <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>
                                                    {member.description.length > 100 
                                                        ? member.description.substring(0, 100) + '...' 
                                                        : member.description}
                                                </p>
                                                {(member.email || member.linkedin) && (
                                                    <div style={{ marginTop: '5px' }}>
                                                        {member.email && <span style={{ fontSize: '0.8rem', color: '#007bff' }}>📧 {member.email}</span>}
                                                        {member.email && member.linkedin && <span style={{ margin: '0 10px' }}>|</span>}
                                                        {member.linkedin && <span style={{ fontSize: '0.8rem', color: '#007bff' }}>💼 LinkedIn</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => editTeamMember(member)}
                                                    style={{
                                                        background: '#ffc107',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteTeamMember(member.id)}
                                                    style={{
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AdminCard>

                    {/* Footer Content Management */}
                    <AdminCard title="Website Branding & Footer Management" icon="🏢" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Website Branding">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Manage your website's brand identity including name, title, and welcome message used across the site.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Website Name:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.websiteName}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, websiteName: e.target.value })}
                                        placeholder="EduPlatform"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Appears in header logo and throughout the site
                                    </small>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Website Title:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.websiteTitle}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, websiteTitle: e.target.value })}
                                        placeholder="EduPlatform - Professional Courses"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Appears in browser tab title
                                    </small>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Welcome Message:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.welcomeMessage}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, welcomeMessage: e.target.value })}
                                        placeholder="Welcome to EduPlatform"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Appears on the home page hero section
                                    </small>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Contact Information">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Manage contact information displayed in your website footer.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address:</label>
                                    <input
                                        type="email"
                                        value={footerContactInfo.email}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, email: e.target.value })}
                                        placeholder="info@yourcompany.com"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number:</label>
                                    <input
                                        type="tel"
                                        value={footerContactInfo.phone}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, phone: e.target.value })}
                                        placeholder="+91 12345 67890"
                                        className="admin-input"
                                    />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address:</label>
                                    <textarea
                                        value={footerContactInfo.address}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, address: e.target.value })}
                                        placeholder="123 Business Street, City, State, ZIP Code"
                                        className="admin-input"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Company Name:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.companyName}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, companyName: e.target.value })}
                                        placeholder="Your Company Name"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Appears in the copyright notice
                                    </small>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Footer Tagline:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.tagline}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, tagline: e.target.value })}
                                        placeholder="Designed with ❤️ for education"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Appears at the bottom of the footer
                                    </small>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Copyright Text:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.copyrightText}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, copyrightText: e.target.value })}
                                        placeholder="© 2024 EduPlatform. All rights reserved."
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Complete copyright text that appears in the footer bottom
                                    </small>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Stay Updated Section">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Manage the "Stay Updated" newsletter section content in the footer.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Section Title:</label>
                                    <input
                                        type="text"
                                        value={footerContactInfo.stayUpdatedTitle}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, stayUpdatedTitle: e.target.value })}
                                        placeholder="Stay Updated"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                                    <textarea
                                        value={footerContactInfo.stayUpdatedDescription}
                                        onChange={(e) => setFooterContactInfo({ ...footerContactInfo, stayUpdatedDescription: e.target.value })}
                                        placeholder="Get the latest updates about our courses and certifications"
                                        className="admin-input"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <ActionButtons buttons={[
                            {
                                label: 'Update Website Branding & Footer',
                                icon: '🏢',
                                onClick: updateFooterContactInfo,
                                variant: 'primary'
                            },
                            {
                                label: 'Reset to Defaults',
                                icon: '�',
                                onClick: () => {
                                    if (window.confirm('Are you sure you want to reset all branding and footer content to defaults?')) {
                                        const defaultContactInfo = {
                                            email: 'info@eduplatform.com',
                                            phone: '+91 83406 85926',
                                            address: '123 Education Street, Learning City, LC 12345',
                                            companyName: 'EduPlatform',
                                            tagline: 'Designed with ❤️ for education',
                                            stayUpdatedTitle: 'Stay Updated',
                                            stayUpdatedDescription: 'Get the latest updates about our courses and certifications',
                                            websiteName: 'EduPlatform',
                                            websiteTitle: 'EduPlatform - Professional Courses',
                                            welcomeMessage: 'Welcome to EduPlatform',
                                            copyrightText: '© 2024 EduPlatform. All rights reserved.'
                                        };
                                        setFooterContactInfo(defaultContactInfo);
                                        localStorage.setItem('footerContactInfo', JSON.stringify(defaultContactInfo));
                                        setFooterContactUpdateStatus('All content reset to defaults');
                                        setTimeout(() => setFooterContactUpdateStatus(''), 3000);
                                    }
                                },
                                variant: 'secondary'
                            }
                        ]} />

                        <StatusIndicator status={footerContactUpdateStatus} />

                        {/* Current Content Preview */}
                        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <h4 style={{ marginBottom: '10px', color: '#495057' }}>Current Website Content</h4>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>🏢 Website Branding:</strong>
                                    <p style={{ margin: '5px 0' }}>🌐 Website Name: {footerContactInfo.websiteName || 'EduPlatform'}</p>
                                    <p style={{ margin: '5px 0' }}>📑 Website Title: {footerContactInfo.websiteTitle || 'EduPlatform - Professional Courses'}</p>
                                    <p style={{ margin: '5px 0' }}>👋 Welcome Message: {footerContactInfo.welcomeMessage || 'Welcome to EduPlatform'}</p>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>📞 Contact Information:</strong>
                                    <p style={{ margin: '5px 0' }}>📧 Email: {footerContactInfo.email || 'Not set'}</p>
                                    <p style={{ margin: '5px 0' }}>📞 Phone: {footerContactInfo.phone || 'Not set'}</p>
                                    <p style={{ margin: '5px 0' }}>📍 Address: {footerContactInfo.address || 'Not set'}</p>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>🏢 Company Details:</strong>
                                    <p style={{ margin: '5px 0' }}>🏢 Company Name: {footerContactInfo.companyName || 'Not set'}</p>
                                    <p style={{ margin: '5px 0' }}>💝 Tagline: {footerContactInfo.tagline || 'Not set'}</p>
                                    <p style={{ margin: '5px 0' }}>©️ Copyright: {footerContactInfo.copyrightText || '© 2024 EduPlatform. All rights reserved.'}</p>
                                </div>
                                <div>
                                    <strong>📰 Stay Updated Section:</strong>
                                    <p style={{ margin: '5px 0' }}>📰 Title: {footerContactInfo.stayUpdatedTitle || 'Stay Updated'}</p>
                                    <p style={{ margin: '5px 0' }}>📝 Description: {footerContactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Branding & Footer Tips */}
                        <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                            <h4 style={{ marginBottom: '10px', color: '#856404' }}>💡 Website Branding Tips</h4>
                            <ul style={{ margin: '0', fontSize: '0.85rem', color: '#856404' }}>
                                <li><strong>Website Name:</strong> Keep it short and memorable (appears in header logo)</li>
                                <li><strong>Website Title:</strong> Include keywords for SEO (appears in browser tab)</li>
                                <li><strong>Welcome Message:</strong> Make it engaging and welcoming (home page hero)</li>
                                <li><strong>Company Name:</strong> Used in copyright and legal contexts</li>
                                <li><strong>Copyright Text:</strong> Complete copyright notice (include year and rights statement)</li>
                                <li><strong>Contact Info:</strong> Keep accurate and up-to-date for customer trust</li>
                                <li><strong>Note:</strong> Changes take effect immediately across the website</li>
                            </ul>
                        </div>
                    </AdminCard>

                    {/* Feedback Management */}
                    <AdminCard title="Feedback Management" icon="💬" collapsible={true} defaultExpanded={false}>
                        {/* Feedback URLs Configuration */}
                        <FormSection title="Google Sheets Configuration">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Student Feedback Read URL:</label>
                                    <input
                                        type="url"
                                        value={readSheetURL}
                                        onChange={(e) => setReadSheetURL(e.target.value)}
                                        placeholder="Google Sheets CSV export URL for student feedback"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        CSV export URL from Google Sheets containing student feedback data
                                    </small>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Faculty Feedback Read URL:</label>
                                    <input
                                        type="url"
                                        value={facultyReadSheetURL}
                                        onChange={(e) => setFacultyReadSheetURL(e.target.value)}
                                        placeholder="Google Sheets CSV export URL for faculty feedback"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        CSV export URL from Google Sheets containing faculty feedback data
                                    </small>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Feedback Form URL:</label>
                                    <input
                                        type="url"
                                        value={writeSheetURL}
                                        onChange={(e) => setWriteSheetURL(e.target.value)}
                                        placeholder="Google Form URL for collecting feedback"
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                        Google Form URL that users will use to submit feedback
                                    </small>
                                </div>
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: 'Update Student URL',
                                        icon: '📊',
                                        onClick: updateReadSheetURL,
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'Update Faculty URL',
                                        icon: '👨‍🏫',
                                        onClick: updateFacultyReadSheetURL,
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'Update Form URL',
                                        icon: '📝',
                                        onClick: updateWriteSheetURL,
                                        variant: 'success'
                                    },
                                    {
                                        label: 'Test Form',
                                        icon: '🔗',
                                        onClick: testFeedbackForm,
                                        variant: 'secondary'
                                    }
                                ]}
                            />
                        </FormSection>

                        {/* Public Feedback Statistics Management */}
                        <FormSection title="Public Website Statistics">
                            <p style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
                                These statistics are displayed on the public Feedback page. You can manually set them or auto-calculate from your feedback data.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                {/* Average Rating */}
                                <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Average Rating</h5>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Rating Value:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.averageRating}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, averageRating: e.target.value})}
                                            placeholder="e.g., 4.8/5"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.averageRatingDescription}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, averageRatingDescription: e.target.value})}
                                            placeholder="e.g., Based on 1,200+ student reviews"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>

                                {/* Satisfaction Rate */}
                                <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Satisfaction Rate</h5>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Rate Value:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.satisfactionRate}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, satisfactionRate: e.target.value})}
                                            placeholder="e.g., 96%"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.satisfactionRateDescription}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, satisfactionRateDescription: e.target.value})}
                                            placeholder="e.g., Students would recommend our courses"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>

                                {/* Response Time */}
                                <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
                                    <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Response Time</h5>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Time Value:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.responseTime}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, responseTime: e.target.value})}
                                            placeholder="e.g., 24hrs"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={publicFeedbackStats.responseTimeDescription}
                                            onChange={(e) => setPublicFeedbackStats({...publicFeedbackStats, responseTimeDescription: e.target.value})}
                                            placeholder="e.g., Average time to address feedback"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            <ActionButtons 
                                buttons={[
                                    {
                                        label: 'Update Statistics',
                                        icon: '💾',
                                        onClick: updatePublicFeedbackStats,
                                        variant: 'success'
                                    },
                                    {
                                        label: 'Auto-Calculate',
                                        icon: '🔢',
                                        onClick: autoCalculateStats,
                                        variant: 'primary'
                                    },
                                    {
                                        label: 'Reset to Defaults',
                                        icon: '🔄',
                                        onClick: resetPublicFeedbackStats,
                                        variant: 'secondary'
                                    }
                                ]}
                            />

                            <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
                                <h6 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>Preview:</h6>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '0.8rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.averageRating}</div>
                                        <div style={{ fontWeight: 'bold' }}>Average Rating</div>
                                        <div style={{ color: '#666' }}>{publicFeedbackStats.averageRatingDescription}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.satisfactionRate}</div>
                                        <div style={{ fontWeight: 'bold' }}>Satisfaction Rate</div>
                                        <div style={{ color: '#666' }}>{publicFeedbackStats.satisfactionRateDescription}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.responseTime}</div>
                                        <div style={{ fontWeight: 'bold' }}>Response Time</div>
                                        <div style={{ color: '#666' }}>{publicFeedbackStats.responseTimeDescription}</div>
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        {/* Feedback Statistics */}
                        <FormSection title="Internal Analytics">
                            <StatsGrid 
                                stats={[
                                    {
                                        label: 'Student Feedback',
                                        value: feedbackStats.totalStudentFeedback
                                    },
                                    {
                                        label: 'Faculty Feedback',
                                        value: feedbackStats.totalFacultyFeedback
                                    },
                                    {
                                        label: 'Avg Student Rating',
                                        value: feedbackStats.averageStudentRating > 0 ? `${feedbackStats.averageStudentRating}/5` : 'N/A'
                                    },
                                    {
                                        label: 'Avg Faculty Rating',
                                        value: feedbackStats.averageFacultyRating > 0 ? `${feedbackStats.averageFacultyRating}/5` : 'N/A'
                                    },
                                    {
                                        label: 'Recent (30 days)',
                                        value: feedbackStats.recentFeedbackCount
                                    }
                                ]}
                            />
                        </FormSection>

                        <StatusIndicator status={publicStatsUpdateStatus} />

                        {/* Student Feedback Data */}
                        <FormSection title="Student Feedback Data">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0 }}>Student Feedback ({feedbackData.length} total)</h4>
                                <ActionButtons 
                                    buttons={[
                                        {
                                            label: feedbackLoading ? 'Loading...' : 'Refresh Data',
                                            icon: '🔄',
                                            onClick: loadFeedbackData,
                                            disabled: feedbackLoading,
                                            variant: 'secondary'
                                        },
                                        {
                                            label: 'Export CSV',
                                            icon: '📥',
                                            onClick: exportStudentFeedback,
                                            variant: 'success'
                                        }
                                    ]}
                                />
                            </div>

                            {feedbackError && (
                                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                                    ❌ {feedbackError}
                                </div>
                            )}

                            {feedbackLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Loading student feedback...
                                </div>
                            ) : feedbackData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No student feedback data available. Check your Google Sheets URL.
                                </div>
                            ) : (
                                <>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        {getPaginatedData(feedbackData, feedbackPage, feedbackItemsPerPage).map((feedback, index) => (
                                            <div key={feedback.id || index} style={{ 
                                                padding: '15px', 
                                                borderBottom: '1px solid #eee',
                                                background: index % 2 === 0 ? '#f9f9f9' : 'white'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 5px 0' }}>{feedback.name || 'Anonymous'}</h5>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                                            {feedback.course || 'No course specified'} | {feedback.email || 'No email'}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
                                                            {'⭐'.repeat(feedback.rating || 0)}{'☆'.repeat(5 - (feedback.rating || 0))}
                                                        </div>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.8rem' }}>
                                                            {feedback.timestamp ? new Date(feedback.timestamp).toLocaleDateString() : 'No date'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                    {feedback.message || 'No message provided'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Student Feedback Pagination */}
                                    {getTotalPages(feedbackData.length, feedbackItemsPerPage) > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                            <button
                                                onClick={() => setFeedbackPage(Math.max(1, feedbackPage - 1))}
                                                disabled={feedbackPage === 1}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: feedbackPage === 1 ? '#f5f5f5' : 'white',
                                                    cursor: feedbackPage === 1 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                ← Previous
                                            </button>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                                Page {feedbackPage} of {getTotalPages(feedbackData.length, feedbackItemsPerPage)}
                                            </span>
                                            <button
                                                onClick={() => setFeedbackPage(Math.min(getTotalPages(feedbackData.length, feedbackItemsPerPage), feedbackPage + 1))}
                                                disabled={feedbackPage === getTotalPages(feedbackData.length, feedbackItemsPerPage)}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: feedbackPage === getTotalPages(feedbackData.length, feedbackItemsPerPage) ? '#f5f5f5' : 'white',
                                                    cursor: feedbackPage === getTotalPages(feedbackData.length, feedbackItemsPerPage) ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </FormSection>

                        {/* Faculty Feedback Data */}
                        <FormSection title="Faculty Feedback Data">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0 }}>Faculty Feedback ({facultyFeedbackData.length} total)</h4>
                                <ActionButtons 
                                    buttons={[
                                        {
                                            label: facultyFeedbackLoading ? 'Loading...' : 'Refresh Data',
                                            icon: '🔄',
                                            onClick: loadFacultyFeedbackData,
                                            disabled: facultyFeedbackLoading,
                                            variant: 'secondary'
                                        },
                                        {
                                            label: 'Export CSV',
                                            icon: '📥',
                                            onClick: exportFacultyFeedback,
                                            variant: 'success'
                                        }
                                    ]}
                                />
                            </div>

                            {facultyFeedbackError && (
                                <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                                    ❌ {facultyFeedbackError}
                                </div>
                            )}

                            {facultyFeedbackLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    Loading faculty feedback...
                                </div>
                            ) : facultyFeedbackData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No faculty feedback data available. Check your Google Sheets URL.
                                </div>
                            ) : (
                                <>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        {getPaginatedData(facultyFeedbackData, facultyFeedbackPage, feedbackItemsPerPage).map((feedback, index) => (
                                            <div key={feedback.id || index} style={{ 
                                                padding: '15px', 
                                                borderBottom: '1px solid #eee',
                                                background: index % 2 === 0 ? '#f9f9f9' : 'white'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 5px 0' }}>{feedback.name || 'Anonymous'}</h5>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                                            {feedback.course || 'No course specified'} | {feedback.email || 'No email'}
                                                        </p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
                                                            {'⭐'.repeat(feedback.rating || 0)}{'☆'.repeat(5 - (feedback.rating || 0))}
                                                        </div>
                                                        <p style={{ margin: '0', color: '#666', fontSize: '0.8rem' }}>
                                                            {feedback.timestamp ? new Date(feedback.timestamp).toLocaleDateString() : 'No date'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                                    {feedback.message || 'No message provided'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Faculty Feedback Pagination */}
                                    {getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage) > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                                            <button
                                                onClick={() => setFacultyFeedbackPage(Math.max(1, facultyFeedbackPage - 1))}
                                                disabled={facultyFeedbackPage === 1}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: facultyFeedbackPage === 1 ? '#f5f5f5' : 'white',
                                                    cursor: facultyFeedbackPage === 1 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                ← Previous
                                            </button>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                                Page {facultyFeedbackPage} of {getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage)}
                                            </span>
                                            <button
                                                onClick={() => setFacultyFeedbackPage(Math.min(getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage), facultyFeedbackPage + 1))}
                                                disabled={facultyFeedbackPage === getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage)}
                                                style={{
                                                    padding: '5px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '3px',
                                                    background: facultyFeedbackPage === getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage) ? '#f5f5f5' : 'white',
                                                    cursor: facultyFeedbackPage === getTotalPages(facultyFeedbackData.length, feedbackItemsPerPage) ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </FormSection>

                        <StatusIndicator status={urlUpdateStatus || facultyUrlUpdateStatus || publicStatsUpdateStatus} />
                    </AdminCard>

                    {/* Social Media Management */}
                    <AdminCard title="Social Media Management" icon="🌐" collapsible={true} defaultExpanded={false}>
                        <FormSection title="Social Media Links">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Manage your social media links that appear in the footer. Leave fields empty to hide specific social media icons.
                            </p>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Facebook URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.facebook}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, facebook: e.target.value })}
                                        placeholder="https://facebook.com/yourpage"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Twitter/X URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.twitter}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, twitter: e.target.value })}
                                        placeholder="https://twitter.com/yourhandle"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Instagram URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.instagram}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, instagram: e.target.value })}
                                        placeholder="https://instagram.com/yourprofile"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>LinkedIn URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.linkedin}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/company/yourcompany"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>YouTube URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.youtube}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, youtube: e.target.value })}
                                        placeholder="https://youtube.com/channel/yourchannel"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>WhatsApp URL:</label>
                                    <input
                                        type="url"
                                        value={socialMediaLinks.whatsapp}
                                        onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, whatsapp: e.target.value })}
                                        placeholder="https://wa.me/1234567890"
                                        className="admin-input"
                                    />
                                </div>
                            </div>

                            <ActionButtons buttons={[
                                {
                                    label: 'Update Social Media Links',
                                    icon: '🌐',
                                    onClick: updateSocialMediaLinks,
                                    variant: 'primary'
                                },
                                {
                                    label: 'Clear All Links',
                                    icon: '🗑️',
                                    onClick: () => {
                                        if (window.confirm('Are you sure you want to clear all social media links?')) {
                                            const emptyLinks = {
                                                facebook: '',
                                                twitter: '',
                                                instagram: '',
                                                linkedin: '',
                                                youtube: '',
                                                whatsapp: ''
                                            };
                                            setSocialMediaLinks(emptyLinks);
                                            localStorage.setItem('socialMediaLinks', JSON.stringify(emptyLinks));
                                            setSocialMediaUpdateStatus('All social media links cleared');
                                            setTimeout(() => setSocialMediaUpdateStatus(''), 3000);
                                        }
                                    },
                                    variant: 'secondary'
                                }
                            ]} />

                            <StatusIndicator status={socialMediaUpdateStatus} />

                            {/* Current Social Media Links Preview */}
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                <h4 style={{ marginBottom: '10px', color: '#495057' }}>Current Social Media Links</h4>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {Object.entries(socialMediaLinks).map(([platform, url]) => (
                                        <p key={platform} style={{ margin: '5px 0' }}>
                                            <strong>{platform.charAt(0).toUpperCase() + platform.slice(1)}:</strong> {url || 'Not set'}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Social Media Tips */}
                            <div style={{ marginTop: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                                <h4 style={{ marginBottom: '10px', color: '#1976d2' }}>💡 Social Media Tips</h4>
                                <ul style={{ margin: '0', fontSize: '0.85rem', color: '#1976d2' }}>
                                    <li>Use complete URLs including https://</li>
                                    <li>For WhatsApp, use format: https://wa.me/1234567890</li>
                                    <li>Empty fields will hide the corresponding social media icon</li>
                                    <li>Test your links after updating to ensure they work correctly</li>
                                </ul>
                            </div>
                        </FormSection>
                    </AdminCard>

                    {/* Home Page Content Management */}
                    <AdminCard title="Home Page Content Management" icon="🏠" collapsible={true} defaultExpanded={false}>
                        
                        {/* Hero Section */}
                        <FormSection title="Hero Section">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hero Title:</label>
                                    <input
                                        type="text"
                                        value={homePageContent.hero.title}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            hero: { ...homePageContent.hero, title: e.target.value }
                                        })}
                                        placeholder="Welcome to EduPlatform"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hero Subtitle:</label>
                                    <textarea
                                        value={homePageContent.hero.subtitle}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            hero: { ...homePageContent.hero, subtitle: e.target.value }
                                        })}
                                        placeholder="Transform your career with our professional courses..."
                                        className="admin-input"
                                        rows="3"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Primary Button Text:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.hero.primaryButtonText}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                hero: { ...homePageContent.hero, primaryButtonText: e.target.value }
                                            })}
                                            placeholder="Explore Courses"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Secondary Button Text:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.hero.secondaryButtonText}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                hero: { ...homePageContent.hero, secondaryButtonText: e.target.value }
                                            })}
                                            placeholder="Verify Certificate"
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        {/* Features Section */}
                        <FormSection title="Features Section">
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Section Title:</label>
                                <input
                                    type="text"
                                    value={homePageContent.features.sectionTitle}
                                    onChange={(e) => setHomePageContent({
                                        ...homePageContent,
                                        features: { ...homePageContent.features, sectionTitle: e.target.value }
                                    })}
                                    placeholder="Why Choose Us?"
                                    className="admin-input"
                                />
                            </div>

                            {/* Feature 1 */}
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Feature 1</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Icon:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature1.icon}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature1: { ...homePageContent.features.feature1, icon: e.target.value }
                                                }
                                            })}
                                            placeholder="🎓"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Title:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature1.title}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature1: { ...homePageContent.features.feature1, title: e.target.value }
                                                }
                                            })}
                                            placeholder="Expert Instructors"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature1.description}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature1: { ...homePageContent.features.feature1, description: e.target.value }
                                                }
                                            })}
                                            placeholder="Learn from industry professionals..."
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Feature 2</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Icon:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature2.icon}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature2: { ...homePageContent.features.feature2, icon: e.target.value }
                                                }
                                            })}
                                            placeholder="📜"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Title:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature2.title}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature2: { ...homePageContent.features.feature2, title: e.target.value }
                                                }
                                            })}
                                            placeholder="Certified Courses"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature2.description}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature2: { ...homePageContent.features.feature2, description: e.target.value }
                                                }
                                            })}
                                            placeholder="Get recognized certificates..."
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Feature 3</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Icon:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature3.icon}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature3: { ...homePageContent.features.feature3, icon: e.target.value }
                                                }
                                            })}
                                            placeholder="💻"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Title:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature3.title}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature3: { ...homePageContent.features.feature3, title: e.target.value }
                                                }
                                            })}
                                            placeholder="Online Learning"
                                            className="admin-input"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                                        <input
                                            type="text"
                                            value={homePageContent.features.feature3.description}
                                            onChange={(e) => setHomePageContent({
                                                ...homePageContent,
                                                features: {
                                                    ...homePageContent.features,
                                                    feature3: { ...homePageContent.features.feature3, description: e.target.value }
                                                }
                                            })}
                                            placeholder="Study at your own pace..."
                                            className="admin-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        {/* Popular Courses Section */}
                        <FormSection title="Popular Courses Section">
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Section Title:</label>
                                    <input
                                        type="text"
                                        value={homePageContent.popularCourses.sectionTitle}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            popularCourses: { ...homePageContent.popularCourses, sectionTitle: e.target.value }
                                        })}
                                        placeholder="Popular Courses"
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Show Count:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={homePageContent.popularCourses.showCount}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            popularCourses: { ...homePageContent.popularCourses, showCount: parseInt(e.target.value) || 6 }
                                        })}
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>View All Button Text:</label>
                                    <input
                                        type="text"
                                        value={homePageContent.popularCourses.viewAllButtonText}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            popularCourses: { ...homePageContent.popularCourses, viewAllButtonText: e.target.value }
                                        })}
                                        placeholder="View All Courses"
                                        className="admin-input"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        {/* Impact Section */}
                        <FormSection title="Impact Section">
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Section Title:</label>
                                    <input
                                        type="text"
                                        value={homePageContent.impact.sectionTitle}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            impact: { ...homePageContent.impact, sectionTitle: e.target.value }
                                        })}
                                        placeholder="Our Impact"
                                        className="admin-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                                    <input
                                        type="checkbox"
                                        id="showImpactSection"
                                        checked={homePageContent.impact.showSection}
                                        onChange={(e) => setHomePageContent({
                                            ...homePageContent,
                                            impact: { ...homePageContent.impact, showSection: e.target.checked }
                                        })}
                                    />
                                    <label htmlFor="showImpactSection" style={{ fontWeight: 'bold' }}>Show Impact Section</label>
                                </div>
                            </div>
                        </FormSection>

                        {/* Action Buttons */}
                        <ActionButtons
                            buttons={[
                                {
                                    label: 'Update Home Page Content',
                                    icon: '🏠',
                                    onClick: updateHomePageContent,
                                    variant: 'primary'
                                },
                                {
                                    label: 'Reset to Defaults',
                                    icon: '🔄',
                                    onClick: resetHomePageContent,
                                    variant: 'secondary'
                                }
                            ]}
                            status={homePageUpdateStatus}
                        />

                        {/* Tips Section */}
                        <FormSection title="Home Page Management Tips">
                            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Tips:</h4>
                                <ul style={{ margin: '0', paddingLeft: '20px', color: '#1e40af' }}>
                                    <li>Keep hero title short and impactful (under 50 characters)</li>
                                    <li>Hero subtitle should clearly explain your value proposition</li>
                                    <li>Use emojis for feature icons to make them visually appealing</li>
                                    <li>Feature descriptions should be concise but informative</li>
                                    <li>Popular courses count affects page loading - keep it reasonable (3-9)</li>
                                    <li>Changes are reflected immediately on the home page</li>
                                </ul>
                            </div>
                        </FormSection>
                    </AdminCard>

                    {/* Impact Statistics Management */}
                    <AdminCard title="Impact Statistics Management" icon="📊" collapsible={true} defaultExpanded={false}>
                        
                        <FormSection title="Manage Impact Statistics">
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                                Control the statistics displayed in the "Our Impact" section on the home page. Enable/disable and customize each statistic.
                            </p>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                {Object.entries(impactStats).map(([key, stat]) => (
                                    <div key={key} style={{
                                        background: stat.show ? '#f0f9ff' : '#f8f9fa',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        border: stat.show ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <input
                                                type="checkbox"
                                                id={`show-${key}`}
                                                checked={stat.show}
                                                onChange={(e) => setImpactStats({
                                                    ...impactStats,
                                                    [key]: { ...stat, show: e.target.checked }
                                                })}
                                                style={{ transform: 'scale(1.2)' }}
                                            />
                                            <label htmlFor={`show-${key}`} style={{ 
                                                fontWeight: 'bold', 
                                                fontSize: '1.1rem',
                                                color: stat.show ? '#1e40af' : '#6b7280'
                                            }}>
                                                {stat.show ? '✅ Enabled' : '❌ Disabled'}
                                            </label>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    Value:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={stat.value}
                                                    onChange={(e) => setImpactStats({
                                                        ...impactStats,
                                                        [key]: { ...stat, value: parseFloat(e.target.value) || 0 }
                                                    })}
                                                    className="admin-input"
                                                    disabled={!stat.show}
                                                    style={{ 
                                                        opacity: stat.show ? 1 : 0.6,
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                    Label:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={stat.label}
                                                    onChange={(e) => setImpactStats({
                                                        ...impactStats,
                                                        [key]: { ...stat, label: e.target.value }
                                                    })}
                                                    className="admin-input"
                                                    disabled={!stat.show}
                                                    style={{ opacity: stat.show ? 1 : 0.6 }}
                                                />
                                            </div>
                                        </div>

                                        {stat.show && (
                                            <div style={{ 
                                                marginTop: '15px', 
                                                padding: '10px', 
                                                background: 'white', 
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                                border: '1px solid #bfdbfe'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                                                    {stat.value.toLocaleString()}{key === 'averageRating' ? '⭐' : '+'}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                    {stat.label}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        {/* Action Buttons */}
                        <ActionButtons
                            buttons={[
                                {
                                    label: 'Update Impact Statistics',
                                    icon: '📊',
                                    onClick: updateImpactStats,
                                    variant: 'primary'
                                },
                                {
                                    label: 'Reset to Defaults',
                                    icon: '🔄',
                                    onClick: resetImpactStats,
                                    variant: 'secondary'
                                }
                            ]}
                            status={impactStatsUpdateStatus}
                        />

                        {/* Tips Section */}
                        <FormSection title="Impact Statistics Tips">
                            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Tips:</h4>
                                <ul style={{ margin: '0', paddingLeft: '20px', color: '#1e40af' }}>
                                    <li>Enable only the statistics that are relevant to your business</li>
                                    <li>Use realistic numbers that reflect your actual achievements</li>
                                    <li>Update statistics regularly to keep them current</li>
                                    <li>Labels should be clear and descriptive</li>
                                    <li>At least one statistic must be enabled for the section to show</li>
                                    <li>Changes are reflected immediately on the home page</li>
                                </ul>
                            </div>
                        </FormSection>
                    </AdminCard>


                    {/* More sections can be added here */}
                    <AdminCard title="More Sections Coming Soon" icon="�" collapsible={true} defaultExpanded={false}>
                        <p>Additional admin sections like Course Management, Social Media Management, etc. can be added here using the same AdminCard pattern.</p>
                    </AdminCard>

                </div>
            </section>
        </div>
    );
};

export default AdminSimple;