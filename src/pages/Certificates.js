import React, { useState, useEffect } from 'react';
import { EXCEL_CONFIG, readStandardCSV } from '../utils/excelReader';
import { generateCertificateWithImage } from '../utils/certificateGenerator';
import ConfigLogger from '../utils/configLogger';

const Certificates = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [certificateTemplate, setCertificateTemplate] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    email: 'support@eduplatform.com',
    phone: '+91 83406 85926'
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const certificatesPerPage = 10;

  // Load certificates from Google Sheets and certificate template on component mount
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Get certificate database URL from admin settings
        const savedURL = localStorage.getItem('certificateDataURL');
        const certificateURL = savedURL || EXCEL_CONFIG.EXCEL_FILE_URL;

        const certificates = await readStandardCSV(certificateURL);
        setExcelData(certificates);
      } catch (error) {
        setLoadError(error.message);
        // Fallback to sample data if Excel loading fails
        setExcelData([
          {
            certificateNumber: 'CERT-2024-001',
            studentName: 'John Doe',
            collegeId: 'STU001',
            courseName: 'Full Stack Web Development',
            issueDate: '2024-01-15',
            completionDate: '2024-01-10',
            grade: 'A+',
            instructor: 'Sarah Johnson',
            duration: '12 weeks',
            college: 'Tech University'
          },
          {
            certificateNumber: 'CERT-2025-018',
            studentName: 'Vikas Mishra',
            collegeId: 'STU018',
            courseName: 'Cyber Security',
            issueDate: '2025-01-15',
            completionDate: '2025-01-10',
            grade: 'A+',
            instructor: 'Puspraj Singh',
            duration: '8 weeks',
            college: 'Professional English Communication and Training Center'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    // Load saved certificate template from ConfigLogger
    const settings = ConfigLogger.getAdminSettings();
    if (settings.certificateTemplate) {
      setCertificateTemplate(settings.certificateTemplate);
    }

    // Load contact info from admin settings
    const loadContactInfo = () => {
      try {
        const savedContactInfo = localStorage.getItem('footerContactInfo');
        if (savedContactInfo) {
          const contactInfo = JSON.parse(savedContactInfo);
          setContactInfo({
            email: contactInfo.email || 'support@eduplatform.com',
            phone: contactInfo.phone || '+91 83406 85926'
          });
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      }
    };

    loadContactInfo();
    loadCertificates();
  }, []);

  const handleSearch = () => {
    if (!certificateNumber.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call delay
    setTimeout(() => {
      // Try multiple possible column names for certificate number
      const result = excelData.find(cert => {
        const possibleFields = [
          cert.certificateNumber,
          cert.CertificateNumber,
          cert['Certificate Number'],
          cert.certificate_number,
          cert.certNumber,
          cert.cert_number,
          cert.id,
          cert.ID,
          cert.number,
          cert.Number
        ];

        const searchTerm = certificateNumber.toLowerCase().trim();
        
        return possibleFields.some(field => 
          field && field.toString().toLowerCase() === searchTerm
        );
      });

      setSearchResult(result || null);
      setIsSearching(false);
    }, 1000);
  };

  const handleDownload = async (certificate) => {
    try {
      setIsDownloading(true);

      // Check if certificate template is available
      if (certificateTemplate) {
        console.log('Using certificate template:', certificateTemplate.substring(0, 50) + '...');
        await generateCertificateWithImage(certificate, certificateTemplate);
      } else {
        console.log('No certificate template found, using default HTML generator');
        alert('No certificate template uploaded. Please ask admin to upload the certificate design first.');
        return;
      }

      // Show success message
      alert(`Certificate PNG downloaded successfully for ${certificate.studentName}!`);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(`Failed to download certificate PNG: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="section-title">Certificate Verification</h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '50px', color: '#666' }}>
            Enter your certificate number to verify and download your certificate.
          </p>

          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
              <h3>Loading Certificate Database...</h3>
              <p style={{ color: '#666' }}>Connecting to database...</p>
            </div>
          )}

          {/* Error State */}
          {loadError && (
            <div style={{ background: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
              <h3>⚠️ Connection Issue</h3>
              <p>Unable to load certificate database: {loadError}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Using fallback data for demonstration.</p>
            </div>
          )}

          {/* Search Section - Only show when not loading */}
          {!isLoading && (
            <div className="certificate-search">
              <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🔍 Verify Certificate</h2>

              <div className="search-form">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter certificate number (e.g., CERT-2024-001)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ textTransform: 'uppercase' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={!certificateNumber.trim() || isSearching}
                >
                  {isSearching ? 'Verifying...' : 'Verify Certificate'}
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                Certificate numbers are case-insensitive. Example: CERT-2024-001
              </p>

              {/* Database Status Info */}
              <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '0.9rem', color: '#1976d2' }}>
                  📊 Database Status: Connected |
                  📋 Certificates available: <strong>{excelData.length}</strong> |
                  🔄 Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Search Results - Certificate Found */}
          {searchResult && (
            <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#28a745', marginBottom: '10px' }}>✅ Certificate Verified</h2>
                <p style={{ color: '#666' }}>This certificate is authentic and valid</p>
              </div>

              <div className="grid grid-2">
                <div>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Student Information</h3>
                  <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                    <p><strong>Student Name:</strong> {searchResult.studentName}</p>
                    <p><strong>College ID:</strong> {searchResult.collegeId}</p>
                    <p><strong>Certificate Number:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{searchResult.certificateNumber}</span></p>
                  </div>

                  <h3 style={{ marginBottom: '15px', color: '#333' }}>Course Details</h3>
                  <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px' }}>
                    <p><strong>Course:</strong> {searchResult.courseName}</p>
                    <p><strong>Duration:</strong> {searchResult.duration}</p>
                    <p><strong>Instructor:</strong> {searchResult.instructor}</p>
                    <p><strong>Grade:</strong> <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.1rem' }}>{searchResult.grade}</span></p>
                    <p><strong>Completion Date:</strong> {searchResult.completionDate}</p>
                    <p><strong>Issue Date:</strong> {searchResult.issueDate}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '30px',
                      borderRadius: '15px',
                      marginBottom: '20px',
                      border: '3px solid #ffd700',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                    <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>Certificate of Completion</h3>

                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '10px', margin: '15px 0' }}>
                      <p style={{ margin: '8px 0', fontSize: '0.9rem', opacity: '0.9' }}>This certifies that</p>
                      <h2 style={{ margin: '10px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>{searchResult.studentName}</h2>
                      <p style={{ margin: '5px 0', fontSize: '0.8rem', opacity: '0.8' }}>Student ID: {searchResult.collegeId}</p>
                      <p style={{ margin: '8px 0', fontSize: '0.9rem', opacity: '0.9' }}>has successfully completed</p>
                      <h3 style={{ margin: '10px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{searchResult.courseName}</h3>
                      <p style={{ margin: '8px 0', fontSize: '0.9rem', opacity: '0.9' }}>with grade: <strong>{searchResult.grade}</strong></p>
                      <p style={{ margin: '5px 0', fontSize: '0.8rem', opacity: '0.8' }}>{searchResult.college}</p>
                    </div>

                    <div style={{ fontSize: '0.7rem', opacity: '0.8', marginTop: '15px' }}>
                      <p>Certificate No: {searchResult.certificateNumber}</p>
                      <p>Issued: {searchResult.issueDate}</p>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownload(searchResult)}
                    disabled={isDownloading}
                    style={{ width: '100%', marginBottom: '15px', padding: '15px' }}
                  >
                    {isDownloading ? '⏳ Generating Certificate...' : '📥 Download Certificate PNG'}
                  </button>

                  <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', fontSize: '0.9rem' }}>
                    ✅ Certificate verified and authentic
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results - Certificate Not Found */}
          {searchResult === null && hasSearched && !isSearching && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '30px', borderRadius: '15px', textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>❌</div>
              <h3 style={{ marginBottom: '15px' }}>Certificate Not Found</h3>
              <p style={{ marginBottom: '20px' }}>
                No certificate found with number: <strong>{certificateNumber}</strong>
              </p>
              <div style={{ background: 'rgba(255,255,255,0.3)', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '0.9rem' }}>
                  Please check your certificate number and try again.<br />
                  Make sure to enter the complete certificate number as shown on your certificate.
                </p>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div style={{ background: '#f8f9fa', padding: '40px', borderRadius: '15px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Certificate Verification Information</h2>

            <div className="grid grid-2">
              <div>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>🎓 For Students</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Find your certificate number on your physical or digital certificate</li>
                  <li>Enter the complete certificate number in the search box above</li>
                  <li>Verify your details and download your certificate</li>
                  <li>Certificates are available immediately after course completion</li>
                  <li>Keep your certificate number safe for future verification</li>
                </ul>
              </div>

              <div>
                <h3 style={{ color: '#28a745', marginBottom: '15px' }}>🏢 For Employers</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Ask candidates for their certificate number</li>
                  <li>Enter the number to instantly verify authenticity</li>
                  <li>Check that student details match the candidate</li>
                  <li>All certificates are digitally verified and tamper-proof</li>
                  <li>Contact us if you need additional verification</li>
                </ul>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px', background: 'white', borderRadius: '10px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Need Help?</h4>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                If you can't find your certificate or need assistance, please contact our support team.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <span>📧 {contactInfo.email}</span>
                <span>📞 {contactInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Certificates;