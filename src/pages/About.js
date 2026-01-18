import React, { useState, useEffect } from 'react';

const About = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [aboutUsContent, setAboutUsContent] = useState({
    mission: {
      paragraph1: '',
      paragraph2: ''
    },
    vision: {
      paragraph1: '',
      paragraph2: ''
    },
    values: []
  });

  // Load team members and about us content from admin data
  useEffect(() => {
    loadTeamMembers();
    loadAboutUsContent();
  }, []);

  const loadAboutUsContent = () => {
    try {
      const savedAboutUsContent = localStorage.getItem('aboutUsContent');
      if (savedAboutUsContent) {
        setAboutUsContent(JSON.parse(savedAboutUsContent));
      } else {
        // Fallback to default content if no admin data
        const defaultContent = {
          mission: {
            paragraph1: 'At our institution, our mission is to provide industry-oriented training for B.Tech students that prepares them for real-world corporate challenges. We aim to bridge the gap between academic knowledge and practical application through hands-on learning and real-time exposure.',
            paragraph2: 'We focus on delivering training guided by experienced corporate professionals, helping students build strong technical foundations, practical skills, and career readiness.'
          },
          vision: {
            paragraph1: 'Our vision is to become a trusted training institute that transforms engineering students into skilled, confident, and job-ready professionals.',
            paragraph2: 'We envision a future where students are not just degree holders but industry-ready individuals who can adapt, perform, and grow in real corporate environments.'
          },
          values: [
            {
              id: 1,
              title: 'Excellence',
              icon: '🎯',
              description: 'We maintain high standards in training quality, curriculum design, and student mentorship to ensure meaningful learning outcomes.'
            },
            {
              id: 2,
              title: 'Accessibility',
              icon: '🤝',
              description: 'We believe true learning comes from real-world experience. Our training emphasizes hands-on practice, live projects, and industry use cases.'
            },
            {
              id: 3,
              title: 'Innovation',
              icon: '🚀',
              description: 'We continuously update our curriculum based on current corporate trends, tools, and technologies to keep students job-ready.'
            }
          ]
        };
        setAboutUsContent(defaultContent);
      }
    } catch (error) {
      console.error('Error loading about us content:', error);
    }
  };

  const loadTeamMembers = () => {
    try {
      const savedTeamMembers = localStorage.getItem('teamMembers');
      if (savedTeamMembers) {
        setTeamMembers(JSON.parse(savedTeamMembers));
      } else {
        // Get website name for email domain
        const getEmailDomain = () => {
          try {
            const savedContactInfo = localStorage.getItem('footerContactInfo');
            if (savedContactInfo) {
              const contactInfo = JSON.parse(savedContactInfo);
              if (contactInfo.email) {
                const domain = contactInfo.email.split('@')[1];
                return domain;
              }
            }
          } catch (error) {
            console.error('Error getting email domain:', error);
          }
          return 'eduplatform.com';
        };

        const emailDomain = getEmailDomain();
        
        // Fallback to default team members if no admin data
        setTeamMembers([
          {
            id: 1,
            name: 'John Smith',
            position: 'CEO & Founder',
            description: '15+ years in education technology and online learning platforms.',
            imageUrl: '',
            email: `john@${emailDomain}`,
            linkedin: ''
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            position: 'Head of Curriculum',
            description: 'Former university professor with expertise in curriculum development.',
            imageUrl: '',
            email: `sarah@${emailDomain}`,
            linkedin: ''
          },
          {
            id: 3,
            name: 'Mike Chen',
            position: 'CTO',
            description: 'Technology leader with experience in building scalable learning platforms.',
            imageUrl: '',
            email: `mike@${emailDomain}`,
            linkedin: ''
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="section-title">About Us</h1>

          <div className="grid grid-2" style={{ marginBottom: '60px' }}>
            <div>
              <h2>Our Mission</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                {aboutUsContent.mission.paragraph1}
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                {aboutUsContent.mission.paragraph2}
              </p>
            </div>
            <div>
              <h2>Our Vision</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                {aboutUsContent.vision.paragraph1}
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                {aboutUsContent.vision.paragraph2}
              </p>
            </div>
          </div>

          <div style={{ background: '#f8f9fa', padding: '60px 40px', borderRadius: '15px', marginBottom: '60px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Values</h2>
            <div className="grid grid-3">
              {aboutUsContent.values.map((value) => (
                <div key={value.id} style={{ textAlign: 'center' }}>
                  <h3>{value.icon} {value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Our Team</h2>

            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px' }}>
                Our trainers are working professionals and experienced corporate experts with real industry exposure. They bring practical insights, real project experience, and workplace best practices into the classroom.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
                Our team is committed to mentoring students not just academically, but also professionally — guiding them in career planning, interviews, and workplace expectations.
              </p>
            </div>

            <div className="grid grid-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    background: member.imageUrl 
                      ? `url(${member.imageUrl})` 
                      : 'linear-gradient(45deg, #667eea, #764ba2)', 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    margin: '0 auto 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white', 
                    fontSize: member.imageUrl ? '0' : '2rem'
                  }}>
                    {!member.imageUrl && (
                      <span style={{ fontSize: '1.5rem' }}>
                        {getInitials(member.name)}
                      </span>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p style={{ color: '#666', marginBottom: '10px' }}>{member.position}</p>
                  <p>{member.description}</p>
                  
                  {/* Contact Links */}
                  {(member.email || member.linkedin) && (
                    <div style={{ 
                      marginTop: '15px'
                    }}>
                      {member.email && (
                        <div style={{ marginBottom: '8px' }}>
                          <a 
                            href={`mailto:${member.email}`}
                            style={{ 
                              color: '#667eea', 
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px'
                            }}
                            title={`Email ${member.name}`}
                          >
                            <span style={{ fontSize: '1.1rem' }}>📧</span>
                            {member.email}
                          </a>
                        </div>
                      )}
                      {member.linkedin && (
                        <div>
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#667eea', 
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px'
                            }}
                            title={`${member.name}'s LinkedIn`}
                          >
                            <span style={{ fontSize: '1.1rem' }}>💼</span>
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;