import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Footer from '@/Components/Footer';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import CartIcon from '@/Components/CartIcon';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location = url('search') + '?q=' + encodeURIComponent(searchQuery);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <nav className="bg-[#0f172a] shadow-lg relative z-50">
                <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={url('/')}>
                                    <ApplicationLogo className="block h-16 w-auto sm:h-16 xs:h-12" variant="white" />
                                </Link>
                            </div>

                            <div className="hidden space-x-4 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={url('/')} active={window.location.pathname === '/' || window.location.pathname === '/home'}>
                                    Главная
                                </NavLink>
                                <NavLink href={url('/brands')} active={window.location.pathname.startsWith('/brands')}>
                                    Бренды
                                </NavLink>
                                <NavLink href={url('/news')} active={window.location.pathname === '/news'}>
                                    Новости
                                </NavLink>
                                <NavLink href={url('/contacts')} active={window.location.pathname === '/contacts'}>
                                    Контакты
                                </NavLink>
                                <div className="relative flex items-center ml-4">
                                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                                        <button 
                                            type="submit" 
                                            className="absolute left-3 text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                        <input 
                                            type="text" 
                                            placeholder="Поиск..." 
                                            className="bg-[#1a2542] text-white border-0 rounded-lg pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>

                        {user && (
                            <div className="hidden sm:flex sm:items-center sm:ml-auto space-x-4">
                                {user.role === 'admin' ? (
                                    <div className="flex items-center space-x-4">
                                        <NavLink href={url('admin/dashboard')} active={window.location.pathname.startsWith('/admin/dashboard')}>
                                            <div className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Админ-панель
                                            </div>
                                        </NavLink>
                                        
                                        <div className="mr-4 inline-flex">
                                            <CartIcon user={user} />
                                        </div>
                                        
                                        <Link
                                            href={url('logout')}
                                            className="flex items-center bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Выход
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mr-4 inline-flex">
                                            <CartIcon user={user} />
                                        </div>
                                        
                                        <div className="border-l border-gray-500 h-8 mx-2"></div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={url('/dashboard')}
                                                className="inline-flex items-center px-3 py-2 border border-indigo-500 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition ease-in-out duration-150"
                                            >
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="w-4 h-4 mr-1" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                                    />
                                                </svg>
                                                Личный кабинет
                                            </Link>
                                            <Link
                                                href={url('logout')}
                                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-100 bg-red-600 hover:bg-red-700 transition ease-in-out duration-150"
                                            >
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="w-4 h-4 mr-1" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                                    />
                                                </svg>
                                                Выход
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!user && (
                            <div className="hidden sm:flex sm:items-center sm:ml-auto">
                                <Link 
                                    href={url('/login')} 
                                    className="px-4 py-2 text-sm font-medium text-white hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 mr-2"
                                >
                                    Вход
                                </Link>
                                <Link 
                                    href={url('register')} 
                                    className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                                >
                                    Регистрация
                                </Link>
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
                            href={url('/')}
                            active={window.location.pathname === '/' || window.location.pathname === '/home'}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                window.location.pathname === '/' || window.location.pathname === '/home'
                                    ? 'bg-[#2a4075] text-white font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Главная
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={url('/brands')}
                            active={window.location.pathname.startsWith('/brands')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                window.location.pathname.startsWith('/brands')
                                    ? 'bg-[#2a4075] text-white font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Бренды
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={url('/news')}
                            active={window.location.pathname === '/news'}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                window.location.pathname === '/news'
                                    ? 'bg-[#2a4075] text-white font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                            </svg>
                            Новости
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={url('/contacts')}
                            active={window.location.pathname === '/contacts'}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${
                                window.location.pathname === '/contacts'
                                    ? 'bg-[#2a4075] text-white font-semibold'
                                    : 'text-white hover:bg-indigo-900'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Контакты
                        </ResponsiveNavLink>
                        <form onSubmit={handleSearchSubmit} className="mt-3">
                            <div className="relative flex items-center">
                                <button 
                                    type="submit" 
                                    className="absolute left-3 text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Поиск..." 
                                    className="w-full bg-[#1a2542] text-white border-0 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
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
                                    <>
                                        <ResponsiveNavLink 
                                            href={url('admin/dashboard')}
                                            className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                                window.location.pathname.startsWith('/admin/dashboard')
                                                    ? 'bg-green-500'
                                                    : 'hover:bg-indigo-900'
                                            }`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                            Админ-панель
                                        </ResponsiveNavLink>
                                        
                                        <ResponsiveNavLink
                                            href={url('logout')}
                                            className="w-full flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-300"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Выход
                                        </ResponsiveNavLink>
                                    </>
                                ) : (
                                    <>
                                        <ResponsiveNavLink 
                                            href={url('/dashboard')}
                                            className={`flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 ${
                                                window.location.pathname === '/dashboard'
                                                    ? 'bg-green-500'
                                                    : 'hover:bg-indigo-900'
                                            }`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Личный кабинет
                                        </ResponsiveNavLink>
                                        
                                        <ResponsiveNavLink
                                            href={url('logout')}
                                            className={`w-full flex items-center text-white px-3 py-2 rounded-lg transition-all duration-300 bg-red-600 hover:bg-red-700`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Выход
                                        </ResponsiveNavLink>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {!user && (
                        <div className="border-t border-indigo-900 px-4 py-4 space-y-2">
                            <div className="flex justify-between">
                                <ResponsiveNavLink 
                                    href={url('/login')}
                                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all duration-300"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Вход
                                </ResponsiveNavLink>
                                <ResponsiveNavLink 
                                    href={url('register')}
                                    className={`flex items-center bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-lg transition-all duration-300 ${
                                        window.location.pathname === '/register'
                                            ? 'bg-green-500'
                                            : ''
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Регистрация
                                </ResponsiveNavLink>
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
