import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Home({ auth, canLogin, canRegister, brands: initialBrands, categories: initialCategories }) {
    const [brands, setBrands] = useState(initialBrands || []);
    const [categories, setCategories] = useState(initialCategories || []);
    const [loadingBrands, setLoadingBrands] = useState(!initialBrands);
    const [loadingCategories, setLoadingCategories] = useState(!initialCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    useEffect(() => {
        // Если данные не переданы через пропсы, загружаем их
        if (!initialBrands) {
            // Получаем бренды
            const fetchBrands = async () => {
                try {
                    const response = await axios.get('/api/brands');
                    // Сортируем бренды по алфавиту
                    const sortedBrands = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
                    setBrands(sortedBrands);
                } catch (error) {
                    console.error('Ошибка при загрузке брендов:', error);
                } finally {
                    setLoadingBrands(false);
                }
            };
            fetchBrands();
        } else {
            setLoadingBrands(false);
        }

        if (!initialCategories) {
            // Получаем категории верхнего уровня
            const fetchCategories = async () => {
                try {
                    const response = await axios.get('/api/categories?root_only=true');
                    setCategories(response.data.data);
                } catch (error) {
                    console.error('Ошибка при загрузке категорий:', error);
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchCategories();
        } else {
            setLoadingCategories(false);
        }
    }, [initialBrands, initialCategories]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Найдите автозапчасти для вашего автомобиля
                    </h2>
                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Введите название или артикул запчасти"
                                className="w-full px-4 py-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-green-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
                            >
                                Найти
                            </button>
                        </div>
                    </form>
                </div>
            }
        >
            <Head title="Главная" />

            <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Бренды автомобилей */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl mb-10 border border-gray-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Популярные бренды
                                </h3>
                                <Link 
                                    href={route('brands.index')}
                                    className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Все бренды
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {loadingBrands ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Загрузка брендов...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {brands.slice(0, 12).map((brand) => (
                                        <Link
                                            key={brand.id}
                                            href={route('brands.show', brand.id)}
                                            className="group relative flex flex-col items-center"
                                        >
                                            <div className="relative w-full aspect-square mb-3">
                                                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl border border-gray-200 p-4 transition-all duration-300 group-hover:shadow-lg group-hover:border-green-200">
                                                    <span className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-all duration-300 text-center font-sans tracking-wider transform group-hover:scale-105">
                                                        {brand.name}
                                                    </span>
                                                </div>
                                                {brand.vin_required && (
                                                    <div className="absolute top-2 right-2">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            VIN
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="text-sm text-center text-gray-600 group-hover:text-green-600 transition-colors duration-300">
                                                {brand.country}
                                            </h4>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Категории запчастей */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    Категории запчастей
                                </h3>
                                <Link 
                                    href={route('categories.index')} 
                                    className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
                                >
                                    Все категории
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            {loadingCategories ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Загрузка категорий...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {categories.slice(0, 8).map((category) => (
                                        <Link
                                            key={category.id}
                                            href={route('categories.show', category.id)}
                                            className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                                        >
                                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 mb-2 transition-colors duration-300">
                                                {category.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                                                {category.description}
                                            </p>
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