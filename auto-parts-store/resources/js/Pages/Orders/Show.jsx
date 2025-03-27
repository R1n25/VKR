import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function OrderShow({ auth, orderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${orderId}`);
                setOrder(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных заказа:', err);
                setError('Не удалось загрузить информацию о заказе. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса заказа
    const getStatusText = (status) => {
        const statusMap = {
            'new': 'Новый',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'new': 'bg-blue-100 text-blue-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказ #{orderId}</h2>}
        >
            <Head title={`Заказ #${orderId}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка информации о заказе...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : order ? (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <Link
                                            href="/orders"
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            ← Назад к списку заказов
                                        </Link>
                                        
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Информация о заказе */}
                                        <div className="md:col-span-2">
                                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                                                <h3 className="text-lg font-semibold mb-4">Информация о заказе</h3>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Номер заказа</p>
                                                        <p className="font-medium">#{order.id}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-sm text-gray-500">Дата</p>
                                                        <p className="font-medium">{formatDate(order.created_at)}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-sm text-gray-500">ФИО</p>
                                                        <p className="font-medium">{order.customer_name}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="font-medium">{order.email}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-sm text-gray-500">Телефон</p>
                                                        <p className="font-medium">{order.phone}</p>
                                                    </div>
                                                    
                                                    <div className="sm:col-span-2">
                                                        <p className="text-sm text-gray-500">Адрес доставки</p>
                                                        <p className="font-medium">{order.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Товары заказа */}
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <h3 className="text-lg font-semibold mb-4">Товары</h3>
                                                
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Товар
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Артикул
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Цена
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Кол-во
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Сумма
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {order.items.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td className="px-6 py-4">
                                                                        <div className="flex items-center">
                                                                            {item.part.image_url && (
                                                                                <img 
                                                                                    src={item.part.image_url}
                                                                                    alt={item.part.name}
                                                                                    className="h-10 w-10 object-cover mr-3"
                                                                                />
                                                                            )}
                                                                            <div>
                                                                                <p className="font-medium text-gray-900">{item.part.name}</p>
                                                                                {item.part.brand && (
                                                                                    <p className="text-xs text-gray-500">{item.part.brand.name}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {item.part.sku}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {item.price} руб.
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {(item.price * item.quantity).toFixed(2)} руб.
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Сводка заказа */}
                                        <div>
                                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-6">
                                                <h3 className="text-lg font-semibold mb-4">Сводка заказа</h3>
                                                
                                                <div className="space-y-3 mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Сумма товаров</span>
                                                        <span className="font-medium">{order.total_amount} руб.</span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Доставка</span>
                                                        <span className="font-medium">0 руб.</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="border-t border-gray-200 pt-4 mt-4">
                                                    <div className="flex justify-between items-center text-lg font-bold">
                                                        <span>Итого:</span>
                                                        <span className="text-indigo-600">{order.total_amount} руб.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-lg mb-4">Заказ не найден</p>
                                    <Link
                                        href="/orders"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Вернуться к списку заказов
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 