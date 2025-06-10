import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import CartIcon from '@/Components/CartIcon';
import SearchIcon from '@/Components/SearchIcon';
import CircleDotIcon from '@/Components/CircleDotIcon';
import { useState, useRef, useEffect } from 'react';
import UserIcon from '@/Components/UserIcon';

const MainLayout = ({ auth, children }) => {
    const { url } = usePage();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Закрывать выпадающее меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Верхняя навигация */}
            <nav className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Логотип */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-16 w-auto sm:h-16 xs:h-12" variant="default" />
                                </Link>
                            </div>

                            {/* Навигационные ссылки */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href={route('home')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url === '/' || url === '/home'
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Главная
                                </Link>
                                <Link
                                    href={route('brands.index')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url.startsWith('/brands')
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Бренды
                                </Link>
                                <Link
                                    href={route('about')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url === '/about'
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    О нас
                                </Link>
                                <Link
                                    href={route('contacts')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url === '/contacts'
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Контакты
                                </Link>
                                <Link
                                    href={route('search')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url === '/search'
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <SearchIcon className="w-5 h-5 mr-1" />
                                    Поиск
                                </Link>
                                <Link
                                    href={route('vin-decoder')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out ${
                                        url === '/vin-decoder'
                                            ? 'border-primary text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <CircleDotIcon className="w-5 h-5 mr-1" />
                                    VIN-код
                                </Link>
                            </div>
                        </div>

                        {/* Правая часть навигации */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
                            {/* Корзина */}
                            <CartIcon user={auth?.user} />

                            {/* Пользовательское меню */}
                            {auth?.user ? (
                                <div className="ml-3 flex items-center space-x-2">
                                    <Link
                                        href={route('profile.edit')}
                                        className="inline-flex items-center px-3 py-2 border border-indigo-500 text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition ease-in-out duration-150"
                                    >
                                        <UserIcon className="w-4 h-4 mr-1" />
                                        Личный кабинет
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition ease-in-out duration-150"
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
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-gray-700 hover:text-primary"
                                    >
                                        Вход
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-sm text-gray-700 hover:text-primary"
                                    >
                                        Регистрация
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Основной контент */}
            <main className="py-4 flex-grow">
                <div className="min-content-width">
                    {children}
                </div>
            </main>

            {/* Футер */}
            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">О компании</h3>
                            <p className="text-gray-600">
                                Магазин автозапчастей с широким ассортиментом товаров для вашего автомобиля.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
                            <p className="text-gray-600">
                                Адрес: г. Москва, ул. Примерная, д. 123<br />
                                Телефон: +7 (123) 456-78-90<br />
                                Email: info@auto-parts.ru
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Информация</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href={route('about')}
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        О нас
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('contacts')}
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        Контакты
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('vin-request.index')}
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        Подбор по VIN
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Магазин автозапчастей. Все права защищены.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout; 