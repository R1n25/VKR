import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Orders({ auth, orders }) {
    // Состояние для отслеживания открытых/закрытых деталей заказов
    const [expandedOrders, setExpandedOrders] = useState({});
    
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
    
    // Функция для получения текстового статуса платежа
    const getPaymentStatusText = (status) => {
        const statusMap = {
            'paid': 'Оплачен',
            'partially_paid': 'Частично оплачен',
            'unpaid': 'Не оплачен'
        };
        
        return statusMap[status] || status;
    };
    
    // Функция для получения класса цвета статуса оплаты
    const getPaymentStatusClass = (status) => {
        const statusClasses = {
            'paid': 'bg-green-100 text-green-800',
            'partially_paid': 'bg-blue-100 text-blue-800',
            'unpaid': 'bg-red-100 text-red-800'
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {orders.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-lg mb-4">Заказов пока нет</p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Перейти к покупкам
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
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
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                                                    Оплачено
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                                                    Статус заказа
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                                                    Статус оплаты
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <React.Fragment key={order.id}>
                                                    <tr className={expandedOrders[order.id] ? "bg-gray-50" : ""}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            <div className="flex items-center">
                                                                <button 
                                                                    onClick={() => toggleOrderDetails(order.id)}
                                                                    className="mr-2 text-indigo-600 focus:outline-none"
                                                                >
                                                                    {expandedOrders[order.id] ? (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                                <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:underline">
                                                                    {order.order_number || `#${order.id}`}
                                                                </Link>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(order.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Н/Д')}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {Number(order.total || 0).toFixed(2)} руб.
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {Number(order.total_paid || 0).toFixed(2)} руб.
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(order.payment_status)}`}>
                                                                {getPaymentStatusText(order.payment_status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Развернутые детали заказа */}
                                                    {expandedOrders[order.id] && order.order_items && order.order_items.length > 0 && (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                                <div className="border-t border-gray-200 pt-4">
                                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Товары в заказе</h4>
                                                                    <div className="overflow-x-auto">
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
                                                                                    <tr key={item.id}>
                                                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                                                            {item.part_name || (item.spare_part && item.spare_part.name) || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {item.part_number || (item.spare_part && item.spare_part.part_number) || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {(item.spare_part && item.spare_part.manufacturer) || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {Number(item.price || 0).toFixed(2)} руб.
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm text-gray-500">
                                                                                            {item.quantity}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                                            {Number((item.price || 0) * (item.quantity || 0)).toFixed(2)} руб.
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                            <tfoot className="bg-gray-50">
                                                                                <tr>
                                                                                    <td colSpan="5" className="px-4 py-2 text-sm font-medium text-right text-gray-900">
                                                                                        Итого:
                                                                                    </td>
                                                                                    <td className="px-4 py-2 text-sm font-bold text-gray-900">
                                                                                        {Number(order.total || 0).toFixed(2)} руб.
                                                                                    </td>
                                                                                </tr>
                                                                            </tfoot>
                                                                        </table>
                                                                    </div>
                                                                    
                                                                    {/* Информация о доставке */}
                                                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <h5 className="text-sm font-medium text-gray-900 mb-2">Информация о доставке</h5>
                                                                            <p className="text-sm text-gray-600">
                                                                                <span className="font-medium">Адрес:</span> {order.shipping_address || order.address || 'Не указан'}
                                                                            </p>
                                                                            {order.shipping_method && (
                                                                                <p className="text-sm text-gray-600">
                                                                                    <span className="font-medium">Способ доставки:</span> {order.shipping_method}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="text-sm font-medium text-gray-900 mb-2">Информация об оплате</h5>
                                                                            <p className="text-sm text-gray-600">
                                                                                <span className="font-medium">Способ оплаты:</span> {
                                                                                    order.payment_method === 'cash' ? 'Наличными при получении' : 
                                                                                    order.payment_method === 'card' ? 'Картой при получении' : 
                                                                                    order.payment_method === 'online' ? 'Онлайн оплата' : 
                                                                                    'Не указан'
                                                                                }
                                                                            </p>
                                                                            <p className="text-sm text-gray-600">
                                                                                <span className="font-medium">Оплачено:</span> {Number(order.total_paid || 0).toFixed(2)} руб. из {Number(order.total || 0).toFixed(2)} руб.
                                                                            </p>
                                                                        </div>
                                                                    </div>
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