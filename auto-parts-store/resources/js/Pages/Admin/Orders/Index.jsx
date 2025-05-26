import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Index({ auth, orders, filters, ordersCount }) {
    // Отладочная информация
    console.log("Orders data:", orders);
    console.log("Orders count:", ordersCount);

    const [searchFilters, setSearchFilters] = useState({
        order_number: filters?.order_number || '',
        customer_name: filters?.customer_name || '',
        status: filters?.status || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    // Функция для обработки изменений в форме фильтров
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Функция для отправки формы фильтров
    const handleSearch = (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value) {
                queryParams.append(key, value);
            }
        });
        
        window.location.href = `${route('admin.orders.index')}?${queryParams.toString()}`;
    };

    // Функция для сброса фильтров
    const handleResetFilters = () => {
        setSearchFilters({
            order_number: '',
            customer_name: '',
            status: '',
            date_from: '',
            date_to: '',
        });
        
        window.location.href = route('admin.orders.index');
    };

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
            case 'shipped':
                return 'Отправлен';
            case 'delivered':
                return 'Доставлен';
            default:
                return status || 'Неизвестно';
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
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-200 text-green-900';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd.MM.yyyy, HH:mm', { locale: ru });
        } catch (error) {
            return dateString || 'Нет данных';
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление заказами</h2>}
        >
            <Head title="Управление заказами" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Отладочная информация */}
                            <div className="mb-4 p-4 bg-gray-100 rounded">
                                <p>Всего заказов: {ordersCount || 0}</p>
                                <p>Текущая страница: {orders?.current_page || 'N/A'}</p>
                            </div>
                            
                            {/* Фильтры */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
                                
                                <form onSubmit={handleSearch} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Номер заказа
                                            </label>
                                            <input
                                                type="text"
                                                id="order_number"
                                                name="order_number"
                                                value={searchFilters.order_number}
                                                onChange={handleFilterChange}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Имя клиента
                                            </label>
                                            <input
                                                type="text"
                                                id="customer_name"
                                                name="customer_name"
                                                value={searchFilters.customer_name}
                                                onChange={handleFilterChange}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Статус
                                            </label>
                                            <select
                                                id="status"
                                                name="status"
                                                value={searchFilters.status}
                                                onChange={handleFilterChange}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="">Все статусы</option>
                                                <option value="pending">Ожидает обработки</option>
                                                <option value="processing">В обработке</option>
                                                <option value="shipped">Отправлен</option>
                                                <option value="delivered">Доставлен</option>
                                                <option value="completed">Выполнен</option>
                                                <option value="cancelled">Отменен</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                                                Дата с
                                            </label>
                                            <input
                                                type="date"
                                                id="date_from"
                                                name="date_from"
                                                value={searchFilters.date_from}
                                                onChange={handleFilterChange}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                                                Дата по
                                            </label>
                                            <input
                                                type="date"
                                                id="date_to"
                                                name="date_to"
                                                value={searchFilters.date_to}
                                                onChange={handleFilterChange}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            Сбросить
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Применить фильтры
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            {/* Кнопка экспорта */}
                            <div className="mb-6 flex justify-end">
                                <a
                                    href={`${route('admin.orders.export')}?${new URLSearchParams(searchFilters).toString()}`}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Экспорт в CSV
                                </a>
                            </div>

                            {/* Список заказов */}
                            <h3 className="text-xl font-semibold mb-4">Список заказов</h3>
                            
                            {orders?.data && orders.data.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        № заказа
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Дата
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Клиент
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Статус
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Сумма
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Действия
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {orders.data.map(order => (
                                                    <tr key={order.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-indigo-600">
                                                                {order.order_number || `№${order.id}`}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {formatDate(order.created_at)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {order.shipping_name || order.customer_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {order.shipping_phone || order.phone}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {order.total || '0'} руб.
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                            <Link
                                                                href={route('admin.orders.show', order.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                            >
                                                                Просмотр
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Пагинация */}
                                    <div className="mt-6">
                                        <nav className="flex items-center justify-between">
                                            <div className="flex justify-between flex-1 sm:hidden">
                                                {orders.prev_page_url && (
                                                    <a
                                                        href={orders.prev_page_url}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Назад
                                                    </a>
                                                )}
                                                
                                                {orders.next_page_url && (
                                                    <a
                                                        href={orders.next_page_url}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Вперед
                                                    </a>
                                                )}
                                            </div>
                                            
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Показано с <span className="font-medium">{orders.from}</span> по <span className="font-medium">{orders.to}</span> из <span className="font-medium">{orders.total}</span> заказов
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                        {orders.links.map((link, index) => {
                                                            // Пропускаем "Previous" и "Next" ссылки
                                                            if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') {
                                                                return null;
                                                            }
                                                            
                                                            return (
                                                                <a
                                                                    key={index}
                                                                    href={link.url}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                        link.active
                                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                                />
                                                            );
                                                        })}
                                                    </nav>
                                                </div>
                                            </div>
                                        </nav>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-600 mb-4">Заказы не найдены</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 