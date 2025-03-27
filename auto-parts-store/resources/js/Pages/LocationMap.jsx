import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function LocationMap({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Схема заезда</h2>}
        >
            <Head title="Схема заезда" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-6">Как нас найти</h3>
                            
                            <div className="mb-8">
                                <h4 className="text-lg font-semibold mb-3">Наш адрес:</h4>
                                <p className="text-gray-600">123456, г. Москва, ул. Примерная, д. 123</p>
                                <p className="text-gray-600 mt-2">
                                    <strong>Время работы:</strong> Пн-Пт с 9:00 до 20:00, Сб-Вс с 10:00 до 18:00
                                </p>
                            </div>
                            
                            <div className="mb-10">
                                <h4 className="text-lg font-semibold mb-3">Карта проезда:</h4>
                                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-gray-500">Здесь будет интерактивная карта</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Для масштабирования используйте кнопки + и - в правом нижнем углу карты или колесико мыши.
                                </p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8 mb-10">
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">На общественном транспорте:</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                        <li>От станции метро "Примерная" - выход №3, далее автобусы №123, №456 до остановки "Магазин Запчасти" (третья остановка).</li>
                                        <li>От станции метро "Образцовая" - выход в сторону ТЦ "Центральный", далее пешком 10 минут по улице Показательной.</li>
                                        <li>Маршрутки №78 и №90 - остановка "Автозапчасти" (конечная).</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">На автомобиле:</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                        <li>С Центральной кольцевой дороги - съезд на улицу Главную, далее прямо 2 км до поворота направо на улицу Примерную.</li>
                                        <li>С Восточного шоссе - поворот на улицу Образцовую, через 1,5 км поворот налево на улицу Примерную.</li>
                                        <li>На нашей территории есть бесплатная парковка для клиентов.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold mb-3">Важная информация:</h4>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>При въезде на территорию сообщите охране, что вы направляетесь в магазин "АвтоЗапчасти".</li>
                                    <li>Для получения заказов необходимо иметь при себе документ, удостоверяющий личность.</li>
                                    <li>Если вы заблудились или возникли сложности с проездом, позвоните нам по телефону <a href="tel:+74951234567" className="text-indigo-600 hover:text-indigo-800">+7 (495) 123-45-67</a>, и мы поможем вам сориентироваться.</li>
                                </ul>
                            </div>
                            
                            <div className="mt-10 grid md:grid-cols-3 gap-6">
                                <div className="border border-gray-200 p-4 rounded-lg">
                                    <h5 className="font-semibold mb-2">Фото магазина</h5>
                                    <div className="bg-gray-200 h-40 w-full rounded flex items-center justify-center">
                                        <span className="text-gray-400">Фото фасада</span>
                                    </div>
                                </div>
                                <div className="border border-gray-200 p-4 rounded-lg">
                                    <h5 className="font-semibold mb-2">Точка отсчета</h5>
                                    <div className="bg-gray-200 h-40 w-full rounded flex items-center justify-center">
                                        <span className="text-gray-400">Фото ориентира</span>
                                    </div>
                                </div>
                                <div className="border border-gray-200 p-4 rounded-lg">
                                    <h5 className="font-semibold mb-2">Вход в магазин</h5>
                                    <div className="bg-gray-200 h-40 w-full rounded flex items-center justify-center">
                                        <span className="text-gray-400">Фото входа</span>
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