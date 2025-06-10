import React, { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';

export default function AdminLayout({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Основной контент с боковой навигацией */}
            <div className="flex flex-grow">
                {/* Боковая навигация */}
                <aside className={`bg-[#243969] text-white w-64 min-h-screen flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
                    {/* Логотип вверху боковой панели */}
                    <div className="p-4 flex items-center justify-center border-b border-[#3a5085]">
                        <Link href="/">
                            <ApplicationLogo className="block h-12 w-auto" variant="white" />
                        </Link>
                    </div>
                    
                    <div className="p-4">
                        <div className="space-y-1">
                            {/* Ссылка на сайт */}
                            <Link 
                                href={route('home')} 
                                className="block py-3 px-4 rounded-lg flex items-center transition-colors hover:bg-[#3a5085]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                На сайт
                            </Link>
                            
                            {/* Разделитель */}
                            <div className="border-t border-[#3a5085] my-3"></div>
                            
                            <Link 
                                href={route('admin.dashboard')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.dashboard') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Панель управления
                            </Link>
                            <Link 
                                href={route('admin.spare-parts.inertia')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.spare-parts.inertia') || route().current('admin.spare-parts.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Запчасти
                            </Link>
                            <Link 
                                href={route('admin.part-categories.inertia')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.part-categories.inertia') || route().current('admin.part-categories.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Категории
                            </Link>
                            <Link
                                href={route('admin.orders.index')}
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.orders.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Заказы
                            </Link>

                            <Link 
                                href={route('admin.vin-requests.index')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.vin-requests.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                VIN-запросы
                            </Link>
                            <Link 
                                href={route('admin.users.index')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.users.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Пользователи
                            </Link>
                            
                            {/* Изменённый раздел предложений - теперь без выпадающего меню */}
                            <Link 
                                href={route('admin.suggestions.inertia')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.suggestions.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Предложения
                            </Link>
                            
                            <Link 
                                href={route('admin.catalog-manager.index')} 
                                className={`block py-3 px-4 rounded-lg flex items-center transition-colors ${route().current('admin.catalog-manager.*') ? 'bg-[#3a5085]' : 'hover:bg-[#3a5085]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Каталог
                            </Link>
                            
                            {/* Разделитель */}
                            <div className="border-t border-[#3a5085] my-3"></div>
                            
                            {/* Информация о пользователе */}
                            <div className="py-3 px-4">
                                <div className="text-sm text-gray-300">Вы вошли как:</div>
                                <div className="font-medium">{user?.name || 'Администратор'}</div>
                                <div className="text-xs text-gray-400 mt-1">{user?.email || ''}</div>
                            </div>
                            
                            {/* Кнопка выхода */}
                            {user && (
                                <Link
                                    href={route('logout')}
                                    className="w-full block py-3 px-4 rounded-lg flex items-center transition-colors bg-red-600 hover:bg-red-700 mt-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Выйти
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Основной контент */}
                <div className="flex-grow">
                    {/* Кнопка переключения боковой панели для мобильных устройств */}
                    <div className="lg:hidden p-4 bg-[#2a4075] flex items-center">
                        <button 
                            onClick={toggleSidebar} 
                            className="text-white p-2 rounded-md hover:bg-[#3a5085] mr-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span className="text-white font-bold text-lg">Админ-панель</span>
                    </div>
                    
                    {header && (
                        <header className="bg-white shadow">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    <main className="flex-grow">
                        <FlashMessage />
                        <div className="p-4 sm:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
} 