import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import VinSearchForm from '@/Components/VinSearch/VinSearchForm';
import PartSchemeViewer from '@/Components/VinSearch/PartSchemeViewer';

export default function Index() {
    const [searchResult, setSearchResult] = useState(null);

    const handleSearchResult = (result) => {
        setSearchResult(result);
    };

    return (
        <AppLayout>
            <Head title="Поиск по VIN" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Форма поиска */}
                        <VinSearchForm onResult={handleSearchResult} />

                        {/* Результаты поиска */}
                        {searchResult && (
                            <div className="space-y-6">
                                {/* Информация об автомобиле */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Информация об автомобиле
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Марка</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.make}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Модель</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.model}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Год выпуска</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.year}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Двигатель</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.engine || 'Н/Д'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Трансмиссия</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.transmission || 'Н/Д'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Тип кузова</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{searchResult.vin_search.body_type || 'Н/Д'}</dd>
                                        </div>
                                    </div>
                                </div>

                                {/* Схемы запчастей */}
                                {searchResult.schemes.length > 0 ? (
                                    <PartSchemeViewer schemes={searchResult.schemes} />
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-md">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Схемы не найдены
                                                </h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>
                                                        К сожалению, для данного автомобиля схемы запчастей не найдены.
                                                        Пожалуйста, обратитесь к нашим специалистам за помощью.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 