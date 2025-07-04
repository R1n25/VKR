import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';



export default function Dashboard({ auth, vinRequests }) {
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState('');
    const [expandedOrders, setExpandedOrders] = useState({});
    
    // Функция для разворачивания/сворачивания детали заказа
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };
    
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!auth.user) return;
            
            try {
                const response = await axios.get('/api/orders', {
                    params: { limit: 5 }
                });
                
                // Проверяем, что response.data.data существует и является массивом
                if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    // Логируем полученные данные для отладки
                    console.log('Полученные заказы:', response.data.data);
                    
                    // Обрабатываем полученные заказы для корректного отображения товаров
                    const processedOrders = response.data.data.map(order => {
                        // Проверяем и обрабатываем элементы заказа
                        if (order.order_items && Array.isArray(order.order_items)) {
                            order.order_items = order.order_items.map(item => {
                                // Если у товара есть связанная запчасть с данными
                                if (item.spare_part) {
                                    // Копируем свойства из spare_part в товар для удобства доступа
                                    item.part_number = item.spare_part.part_number || item.sku || 'Н/Д';
                                    item.manufacturer = item.spare_part.manufacturer || 'Н/Д';
                                    item.brand = item.spare_part.brand?.name || item.brand || 'Н/Д';
                                }
                                return item;
                            });
                        }
                        return order;
                    });
                    
                    setRecentOrders(processedOrders);
                } else {
                    console.error('Данные заказов не являются массивом:', response.data);
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
    
    // Простая функция для форматирования даты
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    
    // Функция для получения текстового статуса заказа
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
            'returned': 'Возвращен',
            'cancelled': 'Отменен',
            'completed': 'Завершен'
        };
        
        return statuses[status] || status;
    };
    
    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const classes = {
            'pending': 'bg-blue-100 text-blue-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'ready_for_pickup': 'bg-green-100 text-green-800',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
            'in_delivery': 'bg-purple-100 text-purple-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'returned': 'bg-red-100 text-red-800',
            'cancelled': 'bg-gray-100 text-gray-800',
            'completed': 'bg-emerald-100 text-emerald-800'
        };
        
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    // Функция для получения текстового статуса VIN-запроса
    const getVinStatusText = (status) => {
        const statusMap = {
            'new': 'Новый',
            'processing': 'В обработке',
            'completed': 'Выполнен',
            'cancelled': 'Отменён',
        };
        
        return statusMap[status] || status;
    };
    
    // Функция для получения класса цвета статуса VIN-запроса
    const getVinStatusClass = (status) => {
        const statusClasses = {
            'new': 'bg-blue-100 text-blue-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    // Проверка, что vinRequests существует и является массивом
    const hasVinRequests = Array.isArray(vinRequests) && vinRequests.length > 0;
    
    // Проверка, что recentOrders существует и является массивом
    const hasRecentOrders = Array.isArray(recentOrders) && recentOrders.length > 0;

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

                    {/* История VIN-запросов */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Мои VIN-запросы</h3>
                                <Link href={route('vin-request.user')} className="text-green-600 hover:text-green-800 text-sm font-medium">
                                    Все запросы
                                </Link>
                            </div>
                            
                            {hasVinRequests ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    № запроса
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    VIN-код
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Дата
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Статус
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Описание
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Действия
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {vinRequests.map((request) => (
                                                <tr key={request.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {request.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                        {request.vin}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(request.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVinStatusClass(request.status)}`}>
                                                            {getVinStatusText(request.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {request.parts_description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={route('vin-request.show', request.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            {request.status === 'completed' ? 'Посмотреть ответ' : 'Подробнее'}
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500 mb-4">У вас пока нет запросов по VIN-коду</p>
                                    <Link
                                        href={route('vin-request.index')}
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Создать первый запрос
                                    </Link>
                                </div>
                            )}
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
                            ) : !hasRecentOrders ? (
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
                                    <div className="border-b border-gray-200 pb-4 mb-4">
                                        <p className="text-sm text-gray-500">Нажмите на стрелку рядом с номером заказа, чтобы увидеть детали</p>
                                    </div>
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
                                                <React.Fragment key={order.id}>
                                                    <tr className={expandedOrders[order.id] ? "bg-gray-50" : "hover:bg-gray-50 transition-colors duration-150"}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
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
                                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.order_number || order.id}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {order.order_items?.length || 0} товаров
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(order.created_at).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                                                            </div>
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{Number(order.total || 0).toFixed(2)} руб.</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                                className="inline-flex items-center px-3 py-1 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                        >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            Подробнее
                                                        </Link>
                                                    </td>
                                                </tr>
                                                    
                                                    {/* Развернутые детали заказа */}
                                                    {expandedOrders[order.id] && order.order_items && order.order_items.length > 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
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
                                                                                            {item.part_number || item.sku || 'Н/Д'}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 text-sm font-semibold text-gray-700">
                                                                                            {item.manufacturer || (item.spare_part && item.spare_part.manufacturer) || 'Н/Д'}
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

                    {/* Настройки профиля */}
                    <div className="mt-4 border rounded-lg shadow-sm bg-white p-4">
                        <h3 className="text-lg font-semibold mb-4">Настройки профиля</h3>
                        <div className="space-y-2">
                            <Link href={route('profile.edit')} className="text-indigo-600 hover:text-indigo-900 block">
                                <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                                Редактировать профиль
                            </Link>
                            <Link href={route('profile.edit')} className="text-indigo-600 hover:text-indigo-900 block">
                                <KeyIcon className="w-5 h-5 inline-block mr-2" />
                                Изменить пароль
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 