import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminAlert from '@/Components/AdminAlert';
import OrderStatusBadge from '@/Components/OrderStatusBadge';
import AdminPagination from '@/Components/AdminPagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminTable from '@/Components/AdminTable';

export default function Index({ auth, orders, filters, ordersCount }) {
    // Отладочная информация
    console.log("Orders data:", orders);
    console.log("Orders count:", ordersCount);

    // Константа для админ-панели
    const isAdmin = true;

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
                return 'В работе';
            case 'ready_for_pickup':
                return 'Готов к выдаче';
            case 'ready_for_delivery':
                return 'Готов к доставке';
            case 'shipping':
                return 'В доставке';
            case 'delivered':
                return 'Выдано';
            case 'returned':
                return 'Возвращен';
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
            case 'ready_for_pickup':
                return 'bg-green-100 text-green-800';
            case 'ready_for_delivery':
                return 'bg-indigo-100 text-indigo-800';
            case 'shipping':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-200 text-green-900';
            case 'returned':
                return 'bg-red-100 text-red-800';
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
                    <AdminCard>
                        <AdminPageHeader 
                            title="Управление заказами" 
                            subtitle={`Всего заказов: ${ordersCount || 0}`}
                        />
                        
                        {/* Фильтры */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#2a4075]">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Фильтры поиска
                            </h3>
                            
                            <form onSubmit={handleSearch} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AdminFormGroup label="Номер заказа" name="order_number">
                                        <AdminInput
                                            type="text"
                                            name="order_number"
                                            value={searchFilters.order_number}
                                            handleChange={handleFilterChange}
                                            placeholder="Введите номер"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Имя клиента" name="customer_name">
                                        <AdminInput
                                            type="text"
                                            name="customer_name"
                                            value={searchFilters.customer_name}
                                            handleChange={handleFilterChange}
                                            placeholder="Введите имя"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Статус" name="status">
                                        <AdminSelect
                                            name="status"
                                            value={searchFilters.status}
                                            handleChange={handleFilterChange}
                                        >
                                            <option value="">Все статусы</option>
                                            <option value="pending">Ожидает обработки</option>
                                            <option value="processing">В работе</option>
                                            <option value="ready_for_pickup">Готов к выдаче</option>
                                            <option value="ready_for_delivery">Готов к доставке</option>
                                            <option value="shipping">В доставке</option>
                                            <option value="delivered">Выдано</option>
                                            <option value="returned">Возвращен</option>
                                        </AdminSelect>
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Дата с" name="date_from">
                                        <AdminInput
                                            type="date"
                                            name="date_from"
                                            value={searchFilters.date_from}
                                            handleChange={handleFilterChange}
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Дата по" name="date_to">
                                        <AdminInput
                                            type="date"
                                            name="date_to"
                                            value={searchFilters.date_to}
                                            handleChange={handleFilterChange}
                                        />
                                    </AdminFormGroup>
                                </div>
                                
                                <div className="mt-4 flex justify-end space-x-2">
                                    <SecondaryButton 
                                        type="button" 
                                        onClick={handleResetFilters}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Сбросить
                                    </SecondaryButton>
                                    <PrimaryButton type="submit" className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Применить фильтры
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>

                        {/* Список заказов */}
                        <AdminTable
                            headers={[
                                '№',
                                'Дата',
                                'Клиент',
                                'Сумма',
                                'Статус',
                                'Действия'
                            ]}
                            data={orders.data}
                            renderRow={(order) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.order_number || `№${order.id}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Н/Д')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.total || order.total_amount || 0} ₽
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <OrderStatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={route('admin.orders.show', order.id)} className="btn-primary text-xs py-1 px-3">
                                            Просмотр
                                        </Link>
                                    </td>
                                </>
                            )}
                            emptyMessage="Заказы не найдены"
                        />

                        {/* Пагинация */}
                        <div className="mt-4">
                            <AdminPagination links={orders.links} />
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 