import React from 'react';

export default function AdminAlert({ 
    type = 'info', // 'info', 'success', 'warning', 'error'
    message, 
    onClose = null,
    className = '',
    showIcon = true
}) {
    const typeClasses = {
        'info': 'bg-blue-50 text-blue-800 border-blue-100',
        'success': 'bg-green-50 text-green-800 border-green-100',
        'warning': 'bg-yellow-50 text-yellow-800 border-yellow-100',
        'error': 'bg-red-50 text-red-800 border-red-100'
    };

    const icons = {
        'info': (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        'success': (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        'warning': (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        'error': (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    return (
        <div className={`p-4 mb-4 rounded-lg border ${typeClasses[type]} ${className}`}>
            <div className="flex items-center">
                {showIcon && icons[type]}
                <div className="flex-1">{message}</div>
                {onClose && (
                    <button 
                        onClick={onClose} 
                        className="ml-auto p-1 hover:bg-white hover:bg-opacity-25 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
} 