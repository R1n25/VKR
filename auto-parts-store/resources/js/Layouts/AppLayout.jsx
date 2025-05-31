import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Навигационная панель */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Логотип */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                </Link>
                            </div>

                            {/* Навигационные ссылки */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link 
                                    href={route('home')} 
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition"
                                >
                                    Главная
                                </Link>
                                <Link 
                                    href={route('categories.index')} 
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition"
                                >
                                    Каталог
                                </Link>
                                <Link 
                                    href={route('brands.index')} 
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition"
                                >
                                    Бренды
                                </Link>
                                <Link 
                                    href={route('search')} 
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition"
                                >
                                    Поиск
                                </Link>
                            </div>
                        </div>

                        {/* Правая часть навигации */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            {auth.user ? (
                                <div className="flex items-center space-x-4">
                                    <Link 
                                        href={route('cart')} 
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Корзина
                                    </Link>
                                    <Link 
                                        href={route('dashboard')} 
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition"
                                    >
                                        {auth.user.name}
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link 
                                        href={route('login')} 
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition"
                                    >
                                        Вход
                                    </Link>
                                    <Link 
                                        href={route('register')} 
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none transition"
                                    >
                                        Регистрация
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Мобильная навигация */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className="inline-flex" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Основное содержимое страницы */}
            <main>{children}</main>

            {/* Футер */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:justify-between">
                        <div className="mb-6 md:mb-0">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="h-8 w-auto" />
                                <span className="ml-3 text-xl font-semibold">Авто Запчасти</span>
                            </Link>
                            <p className="mt-2 text-sm text-gray-500">
                                Качественные запчасти для вашего автомобиля
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Компания</h3>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link href={route('about')} className="text-base text-gray-500 hover:text-gray-900">
                                            О нас
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('contacts')} className="text-base text-gray-500 hover:text-gray-900">
                                            Контакты
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Каталог</h3>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link href={route('categories.index')} className="text-base text-gray-500 hover:text-gray-900">
                                            Категории
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('brands.index')} className="text-base text-gray-500 hover:text-gray-900">
                                            Бренды
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Поддержка</h3>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link href={route('vin-request.index')} className="text-base text-gray-500 hover:text-gray-900">
                                            Подбор по VIN
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('search')} className="text-base text-gray-500 hover:text-gray-900">
                                            Поиск
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} Авто Запчасти. Все права защищены.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 