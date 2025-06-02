import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FinancesShow({ user, payments, balanceTransactions, stats, paymentMethods }) {
    const [showBalanceForm, setShowBalanceForm] = useState(false);
    
    const { data, setData, patch, processing, errors, reset } = useForm({
        balance: user.balance,
        description: '',
    });
    
    const handleBalanceSubmit = (e) => {
        e.preventDefault();
        
        patch(route('admin.finances.update-balance', user.id), {
            onSuccess: () => {
                setShowBalanceForm(false);
                reset();
            }
        });
    };
    
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
    
    // Функция для определения класса баланса
    const getBalanceClass = (balance) => {
        if (balance > 0) return 'text-green-600 font-semibold';
        if (balance < 0) return 'text-red-600 font-semibold';
        return 'text-gray-600';
    };
    
    // Функция для получения типа операции
    const getOperationTypeText = (operationType) => {
        const typeMap = {
            'deposit': 'Пополнение',
            'withdraw': 'Списание',
            'adjustment': 'Корректировка'
        };
        
        return typeMap[operationType] || operationType;
    };
    
    // Функция для получения класса цвета операции
    const getOperationTypeClass = (operationType, amount) => {
        if (amount > 0) return 'text-green-600';
        if (amount < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <AdminLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Финансы пользователя</h2>}
        >
            <Head title={`Финансы - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Информация о пользователе */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                    <p className="text-gray-600">{user.email}</p>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.finances.index')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Назад к списку
                                    </Link>
                                    
                                    <Link
                                        href={route('admin.finances.create', user.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Изменить баланс
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className={`p-4 rounded-lg ${user.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className="text-sm text-gray-500">Текущий баланс</p>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-2xl font-bold ${getBalanceClass(user.balance)}`}>
                                            {user.balance} руб.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowBalanceForm(!showBalanceForm)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {showBalanceForm ? 'Отмена' : 'Изменить'}
                                        </button>
                                    </div>
                                    
                                    {showBalanceForm && (
                                        <form onSubmit={handleBalanceSubmit} className="mt-4">
                                            <div className="mb-3">
                                                <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
                                                    Новый баланс
                                                </label>
                                                <input
                                                    type="number"
                                                    id="balance"
                                                    step="0.01"
                                                    value={data.balance}
                                                    onChange={(e) => setData('balance', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                                {errors.balance && <p className="text-red-500 text-xs mt-1">{errors.balance}</p>}
                                            </div>
                                            
                                            <div className="mb-3">
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                    Описание
                                                </label>
                                                <input
                                                    type="text"
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Причина изменения баланса"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                />
                                            </div>
                                            
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processing ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Оплачено</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.total_paid} руб.</p>
                                </div>
                                
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Ожидает оплаты</p>
                                    <p className="text-2xl font-bold text-yellow-700">{stats.pending_payments} руб.</p>
                                </div>
                                
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Возвращено</p>
                                    <p className="text-2xl font-bold text-red-700">{stats.total_refunded} руб.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* История движения баланса */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">История движения баланса</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Дата
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Операция
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Сумма
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Баланс после
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Описание
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {balanceTransactions && balanceTransactions.data && balanceTransactions.data.length > 0 ? (
                                            balanceTransactions.data.map((transaction) => (
                                                <tr key={`balance-${transaction.id}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(transaction.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={getOperationTypeClass(transaction.operation_type, transaction.amount)}>
                                                            {getOperationTypeText(transaction.operation_type)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} руб.
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transaction.balance_after} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {transaction.description}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    История движения баланса пуста
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Пагинация для истории баланса */}
                            {balanceTransactions && balanceTransactions.links && balanceTransactions.links.length > 3 && (
                                <div className="mt-6">
                                    <nav className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between">
                                            {balanceTransactions.prev_page_url && (
                                                <Link
                                                    href={balanceTransactions.prev_page_url}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Предыдущая
                                                </Link>
                                            )}
                                            
                                            {balanceTransactions.next_page_url && (
                                                <Link
                                                    href={balanceTransactions.next_page_url}
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
                    </div>
                    
                    {/* История платежей */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">История платежей</h3>
                                
                                <Link
                                    href={route('admin.finances.create', user.id)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Добавить платеж
                                </Link>
                            </div>
                            
                            {payments.data.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-lg mb-4">Платежей пока нет</p>
                                </div>
                            ) : (
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
                                                                href={route('admin.orders.show', payment.order.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                {payment.order.order_number || `#${payment.order.id}`}
                                                            </Link>
                                                        ) : 'Н/Д'}
                                                    </td>
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
                                                            href={route('admin.payments.show', payment.id)}
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
                            )}
                            
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
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 