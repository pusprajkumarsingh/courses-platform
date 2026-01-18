# GitHub Pages Deployment Guide

## Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository" (green button)
3. Name your repository (e.g., "course-platform" or "education-website")
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we already have files)
6. Click "Create Repository"

## Step 2: Update package.json
1. Open `package.json`
2. Replace `YOUR_USERNAME` with your GitHub username
3. Replace `YOUR_REPOSITORY_NAME` with your repository name
4. Example: `"homepage": "https://johnsmith.github.io/course-platform"`

## Step 3: Initialize Git and Push to GitHub
Run these commands in your terminal:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Course Platform"

# Add GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to GitHub Pages
```bash
# Deploy to GitHub Pages
npm run deploy
```

## Step 5: Enable GitHub Pages
1. Go to your GitHub repository
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "gh-pages" branch
6. Click "Save"

## Step 6: Access Your Website
Your website will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`

## Important Notes:
- First deployment may take 5-10 minutes to be live
- Any changes: run `npm run deploy` to update
- Make sure repository is **Public** for free GitHub Pages
- The mobile toggle functionality will work perfectly on the live site

## Troubleshooting:
- If 404 error: Check repository name in package.json homepage
- If blank page: Check browser console for errors
- If slow loading: GitHub Pages may take time to propagate changes