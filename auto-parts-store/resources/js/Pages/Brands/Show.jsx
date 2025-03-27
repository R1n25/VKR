import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function BrandShow({ auth, brandId, brand: initialBrand, models: initialModels }) {
    const [brand, setBrand] = useState(initialBrand || null);
    const [models, setModels] = useState(initialModels || []);
    const [loading, setLoading] = useState(!initialBrand);
    const [error, setError] = useState('');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {loading ? 'Загрузка бренда...' : brand ? brand.name : 'Бренд'}
                </h2>
            }
        >
            <Head title={loading ? 'Бренд автомобилей' : brand ? brand.name : 'Бренд'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка данных...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <div>
                                    {/* Хлебные крошки */}
                                    <nav className="mb-6">
                                        <ol className="flex space-x-2 text-sm text-gray-500">
                                            <li>
                                                <Link href={route('home')} className="hover:text-indigo-600">
                                                    Главная
                                                </Link>
                                            </li>
                                            <li className="flex items-center">
                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <Link href={route('brands.index')} className="hover:text-indigo-600">
                                                    Бренды
                                                </Link>
                                            </li>
                                            <li className="flex items-center">
                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-gray-900">{brand.name}</span>
                                            </li>
                                        </ol>
                                    </nav>

                                    {/* Информация о бренде */}
                                    <div className="mb-10">
                                        <div className="flex items-center mb-6">
                                            {brand.logo_url && (
                                                <img 
                                                    src={brand.logo_url} 
                                                    alt={`Логотип ${brand.name}`}
                                                    className="h-20 mr-6"
                                                />
                                            )}
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{brand.name}</h1>
                                                {brand.country && (
                                                    <p className="text-gray-600">Страна: {brand.country}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {brand.description && (
                                            <div className="prose max-w-none">
                                                <p>{brand.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Модели автомобилей */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-6">Модели {brand.name}</h3>

                                        {models.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">Модели для данного бренда пока не добавлены</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {models.map(model => (
                                                    <Link
                                                        key={model.id}
                                                        href={route('models.show', model.id)}
                                                        className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group"
                                                    >
                                                        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                                            {model.image_url ? (
                                                                <img
                                                                    src={model.image_url}
                                                                    alt={model.name}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full bg-gray-200">
                                                                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="p-4">
                                                            <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">{model.name}</h4>
                                                            
                                                            {model.years && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Годы выпуска: {model.years}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 