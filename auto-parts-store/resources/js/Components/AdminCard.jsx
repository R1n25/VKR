import React from 'react';

export default function AdminCard({ 
    children, 
    className = '', 
    header = null, 
    footer = null,
    headerClassName = '',
    bodyClassName = '',
    footerClassName = ''
}) {
    return (
        <div className={`admin-card ${className}`}>
            {header && (
                <div className={`admin-card-header ${headerClassName}`}>
                    {header}
                </div>
            )}
            <div className={`admin-card-body ${bodyClassName}`}>
                {children}
            </div>
            {footer && (
                <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );
} 