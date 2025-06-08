import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
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

    const handleUpdateCategory = (partId, categoryId) => {
        router.put(route('admin.spare-parts.update-category', { spare_part: partId }), {
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
            router.post(route('admin.spare-parts.set-all-active'), {}, {
                onSuccess: () => {
                    // Показываем уведомление об успешной активации
                    setNotification({ type: 'success', message: 'Все запчасти успешно активированы' });
                    
                    // Создаем таймер для автоматического скрытия уведомления
                    const timer = setTimeout(() => {
                        setNotification(null);
                    }, 3000);
                    
                    // Перезагружаем страницу для обновления данных
                    router.reload({ only: ['spareParts'] });
                },
                onError: (errors) => {
                    setNotification({ type: 'error', message: 'Ошибка при активации запчастей: ' + (errors.message || 'Неизвестная ошибка') });
                    
                    // Создаем таймер для автоматического скрытия уведомления об ошибке
                    setTimeout(() => {
                        setNotification(null);
                    }, 3000);
                }
            });
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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Управление запчастями" 
                            subtitle={`Всего запчастей: ${spareParts.total}`} 
                        />
                        
                        {/* Фильтры */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#2a4075]">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Фильтры поиска
                            </h3>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <form onSubmit={handleSearch}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AdminFormGroup label="Поиск" name="search">
                                            <AdminInput
                                                type="text"
                                                name="search"
                                                value={data.search}
                                                handleChange={(e) => setData('search', e.target.value)}
                                                placeholder="Название или артикул"
                                            />
                                        </AdminFormGroup>
                                        
                                        <AdminFormGroup label="Категория" name="category_id">
                                            <AdminSelect
                                                name="category_id"
                                                value={data.category_id}
                                                handleChange={(e) => setData('category_id', e.target.value)}
                                            >
                                                <option value="">Все категории</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </AdminSelect>
                                        </AdminFormGroup>
                                        
                                        <AdminFormGroup label="Производитель" name="manufacturer">
                                            <AdminSelect
                                                name="manufacturer"
                                                value={data.manufacturer}
                                                handleChange={(e) => setData('manufacturer', e.target.value)}
                                            >
                                                <option value="">Все производители</option>
                                                {manufacturers.map((manufacturer) => (
                                                    <option key={manufacturer} value={manufacturer}>
                                                        {manufacturer}
                                                    </option>
                                                ))}
                                            </AdminSelect>
                                        </AdminFormGroup>
                                    </div>
                                    
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <PrimaryButton 
                                                type="submit" 
                                                disabled={processing}
                                                className="flex items-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Применение...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                        </svg>
                                                        Применить фильтры
                                                    </>
                                                )}
                                            </PrimaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={handleReset}
                                                className="flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Сбросить
                                            </SecondaryButton>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <SuccessButton
                                                href={route('admin.spare-parts.create-inertia')}
                                                className="flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Добавить запчасть
                                            </SuccessButton>
                                            <InfoButton
                                                type="button"
                                                onClick={() => handleActivateAll()}
                                                className="flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Активировать все
                                            </InfoButton>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Таблица запчастей */}
                        <AdminTable
                            headers={[
                                'ID',
                                'Название',
                                'Артикул',
                                'Категория',
                                'Производитель',
                                { content: 'Цена', props: { className: 'text-right' } },
                                { content: 'Кол-во', props: { className: 'text-center' } },
                                { content: 'Статус', props: { className: 'text-center' } },
                                { content: 'Действия', props: { className: 'text-center' } }
                            ]}
                            data={spareParts.data}
                            onSort={handleSort}
                            currentSort={data.sort}
                            currentDirection={data.direction}
                            renderRow={(part) => (
                                <>
                                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">{part.id}</td>
                                    <td className="px-2 py-3 text-sm text-gray-900 break-words">{part.name}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500">{part.part_number}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500">
                                        {part.category_id ? (
                                            categories.find(cat => cat.id === part.category_id)?.name || '-'
                                        ) : '-'}
                                    </td>
                                    <td className="px-2 py-3 text-sm text-gray-500 break-words">{part.manufacturer}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 text-right">{part.price} ₽</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 text-center">{part.stock_quantity}</td>
                                    <td className="px-2 py-3 text-sm text-gray-500 text-center">
                                        {part.is_available ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Активна</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Неактивна</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-3 text-sm font-medium">
                                        <div className="flex flex-col space-y-1 items-center">
                                            <SecondaryButton
                                                href={route('admin.spare-parts.edit-inertia', part.id)}
                                                className="text-xs px-2 py-1 w-full"
                                            >
                                                Изменить
                                            </SecondaryButton>
                                            <InfoButton
                                                href={route('admin.spare-parts.show-inertia', part.id)}
                                                className="text-xs px-2 py-1 w-full"
                                            >
                                                Просмотр
                                            </InfoButton>
                                            <PrimaryButton
                                                href={route('admin.spare-parts.analogs', part.id)}
                                                className="text-xs px-2 py-1 w-full"
                                            >
                                                Аналоги
                                            </PrimaryButton>
                                            <DangerButton
                                                onClick={() => handleDelete(part.id)}
                                                className="text-xs px-2 py-1 w-full"
                                            >
                                                Удалить
                                            </DangerButton>
                                        </div>
                                    </td>
                                </>
                            )}
                            emptyMessage="Запчасти не найдены"
                        />

                        {/* Пагинация */}
                        <div className="mt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div className="mb-2 sm:mb-0 text-sm text-gray-700">
                                    Показано с {spareParts.from || 0} по {spareParts.to || 0} из {spareParts.total} записей
                                </div>
                                <AdminPagination links={spareParts.links} />
                            </div>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 