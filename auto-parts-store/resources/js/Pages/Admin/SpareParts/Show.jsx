import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { toast } from 'react-hot-toast';

// Словарь соответствия ID категорий их названиям
const categoryNames = {
    1: 'Двигатель',
    2: 'Блок цилиндров',
    3: 'Головка блока цилиндров',
    4: 'Поршневая группа',
    5: 'Система смазки',
    6: 'Система охлаждения',
    7: 'Трансмиссия',
    8: 'Сцепление',
    9: 'Коробка передач',
    10: 'Карданная передача',
    11: 'Подвеска',
    12: 'Передняя подвеска',
    13: 'Задняя подвеска',
    14: 'Ступицы и подшипники',
    15: 'Рулевое управление',
    16: 'Рулевые механизмы',
    17: 'Рулевые тяги',
    18: 'Тормозная система',
    19: 'Тормозные диски',
    20: 'Тормозные колодки',
    21: 'Электрооборудование',
    22: 'Система зажигания',
    23: 'Генераторы и стартеры',
    24: 'Кузовные детали',
    25: 'Капот и крылья',
    26: 'Двери',
    27: 'Салон',
    28: 'Сиденья',
    29: 'Панель приборов',
    30: 'Расходные материалы',
    31: 'Масла и жидкости',
    32: 'Фильтры',
    33: 'Аксессуары',
    34: 'Коврики',
    35: 'Чехлы'
};

// Функция для получения названия категории по ID
function getCategoryNameById(categoryId) {
    return categoryNames[categoryId] || 'Неизвестная категория';
}

export default function Show({ auth, sparePart }) {
    console.log('SparePart data:', sparePart);
    console.log('Category data:', {
        category_id: sparePart.category_id,
        category: sparePart.category,
        category_name: sparePart.category_name
    });
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр запчасти</h2>}
        >
            <Head title={`Запчасть: ${sparePart.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-gray-800">{sparePart.name}</h1>
                                <div className="flex space-x-2">
                                    <Link
                                        href={route('admin.spare-parts.inertia')}
                                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                    >
                                        Назад к списку
                                    </Link>
                                    <Link
                                        href={route('admin.spare-parts.analogs', sparePart.id)}
                                        className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
                                    >
                                        Управление аналогами
                                    </Link>
                                    <Link
                                        href={route('admin.spare-parts.edit-inertia', sparePart.id)}
                                        className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700"
                                    >
                                        Редактировать
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                {/* Информация о запчасти */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Название</p>
                                                <p className="font-medium">{sparePart.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Артикул</p>
                                                <p className="font-medium">{sparePart.part_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Категория</p>
                                                <p className="font-medium">
                                                    {sparePart.category_id ? (
                                                        sparePart.category_name || (sparePart.category ? sparePart.category.name : getCategoryNameById(sparePart.category_id))
                                                    ) : 'Без категории'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Производитель</p>
                                                <p className="font-medium">{sparePart.manufacturer || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Цена</p>
                                                <p className="font-medium">{sparePart.price} ₽</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Количество на складе</p>
                                                <p className="font-medium">{sparePart.stock_quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Дата добавления</p>
                                                <p className="font-medium">{new Date(sparePart.created_at).toLocaleDateString('ru-RU')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {sparePart.description && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h2 className="text-lg font-semibold mb-4">Описание</h2>
                                            <p className="whitespace-pre-wrap">{sparePart.description}</p>
                                        </div>
                                    )}

                                    {/* Совместимые модели автомобилей */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h2 className="text-lg font-semibold mb-4">Совместимые модели автомобилей</h2>
                                        {sparePart.car_models && sparePart.car_models.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {sparePart.car_models.map((model) => (
                                                    <div key={model.id} className="bg-white p-2 rounded border border-gray-200">
                                                        {model.brand ? `${model.brand.name} ${model.name}` : model.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Нет совместимых моделей</p>
                                        )}
                                    </div>

                                    {/* Аналоги */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h2 className="text-lg font-semibold mb-4">Аналоги</h2>
                                        {sparePart.analogs && sparePart.analogs.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Производитель</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {sparePart.analogs.map((analog) => (
                                                            <tr key={analog.id}>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                                    <Link 
                                                                        href={route('admin.spare-parts.show-inertia', analog.analog_spare_part_id)}
                                                                        className="text-indigo-600 hover:text-indigo-900"
                                                                    >
                                                                        {analog.analogSparePart.name}
                                                                    </Link>
                                                                </td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{analog.analogSparePart.part_number}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{analog.analogSparePart.manufacturer}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                                    {analog.is_direct ? (
                                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Прямой</span>
                                                                    ) : (
                                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Непрямой</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Нет аналогов</p>
                                        )}
                                    </div>
                                </div>

                                {/* Изображение и дополнительная информация */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h2 className="text-lg font-semibold mb-4">Изображение</h2>
                                        {sparePart.image_url ? (
                                            <img 
                                                src={`/storage/${sparePart.image_url}`} 
                                                alt={sparePart.name} 
                                                className="w-full h-auto object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center">
                                                <p className="text-gray-500">Нет изображения</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h2 className="text-lg font-semibold mb-4">Действия</h2>
                                        <div className="space-y-2">
                                            <Link
                                                href={route('admin.spare-parts.edit-inertia', sparePart.id)}
                                                className="block w-full px-4 py-2 bg-indigo-600 text-center rounded-md text-white hover:bg-indigo-700"
                                            >
                                                Редактировать
                                            </Link>
                                            <Link
                                                href={route('admin.spare-parts.analogs', sparePart.id)}
                                                className="block w-full px-4 py-2 bg-purple-600 text-center rounded-md text-white hover:bg-purple-700"
                                            >
                                                Управление аналогами
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Вы действительно хотите удалить эту запчасть? Это действие нельзя будет отменить.')) {
                                                        // Действие по удалению
                                                    }
                                                }}
                                                className="block w-full px-4 py-2 bg-red-600 text-center rounded-md text-white hover:bg-red-700"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 