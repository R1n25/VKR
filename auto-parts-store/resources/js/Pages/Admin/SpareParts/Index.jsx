import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Index({ auth, spareParts, categories, manufacturers, filters }) {
    const [searchParams, setSearchParams] = useState({
        search: filters.search || '',
        category: filters.category || '',
        manufacturer: filters.manufacturer || '',
        status: filters.status || '',
    });

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        category: filters.category || '',
        manufacturer: filters.manufacturer || '',
        status: filters.status || '',
        sort: filters.sort || 'id',
        direction: filters.direction || 'desc',
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
            category: '',
            manufacturer: '',
            status: '',
            sort: 'id',
            direction: 'desc',
        });
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

    const getAvailabilityStatus = (isAvailable) => {
        return isAvailable ? (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">В наличии</span>
        ) : (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Нет в наличии</span>
        );
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Запчасти</h2>}
        >
            <Head title="Управление запчастями" />

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
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Категория
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Все категории</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
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
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Статус
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Любой статус</option>
                                            <option value="available">В наличии</option>
                                            <option value="unavailable">Нет в наличии</option>
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
                                            href={route('admin.spare-parts.create')}
                                            className="ml-auto px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Добавить запчасть
                                        </Link>
                                    </div>
                                </form>
                            </div>

                            {/* Таблица запчастей */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('id')}
                                            >
                                                ID {getSortIcon('id')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('name')}
                                            >
                                                Название {getSortIcon('name')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('part_number')}
                                            >
                                                Артикул {getSortIcon('part_number')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('price')}
                                            >
                                                Цена {getSortIcon('price')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('stock_quantity')}
                                            >
                                                Количество {getSortIcon('stock_quantity')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('manufacturer')}
                                            >
                                                Производитель {getSortIcon('manufacturer')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('is_available')}
                                            >
                                                Статус {getSortIcon('is_available')}
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {spareParts.data.length > 0 ? (
                                            spareParts.data.map((part) => (
                                                <tr key={part.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {part.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {part.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.part_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.price} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.stock_quantity} шт.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.manufacturer}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {getAvailabilityStatus(part.is_available)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.spare-parts.show', part.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Просмотр
                                                            </Link>
                                                            <Link
                                                                href={route('admin.spare-parts.edit', part.id)}
                                                                className="text-yellow-600 hover:text-yellow-900"
                                                            >
                                                                Редактировать
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
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
                                        Показано с {spareParts.from || 0} по {spareParts.to || 0} из {spareParts.total} запчастей
                                    </div>
                                    <div className="flex space-x-1">
                                        {spareParts.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-4 py-2 text-sm border rounded ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
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