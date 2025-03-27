import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Панель администратора</h2>}
        >
            <Head title="Админ панель" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Статистика */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-500 text-white rounded-lg p-4 shadow-lg">
                                    <h3 className="text-lg font-semibold mb-2">Всего товаров</h3>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
                                    <h3 className="text-lg font-semibold mb-2">Активные заказы</h3>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-lg">
                                    <h3 className="text-lg font-semibold mb-2">Пользователи</h3>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <div className="bg-purple-500 text-white rounded-lg p-4 shadow-lg">
                                    <h3 className="text-lg font-semibold mb-2">Отзывы</h3>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                            </div>

                            {/* Быстрые действия */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                        Добавить товар
                                    </button>
                                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                                        Создать акцию
                                    </button>
                                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                                        Управление заказами
                                    </button>
                                </div>
                            </div>

                            {/* Последние действия */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Последние действия</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">Новый заказ #123</p>
                                                <p className="text-sm text-gray-500">2 минуты назад</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Новый</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <p className="font-medium">Обновлен товар "Масляный фильтр"</p>
                                                <p className="text-sm text-gray-500">1 час назад</p>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Обновлено</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Новый отзыв от пользователя</p>
                                                <p className="text-sm text-gray-500">3 часа назад</p>
                                            </div>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Отзыв</span>
                                        </div>
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