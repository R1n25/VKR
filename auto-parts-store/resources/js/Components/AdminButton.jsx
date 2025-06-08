import React from 'react';

export default function AdminButton({
    children,
    className = '',
    variant = 'primary', // primary, secondary, success, danger, info, warning
    size = 'md', // sm, md, lg
    icon = null,
    iconPosition = 'left', // left, right
    disabled = false,
    type = 'button',
    ...props
}) {
    // Варианты цветов
    const variantClasses = {
        primary: 'bg-[#243969] hover:bg-[#3a5085] focus:bg-[#3a5085] text-white focus:ring-[#243969] active:bg-[#172544]',
        secondary: 'bg-white border-[#d1d5db] text-[#3a5085] hover:bg-gray-50 hover:text-[#243969] focus:ring-[#243969]',
        success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 active:bg-green-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 active:bg-red-800',
        info: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400 active:bg-blue-700',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 active:bg-yellow-700',
    };

    // Варианты размеров
    const sizeClasses = {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-4 py-2 text-xs',
        lg: 'px-6 py-3 text-sm',
    };

    // Класс границы
    const borderClass = variant === 'secondary' ? 'border' : 'border border-transparent';

    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center rounded-md
                ${borderClass}
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                font-semibold uppercase tracking-widest
                transition duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                ${className}
            `}
            {...props}
        >
            {icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
} 