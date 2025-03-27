import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function UserDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Личный кабинет</h2>}
        >
            <Head title="Личный кабинет" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-4">Добро пожаловать, {auth.user.name}!</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Секция брендов авто */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow md:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">Мои автомобили</h4>
                                        <Link 
                                            href={route('brands.index')} 
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            Добавить автомобиль →
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Пример автомобиля */}
                                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">Toyota Camry</p>
                                                    <p className="text-sm text-gray-600">2018 год</p>
                                                    <p className="text-sm text-gray-600">VIN: XXXXXXXXXXXXX</p>
                                                </div>
                                                <Link 
                                                    href="#"
                                                    className="text-sm text-green-600 hover:text-green-700"
                                                >
                                                    Запчасти
                                                </Link>
                                            </div>
                                        </div>
                                        {/* Кнопка добавления нового автомобиля */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-green-500 transition-colors cursor-pointer">
                                            <Link 
                                                href={route('brands.index')}
                                                className="text-gray-500 hover:text-green-600 flex flex-col items-center"
                                            >
                                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <span>Добавить автомобиль</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Секция заказов */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">Мои заказы</h4>
                                        <Link 
                                            href={route('orders.index')} 
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            Все заказы →
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Здесь будет список последних заказов */}
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">Заказ #12345</p>
                                                    <p className="text-sm text-gray-600">Статус: В обработке</p>
                                                    <p className="text-sm text-gray-600">Дата: 27.03.2024</p>
                                                </div>
                                                <Link 
                                                    href={route('orders.show', 12345)} 
                                                    className="text-sm text-green-600 hover:text-green-700"
                                                >
                                                    Подробнее
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Секция личных данных */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">Личные данные</h4>
                                        <Link 
                                            href={route('profile.edit')} 
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            Редактировать →
                                        </Link>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Имя:</p>
                                            <p className="font-medium">{auth.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email:</p>
                                            <p className="font-medium">{auth.user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Корзина */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">Корзина</h4>
                                        <Link 
                                            href={route('cart')} 
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            Перейти в корзину →
                                        </Link>
                                    </div>
                                    <p className="text-gray-600">Товаров в корзине: 0</p>
                                </div>

                                {/* Избранное */}
                                <div className="bg-gray-50 p-6 rounded-lg shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">Избранное</h4>
                                        <Link 
                                            href="#" 
                                            className="text-sm text-green-600 hover:text-green-700"
                                        >
                                            Смотреть все →
                                        </Link>
                                    </div>
                                    <p className="text-gray-600">Нет товаров в избранном</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 