import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function FlashMessage() {
    const { flash = {} } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        if (flash && (flash.success || flash.error)) {
            setMessage(flash.success || flash.error);
            setType(flash.success ? 'success' : 'error');
            setVisible(true);
            
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible) return null;

    const getTypeClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 text-green-800 border-green-300';
            case 'error':
                return 'bg-red-50 text-red-800 border-red-300';
            default:
                return 'bg-blue-50 text-blue-800 border-blue-300';
        }
    };
    
    const getIconClasses = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className={`fixed top-20 right-4 z-50 rounded-lg shadow-lg p-4 border ${getTypeClasses()} max-w-md flex items-start`}>
            <div className="flex-shrink-0 mr-3">
                {getIconClasses()}
            </div>
            <div className="flex-1">
                <p>{message}</p>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="ml-4 text-gray-500 hover:text-gray-700"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
} 