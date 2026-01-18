# Google Sheets Integration Setup Guide

## Overview
Your website now supports Google Sheets integration for shared data management. When enabled, all admin updates will be visible to all users across the globe in real-time.

## 🎯 What This Solves
- **Before**: Admin updates only visible on your device (localStorage)
- **After**: Admin updates visible to ALL users worldwide (Google Sheets)

## 📋 Setup Instructions

### Step 1: Create Google Sheets

Create separate Google Sheets for each data type with the exact column headers listed below:

#### 1. Courses Data Sheet
**Headers (Row 1):**
```
id | title | description | price | duration | level | category | imageUrl | instructor | rating | students | features
```

**Example Data (Row 2):**
```
1 | Python Programming | Learn Python from basics to advanced | $99 | 8 weeks | Beginner | programming | https://example.com/image.jpg | John Doe | 4.8 | 1200 | Learn Python syntax|Build real projects|Get certified
```

#### 2. Team Members Data Sheet
**Headers (Row 1):**
```
id | name | position | description | imageUrl | email | linkedin
```

**Example Data (Row 2):**
```
1 | John Smith | Lead Instructor | Expert in web development with 10+ years experience | https://example.com/john.jpg | john@example.com | https://linkedin.com/in/johnsmith
```

#### 3. Gallery Items Data Sheet
**Headers (Row 1):**
```
id | title | description | category | imageUrl
```

**Example Data (Row 2):**
```
1 | Graduation Ceremony 2024 | Our latest batch of successful students | events | https://example.com/graduation.jpg
```

#### 4. Home Page Content Sheet
**Headers (Row 1):**
```
heroTitle | heroSubtitle | heroPrimaryButton | heroSecondaryButton | featuresSectionTitle | feature1Icon | feature1Title | feature1Description | feature2Icon | feature2Title | feature2Description | feature3Icon | feature3Title | feature3Description | popularCoursesSectionTitle | popularCoursesShowCount | popularCoursesViewAllButton | impactSectionTitle | impactShowSection
```

**Example Data (Row 2):**
```
Welcome to EduPlatform | Transform your career with professional courses | Explore Courses | Verify Certificate | Why Choose Us? | 🎓 | Expert Instructors | Learn from industry professionals | 📜 | Certified Courses | Get recognized certificates | 💻 | Online Learning | Study at your own pace | Popular Courses | 6 | View All Courses | Our Impact | true
```

#### 5. Footer Contact Info Sheet
**Headers (Row 1):**
```
email | phone | address | companyName | tagline | stayUpdatedTitle | stayUpdatedDescription | websiteName | websiteTitle | welcomeMessage | copyrightText
```

**Example Data (Row 2):**
```
info@eduplatform.com | +1-234-567-8900 | 123 Education St, Learning City | EduPlatform | Empowering Education | Stay Updated | Get latest updates about courses | EduPlatform | EduPlatform - Professional Courses | Welcome to EduPlatform | © 2024 EduPlatform. All rights reserved.
```

#### 6. Social Media Links Sheet
**Headers (Row 1):**
```
facebook | twitter | instagram | linkedin | youtube | whatsapp
```

**Example Data (Row 2):**
```
https://facebook.com/eduplatform | https://twitter.com/eduplatform | https://instagram.com/eduplatform | https://linkedin.com/company/eduplatform | https://youtube.com/eduplatform | https://wa.me/1234567890
```

### Step 2: Make Sheets Public

For each Google Sheet:
1. Click **Share** button (top right)
2. Click **Change to anyone with the link**
3. Set permission to **Viewer**
4. Click **Copy link**

### Step 3: Configure in Admin Panel

1. Go to your website: https://pusprajkumarsingh.github.io/courses-platform/admin
2. Login with your admin credentials
3. Find **"Google Sheets Data Sync"** section
4. Paste each Google Sheets URL in the corresponding field
5. Click **"Save Google Sheets URLs"**
6. Enable **"Enable Google Sheets Data Sync"** checkbox
7. Click **"🔄 Sync All Data"**

### Step 4: Test the Integration

1. Add/edit data in your Google Sheets
2. Go back to admin panel and click **"🔄 Sync All Data"**
3. Visit your website homepage and courses page
4. Verify that changes appear for all users

## 🔧 Features Configuration

### Features Column Format
For courses, the `features` column should contain pipe-separated values:
```
Learn Python syntax|Build real projects|Get certified|Master data structures
```

### Category Values
Use these exact category IDs in the courses sheet:
- `programming` - Programming
- `data-science` - Data Science  
- `marketing` - Marketing
- `design` - Design
- `cloud` - Cloud Computing
- `communication` - Communication
- `language` - Language
- `professional` - Professional Skills
- `business` - Business
- `english` - English
- `soft-skills` - Soft Skills

### Level Values
Use these exact level values:
- `Beginner`
- `Intermediate` 
- `Advanced`

## 🚀 Benefits

### For Admins:
- ✅ Update content once, visible to all users
- ✅ Real-time content management
- ✅ No need to rebuild/redeploy website
- ✅ Easy bulk data management in spreadsheets

### For Users:
- ✅ Always see latest content
- ✅ Consistent experience across all devices
- ✅ Real-time updates without page refresh needed

## 🔄 How It Works

1. **Data Storage**: Content stored in Google Sheets (shared) + localStorage (backup)
2. **Data Loading**: Website tries Google Sheets first, falls back to localStorage
3. **Admin Updates**: Can update via admin panel OR directly in Google Sheets
4. **Sync Process**: Manual sync via admin panel or automatic on page load
5. **Fallback**: If Google Sheets unavailable, uses localStorage data

## 🛠️ Troubleshooting

### Common Issues:

**"Invalid Google Sheets URL format"**
- Ensure URL starts with `https://docs.google.com/spreadsheets/d/`
- Make sure sheet is publicly viewable

**"No data synced"**
- Check if sheet has correct column headers (case-sensitive)
- Verify sheet has data in Row 2 and beyond
- Ensure sheet is publicly accessible

**"Sync failed"**
- Check browser console for detailed error messages
- Verify internet connection
- Try refreshing and syncing again

### Testing URLs:
Use the **Test** buttons in admin panel to verify each Google Sheets URL opens correctly.

## 📊 Current Status

Your website is now live with Google Sheets integration at:
**https://pusprajkumarsingh.github.io/courses-platform**

The system is backward compatible - existing localStorage data will continue to work as fallback even when Google Sheets sync is enabled.