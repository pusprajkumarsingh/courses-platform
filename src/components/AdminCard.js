import React, { useState } from 'react';

const AdminCard = ({ 
    title, 
    icon = '📋', 
    children, 
    collapsible = false, 
    defaultExpanded = true,
    headerActions = null,
    className = '',
    style = {}
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const cardStyle = {
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        ...style
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isExpanded ? '20px' : '0',
        cursor: collapsible ? 'pointer' : 'default'
    };

    const titleStyle = {
        margin: '0',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const toggleButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
    };

    const contentStyle = {
        display: isExpanded ? 'block' : 'none',
        animation: isExpanded ? 'fadeIn 0.3s ease' : 'none'
    };

    const handleHeaderClick = () => {
        if (collapsible) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className={`admin-card ${className}`} style={cardStyle}>
            <div style={headerStyle} onClick={handleHeaderClick}>
                <h2 style={titleStyle}>
                    <span>{icon}</span>
                    {title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {headerActions}
                    {collapsible && (
                        <button style={toggleButtonStyle} title={isExpanded ? 'Collapse' : 'Expand'}>
                            ▼
                        </button>
                    )}
                </div>
            </div>
            <div style={contentStyle}>
                {children}
            </div>
        </div>
    );
};

// Status indicator component for consistent status displays
export const StatusIndicator = ({ status, successText, errorText, className = '' }) => {
    if (!status) return null;

    const isSuccess = status.includes('successfully') || status.includes('✅') || status.includes('updated') || status.includes('added') || status.includes('deleted');
    
    const statusStyle = {
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '0.9rem',
        fontWeight: '500',
        background: isSuccess ? '#d4edda' : '#f8d7da',
        color: isSuccess ? '#155724' : '#721c24',
        border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    return (
        <div className={`status-indicator ${className}`} style={statusStyle}>
            <span>{isSuccess ? '✅' : '⚠️'}</span>
            {status}
        </div>
    );
};

// Form section component for consistent form layouts
export const FormSection = ({ title, children, className = '' }) => {
    const sectionStyle = {
        marginBottom: '25px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    };

    const titleStyle = {
        marginBottom: '15px',
        color: '#495057',
        fontSize: '1.1rem',
        fontWeight: '600'
    };

    return (
        <div className={`form-section ${className}`} style={sectionStyle}>
            {title && <h4 style={titleStyle}>{title}</h4>}
            {children}
        </div>
    );
};

// Stats grid component for displaying statistics
export const StatsGrid = ({ stats = [], className = '' }) => {
    // Ensure stats is always an array
    if (!Array.isArray(stats)) {
        console.warn('StatsGrid: stats prop must be an array');
        return null;
    }

    if (stats.length === 0) {
        return null;
    }

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
    };

    const statItemStyle = {
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center'
    };

    const statLabelStyle = {
        fontSize: '0.9rem',
        color: '#6c757d',
        marginBottom: '5px',
        fontWeight: '500'
    };

    const statValueStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#495057'
    };

    return (
        <div className={`stats-grid ${className}`} style={gridStyle}>
            {stats.map((stat, index) => {
                // Ensure stat is an object with required properties
                if (!stat || typeof stat !== 'object') {
                    console.warn(`StatsGrid: Invalid stat at index ${index}`);
                    return null;
                }

                return (
                    <div key={index} style={statItemStyle}>
                        <div style={statLabelStyle}>{stat.label || 'N/A'}</div>
                        <div style={statValueStyle}>{stat.value || 'N/A'}</div>
                    </div>
                );
            })}
        </div>
    );
};

// Action buttons component for consistent button layouts
export const ActionButtons = ({ buttons = [], status = '', className = '' }) => {
    // Ensure buttons is always an array
    if (!Array.isArray(buttons)) {
        console.warn('ActionButtons: buttons prop must be an array');
        return null;
    }

    if (buttons.length === 0 && !status) {
        return null;
    }

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '15px'
    };

    const buttonsRowStyle = {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    };

    const getButtonStyle = (variant = 'primary') => {
        const baseStyle = {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        };

        const variants = {
            primary: { background: '#007bff', color: 'white' },
            secondary: { background: '#6c757d', color: 'white' },
            success: { background: '#28a745', color: 'white' },
            danger: { background: '#dc3545', color: 'white' },
            warning: { background: '#ffc107', color: '#212529' },
            info: { background: '#17a2b8', color: 'white' },
            light: { background: '#f8f9fa', color: '#495057', border: '1px solid #dee2e6' }
        };

        return { ...baseStyle, ...variants[variant] };
    };

    const getStatusStyle = (status) => {
        const isError = status.toLowerCase().includes('error') || 
                       status.toLowerCase().includes('required') || 
                       status.toLowerCase().includes('invalid');
        
        const isSuccess = status.toLowerCase().includes('success') || 
                         status.toLowerCase().includes('updated') || 
                         status.toLowerCase().includes('saved');

        return {
            padding: '12px 15px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: isError ? '#f8d7da' : isSuccess ? '#d4edda' : '#d1ecf1',
            color: isError ? '#721c24' : isSuccess ? '#155724' : '#0c5460',
            border: `1px solid ${isError ? '#f5c6cb' : isSuccess ? '#c3e6cb' : '#bee5eb'}`,
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        };
    };

    const getStatusIcon = (status) => {
        const isError = status.toLowerCase().includes('error') || 
                       status.toLowerCase().includes('required') || 
                       status.toLowerCase().includes('invalid');
        
        const isSuccess = status.toLowerCase().includes('success') || 
                         status.toLowerCase().includes('updated') || 
                         status.toLowerCase().includes('saved');

        return isError ? '❌' : isSuccess ? '✅' : 'ℹ️';
    };

    return (
        <div className={`action-buttons ${className}`} style={containerStyle}>
            {buttons.length > 0 && (
                <div style={buttonsRowStyle}>
                    {buttons.map((button, index) => {
                        // Ensure button is an object with required properties
                        if (!button || typeof button !== 'object') {
                            console.warn(`ActionButtons: Invalid button at index ${index}`);
                            return null;
                        }

                        return (
                            <button
                                key={index}
                                onClick={button.onClick}
                                disabled={button.disabled}
                                style={{
                                    ...getButtonStyle(button.variant),
                                    opacity: button.disabled ? 0.6 : 1,
                                    cursor: button.disabled ? 'not-allowed' : 'pointer'
                                }}
                                title={button.title}
                            >
                                {button.icon && <span>{button.icon}</span>}
                                {button.label}
                            </button>
                        );
                    })}
                </div>
            )}
            
            {/* Status Message */}
            {status && (
                <div style={getStatusStyle(status)}>
                    <span>{getStatusIcon(status)}</span>
                    <span>{status}</span>
                </div>
            )}
        </div>
    );
};

export default AdminCard;