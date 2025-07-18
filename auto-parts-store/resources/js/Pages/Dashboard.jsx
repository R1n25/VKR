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
                console.log('Отправка запроса на получение заказов для пользователя:', auth.user.id);
                const response = await axios.get('/api/orders', {
                    params: { limit: 5 }
                });
                
                // Добавляем отладочную информацию
                console.log('API запрос:', '/api/orders?limit=5');
                console.log('API ответ:', response);
                console.log('API данные:', response.data);
                console.log('API данные.data:', response.data.data);
                console.log('API данные.success:', response.data.success);
                console.log('API текущий пользователь:', auth.user);
                
                // Проверяем формат ответа
                if (response.data && response.data.success) {
                    // Если есть данные в формате data
                    if (Array.isArray(response.data.data)) {
                        console.log('Установка данных заказов из массива:', response.data.data);
                        setRecentOrders(response.data.data);
                    } else if (response.data.data && Array.isArray(response.data.data.data)) {
                        // Поддержка старого формата ответа, где данные были внутри data.data
                        console.log('Установка данных заказов из вложенного массива:', response.data.data.data);
                        setRecentOrders(response.data.data.data);
                    } else {
                        // Если формат ответа некорректный, устанавливаем пустой массив
                        console.log('Некорректный формат ответа, установка пустого массива');
                        setRecentOrders([]);
                    }
                } else {
                    // Если ответ неуспешный, устанавливаем пустой массив
                    console.log('Неуспешный ответ API, установка пустого массива');
                    setRecentOrders([]);
                }
                
                setLoadingOrders(false);
            } catch (err) {
                console.error('Ошибка при получении последних заказов:', err);
                setErrorOrders('Не удалось загрузить информацию о последних заказах.');
                setLoadingOrders(false);
                setRecentOrders([]);
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
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'ready_for_pickup': 'Готов к выдаче',
            'ready_for_delivery': 'Готов к доставке',
            'shipping': 'В пути',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'completed': 'Завершен',
            'returned': 'Возвращен',
            'cancelled': 'Отменен'
        };
        
        return statusMap[status] || status;
    };
    
    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'new': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'ready_for_pickup': 'bg-indigo-100 text-indigo-800',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'completed': 'bg-green-100 text-green-800',
            'returned': 'bg-red-100 text-red-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Личный кабинет</h2>}
        >
            <Head title="Личный кабинет" />

            <div className="py-12">
                <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
                    {/* Приветствие и краткая статистика */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Добро пожаловать, {auth.user.name}!</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                    <div className="text-indigo-800 font-medium mb-1">Заказы</div>
                                    <Link href="/orders" className="text-xl font-bold text-indigo-700 hover:text-indigo-900">
                                        Мои заказы
                                    </Link>
                                </div>
                                
                                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                                    <div className="text-emerald-800 font-medium mb-1">Корзина</div>
                                    <Link href="/cart" className="text-xl font-bold text-emerald-700 hover:text-emerald-900">
                                        Перейти в корзину
                                    </Link>
                                </div>
                                
                                <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                                    <div className="text-amber-800 font-medium mb-1">Профиль</div>
                                    <Link href="/profile" className="text-xl font-bold text-amber-700 hover:text-amber-900">
                                        Настройки профиля
                                    </Link>
                                </div>
                                
                                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                    <div className="text-green-800 font-medium mb-1">Подбор запчастей</div>
                                    <Link href={route('vin-request.index')} className="text-xl font-bold text-green-700 hover:text-green-900">
                                        Подбор по VIN
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Подбор запчастей по VIN */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Подбор запчастей по VIN-коду</h3>
                                <Link href={route('vin-request.user')} className="text-green-600 hover:text-green-800 text-sm font-medium">
                                    Мои VIN-запросы
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <p className="text-gray-600 mb-4">
                                        Не знаете какие запчасти подойдут для вашего автомобиля? 
                                        Отправьте нам VIN-код, и наши специалисты подберут необходимые детали.
                                    </p>
                                    <ul className="text-gray-600 mb-6 space-y-2">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Точный подбор запчастей для вашего автомобиля
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Быстрая обработка запроса специалистами
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Консультация по выбору и установке
                                        </li>
                                    </ul>
                                    <Link
                                        href={route('vin-request.index')}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Создать запрос
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <p className="font-medium text-lg text-gray-900 mb-2">VIN-код автомобиля</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            VIN-код состоит из 17 символов и находится в техпаспорте или на кузове автомобиля
                                        </p>
                                        <Link
                                            href={route('vin-request.index')}
                                            className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                                        >
                                            Подробнее
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
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
                                                    Товары
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
                                                        #{order.order_number || order.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {order.order_items && order.order_items.length > 0 ? (
                                                            <div className="max-h-24 overflow-y-auto">
                                                                {order.order_items.map((item, idx) => (
                                                                    <div key={idx} className="mb-2 last:mb-0">
                                                                        <div className="font-medium">{item.part_name || (item.spare_part && item.spare_part.name)}</div>
                                                                        <div className="text-xs text-gray-400">
                                                                            Артикул: {item.part_number || (item.spare_part && item.spare_part.part_number)}
                                                                        </div>
                                                                        {(item.spare_part && item.spare_part.brand) && (
                                                                            <div className="text-xs text-gray-400">
                                                                                Производитель: {item.spare_part.brand}
                                                                            </div>
                                                                        )}
                                                                        <div className="text-xs">
                                                                            {item.quantity} x {item.price ? `${Number(item.price).toFixed(2)} руб.` : ''}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Нет данных</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {typeof order.total === 'number' 
                                                            ? `${order.total.toFixed(2)} руб.` 
                                                            : order.total_price 
                                                                ? `${Number(order.total_price).toFixed(2)} руб.` 
                                                                : `${order.total || 0} руб.`}
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                                <Link
                                    href="/search"
                                    className="block p-6 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                        Поиск запчастей
                                    </h4>
                                    <p className="text-gray-500">
                                        Быстрый поиск по артикулу или названию
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
