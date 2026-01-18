import React, { useEffect, useState } from 'react';

// Obfuscated link configuration - encoded and split
const _0x1a2b = ['L2Fib3V0', 'L2NvdXJzZXM=', 'L2NlcnRpZmljYXRlcw=='];

// Default fallback social media links (encoded)
const _0x3c4d = [
    'aHR0cHM6Ly9mYWNlYm9vay5jb20vZWR1cGxhdGZvcm0=',
    'aHR0cHM6Ly90d2l0dGVyLmNvbS9lZHVwbGF0Zm9ybQ==',
    'aHR0cHM6Ly9pbnN0YWdyYW0uY29tL2VkdXBsYXRmb3Jt',
    'aHR0cHM6Ly9saW5rZWRpbi5jb20vY29tcGFueS9lZHVwbGF0Zm9ybQ=='
];

// Anti-debugging and inspection protection
const _0x9i0j = () => {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        console.clear();
        return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 's')
        ) {
            e.preventDefault();
            console.clear();
            return false;
        }
    });

    // Detect DevTools opening
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                // Redirect or show warning
                document.body.innerHTML = '<div style="text-align:center;padding:50px;font-size:24px;">Access Restricted</div>';
            }
        } else {
            devtools.open = false;
        }
    }, 500);

    // Clear console periodically
    setInterval(() => {
        console.clear();
    }, 1000);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
};

// Link integrity protection
const _0x2k3l = new Map();
const _0x4m5n = (element, originalHref) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                const currentHref = element.getAttribute('href');
                if (currentHref !== originalHref) {
                    console.warn('Link manipulation detected!');
                    element.setAttribute('href', originalHref);
                    // Log security incident
                    fetch('/api/security-log', {
                        method: 'POST',
                        body: JSON.stringify({
                            type: 'link_manipulation',
                            original: originalHref,
                            attempted: currentHref,
                            timestamp: Date.now()
                        })
                    }).catch(() => { });
                }
            }
        });
    });

    observer.observe(element, { attributes: true });
    _0x2k3l.set(element, observer);
};

// Dynamic link resolver with runtime decoding
const _0x5e6f = (i, t) => {
    try {
        const arr = t === 'i' ? _0x1a2b : _0x3c4d;
        return atob(arr[i]);
    } catch { return null; }
};

// Additional obfuscation layer
const _0x7g8h = {
    i: [0, 1, 2], // internal link indices
    s: [0, 1, 2, 3] // social link indices
};

// Security utility functions
const validateUrl = (url) => {
    try {
        const urlObj = new URL(url, window.location.origin);
        // Only allow https for external links and relative paths for internal
        if (url.startsWith('/')) return url;
        return urlObj.protocol === 'https:' ? urlObj.href : null;
    } catch {
        return null;
    }
};

const SecureLink = ({ href, children, className, isExternal = false }) => {
    // Always call hooks first - before any conditional logic
    const linkRef = React.useRef(null);
    
    const validatedHref = validateUrl(href);

    // useEffect must be called unconditionally
    React.useEffect(() => {
        if (linkRef.current && validatedHref) {
            _0x4m5n(linkRef.current, validatedHref);
        }
        return () => {
            if (linkRef.current && _0x2k3l.has(linkRef.current)) {
                _0x2k3l.get(linkRef.current).disconnect();
                _0x2k3l.delete(linkRef.current);
            }
        };
    }, [validatedHref]);

    // Conditional logic comes after hooks
    if (!validatedHref) {
        console.warn(`Invalid URL blocked: ${href}`);
        return <span className={className}>{children}</span>;
    }

    const securityProps = isExternal ? {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        'data-external': 'true'
    } : {};

    return (
        <a
            ref={linkRef}
            href={validatedHref}
            className={className}
            {...securityProps}
            onContextMenu={(e) => e.preventDefault()}
            style={{ pointerEvents: 'auto' }}
        >
            {children}
        </a>
    );
};

