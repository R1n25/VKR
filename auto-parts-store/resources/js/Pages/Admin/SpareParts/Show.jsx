import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminTable from '@/Components/AdminTable';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InfoButton from '@/Components/InfoButton';
import SuccessButton from '@/Components/SuccessButton';
import DangerButton from '@/Components/DangerButton';

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
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр запчасти</h2>}
        >
            <Head title={`Запчасть: ${sparePart.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <AdminPageHeader 
                                title={sparePart.name} 
                                subtitle={`Артикул: ${sparePart.part_number}`} 
                            />
                            <div className="mt-4 sm:mt-0 flex space-x-2">
                                <SecondaryButton
                                    href={route('admin.spare-parts.inertia')}
                                    className="flex items-center justify-center w-44"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Назад к списку
                                </SecondaryButton>
                                <PrimaryButton
                                    href={route('admin.spare-parts.analogs', sparePart.id)}
                                    className="flex items-center justify-center w-44"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    Управление аналогами
                                </PrimaryButton>
                                <SuccessButton
                                    href={route('admin.spare-parts.edit-inertia', sparePart.id)}
                                    className="flex items-center justify-center w-44"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Редактировать
                                </SuccessButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {/* Информация о запчасти */}
                            <div className="md:col-span-2 space-y-6">
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Основная информация</h2>
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
                                            <div>
                                                <p className="text-sm text-gray-500">Статус</p>
                                                <p className="font-medium">
                                                    {sparePart.is_available ? (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Активна</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Неактивна</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AdminCard>

                                {sparePart.description && (
                                    <AdminCard className="!p-0">
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Описание</h2>
                                            <p className="whitespace-pre-wrap">{sparePart.description}</p>
                                        </div>
                                    </AdminCard>
                                )}

                                {/* Совместимые модели автомобилей */}
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Совместимые модели автомобилей</h2>
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
                                </AdminCard>

                                {/* Совместимость с двигателями */}
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Совместимость с двигателями</h2>
                                        {sparePart.engine_compatibilities && sparePart.engine_compatibilities.length > 0 ? (
                                            <div className="space-y-3">
                                                {sparePart.engine_compatibilities.map((compatibility, index) => (
                                                    <div key={compatibility.id || `engine-compat-${index}`} className="border-b pb-2">
                                                        <div className="font-medium">{compatibility.brand} {compatibility.model}</div>
                                                        {compatibility.years && (
                                                            <div className="text-sm text-gray-600">
                                                                Годы выпуска: {compatibility.years}
                                                            </div>
                                                        )}
                                                        {compatibility.engine && (
                                                            <div className="text-sm text-gray-600">
                                                                <span className="font-medium">Двигатель: </span>
                                                                {compatibility.engine.name}
                                                                {compatibility.engine.volume && ` ${compatibility.engine.volume}`}
                                                                {compatibility.engine.power && ` (${compatibility.engine.power} л.с.)`}
                                                                {compatibility.engine.fuel_type && `, ${compatibility.engine.fuel_type}`}
                                                            </div>
                                                        )}
                                                        {compatibility.notes && (
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                <span className="font-medium">Примечание: </span>
                                                                {compatibility.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Нет данных о совместимости с двигателями</p>
                                        )}
                                    </div>
                                </AdminCard>

                                {/* Аналоги */}
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Аналоги</h2>
                                        {sparePart.analogs && sparePart.analogs.length > 0 ? (
                                            <AdminTable
                                                headers={[
                                                    'Название',
                                                    'Артикул',
                                                    'Производитель',
                                                    'Тип'
                                                ]}
                                                data={sparePart.analogs}
                                                renderRow={(analog) => (
                                                    <>
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
                                                    </>
                                                )}
                                                emptyMessage="Нет аналогов"
                                            />
                                        ) : (
                                            <p className="text-gray-500">Нет аналогов</p>
                                        )}
                                    </div>
                                </AdminCard>
                            </div>

                            {/* Боковая панель */}
                            <div className="space-y-6">
                                {/* Изображение */}
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Изображение</h2>
                                        <div className="bg-gray-100 aspect-square flex items-center justify-center rounded-lg">
                                            {sparePart.image_url ? (
                                                <img 
                                                    src={sparePart.image_url} 
                                                    alt={sparePart.name} 
                                                    className="max-h-full object-contain"
                                                />
                                            ) : (
                                                <div className="text-gray-400">Нет изображения</div>
                                            )}
                                        </div>
                                    </div>
                                </AdminCard>

                                {/* Действия */}
                                <AdminCard className="!p-0">
                                    <div className="p-4">
                                        <h2 className="text-lg font-semibold mb-4 text-[#2a4075]">Действия</h2>
                                        <div className="flex flex-col space-y-2">
                                            <SuccessButton
                                                href={route('admin.spare-parts.edit-inertia', sparePart.id)}
                                                className="w-full justify-center"
                                            >
                                                Редактировать
                                            </SuccessButton>
                                            <PrimaryButton
                                                href={route('admin.spare-parts.analogs', sparePart.id)}
                                                className="w-full justify-center"
                                            >
                                                Управление аналогами
                                            </PrimaryButton>
                                            <DangerButton
                                                href={route('admin.spare-parts.inertia')}
                                                className="w-full justify-center"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm('Вы действительно хотите удалить эту запчасть?')) {
                                                        router.delete(route('admin.spare-parts.destroy', sparePart.id));
                                                    }
                                                }}
                                            >
                                                Удалить
                                            </DangerButton>
                                        </div>
                                    </div>
                                </AdminCard>
                            </div>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 