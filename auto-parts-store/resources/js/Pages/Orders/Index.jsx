import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Orders({ auth, orders }) {
    // Создаем объект с развернутыми заказами по умолчанию
    const initialExpandedOrders = {};
    orders.forEach(order => {
        initialExpandedOrders[order.id] = true;
    });
    
    // Состояние для отслеживания открытых/закрытых деталей заказов
    const [expandedOrders, setExpandedOrders] = useState(initialExpandedOrders);
    
    // Функция для переключения состояния раскрытия заказа
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };
    
    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса заказа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'processing': 'В работе',
            'ready_for_pickup': 'Готов к выдаче',
            'ready_for_delivery': 'Готов к доставке',
            'shipping': 'В доставке',
            'delivered': 'Выдано',
            'returned': 'Возвращен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'ready_for_pickup': 'bg-green-100 text-green-800',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-200 text-green-900',
            'returned': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказы</h2>}
        >
            <Head title="Заказы" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            {orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-600 mb-2">Заказов пока нет</p>
                                        <p className="text-gray-500 mb-4">Оформите заказ, чтобы он появился в этом списке</p>
                                        <Link
                                            href="/"
                                            className="btn btn-primary inline-flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Перейти к покупкам
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive overflow-hidden">
                                    <div className="mb-6 border-b border-gray-200 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">История заказов</h3>
                                        <p className="text-sm text-gray-500">Управление и отслеживание ваших заказов</p>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                                                    № заказа
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                                    Дата
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                                                    Клиент
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                                    Сумма
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                                                    Статус заказа
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <React.Fragment key={order.id}>
                                                    <tr className={expandedOrders[order.id] ? "bg-gray-50" : "hover:bg-gray-50 transition-colors duration-150"}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            <div className="flex items-center">
                                                                <button 
                                                                    onClick={() => toggleOrderDetails(order.id)}
                                                                    className="mr-2 text-primary-600 focus:outline-none transition-transform duration-200 ease-in-out transform" 
                                                                    style={{ transform: expandedOrders[order.id] ? 'rotate(90deg)' : 'rotate(0)' }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </button>
                                                                <span className="text-gray-900 font-medium">
                                                                    {order.order_number || `#${order.id}`}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(order.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Н/Д')}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            {Number(order.total || 0).toFixed(2)} руб.
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge ${getStatusClass(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Развернутые детали заказа */}
                                                    {expandedOrders[order.id] && order.order_items && order.order_items.length > 0 && (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-4 bg-gray-50 animate-fade-in">
                                                                <div className="border-t border-gray-200 pt-4">
                                                                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                                                        <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                        </svg>
                                                                        Товары в заказе
                                                                    </h4>
                                                                    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                                                                        <table className="min-w-full divide-y divide-gray-200">
                                                                            <thead className="bg-gray-100">
                                                                                <tr>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Наименование
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Артикул
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Производитель
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Цена
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Кол-во
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                        Сумма
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                                {order.order_items.map((item) => (
                                                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                                                            {item.name}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm font-mono text-gray-700">
                                                                                            {item.part_number || item.sku || (item.product && item.product.sku) || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm font-semibold text-gray-700">
                                                                                            {item.manufacturer || (item.spare_part && item.spare_part.manufacturer) || 
                                                                                            (item.product && item.product.brand && item.product.brand.name) || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {Number(item.price).toFixed(2)} руб.
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {item.quantity}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                                            {Number(item.price * item.quantity).toFixed(2)} руб.
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    
                                                                    {order.shipping_address && (
                                                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                                                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                                                    <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    </svg>
                                                                                    Адрес доставки
                                                                                </h5>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {order.shipping_address}
                                                                                </p>
                                                                            </div>
                                                                            
                                                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                                                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                                                    <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                                    </svg>
                                                                                    Итоговая сумма
                                                                                </h5>
                                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                                    <div className="text-gray-500">Всего к оплате:</div>
                                                                                    <div className="text-gray-900 font-medium">{Number(order.total || 0).toFixed(2)} руб.</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 