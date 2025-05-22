import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function BrandsIndex({ auth, brands: initialBrands }) {
    // Сортируем бренды по алфавиту при инициализации
    const sortedInitialBrands = initialBrands ? [...initialBrands].sort((a, b) => a.name.localeCompare(b.name)) : [];
    
    const [brands, setBrands] = useState(sortedInitialBrands);
    const [filteredBrands, setFilteredBrands] = useState(sortedInitialBrands);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Фильтрация брендов при изменении поискового запроса
    useEffect(() => {
        if (!brands || brands.length === 0) return;
        
        let filtered = [...brands];
        
        // Фильтрация по поисковому запросу
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(brand => 
                brand.name.toLowerCase().includes(query) || 
                (brand.country && brand.country.toLowerCase().includes(query))
            );
        }
        
        // Сохраняем отсортированный список
        setFilteredBrands(filtered);
    }, [brands, searchQuery]);
    
    // Обработчик изменения поискового запроса
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Бренды автомобилей</h2>}
        >
            <Head title="Бренды автомобилей" />

            <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Поисковая секция */}
                    <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl shadow-2xl mb-10 py-12 px-6 sm:px-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.05] -z-1"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent -z-1"></div>
                        <div className="max-w-4xl mx-auto text-center relative">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 drop-shadow-md">
                                Найдите бренды автомобилей
                            </h2>
                            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
                                <div className="relative flex-grow w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Поиск по названию или стране"
                                        className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 shadow-lg"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Список брендов */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                        <div className="p-8">
                            {/* Хлебные крошки */}
                            <nav className="mb-8">
                                <ol className="flex space-x-2 text-sm text-gray-500">
                                    <li>
                                        <Link href={route('home')} className="hover:text-green-600 transition-colors duration-200 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Главная
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium text-gray-900">Бренды</span>
                                    </li>
                                </ol>
                            </nav>

                            {/* Сетка брендов */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                                    <p className="mt-4 text-gray-600">Загрузка брендов...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 text-red-700 p-6 rounded-xl">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {error}
                                    </div>
                                </div>
                            ) : filteredBrands.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-xl">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="mt-4 text-lg text-gray-500">По вашему запросу ничего не найдено</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {filteredBrands.map(brand => (
                                        <Link
                                            key={brand.id}
                                            href={route('brands.show', brand.id)}
                                            className="group relative flex flex-col items-center p-6 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="relative w-full aspect-square mb-4 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-all duration-300 text-center font-sans tracking-wider transform group-hover:scale-105">
                                                    {brand.name}
                                                </span>
                                                {brand.vin_required && (
                                                    <div className="absolute top-0 right-0">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            VIN
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500 text-center group-hover:text-gray-600 transition-colors duration-300">
                                                {brand.country}
                                            </p>
                                            <div className="absolute inset-0 border-2 border-green-500 scale-105 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300"></div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 