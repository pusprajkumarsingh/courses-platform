// Router Configuration Utility
// Automatically detects deployment environment and uses appropriate routing

import { BrowserRouter, HashRouter } from 'react-router-dom';

// Detect if we're on GitHub Pages
const isGitHubPages = () => {
  return (
    window.location.hostname === 'username.github.io' ||
    window.location.hostname.includes('.github.io') ||
    window.location.pathname.includes('/courses-platform/') ||
    process.env.PUBLIC_URL?.includes('github.io')
  );
};

// Detect if we're in development
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Get the appropriate router based on environment
export const getRouter = () => {
  // Use HashRouter for GitHub Pages, BrowserRouter for other servers
  if (isGitHubPages() && !isDevelopment()) {
    console.log('Using HashRouter for GitHub Pages deployment');
    return HashRouter;
  } else {
    console.log('Using BrowserRouter for server deployment');
    return BrowserRouter;
  }
};

// Get base URL for the application
export const getBaseName = () => {
  if (isGitHubPages() && !isDevelopment()) {
    return '/courses-platform';
  }
  return '';
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    isGitHubPages: isGitHubPages(),
    isDevelopment: isDevelopment(),
    publicUrl: process.env.PUBLIC_URL,
    nodeEnv: process.env.NODE_ENV,
    routerType: isGitHubPages() && !isDevelopment() ? 'HashRouter' : 'BrowserRouter'
  };
};