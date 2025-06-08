import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminPageHeader({
    title,
    subtitle = null,
    actions = null,
    backUrl = null,
    backText = 'Назад'
}) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <div>
                    {backUrl && (
                        <Link 
                            href={backUrl} 
                            className="text-[#243969] hover:text-[#3a5085] inline-flex items-center mb-2"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {backText}
                        </Link>
                    )}
                    <h1 className="text-2xl font-bold text-[#243969] flex items-center">
                        {title}
                    </h1>
                    {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
                </div>
                {actions && <div className="flex space-x-2">{actions}</div>}
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-[#243969] to-transparent opacity-25"></div>
        </div>
    );
} 