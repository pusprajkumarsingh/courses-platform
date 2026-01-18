import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getRouter, getBaseName, getEnvironmentInfo } from './utils/routerConfig';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Gallery from './pages/Gallery';
import Certificates from './pages/Certificates';
import Feedback from './pages/Feedback';
import AdminSimple from './pages/AdminSimple';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [isMobileView, setIsMobileView] = useState(false);
  const Router = getRouter();
  const basename = getBaseName();

  useEffect(() => {
    // Load mobile view preference
    const savedMobileView = localStorage.getItem('mobileViewEnabled');
    if (savedMobileView === 'true') {
      setIsMobileView(true);
      document.body.classList.add('mobile-optimized');
    }

    // Log environment info for debugging
    console.log('App Environment Info:', getEnvironmentInfo());

    // Handle redirect from 404.html for regular servers
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && !window.location.hostname.includes('.github.io')) {
      sessionStorage.removeItem('redirectPath');
      window.history.replaceState(null, null, redirectPath);
    }
  }, []);

  const toggleMobileView = () => {
    const newMobileView = !isMobileView;
    setIsMobileView(newMobileView);
    
    // Save preference
    localStorage.setItem('mobileViewEnabled', newMobileView.toString());
    
    // Apply mobile optimization class
    if (newMobileView) {
      document.body.classList.add('mobile-optimized');
    } else {
      document.body.classList.remove('mobile-optimized');
    }
  };

  return (
    <Router basename={basename}>
      <div className="App">
        {/* Mobile CSS Styles */}
        <style>
          {`
            /* Mobile Toggle Switch Spacing */
            body {
              padding-top: 0 !important;
            }
            
            .header {
              margin-top: 0 !important;
              padding-top: 15px !important;
            }
            
            /* Very small screens - make toggle switch even smaller */
            @media (max-width: 480px) {
              .mobile-optimized .container {
                padding: 10px 15px 10px 70px !important;
              }
              
              .header:not(.mobile-optimized .header) .container {
                padding: 0 20px 0 70px !important;
              }
            }
            
            /* Desktop mode on mobile - ensure header is visible */
            @media (max-width: 768px) {
              .header:not(.mobile-optimized .header) {
                padding: 15px 0 !important;
                min-height: 80px !important;
              }
              
              .header:not(.mobile-optimized .header) .container {
                padding: 0 60px 0 80px !important; /* Space for mobile toggle switch */
              }
              
              .header:not(.mobile-optimized .header) .nav {
                flex-direction: column !important;
                gap: 10px !important;
                align-items: center !important;
              }
              
              .header:not(.mobile-optimized .header) .logo {
                font-size: 1.4rem !important;
                margin-bottom: 8px !important;
                padding: 8px 15px !important;
              }
              
              .header:not(.mobile-optimized .header) .nav-links {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                gap: 6px !important;
                width: 100% !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .header:not(.mobile-optimized .header) .nav-links li button {
                padding: 8px 12px !important;
                font-size: 13px !important;
                width: auto !important;
                text-align: center !important;
                white-space: nowrap !important;
                border-radius: 15px !important;
                min-width: 70px !important;
              }
            }
            
            .mobile-optimized .header {
              padding: 8px 0 !important;
              min-height: auto !important;
            }
            
            .mobile-optimized .container {
              max-width: 100% !important;
              padding: 10px 15px 10px 80px !important; /* Space for mobile toggle switch on left */
            }
            
            .mobile-optimized .nav {
              flex-direction: column !important;
              gap: 8px !important;
              align-items: center !important;
            }
            
            .mobile-optimized .logo {
              font-size: 1.2rem !important;
              margin-bottom: 5px !important;
              padding: 6px 12px !important;
            }
            
            .mobile-optimized .nav-links {
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: wrap !important;
              gap: 6px !important;
              width: 100% !important;
              justify-content: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .mobile-optimized .nav-links li {
              width: auto !important;
              margin: 0 !important;
            }
            
            .mobile-optimized .nav-links li button {
              padding: 6px 10px !important;
              font-size: 12px !important;
              width: auto !important;
              text-align: center !important;
              white-space: nowrap !important;
              border-radius: 12px !important;
              min-width: 60px !important;
            }
            
            .mobile-optimized {
              font-size: 16px !important;
            }
            
            .mobile-optimized .grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            
            .mobile-optimized .grid-2 {
              grid-template-columns: 1fr !important;
            }
            
            .mobile-optimized .grid-3 {
              grid-template-columns: 1fr !important;
            }
            
            .mobile-optimized .grid-4 {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .mobile-optimized .course-card {
              margin-bottom: 25px !important;
            }
            
            .mobile-optimized .header {
              padding: 10px 0 !important;
              min-height: auto !important;
            }
            
            .mobile-optimized .nav {
              flex-direction: column !important;
              gap: 10px !important;
              align-items: center !important;
            }
            
            .mobile-optimized .logo {
              font-size: 1.3rem !important;
              margin-bottom: 10px !important;
              padding: 8px 15px !important;
            }
            
            .mobile-optimized .nav-links {
              flex-direction: row !important;
              flex-wrap: wrap !important;
              gap: 8px !important;
              width: 100% !important;
              justify-content: center !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .mobile-optimized .nav-links li {
              width: auto !important;
              margin: 0 !important;
            }
            
            .mobile-optimized .nav-links li button {
              padding: 8px 12px !important;
              font-size: 13px !important;
              width: auto !important;
              text-align: center !important;
              white-space: nowrap !important;
              border-radius: 15px !important;
              min-width: 70px !important;
            }
            
            .mobile-optimized .hero {
              padding: 50px 0 !important;
            }
            
            .mobile-optimized .hero h1 {
              font-size: 2.2rem !important;
              line-height: 1.2 !important;
            }
            
            .mobile-optimized .hero p {
              font-size: 1.1rem !important;
              line-height: 1.5 !important;
            }
            
            .mobile-optimized .section {
              padding: 40px 0 !important;
            }
            
            .mobile-optimized .admin-input {
              font-size: 16px !important;
              padding: 15px !important;
              min-height: 50px !important;
            }
            
            .mobile-optimized button {
              padding: 15px 20px !important;
              font-size: 16px !important;
              min-height: 50px !important;
            }
            
            .mobile-optimized .btn {
              padding: 15px 25px !important;
              font-size: 16px !important;
              min-height: 50px !important;
            }
            
            .mobile-optimized .card {
              padding: 20px !important;
              margin-bottom: 20px !important;
            }
            
            .mobile-optimized .section-title {
              font-size: 2rem !important;
              margin-bottom: 30px !important;
            }
            
            .mobile-optimized .nav {
              flex-direction: column !important;
              gap: 10px !important;
              align-items: center !important;
            }
            
            .mobile-optimized .logo {
              font-size: 1.3rem !important;
              margin-bottom: 10px !important;
              padding: 8px 15px !important;
            }
          `}
        </style>

        {/* Mobile Toggle Switch */}
        <div 
          onClick={toggleMobileView}
          title={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 99999,
            width: '50px',
            height: '26px',
            background: isMobileView ? '#28a745' : '#6c757d',
            borderRadius: '13px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
        >
          {/* Switch Circle */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: isMobileView ? '26px' : '2px',
              width: '18px',
              height: '18px',
              background: 'white',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px'
            }}
          >
            {isMobileView ? '💻' : '📱'}
          </div>
        </div>

        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<AdminSimple />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;