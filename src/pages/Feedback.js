import React, { useState, useEffect } from 'react';
import FeedbackExcelAPI from '../utils/feedbackExcelAPI';

const Feedback = () => {
  const [feedbackType, setFeedbackType] = useState('student');
  const [displayedFeedback, setDisplayedFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [publicFeedbackStats, setPublicFeedbackStats] = useState({
    averageRating: '4.8/5',
    averageRatingDescription: 'Based on 1,200+ student reviews',
    satisfactionRate: '96%',
    satisfactionRateDescription: 'Students would recommend our courses',
    responseTime: '24hrs',
    responseTimeDescription: 'Average time to address feedback'
  });

  // Fallback feedback data in case Google Sheets is not available
  const fallbackFeedback = [
    // Student feedback examples
    {
      id: 1,
      type: 'student',
      name: 'Alice Johnson',
      course: 'Full Stack Web Development',
      rating: 5,
      message: 'Excellent course! The instructors were knowledgeable and the projects were very practical.',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 3,
      type: 'student',
      name: 'Mike Chen',
      course: 'Digital Marketing Mastery',
      rating: 5,
      message: 'This course transformed my career. I got a promotion within 3 months of completion!',
      timestamp: '2024-02-10T09:45:00Z'
    },
    {
      id: 5,
      type: 'student',
      name: 'John Davis',
      course: 'Cloud Computing with AWS',
      rating: 5,
      message: 'Amazing hands-on experience with real-world projects. The AWS certification prep was excellent!',
      timestamp: '2024-02-20T11:30:00Z'
    },
    {
      id: 6,
      type: 'student',
      name: 'Emma Wilson',
      course: 'UI/UX Design Fundamentals',
      rating: 4,
      message: 'Great introduction to design principles. The portfolio projects really helped build my skills.',
      timestamp: '2024-02-25T13:45:00Z'
    },
    {
      id: 7,
      type: 'student',
      name: 'Sarah Martinez',
      course: 'Data Science & Analytics',
      rating: 5,
      message: 'Outstanding curriculum! The hands-on projects with real datasets were incredibly valuable.',
      timestamp: '2024-03-01T14:20:00Z'
    },
    {
      id: 8,
      type: 'student',
      name: 'David Kim',
      course: 'Mobile App Development',
      rating: 4,
      message: 'Comprehensive course covering both iOS and Android development. Great instructor support.',
      timestamp: '2024-03-05T11:15:00Z'
    },
    // Faculty feedback examples
    {
      id: 2,
      type: 'faculty',
      name: 'Dr. Robert Smith',
      course: 'Data Science & Analytics',
      rating: 4,
      message: 'Great platform for delivering courses. The student engagement tools are very helpful and the analytics dashboard provides excellent insights.',
      timestamp: '2024-01-20T14:15:00Z'
    },
    {
      id: 4,
      type: 'faculty',
      name: 'Prof. Sarah Williams',
      course: 'Mobile App Development',
      rating: 5,
      message: 'The platform provides excellent tools for course creation and student interaction. The assignment submission system works flawlessly.',
      timestamp: '2024-02-15T16:20:00Z'
    },
    {
      id: 9,
      type: 'faculty',
      name: 'Dr. Michael Brown',
      course: 'Full Stack Web Development',
      rating: 5,
      message: 'Outstanding curriculum design tools. Students are well-prepared for real-world development. The project-based learning approach works perfectly.',
      timestamp: '2024-02-28T10:45:00Z'
    },
    {
      id: 10,
      type: 'faculty',
      name: 'Prof. Lisa Garcia',
      course: 'Digital Marketing Mastery',
      rating: 4,
      message: 'Excellent content management system. The case studies are current and relevant. Platform is intuitive and easy to navigate for both instructors and students.',
      timestamp: '2024-03-10T13:30:00Z'
    },
    {
      id: 11,
      type: 'faculty',
      name: 'Dr. James Wilson',
      course: 'Cloud Computing with AWS',
      rating: 5,
      message: 'The hands-on lab environment is exceptional. Students get real AWS experience. The integration with AWS services for practical learning is outstanding.',
      timestamp: '2024-03-15T09:20:00Z'
    },
    {
      id: 12,
      type: 'faculty',
      name: 'Prof. Amanda Chen',
      course: 'UI/UX Design Fundamentals',
      rating: 4,
      message: 'Great design tools and portfolio features. Students can showcase their work effectively. The peer review system encourages collaborative learning.',
      timestamp: '2024-03-20T15:10:00Z'
    }
  ];

  // Load feedback URL from admin panel Write Sheet URL
  const getFeedbackURL = () => {
    const urls = FeedbackExcelAPI.loadStoredURLs();
    return urls.writeURL || '';
  };

  const handleFeedbackClick = () => {
    const feedbackURL = getFeedbackURL();

    if (feedbackURL && feedbackURL.trim()) {
      console.log('Opening feedback URL:', feedbackURL);
      setShowFeedbackModal(true);
    } else {
      alert('Feedback form is not configured yet. Please contact the administrator.');
      console.error('No feedback URL configured in admin panel Write Sheet field');
    }
  };

  // Load random feedback on component mount and when feedback type changes
  useEffect(() => {
    loadRandomFeedback();
    loadPublicFeedbackStats();
  }, [feedbackType]);

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

  const loadRandomFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await FeedbackExcelAPI.getRandomFeedback(6, feedbackType);

      if (result.success && result.data.length > 0) {
        setDisplayedFeedback(result.data);
      } else {
        // Use fallback data if Excel sheet is not available
        const filteredFallback = fallbackFeedback
          .filter(item => item.type === feedbackType)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setDisplayedFeedback(filteredFallback);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      // Use fallback data on error
      const filteredFallback = fallbackFeedback
        .filter(item => item.type === feedbackType)
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
      setDisplayedFeedback(filteredFallback);
      setError('Using offline feedback data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Feedback</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '50px', color: '#666' }}>
            We value your feedback! Share your experience and help us improve our courses and platform.
          </p>

          <div className="grid grid-2" style={{ gap: '50px' }}>
            {/* Feedback Button */}
            <div>
              <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '30px' }}>Share Your Feedback</h2>

                <div style={{ marginBottom: '30px' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
                  <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px' }}>
                    We value your opinion! Click the button below to share your experience with our courses and platform.
                  </p>
                </div>

                <button
                  onClick={handleFeedbackClick}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '20px',
                    fontSize: '1.2rem',
                    marginBottom: '20px'
                  }}
                >
                  📝 Give Feedback
                </button>

                <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Why Your Feedback Matters</h4>
                  <ul style={{ textAlign: 'left', margin: '0', paddingLeft: '20px', fontSize: '0.9rem', color: '#666' }}>
                    <li>Helps us improve our courses</li>
                    <li>Guides future content development</li>
                    <li>Assists other students in course selection</li>
                    <li>Builds a better learning community</li>
                  </ul>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                    <strong>Quick & Easy:</strong> The form takes less than 2 minutes to complete
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Feedback */}
            <div>
              <h2 style={{ marginBottom: '30px' }}>Recent Feedback</h2>

              <div style={{ marginBottom: '20px' }}>
                <button
                  className={`btn ${feedbackType === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFeedbackType('student')}
                  style={{ marginRight: '10px' }}
                >
                  Student Reviews
                </button>
                <button
                  className={`btn ${feedbackType === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFeedbackType('faculty')}
                >
                  Faculty Reviews
                </button>
              </div>

              {error && (
                <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Loading feedback...
                  </div>
                ) : displayedFeedback.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No feedback available for {feedbackType}s yet.
                  </div>
                ) : (
                  displayedFeedback.map(feedback => (
                    <div key={feedback.id} className="card" style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0' }}>{feedback.name}</h4>
                          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{feedback.course}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem' }}>{renderStars(feedback.rating)}</div>
                          <p style={{ margin: '0', color: '#666', fontSize: '0.8rem' }}>
                            {feedback.timestamp ? new Date(feedback.timestamp).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <p style={{ margin: '0', lineHeight: '1.6' }}>{feedback.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={loadRandomFeedback}
                  disabled={loading}
                  style={{ fontSize: '0.9rem' }}
                >
                  {loading ? 'Loading...' : 'Load More Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>Feedback Statistics</h2>
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.averageRating}</div>
              <h3>Average Rating</h3>
              <p>{publicFeedbackStats.averageRatingDescription}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.satisfactionRate}</div>
              <h3>Satisfaction Rate</h3>
              <p>{publicFeedbackStats.satisfactionRateDescription}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', color: '#007bff', fontWeight: 'bold' }}>{publicFeedbackStats.responseTime}</div>
              <h3>Response Time</h3>
              <p>{publicFeedbackStats.responseTimeDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Form Modal */}
      {showFeedbackModal && (
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
            width: '90%',
            maxWidth: '800px',
            height: '90%',
            maxHeight: '700px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowFeedbackModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}
              title="Close Form"
            >
              ×
            </button>

            {/* Form Header */}
            <div style={{
              padding: '20px 20px 10px 20px',
              borderBottom: '1px solid #eee',
              borderRadius: '15px 15px 0 0',
              background: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0', color: '#333', textAlign: 'center' }}>
                📝 Course Feedback Form
              </h3>
              <p style={{ margin: '5px 0 0 0', color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>
                Your feedback helps us improve our courses and platform
              </p>
            </div>

            {/* Embedded Feedback Form */}
            <div style={{
              height: 'calc(100% - 80px)',
              overflow: 'hidden',
              borderRadius: '0 0 15px 15px'
            }}>
              <iframe
                src={getFeedbackURL()}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  borderRadius: '0 0 15px 15px'
                }}
                title="Feedback Form"
              >
                Loading feedback form...
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;