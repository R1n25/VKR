import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Home({ auth, canLogin, canRegister, brands: initialBrands, categories: initialCategories }) {
    const [brands] = useState(initialBrands || []);
    const [categories] = useState(initialCategories || []);
    const [searchQuery, setSearchQuery] = useState('');

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

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {brands.filter(brand => brand.is_popular).map((brand) => (
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
                        </div>
                    </div>

                    {/* Подбор по VIN-коду */}
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl mt-10 border border-gray-100">
                        <div className="p-8 sm:flex items-center">
                            <div className="sm:w-2/3 mb-6 sm:mb-0 sm:pr-8">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                    VIN-запрос
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Не знаете какие запчасти нужны для вашего автомобиля? Мы поможем подобрать необходимые детали по VIN-коду вашего автомобиля.
                                </p>
                                <ul className="text-gray-600 mb-6 space-y-2">
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Точный подбор запчастей для вашего автомобиля
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Быстрая обработка запроса специалистами
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Консультация по выбору и установке
                                    </li>
                                </ul>
                                <Link
                                    href={route('vin-request.index')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    VIN-запрос
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="sm:w-1/3">
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-800 font-mono text-lg font-bold mb-2">VIN: WBA1J7C5XJV000001</p>
                                        <p className="text-sm text-gray-500">
                                            VIN-код можно найти в техпаспорте или на кузове автомобиля
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
} 