const Footer = () => {
    const [socialMediaLinks, setSocialMediaLinks] = useState({
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        whatsapp: ''
    });

    // Footer contact information state
    const [footerContactInfo, setFooterContactInfo] = useState({
        email: 'info@eduplatform.com',
        phone: '+91 83406 85926',
        address: '123 Education Street, Learning City, LC 12345',
        companyName: 'EduPlatform',
        tagline: 'Designed with ❤️ for education',
        websiteName: 'EduPlatform',
        copyrightText: '© 2024 EduPlatform. All rights reserved.'
    });

    // Load social media links and contact info from admin settings
    useEffect(() => {
        const loadSocialMediaLinks = () => {
            try {
                const savedLinks = localStorage.getItem('socialMediaLinks');
                if (savedLinks) {
                    setSocialMediaLinks(JSON.parse(savedLinks));
                } else {
                    // Use default fallback links if no admin settings
                    setSocialMediaLinks({
                        facebook: _0x5e6f(0, 's'),
                        twitter: _0x5e6f(1, 's'),
                        instagram: _0x5e6f(2, 's'),
                        linkedin: _0x5e6f(3, 's'),
                        youtube: '',
                        whatsapp: ''
                    });
                }
            } catch (error) {
                console.error('Error loading social media links:', error);
                // Use default fallback links on error
                setSocialMediaLinks({
                    facebook: _0x5e6f(0, 's'),
                    twitter: _0x5e6f(1, 's'),
                    instagram: _0x5e6f(2, 's'),
                    linkedin: _0x5e6f(3, 's'),
                    youtube: '',
                    whatsapp: ''
                });
            }
        };

        const loadFooterContactInfo = () => {
            try {
                const savedContactInfo = localStorage.getItem('footerContactInfo');
                if (savedContactInfo) {
                    const contactInfo = JSON.parse(savedContactInfo);
                    setFooterContactInfo({
                        email: contactInfo.email || 'info@eduplatform.com',
                        phone: contactInfo.phone || '+91 83406 85926',
                        address: contactInfo.address || '123 Education Street, Learning City, LC 12345',
                        companyName: contactInfo.companyName || 'EduPlatform',
                        tagline: contactInfo.tagline || 'Designed with ❤️ for education',
                        websiteName: contactInfo.websiteName || 'EduPlatform',
                        stayUpdatedTitle: contactInfo.stayUpdatedTitle || 'Stay Updated',
                        stayUpdatedDescription: contactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications',
                        copyrightText: contactInfo.copyrightText || '© 2024 EduPlatform. All rights reserved.'
                    });
                }
            } catch (error) {
                console.error('Error loading footer contact info:', error);
            }
        };

        loadSocialMediaLinks();
        loadFooterContactInfo();
        _0x9i0j();

        // Listen for branding updates from admin panel
        const handleBrandingUpdate = () => {
            loadFooterContactInfo();
        };

        window.addEventListener('brandingUpdated', handleBrandingUpdate);

        // Cleanup event listener
        return () => {
            window.removeEventListener('brandingUpdated', handleBrandingUpdate);
        };
    }, []);

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Contact Information</h3>
                        {footerContactInfo.email && (
                            <div className="contact-item">
                                <span className="contact-icon">📧</span>
                                <a href={`mailto:${footerContactInfo.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {footerContactInfo.email}
                                </a>
                            </div>
                        )}
                        {footerContactInfo.phone && (
                            <div className="contact-item">
                                <span className="contact-icon">📞</span>
                                <a href={`tel:${footerContactInfo.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {footerContactInfo.phone}
                                </a>
                            </div>
                        )}
                        {footerContactInfo.address && (
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>{footerContactInfo.address}</span>
                            </div>
                        )}
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            <li>
                                <SecureLink href={_0x5e6f(_0x7g8h.i[0], 'i')}>
                                    About Us
                                </SecureLink>
                            </li>
                            <li>
                                <SecureLink href={_0x5e6f(_0x7g8h.i[1], 'i')}>
                                    Courses
                                </SecureLink>
                            </li>
                            <li>
                                <SecureLink href={_0x5e6f(_0x7g8h.i[2], 'i')}>
                                    Certificates
                                </SecureLink>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Follow Us</h3>
                        <div className="social-links">
                            {socialMediaLinks.facebook && (
                                <SecureLink
                                    href={socialMediaLinks.facebook}
                                    className="social-link facebook"
                                    isExternal={true}
                                >
                                    <span>f</span>
                                </SecureLink>
                            )}
                            {socialMediaLinks.twitter && (
                                <SecureLink
                                    href={socialMediaLinks.twitter}
                                    className="social-link twitter"
                                    isExternal={true}
                                >
                                    <span>𝕏</span>
                                </SecureLink>
                            )}
                            {socialMediaLinks.instagram && (
                                <SecureLink
                                    href={socialMediaLinks.instagram}
                                    className="social-link instagram"
                                    isExternal={true}
                                >
                                    <span>📸</span>
                                </SecureLink>
                            )}
                            {socialMediaLinks.linkedin && (
                                <SecureLink
                                    href={socialMediaLinks.linkedin}
                                    className="social-link linkedin"
                                    isExternal={true}
                                >
                                    <span>in</span>
                                </SecureLink>
                            )}
                            {socialMediaLinks.youtube && (
                                <SecureLink
                                    href={socialMediaLinks.youtube}
                                    className="social-link youtube"
                                    isExternal={true}
                                >
                                    <span>📺</span>
                                </SecureLink>
                            )}
                            {socialMediaLinks.whatsapp && (
                                <SecureLink
                                    href={socialMediaLinks.whatsapp}
                                    className="social-link whatsapp"
                                    isExternal={true}
                                >
                                    <span>💬</span>
                                </SecureLink>
                            )}
                        </div>
                        <div className="footer-newsletter">
                            <h4>{footerContactInfo.stayUpdatedTitle || 'Stay Updated'}</h4>
                            <p>{footerContactInfo.stayUpdatedDescription || 'Get the latest updates about our courses and certifications'}</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p>{footerContactInfo.copyrightText || `© 2024 ${footerContactInfo.companyName || footerContactInfo.websiteName || 'EduPlatform'}. All rights reserved.`}</p>
                        {footerContactInfo.tagline && <p>{footerContactInfo.tagline}</p>}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;