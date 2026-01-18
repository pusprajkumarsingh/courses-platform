import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [websiteName, setWebsiteName] = useState('EduPlatform');

  // Load website name from admin settings
  useEffect(() => {
    const loadWebsiteName = () => {
      try {
        const savedContactInfo = localStorage.getItem('footerContactInfo');
        if (savedContactInfo) {
          const contactInfo = JSON.parse(savedContactInfo);
          if (contactInfo && contactInfo.websiteName) {
            setWebsiteName(contactInfo.websiteName);
          }
        }
      } catch (error) {
        console.error('Error loading website name:', error);
      }
    };

    loadWebsiteName();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'footerContactInfo') {
        loadWebsiteName();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same window (admin panel updates)
    const handleCustomUpdate = () => {
      loadWebsiteName();
    };
    
    window.addEventListener('brandingUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brandingUpdated', handleCustomUpdate);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <button onClick={() => handleNavigation('/')} className="logo">
            {websiteName}
          </button>
          <ul className="nav-links">
            <li><button onClick={() => handleNavigation('/')}>Home</button></li>
            <li><button onClick={() => handleNavigation('/about')}>About Us</button></li>
            <li><button onClick={() => handleNavigation('/courses')}>Courses</button></li>
            <li><button onClick={() => handleNavigation('/gallery')}>Gallery</button></li>
            <li><button onClick={() => handleNavigation('/certificates')}>Certificates</button></li>
            <li><button onClick={() => handleNavigation('/feedback')}>Feedback</button></li>
            <li><button onClick={() => handleNavigation('/admin')} style={{color: '#ffd700'}}>Admin</button></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;