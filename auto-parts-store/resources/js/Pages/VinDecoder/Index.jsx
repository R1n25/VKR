import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import VinSearchForm from '@/Components/VinSearch/VinSearchForm';
import VinDecoder from '@/Components/VinSearch/VinDecoder';
import MainLayout from '@/Layouts/MainLayout';

export default function VinDecoderPage() {
    const [vin, setVin] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    const handleVinSubmit = (e) => {
        e.preventDefault();
        if (vin.length === 17) {
            setSearchResults({});
        }
    };

    // Обработчик результатов поиска по VIN
    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    return (
        <MainLayout>
            <Head title="Дешифратор VIN-кода автомобиля" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                Дешифратор VIN-кода автомобиля
                            </h1>
                            
                            <div className="mb-8">
                                <p className="text-gray-600 mb-4">
                                    VIN-код (Vehicle Identification Number) — это уникальный код транспортного средства, 
                                    состоящий из 17 символов. Он содержит информацию о производителе, модели, годе выпуска,
                                    заводе-изготовителе и других характеристиках автомобиля.
                                </p>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Структура VIN-кода:</h3>
                                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                                        <li>Символы 1-3: Мировой индекс производителя (WMI)</li>
                                        <li>Символы 4-8: Описательная часть (модель, тип кузова, двигатель)</li>
                                        <li>Символ 9: Контрольная цифра</li>
                                        <li>Символ 10: Год выпуска</li>
                                        <li>Символ 11: Завод-изготовитель</li>
                                        <li>Символы 12-17: Серийный номер автомобиля</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <form onSubmit={handleVinSubmit} className="mb-6">
                                    <div>
                                        <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                                            Введите VIN-код автомобиля
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                name="vin"
                                                id="vin"
                                                value={vin}
                                                onChange={(e) => setVin(e.target.value.toUpperCase())}
                                                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                                                placeholder="Например: WVWZZZ1KZAW123456"
                                                maxLength={17}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Введите все 17 символов VIN-кода для получения подробной информации
                                        </p>
                                    </div>
                                </form>
                                
                                {vin && vin.length === 17 && (
                                    <div className="mt-6">
                                        <h2 className="text-xl font-semibold mb-4">Расшифровка VIN-кода: {vin}</h2>
                                        <VinDecoder vin={vin} />
                                    </div>
                                )}
                                
                                {vin && vin.length > 0 && vin.length < 17 && (
                                    <div className="rounded-md bg-yellow-50 p-4 mt-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-yellow-800">
                                                    VIN-код должен состоять из 17 символов. Сейчас введено: {vin.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-10 border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4">Поиск запчастей по VIN-коду</h2>
                                <p className="text-gray-600 mb-6">
                                    Если вы хотите найти запчасти для вашего автомобиля, воспользуйтесь формой поиска по VIN-коду:
                                </p>
                                
                                <VinSearchForm onResult={handleSearchResults} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 