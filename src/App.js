import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

  useEffect(() => {
    // Load mobile view preference
    const savedMobileView = localStorage.getItem('mobileViewEnabled');
    if (savedMobileView === 'true') {
      setIsMobileView(true);
      document.body.classList.add('mobile-optimized');
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
    <Router>
      <div className="App">
        {/* Mobile CSS Styles */}
        <style>
          {`
            .mobile-optimized .header {
              padding: 8px 0 !important;
              min-height: auto !important;
            }
            
            .mobile-optimized .container {
              max-width: 100% !important;
              padding: 10px 15px !important;
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
            
            @keyframes pulse {
              0% { 
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border-color: rgba(0, 123, 255, 0.3);
              }
              50% { 
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                border-color: rgba(0, 123, 255, 0.5);
              }
              100% { 
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border-color: rgba(0, 123, 255, 0.3);
              }
            }
            
            .mobile-toggle-pulse {
              animation: pulse 3s infinite;
            }
          `}
        </style>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-toggle-pulse"
          onClick={toggleMobileView}
          title={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            background: isMobileView 
              ? 'rgba(40, 167, 69, 0.2)' 
              : 'rgba(0, 123, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: isMobileView ? '#28a745' : '#007bff',
            border: `2px solid ${isMobileView ? 'rgba(40, 167, 69, 0.3)' : 'rgba(0, 123, 255, 0.3)'}`,
            borderRadius: '25px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: '100px',
            justifyContent: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            e.target.style.background = isMobileView 
              ? 'rgba(40, 167, 69, 0.3)' 
              : 'rgba(0, 123, 255, 0.3)';
            e.target.classList.remove('mobile-toggle-pulse');
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            e.target.style.background = isMobileView 
              ? 'rgba(40, 167, 69, 0.2)' 
              : 'rgba(0, 123, 255, 0.2)';
            e.target.classList.add('mobile-toggle-pulse');
          }}
        >
          <span style={{ fontSize: '14px' }}>
            {isMobileView ? '💻' : '📱'}
          </span>
          <span>{isMobileView ? 'Desktop' : 'Mobile'}</span>
        </button>

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