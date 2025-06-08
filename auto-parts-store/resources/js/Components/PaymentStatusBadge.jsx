import React from 'react';

export default function PaymentStatusBadge({ status, size = 'md' }) {
    // Функция для получения текстового представления статуса оплаты
    const getStatusText = (status) => {
        const statuses = {
            'pending': 'Ожидает оплаты',
            'paid': 'Оплачен',
            'partially_paid': 'Частично оплачен',
            'refunded': 'Возврат',
            'failed': 'Ошибка оплаты',
            'canceled': 'Отменен'
        };
        
        return statuses[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'paid': 'bg-green-100 text-green-800 border-green-200',
            'partially_paid': 'bg-blue-100 text-blue-800 border-blue-200',
            'refunded': 'bg-purple-100 text-purple-800 border-purple-200',
            'failed': 'bg-red-100 text-red-800 border-red-200',
            'canceled': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        
        return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Функция для получения иконки статуса
    const getStatusIcon = (status) => {
        const icons = {
            'pending': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'paid': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
            'partially_paid': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'refunded': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            ),
            'failed': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'canceled': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        };
        
        return icons[status] || null;
    };

    const sizeClasses = {
        'sm': 'text-xs px-2 py-0.5',
        'md': 'text-xs px-2.5 py-1',
        'lg': 'text-sm px-3 py-1.5'
    };

    return (
        <span className={`inline-flex items-center rounded-full border ${getStatusColorClass(status)} ${sizeClasses[size] || sizeClasses.md}`}>
            {getStatusIcon(status)}
            {getStatusText(status)}
        </span>
    );
} 