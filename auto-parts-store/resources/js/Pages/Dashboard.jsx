import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ auth }) {
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState('');
    
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!auth.user) return;
            
            try {
                const response = await axios.get('/api/orders', {
                    params: { limit: 5 }
                });
                setRecentOrders(response.data.data);
                setLoadingOrders(false);
            } catch (err) {
                console.error('Ошибка при получении последних заказов:', err);
                setErrorOrders('Не удалось загрузить информацию о последних заказах.');
                setLoadingOrders(false);
            }
        };
        
        fetchRecentOrders();
    }, [auth.user]);
    
    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Личный кабинет</h2>}
        >
            <Head title="Личный кабинет" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Приветствие и краткая статистика */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Добро пожаловать, {auth.user.name}!</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                    <div className="text-indigo-800 font-medium mb-1">Заказы</div>
                                    <Link href="/orders" className="text-2xl font-bold text-indigo-700 hover:text-indigo-900">
                                        Мои заказы
                                    </Link>
                                </div>
                                
                                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                                    <div className="text-emerald-800 font-medium mb-1">Корзина</div>
                                    <Link href="/cart" className="text-2xl font-bold text-emerald-700 hover:text-emerald-900">
                                        Перейти в корзину
                                    </Link>
                                </div>
                                
                                <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                                    <div className="text-amber-800 font-medium mb-1">Профиль</div>
                                    <Link href="/profile" className="text-2xl font-bold text-amber-700 hover:text-amber-900">
                                        Настройки профиля
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Последние заказы */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Последние заказы</h3>
                                <Link href="/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                    Все заказы
                                </Link>
                            </div>
                            
                            {loadingOrders ? (
                                <div className="text-center py-10">
                                    <p>Загрузка заказов...</p>
                                </div>
                            ) : errorOrders ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {errorOrders}
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Перейти к покупкам
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    № заказа
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Дата
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
                                            {recentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{order.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.total_amount} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <Link
                                                            href={`/orders/${order.id}`}
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
                        </div>
                    </div>
                    
                    {/* Каталог и рекомендации */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-xl font-semibold mb-6">Каталог автозапчастей</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link
                                    href="/brands"
                                    className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        Бренды автомобилей
                                    </h4>
                                    <p className="text-gray-500">
                                        Просмотрите запчасти по маркам автомобилей
                                    </p>
                                </Link>
                                
                                <Link
                                    href="/categories"
                                    className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        Категории запчастей
                                    </h4>
                                    <p className="text-gray-500">
                                        Просмотрите запчасти по категориям
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
