import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Footer from '@/Components/Footer';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CartIcon from '@/Components/CartIcon';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <nav className="bg-[#0f172a] shadow-lg relative z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('home')}>
                                    <ApplicationLogo className="block h-12 w-auto fill-current text-white transition-all duration-300 hover:scale-110 hover:text-green-400" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('home')} active={route().current('home')}>
                                    Главная
                                </NavLink>
                                <NavLink href={route('brands.index')} active={route().current('brands.index')}>
                                    Бренды
                                </NavLink>
                                <NavLink href={route('categories.index')} active={route().current('categories.index')}>
                                    Категории
                                </NavLink>
                                <NavLink href={route('news')} active={route().current('news')}>
                                    Новости
                                </NavLink>
                                <NavLink href={route('contacts')} active={route().current('contacts')}>
                                    Контакты
                                </NavLink>
                            </div>
                        </div>

                        {user && (
                            <div className="hidden sm:flex sm:items-center sm:ml-auto space-x-4">
                                {user.role === 'admin' ? (
                                    <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                        Админ-панель
                                    </NavLink>
                                ) : (
                                    <>
                                        <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                            Личный кабинет
                                        </NavLink>
                                        <NavLink href={route('orders.index')} active={route().current('orders.index')}>
                                            Заказы
                                        </NavLink>
                                    </>
                                )}
                                
                                <div className="mr-4 inline-flex">
                                    <CartIcon user={user} />
                                </div>
                                
                                {user.role !== 'admin' && (
                                    <NavLink href={route('finances.index')} active={route().current('finances.index')}>
                                        Финансы
                                    </NavLink>
                                )}
                                
                                <span className="text-white mr-2">|</span>
                                <span className="text-white mr-2">{user.name}</span>
                                
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition duration-200"
                                >
                                    Выход
                                </Link>
                            </div>
                        )}

                        {!user && (
                            <div className="hidden sm:flex sm:items-center sm:ml-auto">
                                {route().has('login') && (
                                    <Link 
                                        href={route('login')} 
                                        className="px-4 py-2 text-sm font-medium text-white hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 mr-2"
                                    >
                                        Вход
                                    </Link>
                                )}
                                {route().has('register') && (
                                    <Link 
                                        href={route('register')} 
                                        className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                                    >
                                        Регистрация
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <span className="sr-only">Open main menu</span>
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`${
                        showingNavigationDropdown ? 'block' : 'hidden'
                    } sm:hidden bg-indigo-950 border-t border-indigo-900`}
                >
                    <div className="space-y-2 px-4 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('home')}
                            active={route().current('home')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                route().current('home')
                                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Главная
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('brands.index')}
                            active={route().current('brands.index')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                route().current('brands.index')
                                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Бренды
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('categories.index')}
                            active={route().current('categories.index')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                route().current('categories.index')
                                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Категории
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('news')}
                            active={route().current('news')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                route().current('news')
                                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                            </svg>
                            Новости
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('contacts')}
                            active={route().current('contacts')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                route().current('contacts')
                                    ? 'bg-[#2a4075] text-white shadow-lg shadow-[#2a4075]/30 font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Контакты
                        </ResponsiveNavLink>
                    </div>

                    {user && (
                        <div className="border-t border-indigo-900 pb-3 pt-4">
                        <div className="px-4">
                                <div className="text-base font-medium text-white">
                                {user.name}
                            </div>
                                <div className="text-sm font-medium text-indigo-300">
                                {user.email}
                            </div>
                        </div>

                            <div className="mt-3 space-y-1 px-4">
                                {user.role === 'admin' ? (
                                    <ResponsiveNavLink 
                                        href={route('admin.dashboard')}
                                        className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                            route().current('admin.dashboard')
                                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                : 'hover:bg-indigo-900'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        Админ-панель
                                    </ResponsiveNavLink>
                                ) : (
                                    <>
                                        <ResponsiveNavLink 
                                            href={route('dashboard')}
                                            className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                                route().current('dashboard')
                                                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                    : 'hover:bg-indigo-900'
                                            }`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Личный кабинет
                                        </ResponsiveNavLink>
                                        
                                        <ResponsiveNavLink 
                                            href={route('orders.index')}
                                            className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                                route().current('orders.index')
                                                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                    : 'hover:bg-indigo-900'
                                            }`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Заказы
                                        </ResponsiveNavLink>
                                    </>
                                )}
                                
                                {user.role !== 'admin' && (
                                    <ResponsiveNavLink 
                                        href={route('finances.index')}
                                        className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                            route().current('finances.*')
                                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                : 'hover:bg-indigo-900'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Финансы
                                    </ResponsiveNavLink>
                                )}
                                
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                        className={`w-full flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-indigo-900`}
                                >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Выход
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    )}

                    {!user && (
                        <div className="border-t border-indigo-900 px-4 py-4 space-y-2">
                            <div className="flex justify-between">
                                {route().has('login') && (
                                    <ResponsiveNavLink 
                                        href={route('login')}
                                        className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                            route().current('login')
                                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                : 'hover:bg-indigo-900'
                                        }`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Вход
                                    </ResponsiveNavLink>
                                )}
                                {route().has('register') && (
                                    <ResponsiveNavLink 
                                        href={route('register')}
                                        className={`flex items-center bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-lg transition-all duration-300 ${
                                            route().current('register')
                                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                : ''
                                        }`}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Регистрация
                                    </ResponsiveNavLink>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <header>
                <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <div className="text-white">
                        {header}
                        </div>
                    </div>
                    </div>
                </header>

            <main>{children}</main>
            <Footer />
        </div>
    );
}
