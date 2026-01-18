import React, { useState, useEffect } from 'react';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryItems, setGalleryItems] = useState([]);
  const [achievements, setAchievements] = useState({
    studentsGraduated: '5000+',
    industryEvents: '50+',
    jobPlacementRate: '95%'
  });

  // Load gallery data from localStorage (managed by admin)
  useEffect(() => {
    const loadGalleryData = () => {
      try {
        const savedGalleryItems = localStorage.getItem('galleryItems');
        const savedAchievements = localStorage.getItem('galleryAchievements');
        
        console.log('Loading gallery data...');
        console.log('Raw savedGalleryItems:', savedGalleryItems);
        
        if (savedGalleryItems) {
          const parsedItems = JSON.parse(savedGalleryItems);
          console.log('Parsed gallery items:', parsedItems);
          console.log('First item imageUrl:', parsedItems[0]?.imageUrl?.substring(0, 50) + '...');
          setGalleryItems(parsedItems);
        } else {
          console.log('No saved gallery items, using defaults');
          // Default fallback data
          setGalleryItems([
            { id: 1, category: 'events', title: 'Annual Tech Conference 2024', description: 'Our biggest event with 500+ attendees', imageUrl: '' },
            { id: 2, category: 'students', title: 'Web Development Graduates', description: 'Celebrating our successful graduates', imageUrl: '' },
            { id: 3, category: 'facilities', title: 'Modern Learning Lab', description: 'State-of-the-art computer laboratory', imageUrl: '' },
            { id: 4, category: 'events', title: 'Industry Expert Workshop', description: 'Workshop on AI and Machine Learning', imageUrl: '' },
            { id: 5, category: 'students', title: 'Data Science Project Showcase', description: 'Students presenting their final projects', imageUrl: '' },
            { id: 6, category: 'facilities', title: 'Virtual Reality Training Room', description: 'Immersive learning experience setup', imageUrl: '' },
            { id: 7, category: 'events', title: 'Hackathon 2024', description: '48-hour coding competition', imageUrl: '' },
            { id: 8, category: 'students', title: 'Mobile App Development Team', description: 'Students working on real-world projects', imageUrl: '' },
            { id: 9, category: 'facilities', title: 'Recording Studio', description: 'Professional setup for course recordings', imageUrl: '' }
          ]);
        }
        
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements));
        }
      } catch (error) {
        console.error('Error loading gallery data:', error);
      }
    };

    loadGalleryData();
  }, []);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'events', name: 'Events' },
    { id: 'students', name: 'Students' },
    { id: 'facilities', name: 'Facilities' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Gallery</h1>
          <p style={{textAlign: 'center', fontSize: '1.2rem', marginBottom: '50px', color: '#666'}}>
            Explore our vibrant learning community through photos of events, students, and facilities.
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
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-3">
            {filteredItems.map(item => (
              <div key={item.id} className="card" style={{padding: '0', overflow: 'hidden'}}>
                <div 
                  style={{
                    height: '200px',
                    position: 'relative',
                    background: !item.imageUrl ? `linear-gradient(45deg, #667eea, #764ba2)` : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                    overflow: 'hidden'
                  }}
                >
                  {item.imageUrl ? (
                    <>
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                        onError={(e) => {
                          // If image fails to load, hide it and show emoji fallback
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}>
                        <span style={{ fontSize: '2rem' }}>
                          {item.category === 'events' && '🎉'}
                          {item.category === 'students' && '👨‍🎓'}
                          {item.category === 'facilities' && '🏢'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {item.category === 'events' && '🎉'}
                      {item.category === 'students' && '👨‍🎓'}
                      {item.category === 'facilities' && '🏢'}
                    </>
                  )}
                </div>
                <div style={{padding: '20px'}}>
                  <h3 style={{marginBottom: '10px', fontSize: '1.2rem'}}>{item.title}</h3>
                  <p style={{color: '#666', fontSize: '0.9rem'}}>{item.description}</p>
                  <div style={{marginTop: '15px'}}>
                    <span 
                      style={{
                        background: '#007bff',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
              <h3>No items found in this category</h3>
              <p>Try selecting a different category to view more content.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{background: '#f8f9fa'}}>
        <div className="container">
          <h2 style={{textAlign: 'center', marginBottom: '50px'}}>Our Achievements</h2>
          <div className="grid grid-3">
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>{achievements.studentsGraduated}</div>
              <h3>Students Graduated</h3>
              <p>Successfully completed our courses</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>{achievements.industryEvents}</div>
              <h3>Industry Events</h3>
              <p>Workshops and conferences organized</p>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '3rem', color: '#007bff', fontWeight: 'bold'}}>{achievements.jobPlacementRate}</div>
              <h3>Job Placement Rate</h3>
              <p>Graduates finding relevant employment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;