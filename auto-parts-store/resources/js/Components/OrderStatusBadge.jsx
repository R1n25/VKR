import React from 'react';

export default function OrderStatusBadge({ status, size = 'md' }) {
    // Функция для получения текстового представления статуса заказа
    const getStatusText = (status) => {
        // Используем встроенный перевод
        const statuses = {
            'pending': 'Ожидает обработки',
            'processing': 'В работе',
            'ready_for_pickup': 'Готов к выдаче',
            'ready_for_delivery': 'Готов к доставке',
            'in_delivery': 'В доставке',
            'shipping': 'В доставке',
            'delivered': 'Выдано',
            'returned': 'Возвращен'
        };
        
        return statuses[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        const classes = {
            'pending': 'bg-blue-100 text-blue-800 border-blue-200',
            'processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'ready_for_pickup': 'bg-green-100 text-green-800 border-green-200',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'in_delivery': 'bg-purple-100 text-purple-800 border-purple-200',
            'shipping': 'bg-purple-100 text-purple-800 border-purple-200',
            'delivered': 'bg-green-100 text-green-800 border-green-200',
            'returned': 'bg-red-100 text-red-800 border-red-200'
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
            'processing': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            'ready_for_pickup': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
            'ready_for_delivery': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            'in_delivery': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'shipping': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'delivered': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'returned': (
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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