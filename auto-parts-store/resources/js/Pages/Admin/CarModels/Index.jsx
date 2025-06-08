import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, carModels, brands }) {
    const [filteredModels, setFilteredModels] = useState(carModels);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [isPopularFilter, setIsPopularFilter] = useState('');
    
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
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Модели автомобилей</h2>}
        >
            <Head title="Модели автомобилей" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
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
                                
                                <div className="w-full md:w-1/4 flex justify-end">
                                    <Link
                                        href={route('admin.car-models.create')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Добавить модель
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Таблица моделей */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Изображение
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Название
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Бренд
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Годы выпуска
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Популярная
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredModels.length > 0 ? (
                                            filteredModels.map(model => (
                                                <tr key={model.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {model.image_url ? (
                                                            <img 
                                                                src={`/storage/${model.image_url}`} 
                                                                alt={model.name}
                                                                className="h-12 w-16 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-16 bg-gray-200 rounded flex items-center justify-center">
                                                                <span className="text-xs text-gray-500">Нет фото</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {model.name}
                                                        </div>
                                                        {model.generation && (
                                                            <div className="text-xs text-gray-500">
                                                                {model.generation}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {model.brand ? model.brand.name : 'Неизвестный бренд'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {model.year_start && model.year_end ? 
                                                                `${model.year_start} - ${model.year_end}` : 
                                                                model.year_start ? 
                                                                    `${model.year_start} - н.в.` : 
                                                                    'Не указано'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${model.is_popular ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {model.is_popular ? 'Да' : 'Нет'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-3">
                                                            <Link
                                                                href={route('admin.car-models.edit', model.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <PencilIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('admin.car-models.destroy', model.id)}
                                                                method="delete"
                                                                as="button"
                                                                className="text-red-600 hover:text-red-900"
                                                                onClick={(e) => {
                                                                    if (!confirm('Вы уверены, что хотите удалить эту модель?')) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    Нет моделей, соответствующих заданным критериям
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 