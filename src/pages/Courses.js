import { useState, useEffect } from 'react';
import DataSyncManager from '../utils/dataSyncManager';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalCategories: 0
  });
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Courses' }
  ]);

  // Function to get proper category display name
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

  // Function to get category-specific colors
  const getCategoryColor = (categoryId) => {
    const colorMap = {
      'programming': '#6366f1',
      'data-science': '#8b5cf6',
      'marketing': '#ec4899',
      'design': '#06b6d4',
      'cloud': '#10b981',
      'communication': '#f59e0b',
      'language': '#8b5cf6',
      'professional': '#6366f1', // Blue instead of green
      'business': '#dc2626',
      'english': '#7c3aed',
      'soft-skills': '#0891b2'
    };
    return colorMap[categoryId] || '#6366f1';
  };

  // Load courses data from localStorage (managed by admin)
  useEffect(() => {
    const dataSyncManager = new DataSyncManager();
    
    const loadCoursesData = async () => {
      try {
        console.log('Courses.js: Loading courses data...');
        
        // Always try to load from localStorage first, then sync if enabled
        let coursesData = [];
        
        // Load from localStorage - try both keys for compatibility
        let savedCourses = localStorage.getItem('coursesData');
        if (!savedCourses) {
          savedCourses = localStorage.getItem('courses');
        }
        
        if (savedCourses) {
          coursesData = JSON.parse(savedCourses);
          console.log(`Courses.js: Loaded ${coursesData.length} courses from localStorage`);
          console.log('Courses.js: Courses data:', coursesData);
        } else {
          console.log('Courses.js: No courses found in localStorage');
        }
        
        // If Google Sheets sync is enabled, try to sync (but don't replace if it fails)
        try {
          const syncedCourses = await dataSyncManager.syncCourses();
          if (syncedCourses && syncedCourses.length > 0) {
            coursesData = syncedCourses;
            console.log('Courses.js: Updated with synced courses:', syncedCourses);
          }
        } catch (syncError) {
          console.log('Courses.js: Sync failed, using localStorage data:', syncError.message);
        }
        
        // Initialize showAllFeatures state for each course
        const coursesWithExpandState = coursesData.map(course => ({
          ...course,
          showAllFeatures: course.showAllFeatures || false
        }));
        
        setCourses(coursesWithExpandState);
        
        // Load course categories from localStorage (admin-managed)
        const savedCategories = localStorage.getItem('courseCategories');
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories);
          console.log('Loaded categories:', parsedCategories);
          
          // Show all admin-managed categories
          const categoriesWithAll = [
            { id: 'all', name: 'All Courses' },
            ...parsedCategories
          ];
          setCategories(categoriesWithAll);
        } else if (coursesData.length > 0) {
          // If no saved categories, create categories based on existing courses
          const uniqueCategories = [...new Set(coursesData.map(course => course.category))];
          const dynamicCategories = uniqueCategories.map(categoryId => ({
            id: categoryId,
            name: getCategoryDisplayName(categoryId)
          }));
          
          const categoriesWithAll = [
            { id: 'all', name: 'All Courses' },
            ...dynamicCategories
          ];
          setCategories(categoriesWithAll);
        } else {
          // No courses, so only show "All Courses" category
          setCategories([{ id: 'all', name: 'All Courses' }]);
        }

        // Load course statistics from localStorage (admin-managed)
        const savedCourseStats = localStorage.getItem('courseStats');
        if (savedCourseStats) {
          const parsedStats = JSON.parse(savedCourseStats);
          console.log('Loaded course stats:', parsedStats);
          setCourseStats(parsedStats);
        } else {
          // Calculate default stats if no admin-managed stats exist
          const totalCategories = savedCategories ? JSON.parse(savedCategories).length : 5;
          const defaultStats = {
            totalCourses: coursesData.length || 6,
            totalStudents: 6740,
            averageRating: 4.8,
            totalCategories: totalCategories
          };
          setCourseStats(defaultStats);
        }
      } catch (error) {
        console.error('Error loading courses data:', error);
      }
    };

    loadCoursesData();
  }, []);

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const handleEnroll = (course) => {
    // Simple approach - just like feedback system
    try {
      const enrollmentConfig = localStorage.getItem('enrollmentFormConfig');
      let formURL = '';
      
      if (enrollmentConfig) {
        const config = JSON.parse(enrollmentConfig);
        formURL = config.primaryFormURL || '';
      }
      
      if (formURL && formURL.trim()) {
        // Open Google Form in new tab - simple and works!
        window.open(formURL, '_blank');
      } else {
        alert('Enrollment form is not configured yet. Please contact the administrator.');
      }
    } catch (error) {
      alert('Error opening enrollment form. Please contact the administrator.');
    }
  };

  // Emergency fix function for course categories
  const fixCourseCategories = () => {
    try {
      const savedCourses = localStorage.getItem('coursesData');
      if (!savedCourses) {
        alert('No courses found to fix');
        return;
      }

      const coursesData = JSON.parse(savedCourses);
      let fixedCount = 0;
      
      const updatedCourses = coursesData.map(course => {
        const title = course.title.toLowerCase();
        
        // Fix professional/communication courses
        if (course.category === 'marketing' && 
            (title.includes('professional') || title.includes('communication') || 
             title.includes('english') || title.includes('interview'))) {
          
          let newCategory = 'professional';
          if (title.includes('english')) newCategory = 'english';
          else if (title.includes('communication')) newCategory = 'communication';
          else if (title.includes('interview')) newCategory = 'professional';
          
          fixedCount++;
          return { ...course, category: newCategory };
        }
        
        return course;
      });

      if (fixedCount > 0) {
        localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
        setCourses(updatedCourses);
        alert(`Fixed ${fixedCount} course(s)! Page will refresh.`);
        window.location.reload();
      } else {
        alert('No courses needed fixing');
      }
    } catch (error) {
      alert(`Error fixing courses: ${error.message}`);
    }
  };

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Our Courses</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', marginBottom: '50px', color: '#666'}}>
            Choose from our comprehensive selection of professional courses designed to advance your career.
          </p>
          
          {/* Category Filter */}
          <div style={{textAlign: 'center', marginBottom: '50px'}}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{margin: '0 10px 10px 0'}}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
            
            {/* Temporary Fix Button - Only show if there are courses that need fixing */}
            {courses.some(course => 
              course.category === 'marketing' && 
              (course.title.toLowerCase().includes('professional') || 
               course.title.toLowerCase().includes('communication') || 
               course.title.toLowerCase().includes('english') || 
               course.title.toLowerCase().includes('interview'))
            ) && (
              <div style={{marginTop: '20px'}}>
                <button
                  onClick={fixCourseCategories}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  🔧 Fix Course Categories
                </button>
                <p style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>
                  Click to fix courses showing wrong category tags
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-2">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image" style={{
                  background: course.imageUrl 
                    ? `url(${course.imageUrl}) center/cover` 
                    : `linear-gradient(45deg, ${getCategoryColor(course.category)}, ${getCategoryColor(course.category)}dd)`,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '160px' // Keep reduced image height
                }}>
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
                      onError={(e) => {
                        e.target.parentElement.style.background = `linear-gradient(45deg, ${getCategoryColor(course.category)}, ${getCategoryColor(course.category)}dd)`;
                        e.target.parentElement.innerHTML = course.title.split(' ')[0] + ' Course';
                      }}
                    />
                  ) : (
                    course.title.split(' ')[0] + ' Course'
                  )}
                  
                  {/* Course Category Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '3px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem'
                  }}>
                    {getCategoryDisplayName(course.category)}
                  </div>
                </div>
                
                <div className="course-content" style={{
                  padding: '15px' // Keep reduced padding
                }}>
                  <h3 className="course-title" style={{
                    fontSize: '1.1rem',
                    marginBottom: '8px' // Keep reduced margin
                  }}>{course.title}</h3>
                  
                  {/* Truncated Description with Hover */}
                  <p 
                    style={{
                      marginBottom: '10px', // Keep reduced margin
                      color: '#666',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      cursor: 'pointer',
                      fontSize: '0.9rem', // Keep smaller font
                      lineHeight: '1.3'
                    }}
                    title={course.description} // Shows full description on hover
                  >
                    {course.description}
                  </p>
                  
                  {/* Course Stats */}
                  <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '10px', // Keep reduced margin
                    fontSize: '0.8rem', // Keep smaller font
                    color: '#666'
                  }}>
                    {course.rating && (
                      <span>⭐ {course.rating}</span>
                    )}
                    {course.students && (
                      <span>👥 {course.students} students</span>
                    )}
                    {course.instructor && (
                      <span>👨‍🏫 {course.instructor}</span>
                    )}
                  </div>
                  
                  <div style={{marginBottom: '10px'}}> {/* Keep reduced margin */}
                    <p style={{margin: '2px 0', fontSize: '0.85rem'}}><strong>Duration:</strong> {course.duration}</p>
                    <p style={{margin: '2px 0', fontSize: '0.85rem'}}><strong>Level:</strong> {course.level}</p>
                  </div>
                  
                  <div style={{marginBottom: '12px'}}> {/* Keep reduced margin */}
                    <h4 style={{marginBottom: '6px', fontSize: '0.9rem'}}>What you'll learn:</h4>
                    <div 
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      {/* Show features based on expanded state */}
                      {course.features && course.features.slice(0, course.showAllFeatures ? course.features.length : 4).map((feature, index) => (
                        <span key={index} style={{
                          background: '#f8f9fa',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          color: '#666',
                          border: '1px solid #e9ecef',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '120px'
                        }}>
                          {feature}
                        </span>
                      ))}
                      
                      {/* Show More/Less Button */}
                      {course.features && course.features.length > 4 && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle the showAllFeatures state for this specific course
                            const updatedCourses = courses.map(c => 
                              c.id === course.id 
                                ? { ...c, showAllFeatures: !c.showAllFeatures }
                                : c
                            );
                            setCourses(updatedCourses);
                            // Persist the updated state to localStorage
                            localStorage.setItem('coursesData', JSON.stringify(updatedCourses));
                          }}
                          style={{
                            background: getCategoryColor(course.category),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
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
                            : `+${course.features.length - 4} more`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Price and Button - Side by Side */}
                  <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div className="course-price" style={{
                      fontSize: '1.3rem', // Keep smaller price font
                      fontWeight: 'bold',
                      color: getCategoryColor(course.category)
                    }}>
                      ₹{course.price}
                    </div>
                    <button 
                      onClick={() => handleEnroll(course)}
                      style={{
                        background: getCategoryColor(course.category),
                        border: 'none',
                        padding: '10px 16px', // Keep reduced padding
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.8rem', // Keep smaller button font
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minWidth: '120px' // Keep smaller button width
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      ENROLL NOW
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCourses.length === 0 && courses.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
              <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>No Courses Available</h3>
              <p style={{ color: '#6c757d', marginBottom: '25px', fontSize: '1.1rem' }}>
                Courses will appear here once they are added by the administrator.
              </p>
              <button 
                onClick={() => window.location.href = '/admin'}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go to Admin Panel
              </button>
            </div>
          )}
          
          {filteredCourses.length === 0 && courses.length > 0 && (
            <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
              <h3>No courses found in this category</h3>
              <p>Try selecting a different category to view more courses.</p>
            </div>
          )}
        </div>
      </section>

      {/* Course Statistics */}
      <section className="section" style={{background: '#f8f9fa'}}>
        <div className="container">
          <h2 style={{textAlign: 'center', marginBottom: '50px'}}>Course Statistics</h2>
          <div className="grid grid-4">
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>{courseStats.totalCourses}</div>
              <h3>Total Courses</h3>
              <p>Available for enrollment</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>
                {courseStats.totalStudents.toLocaleString()}
              </div>
              <h3>Students Enrolled</h3>
              <p>Across all courses</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>
                {courseStats.averageRating}
              </div>
              <h3>Average Rating</h3>
              <p>Student satisfaction</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>
                {courseStats.totalCategories}
              </div>
              <h3>Categories</h3>
              <p>Different specializations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Form Integration Note */}
      <section className="section">
        <div className="container">
          <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
            <h2>Simple Enrollment Process</h2>
            <p style={{fontSize: '1.1rem', marginBottom: '30px'}}>
              Fill out our enrollment form with your payment details to get your course access code.
            </p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
              <div style={{padding: '15px 25px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                📝 Fill Form
              </div>
              <div style={{padding: '15px 25px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                💳 Upload Payment Details
              </div>
              <div style={{padding: '15px 25px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                🔑 Get Access Code
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;