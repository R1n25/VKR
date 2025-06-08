import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ auth, carModel }) {
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр модели автомобиля</h2>}
        >
            <Head title="Просмотр модели автомобиля" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6 flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-900">{carModel.name}</h3>
                                <div className="flex space-x-3">
                                    <Link
                                        href={route('admin.car-models.edit', carModel.id)}
                                        className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700"
                                    >
                                        Редактировать
                                    </Link>
                                    <Link
                                        href={route('admin.car-models.index')}
                                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                    >
                                        Назад к списку
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="mb-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Бренд:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.brand ? carModel.brand.name : 'Не указан'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Годы выпуска:</div>
                                                <div className="col-span-2 text-sm text-gray-900">
                                                    {carModel.year_start && carModel.year_end ? 
                                                        `${carModel.year_start} - ${carModel.year_end}` : 
                                                        carModel.year_start ? 
                                                            `${carModel.year_start} - н.в.` : 
                                                            'Не указаны'}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Поколение:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.generation || 'Не указано'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Тип кузова:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.body_type || 'Не указан'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Популярная модель:</div>
                                                <div className="col-span-2 text-sm text-gray-900">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${carModel.is_popular ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {carModel.is_popular ? 'Да' : 'Нет'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Техническая информация</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Тип двигателя:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.engine_type || 'Не указан'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Объем двигателя:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.engine_volume || 'Не указан'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Тип трансмиссии:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.transmission_type || 'Не указан'}</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-sm font-medium text-gray-500">Тип привода:</div>
                                                <div className="col-span-2 text-sm text-gray-900">{carModel.drive_type || 'Не указан'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {carModel.description && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Описание</h4>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-sm text-gray-900">{carModel.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Изображение</h4>
                                    {carModel.image_url ? (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <img
                                                src={`/storage/${carModel.image_url}`}
                                                alt={carModel.name}
                                                className="max-w-full h-auto rounded-md"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
                                            <p className="text-sm text-gray-500">Изображение не загружено</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 