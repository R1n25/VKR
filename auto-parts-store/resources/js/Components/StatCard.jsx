import React from 'react';

export default function StatCard({
    title,
    value,
    icon = null,
    variant = 'primary', // primary, success, warning, info, danger
    change = null,
    changeType = 'up', // up, down
    subtitle = null,
    className = '',
}) {
    // Определение цветов в зависимости от варианта
    const variantClasses = {
        primary: {
            bg: 'bg-[#eef2ff]',
            border: 'border-[#d3deff]',
            text: 'text-[#2a4075]',
            valueText: 'text-[#3a5195]',
        },
        success: {
            bg: 'bg-[#f0fdf4]',
            border: 'border-[#d1fae5]',
            text: 'text-[#166534]',
            valueText: 'text-[#16a34a]',
        },
        warning: {
            bg: 'bg-[#fefce8]',
            border: 'border-[#fef3c7]',
            text: 'text-[#854d0e]',
            valueText: 'text-[#ca8a04]',
        },
        info: {
            bg: 'bg-[#e0f2fe]',
            border: 'border-[#bae6fd]',
            text: 'text-[#0c4a6e]',
            valueText: 'text-[#0284c7]',
        },
        danger: {
            bg: 'bg-[#fef2f2]',
            border: 'border-[#fee2e2]',
            text: 'text-[#991b1b]',
            valueText: 'text-[#dc2626]',
        },
    };

    // Определение цветов для изменения
    const changeClasses = {
        up: 'text-green-600',
        down: 'text-red-600',
    };

    const classes = variantClasses[variant] || variantClasses.primary;

    return (
        <div className={`p-4 rounded-lg shadow border ${classes.bg} ${classes.border} transition-all duration-300 hover:shadow-md ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${classes.text}`}>{title}</h3>
                {icon && (
                    <div className={`p-2 rounded-full ${classes.bg} ${classes.text}`}>
                        {icon}
                    </div>
                )}
            </div>
            <p className={`text-3xl font-bold ${classes.valueText}`}>{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {change && (
                <div className={`flex items-center mt-2 text-sm ${changeClasses[changeType]}`}>
                    {changeType === 'up' ? (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                        </svg>
                    )}
                    {change}
                </div>
            )}
        </div>
    );
} 