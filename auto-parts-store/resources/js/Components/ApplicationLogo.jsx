import React from 'react';

export default function ApplicationLogo({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
            <path d="M7 4.5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1.5" />
            <path d="M17 19.5V21a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1.5" />
            <path d="M5 8l2-2" />
            <path d="M19 8l-2-2" />
        </svg>
    );
}
