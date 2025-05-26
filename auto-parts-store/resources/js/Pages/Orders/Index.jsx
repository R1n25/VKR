import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Orders({ auth, orders, isAdmin }) {
    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса заказа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                <div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    № заказа
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Дата
                                                </th>
                                                {isAdmin && (
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Клиент
                                                    </th>
                                                )}
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Сумма
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Оплачено
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Статус заказа
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Статус оплаты
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Действия
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {order.order_number || `#${order.id}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {order.user ? order.user.name : order.customer_name}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.total || order.total_amount} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.total_paid || 0} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(order.payment_status)}`}>
                                                            {getPaymentStatusText(order.payment_status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        >
                                                            Подробнее
                                                        </Link>
                                                        
                                                        {(isAdmin || (auth.user && auth.user.id === order.user_id)) && order.payment_status !== 'paid' && (
                                                            <Link
                                                                href={isAdmin ? route('admin.orders.add-payment', order.id) : route('orders.add-payment', order.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Оплатить
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
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