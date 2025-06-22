import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminTable from '@/Components/AdminTable';
import AdminAlert from '@/Components/AdminAlert';

export default function Index({ auth, carModels, brands }) {
    const [filteredModels, setFilteredModels] = useState(carModels);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [isPopularFilter, setIsPopularFilter] = useState('');
    const [notification, setNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null);
    
    // Фильтрация моделей при изменении параметров поиска
    useEffect(() => {
        let result = carModels;
        
        // Фильтрация по поисковому запросу
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(model => 
                model.name.toLowerCase().includes(term) || 
                (model.brand && model.brand.name.toLowerCase().includes(term))
            );
        }
        
        // Фильтрация по бренду
        if (selectedBrand) {
            result = result.filter(model => model.brand_id == selectedBrand);
        }
        
        // Фильтрация по популярности
        if (isPopularFilter !== '') {
            const isPopular = isPopularFilter === 'popular';
            result = result.filter(model => model.is_popular === isPopular);
        }
        
        setFilteredModels(result);
    }, [searchTerm, selectedBrand, isPopularFilter, carModels]);
    
    // Обработчик поиска
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Обработчик выбора бренда
    const handleBrandSelect = (e) => {
        setSelectedBrand(e.target.value);
    };
    
    // Обработчик фильтра популярности
    const handlePopularityFilter = (e) => {
        setIsPopularFilter(e.target.value);
    };
    
    // Обработчик удаления модели
    const handleDeleteClick = (model) => {
        setModelToDelete(model);
        setShowDeleteModal(true);
    };
    
    const handleDeleteConfirm = () => {
        router.delete(url(`admin/car-models/${modelToDelete.id}`), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: `Модель "${modelToDelete.name}" успешно удалена`
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при удалении модели'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });
        setShowDeleteModal(false);
        setModelToDelete(null);
    };
    
    // Колонки для таблицы
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'brand', label: 'Бренд' },
        { key: 'years', label: 'Годы выпуска' },
        { key: 'generation', label: 'Поколение' },
        { key: 'actions', label: 'Действия' }
    ];
    
    // Форматирование данных для таблицы
    const data = filteredModels.map(model => ({
        id: model.id,
        name: (
            <Link 
                href={url(`admin/car-models/${model.id}`)} 
                className="text-blue-600 hover:underline font-medium"
            >
                {model.name}
            </Link>
        ),
        brand: model.brand.name,
        years: `${model.year_start} - ${model.year_end || 'н.в.'}`,
        generation: model.generation || '—',
        actions: (
            <div className="flex space-x-2">
                <Link 
                    href={url(`admin/car-models/${model.id}`)} 
                    className="btn-sm btn-info"
                >
                    Просмотр
                </Link>
                <Link 
                    href={url(`admin/car-models/${model.id}/edit`)} 
                    className="btn-sm btn-primary"
                >
                    Редактировать
                </Link>
                <button 
                    onClick={() => handleDeleteClick(model)} 
                    className="btn-sm btn-danger"
                >
                    Удалить
                </button>
            </div>
        )
    }));
    
    // Модальное окно подтверждения удаления
    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
                <p className="mb-6">
                    Вы уверены, что хотите удалить модель "{modelToDelete?.name}"?
                </p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="btn-secondary"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={handleDeleteConfirm} 
                        className="btn-danger"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Модели автомобилей</h2>}
        >
            <Head title="Модели автомобилей" />

            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            {/* Модальное окно удаления */}
            {showDeleteModal && <DeleteModal />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Модели автомобилей" 
                            subtitle={`Всего моделей: ${carModels.length}`}
                            actions={
                                <Link href={url('admin/car-models/create')} className="btn-primary">
                                    Добавить модель
                                </Link>
                            }
                        />
                        
                        {/* Фильтры и поиск */}
                        <div className="mb-6 flex flex-col md:flex-row md:items-end gap-4">
                            <div className="w-full md:w-1/4">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Поиск
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Поиск по названию..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>
                            
                            <div className="w-full md:w-1/4">
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                    Бренд
                                </label>
                                <select
                                    id="brand"
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedBrand}
                                    onChange={handleBrandSelect}
                                >
                                    <option value="">Все бренды</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="w-full md:w-1/4">
                                <label htmlFor="popular" className="block text-sm font-medium text-gray-700 mb-1">
                                    Популярность
                                </label>
                                <select
                                    id="popular"
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={isPopularFilter}
                                    onChange={handlePopularityFilter}
                                >
                                    <option value="">Все модели</option>
                                    <option value="popular">Только популярные</option>
                                    <option value="not-popular">Не популярные</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <AdminTable 
                                columns={columns} 
                                data={data} 
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                searchPlaceholder="Поиск по названию, бренду или поколению..."
                            />
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 