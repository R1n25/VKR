import React, { useState, useEffect } from 'react';

export default function Notification({ type, message, onClose, autoClose = true, duration = 3000 }) {
    const [isVisible, setIsVisible] = useState(true);
    
    // Определяем стили в зависимости от типа уведомления
    const bgColor = type === 'success' 
        ? 'bg-green-100 border-green-500 text-green-700' 
        : type === 'error' 
            ? 'bg-red-100 border-red-500 text-red-700'
            : 'bg-blue-100 border-blue-500 text-blue-700';
    
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);
    
    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };
    
    if (!isVisible) return null;
    
    return (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded border ${bgColor} max-w-md z-50 shadow-md`}>
            <div className="flex items-center">
                {type === 'success' ? (
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                ) : type === 'error' ? (
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                )}
                <span>{message}</span>
                <button 
                    onClick={handleClose} 
                    className="ml-auto"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
} 