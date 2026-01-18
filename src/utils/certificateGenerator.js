import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateCertificate = async (studentData, certificateTemplate) => {
  try {
    // Create a temporary container for the certificate
    const certificateContainer = document.createElement('div');
    certificateContainer.style.position = 'absolute';
    certificateContainer.style.left = '-9999px';
    certificateContainer.style.width = '800px';
    certificateContainer.style.height = '600px';
    certificateContainer.style.background = 'white';
    certificateContainer.style.padding = '40px';
    certificateContainer.style.fontFamily = 'Arial, sans-serif';

    // Add certificate content
    certificateContainer.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; text-align: center;">
        ${certificateTemplate ? `<img src="${certificateTemplate}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" alt="Certificate Template" />` : ''}
        
        <!-- Student Name Overlay -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
          <h1 style="font-size: 36px; font-weight: bold; color: #2c3e50; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
            ${studentData.studentName}
          </h1>
        </div>
        
        <!-- Certificate Number at Bottom -->
        <div style="position: absolute; bottom: 20px; right: 20px; z-index: 10;">
          <p style="font-size: 14px; color: #7f8c8d; margin: 0;">
            Certificate No: ${studentData.certificateNumber}
          </p>
        </div>
        
        <!-- Course Name -->
        <div style="position: absolute; top: 60%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
          <p style="font-size: 18px; color: #34495e; margin: 0;">
            ${studentData.courseName}
          </p>
        </div>
        
        <!-- Issue Date -->
        <div style="position: absolute; bottom: 20px; left: 20px; z-index: 10;">
          <p style="font-size: 14px; color: #7f8c8d; margin: 0;">
            Issued: ${studentData.issueDate}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(certificateContainer);

    // Generate canvas from the certificate container
    const canvas = await html2canvas(certificateContainer, {
      width: 800,
      height: 600,
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    // Remove temporary container
    document.body.removeChild(certificateContainer);

    // Create PDF
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit A4 landscape
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Download the PDF
    pdf.save(`Certificate_${studentData.studentName}_${studentData.certificateNumber}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error('Failed to generate certificate');
  }
};

// Alternative method for image-based certificates - optimized for your specific template
export const generateCertificateWithImage = async (studentData, certificateImageUrl) => {
  try {
    console.log('Starting certificate generation...');
    console.log('Student data:', studentData);
    console.log('Template URL length:', certificateImageUrl.length);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to high resolution for better PNG quality
    canvas.width = 1920;  // Increased from 1024 for better quality
    canvas.height = 1440; // Increased from 768 for better quality

    console.log('Canvas created:', canvas.width, 'x', canvas.height);

    // Load certificate template image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = () => {
        console.log('Image loaded successfully');
        console.log('Image dimensions:', img.width, 'x', img.height);

        // Draw the certificate template
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log('Template drawn on canvas');

        // Configure text styling for your certificate design
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add student name in elegant script font (scaled for higher resolution)
        ctx.font = '120px "Monotype Corsiva", "Script MT Bold", "French Script MT", "Vivaldi", "Vladimir Script", cursive';
        ctx.fillStyle = '#2c5aa0';
        ctx.textAlign = 'center';
        ctx.fillText(studentData.studentName, canvas.width / 2, canvas.height * 0.50);
        console.log('Student name added (centered, elegant script font):', studentData.studentName);

        // Add certificate number at bottom center (scaled for higher resolution)
        ctx.font = '30px Arial';
        ctx.fillStyle = '#2c5aa0';
        ctx.textAlign = 'center';
        ctx.fillText(`Certificate No: ${studentData.certificateNumber}`, canvas.width / 2, canvas.height * 0.88);
        console.log('Certificate number added at bottom center');

        // Add issue date below the certificate number (scaled for higher resolution)
        ctx.font = '26px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText(`Issue Date: ${studentData.issueDate}`, canvas.width / 2, canvas.height * 0.91);
        console.log('Issue date added below certificate number (centered)');

        // Add grade at top right corner
        console.log('All text elements added');

        // Convert to blob and download as high-quality PNG
        canvas.toBlob((blob) => {
          console.log('Canvas converted to blob, size:', blob.size);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Certificate_${studentData.studentName.replace(/\s+/g, '_')}_${studentData.certificateNumber}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('Certificate PNG download initiated');
          resolve(true);
        }, 'image/png', 1.0); // 1.0 = highest quality
      };

      img.onerror = (error) => {
        console.error('Image loading failed:', error);
        reject(new Error('Failed to load certificate template'));
      };

      console.log('Setting image source...');
      img.src = certificateImageUrl;
    });
  } catch (error) {
    console.error('Error generating certificate with image:', error);
    throw new Error('Failed to generate certificate');
  }
};