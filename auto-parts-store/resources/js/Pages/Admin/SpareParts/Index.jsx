import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Index({ auth, spareParts, categories, filters }) {
    const page = usePage();
    const [notification, setNotification] = useState(null);
    
    // Обработка флеш-сообщений
    useEffect(() => {
        const flash = page.props.flash || {};
        
        if (flash.success) {
            setNotification({ type: 'success', message: flash.success });
            
            // Автоматически скрыть уведомление через 3 секунды
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
        
        if (flash.error) {
            setNotification({ type: 'error', message: flash.error });
            
            // Автоматически скрыть уведомление через 3 секунды
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [page.props.flash]);

    const [searchParams, setSearchParams] = useState({
        search: filters.search || '',
        category_id: filters.category_id || '',
        manufacturer: filters.manufacturer || '',
    });

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        category_id: filters.category_id || '',
        manufacturer: filters.manufacturer || '',
        sort: filters.sort || 'id',
        direction: filters.direction || 'asc',
        per_page: filters.per_page || 30,
    });

    const handleSort = (field) => {
        const direction = data.sort === field && data.direction === 'asc' ? 'desc' : 'asc';
        setData({ ...data, sort: field, direction });
        get(route('admin.spare-parts.inertia'), { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('admin.spare-parts.inertia'), { preserveState: true });
    };

    const handleReset = () => {
        setData({
            search: '',
            category_id: '',
            manufacturer: '',
            sort: 'id',
            direction: 'asc',
            per_page: 30,
        });
        get(route('admin.spare-parts.inertia'), { preserveState: true });
    };

    const handlePerPageChange = (e) => {
        const value = e.target.value;
        setData({ ...data, per_page: value });
        get(route('admin.spare-parts.inertia'), { preserveState: true });
    };

    const getSortIcon = (field) => {
        if (data.sort !== field) return null;
        return data.direction === 'asc' ? '↑' : '↓';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: ru });
    };

    // Получить уникальные производители из запчастей
    const manufacturers = [...new Set(spareParts.data.map(part => part.manufacturer).filter(Boolean))];

    const handleDelete = (id) => {
        if (confirm('Вы действительно хотите удалить эту запчасть? Это действие нельзя будет отменить.')) {
            router.delete(route('admin.spare-parts.destroy', { spare_part: id }), {
                onSuccess: () => {
                    // Показываем уведомление об успешном удалении
                    setNotification({ type: 'success', message: 'Запчасть успешно удалена' });
                },
                onError: (errors) => {
                    setNotification({ type: 'error', message: 'Ошибка при удалении запчасти: ' + (errors.message || 'Неизвестная ошибка') });
                }
            });
        }
    };

    // Компонент уведомления
    const Notification = ({ type, message }) => {
        const bgColor = type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700';
        
        return (
            <div className={`fixed top-4 right-4 px-4 py-3 rounded border ${bgColor} max-w-md z-50`}>
                <div className="flex items-center">
                    {type === 'success' ? (
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    )}
                    <span>{message}</span>
                    <button 
                        onClick={() => setNotification(null)} 
                        className="ml-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Запчасти</h2>}
        >
            <Head title="Управление запчастями" />
            
            {/* Отображение уведомления */}
            {notification && <Notification type={notification.type} message={notification.message} />}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Фильтры */}
                            <div className="mb-6">
                                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                            Поиск
                                        </label>
                                        <input
                                            type="text"
                                            id="search"
                                            name="search"
                                            value={data.search}
                                            onChange={e => setData('search', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Название или артикул..."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Категория
                                        </label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Все категории</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                                            Производитель
                                        </label>
                                        <select
                                            id="manufacturer"
                                            name="manufacturer"
                                            value={data.manufacturer}
                                            onChange={e => setData('manufacturer', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Все производители</option>
                                            {manufacturers.map((manufacturer) => (
                                                <option key={manufacturer} value={manufacturer}>
                                                    {manufacturer}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="per_page" className="block text-sm font-medium text-gray-700 mb-1">
                                            Записей на странице
                                        </label>
                                        <select
                                            id="per_page"
                                            name="per_page"
                                            value={data.per_page}
                                            onChange={handlePerPageChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="30">30</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-4 flex space-x-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            Применить фильтры
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Сбросить
                                        </button>
                                        <Link
                                            href={route('admin.spare-parts.create-inertia')}
                                            className="ml-auto px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Добавить запчасть
                                        </Link>
                                    </div>
                                </form>
                            </div>

                            {/* Таблица запчастей */}
                            <div className="overflow-x-auto w-full">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[5%]"
                                                onClick={() => handleSort('id')}
                                            >
                                                ID {getSortIcon('id')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[30%]"
                                                onClick={() => handleSort('name')}
                                            >
                                                Название {getSortIcon('name')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[15%]"
                                                onClick={() => handleSort('part_number')}
                                            >
                                                Артикул {getSortIcon('part_number')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[10%]"
                                                onClick={() => handleSort('category_id')}
                                            >
                                                Категория {getSortIcon('category_id')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[10%]"
                                                onClick={() => handleSort('manufacturer')}
                                            >
                                                Производитель {getSortIcon('manufacturer')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[10%]"
                                                onClick={() => handleSort('price')}
                                            >
                                                Цена {getSortIcon('price')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[5%]"
                                                onClick={() => handleSort('stock_quantity')}
                                            >
                                                Кол-во {getSortIcon('stock_quantity')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]"
                                            >
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {spareParts.data.length > 0 ? (
                                            spareParts.data.map((part) => (
                                                <tr key={part.id} className="hover:bg-gray-50">
                                                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {part.id}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-900 break-words">
                                                        {part.name}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-500">
                                                        {part.part_number}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-500">
                                                        {part.category ? part.category.name : '-'}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-500 break-words">
                                                        {part.manufacturer}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-500 text-right">
                                                        {part.price} ₽
                                                    </td>
                                                    <td className="px-2 py-3 text-sm text-gray-500 text-center">
                                                        {part.stock_quantity}
                                                    </td>
                                                    <td className="px-2 py-3 text-sm font-medium">
                                                        <div className="flex flex-col space-y-1 items-center">
                                                            <Link
                                                                href={route('admin.spare-parts.edit-inertia', part.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Изменить
                                                            </Link>
                                                            <Link
                                                                href={route('admin.spare-parts.show-inertia', part.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Просмотр
                                                            </Link>
                                                            <Link
                                                                href={route('admin.spare-parts.analogs', part.id)}
                                                                className="text-purple-600 hover:text-purple-900"
                                                            >
                                                                Аналоги
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(part.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                type="button"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                    Запчасти не найдены
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Пагинация */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Показано с {spareParts.from || 0} по {spareParts.to || 0} из {spareParts.total} записей
                                    </div>
                                    <div className="flex space-x-1">
                                        {spareParts.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    link.active 
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 