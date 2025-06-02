import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function FinancesIndex({ auth, payments, stats, isAdmin, user_balance }) {
    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса платежа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'completed': 'Выполнен',
            'failed': 'Ошибка',
            'refunded': 'Возвращен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    // Используем актуальный баланс пользователя
    const balance = user_balance !== undefined ? user_balance : (isAdmin ? stats.net_income : stats.balance);
    const balanceClass = balance < 0 ? 'text-red-700' : 'text-blue-700';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Финансы</h2>}
        >
            <Head title="Финансы" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    {/* Статистика финансов */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Общая статистика</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Оплачено</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.total_paid} руб.</p>
                                </div>
                                
                                {isAdmin && (
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-500">Возвращено</p>
                                        <p className="text-2xl font-bold text-red-700">{stats.total_refunded} руб.</p>
                                    </div>
                                )}
                                
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Ожидает оплаты</p>
                                    <p className="text-2xl font-bold text-yellow-700">{stats.pending_payments} руб.</p>
                                </div>
                                
                                <div className={`bg-${balance < 0 ? 'red' : 'blue'}-50 p-4 rounded-lg`}>
                                    <p className="text-sm text-gray-500">Баланс</p>
                                    <p className={`text-2xl font-bold ${balanceClass}`}>
                                        {balance} руб.
                                    </p>
                                </div>
                            </div>
                            
                            {isAdmin && stats.payments_by_method && (
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold mb-3">Платежи по методам оплаты</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <ul className="space-y-2">
                                            {stats.payments_by_method.map((item, index) => (
                                                <li key={index} className="flex justify-between">
                                                    <span>{item.name}</span>
                                                    <span className="font-semibold">{item.total} руб.</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Таблица платежей */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">История платежей</h3>
                                
                                {isAdmin && (
                                    <Link
                                        href={route('admin.payments.create')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Создать платеж
                                    </Link>
                                )}
                            </div>
                            
                            {payments.data.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-lg mb-4">Платежей пока нет</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Дата
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Заказ
                                                    </th>
                                                    {isAdmin && (
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Клиент
                                                        </th>
                                                    )}
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Метод оплаты
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Сумма
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Статус
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Действия
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {payments.data.map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(payment.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.order ? (
                                                                <Link
                                                                    href={route('orders.show', payment.order.id)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    {payment.order.order_number || `#${payment.order.id}`}
                                                                </Link>
                                                            ) : 'Н/Д'}
                                                        </td>
                                                        {isAdmin && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {payment.user ? payment.user.name : 'Н/Д'}
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.payment_method ? payment.payment_method.name : 'Н/Д'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {payment.amount} руб.
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                                                                {getStatusText(payment.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <Link
                                                                href={isAdmin ? route('admin.payments.show', payment.id) : route('finances.show', payment.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Подробнее
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Пагинация */}
                                    {payments.links && payments.links.length > 3 && (
                                        <div className="mt-6">
                                            <nav className="flex items-center justify-between">
                                                <div className="flex-1 flex justify-between">
                                                    {payments.prev_page_url && (
                                                        <Link
                                                            href={payments.prev_page_url}
                                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            Предыдущая
                                                        </Link>
                                                    )}
                                                    
                                                    {payments.next_page_url && (
                                                        <Link
                                                            href={payments.next_page_url}
                                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            Следующая
                                                        </Link>
                                                    )}
                                                </div>
                                            </nav>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 