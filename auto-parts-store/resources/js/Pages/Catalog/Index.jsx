import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, popularBrands, allBrands }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');

    // Фильтрация брендов по поисковому запросу
    const filteredBrands = allBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Обработчик изменения поиска
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Обработчик выбора бренда
    const handleBrandSelect = (e) => {
        setSelectedBrand(e.target.value);
        if (e.target.value) {
            const brand = allBrands.find(b => b.id == e.target.value);
            if (brand && brand.slug) {
                window.location.href = route('catalog.brand', brand.slug);
            }
        }
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Каталог автомобилей" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Каталог автомобилей</h1>
                            
                            {/* Поиск и выбор бренда */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                            Поиск бренда
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="search"
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Поиск бренда..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                            Выберите бренд
                                        </label>
                                        <select
                                            id="brand"
                                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={selectedBrand}
                                            onChange={handleBrandSelect}
                                        >
                                            <option value="">Выберите бренд</option>
                                            {allBrands.map(brand => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Популярные бренды */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Популярные модели</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {popularBrands.map(brand => (
                                        <div key={brand.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                                            <div className="px-4 py-3 bg-gray-100 border-b">
                                                <Link 
                                                    href={route('catalog.brand', brand.slug)} 
                                                    className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                                                >
                                                    {brand.name}
                                                </Link>
                                            </div>
                                            <div className="p-4">
                                                <ul className="space-y-2">
                                                    {brand.car_models && brand.car_models.slice(0, 5).map(model => (
                                                        <li key={model.id} className="flex items-center">
                                                            <ChevronRightIcon className="h-4 w-4 text-indigo-500 mr-2" />
                                                            <Link 
                                                                href={route('catalog.model', [brand.slug, model.slug])}
                                                                className="text-gray-700 hover:text-indigo-600"
                                                            >
                                                                {model.name}
                                                            </Link>
                                                            {model.generation && (
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    ({model.generation})
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                
                                                {brand.car_models && brand.car_models.length > 5 && (
                                                    <div className="mt-3 text-right">
                                                        <Link 
                                                            href={route('catalog.brand', brand.slug)}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Все модели ({brand.car_models.length})
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Все бренды */}
                            {searchTerm && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Результаты поиска</h2>
                                    
                                    {filteredBrands.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {filteredBrands.map(brand => (
                                                <Link
                                                    key={brand.id}
                                                    href={route('catalog.brand', brand.slug)}
                                                    className="bg-gray-50 p-3 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                >
                                                    {brand.name}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Ничего не найдено</p>
                                    )}
                                </div>
                            )}
                            
                            {!searchTerm && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Все бренды</h2>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {allBrands.map(brand => (
                                            <Link
                                                key={brand.id}
                                                href={route('catalog.brand', brand.slug)}
                                                className="bg-gray-50 p-3 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                            >
                                                {brand.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 