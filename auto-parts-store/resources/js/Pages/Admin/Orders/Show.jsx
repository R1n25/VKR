import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';

export default function Show({ auth, order }) {
    const [processing, setProcessing] = useState(false);
    const [statusError, setStatusError] = useState('');

    // Функция для получения текстового представления статуса заказа
    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Ожидает обработки';
            case 'processing':
                return 'В обработке';
            case 'completed':
                return 'Выполнен';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
        } catch (error) {
            return dateString;
        }
    };

    // Функция для получения текста способа оплаты
    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cash':
                return 'Наличными при получении';
            case 'card':
                return 'Картой при получении';
            case 'online':
                return 'Онлайн-оплата';
            default:
                return method;
        }
    };

    // Функция для обновления статуса заказа
    const handleStatusChange = async (newStatus) => {
        if (processing) return;
        
        if (!confirm(`Изменить статус заказа на "${getStatusText(newStatus)}"?`)) {
            return;
        }
        
        setProcessing(true);
        setStatusError('');
        
        try {
            await axios.put(route('admin.orders.update-status', order.id), {
                status: newStatus
            });
            
            router.reload();
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            setStatusError('Не удалось обновить статус заказа.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали заказа</h2>}
        >
            <Head title={`Заказ №${order.order_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <Link
                                    href={route('admin.orders.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Назад к списку заказов
                                </Link>
                            </div>

                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Заказ №{order.order_number}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        от {formatDate(order.created_at)}
                                    </p>
                                </div>
                                
                                <div className="mt-4 md:mt-0">
                                    <div className="flex items-center mb-2">
                                        <span className="mr-2">Статус:</span>
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    
                                    {/* Форма для изменения статуса */}
                                    <div className="mt-2">
                                        <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                                            Изменить статус
                                        </label>
                                        <div className="flex items-center">
                                            <select
                                                id="status-select"
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                disabled={processing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mr-2"
                                            >
                                                <option value="pending">Ожидает обработки</option>
                                                <option value="processing">В обработке</option>
                                                <option value="completed">Выполнен</option>
                                                <option value="cancelled">Отменен</option>
                                            </select>
                                        </div>
                                        
                                        {statusError && (
                                            <p className="mt-1 text-sm text-red-600">{statusError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Данные покупателя</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">ФИО</h4>
                                            <p className="text-gray-900">{order.shipping_name}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Телефон</h4>
                                            <p className="text-gray-900">{order.shipping_phone}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Пользователь</h4>
                                            <p className="text-gray-900">
                                                {order.user ? order.user.name : 'Не зарегистрирован'}
                                                {order.user && order.user.email && ` (${order.user.email})`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Информация о доставке</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Адрес</h4>
                                            <p className="text-gray-900">{order.shipping_address}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Город</h4>
                                            <p className="text-gray-900">{order.shipping_city}</p>
                                        </div>
                                        
                                        {order.shipping_zip && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 mb-1">Индекс</h4>
                                                <p className="text-gray-900">{order.shipping_zip}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Способ оплаты</h4>
                                            <p className="text-gray-900">{getPaymentMethodText(order.payment_method)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {order.notes && (
                                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                    <h3 className="text-lg font-semibold mb-2">Примечания к заказу</h3>
                                    <p className="text-gray-900">{order.notes}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Товары в заказе</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Товар
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Артикул
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Цена
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Количество
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.orderItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.part_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {item.part_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {item.price} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {item.quantity} шт.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {(item.price * item.quantity).toFixed(2)} руб.
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right font-bold">
                                                    Итого:
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                                    {order.total_price} руб.
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 