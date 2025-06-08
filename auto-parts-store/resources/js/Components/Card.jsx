import React from 'react';

export default function Card({ className = '', children, header = null, footer = null }) {
    return (
        <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg ${className}`}>
            {header && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    {header}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {footer}
                </div>
            )}
        </div>
    );
} 