import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminAlert from '@/Components/AdminAlert';
import AdminTable from '@/Components/AdminTable';
import AdminPagination from '@/Components/AdminPagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import SuccessButton from '@/Components/SuccessButton';
import InfoButton from '@/Components/InfoButton';

// Добавляем импорт функции url
const url = (path) => {
    return `/${path}`;
};

export default function Index({ auth, spareParts, categories, filters }) {
    const page = usePage();
    const [notification, setNotification] = useState(null);
    
    // Отладочный вывод для проверки данных
    console.log('SpareParts:', spareParts);
    console.log('Categories:', categories);
    
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
        get(url('admin/spare-parts'), { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        get(url('admin/spare-parts'), { preserveState: true });
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
        get(url('admin/spare-parts'), { preserveState: true });
    };

    const handlePerPageChange = (e) => {
        const value = e.target.value;
        setData({ ...data, per_page: value });
        get(url('admin/spare-parts'), { preserveState: true });
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
            router.delete(url(`admin/spare-parts/${id}`), {
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

    const handleUpdateCategory = (partId, categoryId) => {
        router.put(url(`admin/spare-parts-update-category/${partId}`), {
            category_id: categoryId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ type: 'success', message: 'Категория запчасти успешно обновлена' });
            },
            onError: (errors) => {
                setNotification({ type: 'error', message: 'Ошибка при обновлении категории: ' + (errors.message || 'Неизвестная ошибка') });
            }
        });
    };

    const handleActivateAll = () => {
        if (confirm('Вы действительно хотите активировать все запчасти?')) {
            // Перенаправляем на GET-маршрут для активации всех запчастей
            window.location.href = url('admin/spare-parts-activate-all');
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Запчасти</h2>}
        >
            <Head title="Управление запчастями" />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

            <div className="py-6">
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-4">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Управление запчастями" 
                            subtitle={`Всего запчастей: ${spareParts.total}`} 
                        />
                        
                        {/* Фильтры */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center text-[#2a4075]">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Фильтры поиска
                            </h3>
                            
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <form onSubmit={handleSearch}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <AdminFormGroup label="Поиск" name="search">
                                            <AdminInput
                                                type="text"
                                                name="search"
                                                value={data.search}
                                                onChange={(e) => setData('search', e.target.value)}
                                                placeholder="Артикул, название или описание"
                                            />
                                        </AdminFormGroup>
                                        
                                        <AdminFormGroup label="Категория" name="category_id">
                                            <AdminSelect
                                                name="category_id"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                            >
                                                <option value="">Все категории</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </AdminSelect>
                                        </AdminFormGroup>
                                        
                                        <AdminFormGroup label="Производитель" name="manufacturer">
                                            <AdminSelect
                                                name="manufacturer"
                                                value={data.manufacturer}
                                                onChange={(e) => setData('manufacturer', e.target.value)}
                                            >
                                                <option value="">Все производители</option>
                                                {manufacturers.map((manufacturer) => (
                                                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                                                ))}
                                            </AdminSelect>
                                        </AdminFormGroup>
                                        
                                        <div className="flex items-end space-x-2">
                                            <PrimaryButton type="submit" disabled={processing} className="h-10">
                                                Применить фильтры
                                            </PrimaryButton>
                                            <SecondaryButton type="button" onClick={handleReset} disabled={processing} className="h-10">
                                                Сбросить
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            <div className="flex space-x-2">
                                <PrimaryButton
                                    href={url('admin/spare-parts/create')}
                                    className="flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Добавить запчасть
                                </PrimaryButton>
                                
                                <SecondaryButton
                                    href={url('admin/spare-parts-activate-all')}
                                    className="flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Активировать все
                                </SecondaryButton>
                                
                                <InfoButton
                                    href={url('admin/spare-parts/sync-all-analogs')}
                                    className="flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Синхронизировать аналоги
                                </InfoButton>
                            </div>
                            
                            <div className="flex items-center ml-auto">
                                <span className="text-sm text-gray-600 mr-2">Записей на странице:</span>
                                <select
                                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={data.per_page}
                                    onChange={handlePerPageChange}
                                >
                                    <option value="10">10</option>
                                    <option value="30">30</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Таблица запчастей */}
                        <AdminTable
                            headers={[
                                { content: <button onClick={() => handleSort('id')} className="flex items-center">ID {getSortIcon('id')}</button> },
                                { content: <button onClick={() => handleSort('part_number')} className="flex items-center">Артикул {getSortIcon('part_number')}</button> },
                                { content: <button onClick={() => handleSort('name')} className="flex items-center">Название {getSortIcon('name')}</button> },
                                { content: <button onClick={() => handleSort('manufacturer')} className="flex items-center">Производитель {getSortIcon('manufacturer')}</button> },
                                { content: <button onClick={() => handleSort('price')} className="flex items-center">Цена {getSortIcon('price')}</button> },
                                { content: <button onClick={() => handleSort('category_id')} className="flex items-center">Категория {getSortIcon('category_id')}</button> },
                                { content: <button onClick={() => handleSort('is_active')} className="flex items-center">Статус {getSortIcon('is_active')}</button> },
                                { content: 'Действия' }
                            ]}
                            data={spareParts.data}
                            renderRow={(part) => (
                                <>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {part.id}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                                        {part.part_number}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                        {part.name}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {part.manufacturer || '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {part.price ? `${part.price} ₽` : '-'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-xs"
                                            value={part.category_id || ''}
                                            onChange={(e) => handleUpdateCategory(part.id, e.target.value)}
                                        >
                                            <option value="">Без категории</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${part.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {part.is_active ? 'Активна' : 'Неактивна'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-1">
                                            <Link href={url(`admin/spare-parts/${part.id}/edit`)} className="btn-info text-xs py-1 px-2">
                                                Изменить
                                            </Link>
                                            
                                            <Link href={url(`admin/spare-parts/${part.id}`)} className="btn-primary text-xs py-1 px-2">
                                                Просмотр
                                            </Link>
                                            
                                            <Link href={url(`admin/spare-parts/${part.id}/analogs`)} className="btn-secondary text-xs py-1 px-2">
                                                Аналоги
                                            </Link>
                                            
                                            <button
                                                onClick={() => handleDelete(part.id)}
                                                className="btn-danger text-xs py-1 px-2"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                            compact={true}
                        />
                        
                        {/* Пагинация */}
                        <div className="mt-4">
                            <AdminPagination links={spareParts.links} />
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 