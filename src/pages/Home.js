import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [popularCourses, setPopularCourses] = useState([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalCategories: 0
  });
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to EduPlatform');
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
  const [impactStats, setImpactStats] = useState({
    totalCourses: { value: 25, label: 'Courses Available', show: true },
    totalStudents: { value: 5000, label: 'Students Enrolled', show: true },
    averageRating: { value: 4.8, label: 'Average Rating', show: true },
    totalCategories: { value: 8, label: 'Course Categories', show: true },
    successRate: { value: 95, label: 'Success Rate', show: false },
    certificates: { value: 4500, label: 'Certificates Issued', show: false }
  });

  // Load courses, stats, and branding from admin data
  useEffect(() => {
    loadCourseStats();
    loadWelcomeMessage();
    loadHomePageContent();
    loadImpactStats();
    updatePageTitle();
  }, []);

  // Load popular courses after homePageContent is loaded
  useEffect(() => {
    loadPopularCourses();
  }, [homePageContent]);

  // Listen for storage changes to update in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'footerContactInfo') {
        loadWelcomeMessage();
        updatePageTitle();
      }
      if (e.key === 'homePageContent') {
        loadHomePageContent();
      }
      if (e.key === 'impactStats') {
        loadImpactStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same window (admin panel updates)
    const handleCustomUpdate = () => {
      loadWelcomeMessage();
      updatePageTitle();
    };

    const handleHomePageUpdate = () => {
      loadHomePageContent();
    };

    const handleImpactStatsUpdate = () => {
      loadImpactStats();
    };
    
    window.addEventListener('brandingUpdated', handleCustomUpdate);
    window.addEventListener('homePageUpdated', handleHomePageUpdate);
    window.addEventListener('impactStatsUpdated', handleImpactStatsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brandingUpdated', handleCustomUpdate);
      window.removeEventListener('homePageUpdated', handleHomePageUpdate);
      window.removeEventListener('impactStatsUpdated', handleImpactStatsUpdate);
    };
  }, []);

  const updatePageTitle = () => {
    try {
      const savedContactInfo = localStorage.getItem('footerContactInfo');
      if (savedContactInfo) {
        const contactInfo = JSON.parse(savedContactInfo);
        if (contactInfo && contactInfo.websiteTitle) {
          document.title = contactInfo.websiteTitle;
        }
      }
    } catch (error) {
      console.error('Error updating page title:', error);
    }
  };

  const loadWelcomeMessage = () => {
    try {
      const savedContactInfo = localStorage.getItem('footerContactInfo');
      if (savedContactInfo) {
        const contactInfo = JSON.parse(savedContactInfo);
        if (contactInfo && contactInfo.welcomeMessage) {
          setWelcomeMessage(contactInfo.welcomeMessage);
        }
      }
    } catch (error) {
      console.error('Error loading welcome message:', error);
    }
  };

  const loadPopularCourses = () => {
    try {
      const savedCourses = localStorage.getItem('coursesData');
      if (savedCourses) {
        const courses = JSON.parse(savedCourses);
        // Get the show count from home page content, default to 6
        const showCount = homePageContent.popularCourses.showCount || 6;
        // Get top courses by rating or students, fallback to first courses
        const topCourses = courses
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, showCount)
          .map(course => ({
            ...course,
            showAllFeatures: false // Initialize expand/collapse state
          }));
        setPopularCourses(topCourses);
      } else {
        // No admin courses available - show empty state
        setPopularCourses([]);
      }
    } catch (error) {
      console.error('Error loading popular courses:', error);
    }
  };

  const loadCourseStats = () => {
    try {
      const savedStats = localStorage.getItem('courseStats');
      if (savedStats) {
        setCourseStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading course stats:', error);
    }
  };

  const loadHomePageContent = () => {
    try {
      const savedHomePageContent = localStorage.getItem('homePageContent');
      if (savedHomePageContent) {
        const content = JSON.parse(savedHomePageContent);
        setHomePageContent(content);
        // Also update welcome message from home page content
        setWelcomeMessage(content.hero.title);
      }
    } catch (error) {
      console.error('Error loading home page content:', error);
    }
  };

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

  const getCategoryName = (categoryId) => {
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
    return categoryMap[categoryId] || categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryColor = (categoryId) => {
    const colorMap = {
      'programming': '#6366f1',
      'data-science': '#8b5cf6',
      'marketing': '#ec4899',
      'design': '#06b6d4',
      'cloud': '#10b981',
      'communication': '#f59e0b',
      'language': '#8b5cf6',
      'professional': '#6366f1', // Changed from green to blue
      'business': '#dc2626',
      'english': '#7c3aed',
      'soft-skills': '#0891b2'
    };
    return colorMap[categoryId] || '#6366f1';
  };

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  const handleVerifyCertificate = () => {
    navigate('/certificates');
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleEnrollCourse = (courseId) => {
    // For now, navigate to courses page
    // In a real app, this would handle enrollment
    navigate('/courses');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{homePageContent.hero.title}</h1>
          <p>{homePageContent.hero.subtitle}</p>
          <button onClick={handleExploreCourses} className="btn btn-primary" style={{marginRight: '15px'}}>
            {homePageContent.hero.primaryButtonText}
          </button>
          <button onClick={handleVerifyCertificate} className="btn btn-secondary">
            {homePageContent.hero.secondaryButtonText}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{background: '#f8f9fa'}}>
        <div className="container">
          <h2 className="section-title">{homePageContent.features.sectionTitle}</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>{homePageContent.features.feature1.icon} {homePageContent.features.feature1.title}</h3>
              <p>{homePageContent.features.feature1.description}</p>
            </div>
            <div className="card">
              <h3>{homePageContent.features.feature2.icon} {homePageContent.features.feature2.title}</h3>
              <p>{homePageContent.features.feature2.description}</p>
            </div>
            <div className="card">
              <h3>{homePageContent.features.feature3.icon} {homePageContent.features.feature3.title}</h3>
              <p>{homePageContent.features.feature3.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">{homePageContent.popularCourses.sectionTitle}</h2>
          
          {popularCourses.length > 0 ? (
            <div className="grid grid-3">
              {popularCourses.map((course) => (
              <div key={course.id} className="course-card" style={{ 
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <div 
                  className="course-image" 
                  style={{
                    background: course.imageUrl 
                      ? `url(${course.imageUrl}) center/cover` 
                      : `linear-gradient(45deg, ${getCategoryColor(course.category)}, ${getCategoryColor(course.category)}dd)`,
                    position: 'relative',
                    overflow: 'hidden',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {course.imageUrl ? (
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                        {course.category === 'programming' && '💻'}
                        {course.category === 'data-science' && '📊'}
                        {course.category === 'marketing' && '📈'}
                        {course.category === 'design' && '🎨'}
                        {course.category === 'cloud' && '☁️'}
                        {course.category === 'communication' && '🗣️'}
                        {course.category === 'language' && '🌐'}
                        {course.category === 'professional' && '💼'}
                        {course.category === 'business' && '📊'}
                        {course.category === 'english' && '📚'}
                        {course.category === 'soft-skills' && '🤝'}
                      </div>
                      {getCategoryName(course.category)}
                    </div>
                  )}
                </div>
                
                <div className="course-content" style={{ padding: '15px' }}>
                  <h3 className="course-title" style={{ 
                    margin: '0 0 8px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {course.title}
                  </h3>
                  
                  {/* Truncated Description with Hover */}
                  <p 
                    style={{ 
                      color: '#666',
                      fontSize: '0.9rem',
                      lineHeight: '1.3',
                      margin: '0 0 10px 0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      cursor: 'pointer'
                    }}
                    title={course.description} // Shows full description on hover
                  >
                    {course.description}
                  </p>
                  
                  {/* Course Stats - Rating and Students */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {course.rating && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⭐ {course.rating}
                        </span>
                      )}
                      {course.students && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👥 {course.students} students
                        </span>
                      )}
                    </div>
                    {course.instructor && (
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>
                        👨‍🏫 {course.instructor}
                      </span>
                    )}
                  </div>
                  
                  {/* Duration & Level */}
                  <div style={{marginBottom: '10px'}}> 
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <p style={{margin: '0', fontSize: '0.85rem', color: '#333'}}>
                        <strong>Duration:</strong> <span style={{ color: '#666' }}>{course.duration}</span>
                      </p>
                      <p style={{margin: '0', fontSize: '0.85rem', color: '#333'}}>
                        <strong>Level:</strong> <span style={{ color: '#666' }}>{course.level}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* What you'll learn - Horizontal Tags with Expand/Collapse */}
                  <div style={{marginBottom: '15px'}}>
                    <h4 style={{marginBottom: '6px', fontSize: '0.9rem', color: '#333'}}>What you'll learn:</h4>
                    <div 
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}
                    >
                      {/* Show features based on expanded state */}
                      {course.features && course.features.slice(0, course.showAllFeatures ? course.features.length : 3).map((feature, index) => (
                        <span key={index} style={{
                          background: '#f8f9fa',
                          padding: '3px 6px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          color: '#666',
                          border: '1px solid #e9ecef',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100px'
                        }}>
                          {feature}
                        </span>
                      ))}
                      
                      {/* Show More/Less Button */}
                      {course.features && course.features.length > 3 && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle the showAllFeatures state for this specific course
                            const updatedCourses = popularCourses.map(c => 
                              c.id === course.id 
                                ? { ...c, showAllFeatures: !c.showAllFeatures }
                                : c
                            );
                            setPopularCourses(updatedCourses);
                          }}
                          style={{
                            background: getCategoryColor(course.category),
                            color: 'white',
                            padding: '3px 6px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            userSelect: 'none'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.opacity = '0.8';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          {course.showAllFeatures 
                            ? 'Show Less' 
                            : `+${course.features.length - 3} more`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Price and Button - Fixed at Bottom */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: 'auto'
                  }}>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ 
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: getCategoryColor(course.category)
                      }}>
                        ₹{course.price}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEnrollCourse(course.id)}
                      style={{
                        background: getCategoryColor(course.category),
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '110px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      ENROLL NOW
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📚</div>
              <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>No Courses Available Yet</h3>
              <p style={{ color: '#6c757d', marginBottom: '25px', fontSize: '1.1rem' }}>
                Courses will appear here once they are added by the administrator.
              </p>
              <button 
                onClick={handleExploreCourses}
                className="btn btn-primary"
                style={{
                  background: '#6366f1',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Go to Admin Panel
              </button>
            </div>
          )}
          
          {/* Course Statistics */}
          {homePageContent.impact.showSection && Object.values(impactStats).some(stat => stat.show) && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '40px',
              margin: '50px 0',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '30px', fontSize: '1.8rem' }}>{homePageContent.impact.sectionTitle}</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '30px' 
              }}>
                {Object.entries(impactStats).map(([key, stat]) => 
                  stat.show && (
                    <div key={key}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        {stat.value.toLocaleString()}{key === 'averageRating' ? '⭐' : key === 'successRate' ? '%' : '+'}
                      </div>
                      <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{stat.label}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
          
          <div style={{textAlign: 'center', marginTop: '40px'}}>
            <button 
              onClick={handleViewAllCourses} 
              className="btn btn-secondary"
              style={{
                background: 'transparent',
                border: '2px solid #6366f1',
                color: '#6366f1',
                padding: '12px 30px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6366f1';
              }}
            >
              {homePageContent.popularCourses.viewAllButtonText.toUpperCase()}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;