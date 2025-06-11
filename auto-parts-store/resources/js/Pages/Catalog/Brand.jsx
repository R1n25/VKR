import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { MagnifyingGlassIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Brand({ auth, brand, models, popularModels }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Фильтрация моделей по поисковому запросу
    const filteredModels = {};
    
    Object.keys(models).forEach(letter => {
        const filtered = models[letter].filter(model => 
            model.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered.length > 0) {
            filteredModels[letter] = filtered;
        }
    });
    
    // Обработчик изменения поиска
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Формат года выпуска
    const formatYears = (model) => {
        if (model.year_start && model.year_end) {
            return `${model.year_start} - ${model.year_end}`;
        } else if (model.year_start) {
            return `${model.year_start} - н.в.`;
        } else {
            return 'Год не указан';
        }
    };
    
    return (
        <MainLayout user={auth?.user}>
            <Head title={`${brand.name} - Каталог моделей`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Хлебные крошки */}
                    <div className="mb-4 flex items-center text-sm text-gray-500">
                        <Link href={url('catalog')} className="hover:text-indigo-600">
                            Каталог
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">{brand.name}</span>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {brand.name} - Каталог моделей
                                </h1>
                                
                                {/* Логотип бренда, если есть */}
                                {brand.logo_url && (
                                    <img 
                                        src={`/storage/${brand.logo_url}`} 
                                        alt={`${brand.name} logo`} 
                                        className="h-12"
                                    />
                                )}
                            </div>
                            
                            {/* Поиск модели */}
                            <div className="mb-8">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Поиск модели {brand.name}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder={`Поиск модели ${brand.name}...`}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            
                            {/* Популярные модели */}
                            {popularModels.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                        <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                        Популярные модели {brand.name}
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {popularModels.map(model => (
                                            <Link
                                                key={model.id}
                                                href={url('catalog/model', { brand: brand.slug, model: model.slug })}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {model.image_url ? (
                                                        <img 
                                                            src={`/storage/${model.image_url}`}
                                                            alt={model.name}
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">Нет фото</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                                                        <p className="text-sm text-gray-500">{formatYears(model)}</p>
                                                        {model.generation && (
                                                            <p className="text-xs text-gray-500">
                                                                {model.generation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Все модели */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Все модели {brand.name}
                                </h2>
                                
                                {Object.keys(searchTerm ? filteredModels : models).length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.keys(searchTerm ? filteredModels : models).sort().map(letter => (
                                            <div key={letter} className="border-b pb-4">
                                                <h3 className="text-lg font-medium text-indigo-700 mb-3">{letter}</h3>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {(searchTerm ? filteredModels[letter] : models[letter]).map(model => (
                                                        <Link
                                                            key={model.id}
                                                            href={url('catalog/model', { brand: brand.slug, model: model.slug })}
                                                            className="flex items-center p-2 rounded hover:bg-gray-50"
                                                        >
                                                            <ChevronRightIcon className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                                                            <div>
                                                                <span className="text-gray-900">{model.name}</span>
                                                                {model.is_popular && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        <StarIcon className="h-3 w-3 mr-1" />
                                                                        Популярная
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center text-gray-500">
                                        {searchTerm ? (
                                            <p>Ничего не найдено по запросу "{searchTerm}"</p>
                                        ) : (
                                            <p>Нет доступных моделей для бренда {brand.name}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 