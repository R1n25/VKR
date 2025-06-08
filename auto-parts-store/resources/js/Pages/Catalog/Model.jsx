import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { ChevronRightIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function Model({ auth, brand, model, generations }) {
    // Функция для форматирования года
    const formatYears = (carModel) => {
        if (carModel.year_start && carModel.year_end) {
            return `${carModel.year_start} - ${carModel.year_end}`;
        } else if (carModel.year_start) {
            return `${carModel.year_start} - н.в.`;
        } else {
            return 'Год не указан';
        }
    };
    
    return (
        <Layout user={auth?.user}>
            <Head title={`${brand.name} ${model.name} - Поколения`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Хлебные крошки */}
                    <div className="mb-4 flex items-center text-sm text-gray-500">
                        <Link href={route('catalog.index')} className="hover:text-indigo-600">
                            Каталог
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={route('catalog.brand', brand.slug)} className="hover:text-indigo-600">
                            {brand.name}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">{model.name}</span>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {brand.name} {model.name} - Поколения
                                    </h1>
                                    <p className="text-gray-500 mt-1">
                                        Выберите поколение модели для продолжения
                                    </p>
                                </div>
                                
                                {/* Изображение модели, если есть */}
                                {model.image_url && (
                                    <img 
                                        src={`/storage/${model.image_url}`} 
                                        alt={`${brand.name} ${model.name}`} 
                                        className="h-20 w-32 object-cover rounded"
                                    />
                                )}
                            </div>
                            
                            {/* Список поколений */}
                            <div className="mt-8">
                                {Object.keys(generations).length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(generations).map(([generation, models]) => (
                                            <div 
                                                key={generation || 'no-generation'} 
                                                className="bg-gray-50 rounded-lg overflow-hidden shadow-md border border-gray-200"
                                            >
                                                <div className="px-4 py-3 bg-gray-100 border-b flex items-center justify-between">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {generation ? generation : 'Поколение не указано'}
                                                    </h3>
                                                    <span className="text-sm text-gray-500 flex items-center">
                                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                                        {formatYears(models[0])}
                                                    </span>
                                                </div>
                                                
                                                <div className="p-4">
                                                    {models[0].image_url ? (
                                                        <div className="mb-4">
                                                            <img 
                                                                src={`/storage/${models[0].image_url}`} 
                                                                alt={`${brand.name} ${model.name} ${generation}`} 
                                                                className="w-full h-40 object-cover rounded"
                                                            />
                                                        </div>
                                                    ) : null}
                                                    
                                                    <div className="space-y-2">
                                                        {/* Характеристики */}
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            {models[0].body_type && (
                                                                <div>
                                                                    <span className="text-gray-500">Кузов:</span>
                                                                    <p className="font-medium">{models[0].body_type}</p>
                                                                </div>
                                                            )}
                                                            
                                                            {models[0].engine_type && (
                                                                <div>
                                                                    <span className="text-gray-500">Тип двигателя:</span>
                                                                    <p className="font-medium">{models[0].engine_type}</p>
                                                                </div>
                                                            )}
                                                            
                                                            {models[0].engine_volume && (
                                                                <div>
                                                                    <span className="text-gray-500">Объем:</span>
                                                                    <p className="font-medium">{models[0].engine_volume}</p>
                                                                </div>
                                                            )}
                                                            
                                                            {models[0].transmission_type && (
                                                                <div>
                                                                    <span className="text-gray-500">Трансмиссия:</span>
                                                                    <p className="font-medium">{models[0].transmission_type}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="pt-4 flex justify-end">
                                                            <Link
                                                                href={route('catalog.generation', [brand.slug, model.slug, generation || 'default'])}
                                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                            >
                                                                Выбрать поколение
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <p>Нет доступных поколений для модели {brand.name} {model.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 