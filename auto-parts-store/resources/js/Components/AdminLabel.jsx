import React from 'react';

export default function AdminLabel({ forInput, value, className = '', children, required = false }) {
    return (
        <label 
            htmlFor={forInput} 
            className={`admin-label ${className}`}
        >
            {value || children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
} 