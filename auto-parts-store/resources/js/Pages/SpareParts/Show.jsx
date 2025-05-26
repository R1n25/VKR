import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FormattedPrice } from '@/utils/helpers';
import axios from 'axios';

const Show = ({ auth, sparePart, isAdmin }) => {
    const [analogs, setAnalogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAnalogs();
    }, [sparePart.part_number]);

    const loadAnalogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/cross-references', {
                params: {
                    part_number: sparePart.part_number,
                    manufacturer: sparePart.manufacturer
                }
            });
            setAnalogs(response.data.data);
        } catch (error) {
            console.error('Ошибка при загрузке аналогов:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout auth={auth}>
            <Head title={sparePart.name} />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className="md:flex">
                        <div className="md:w-1/3 p-4">
                            {sparePart.image_url ? (
                                <img
                                    src={sparePart.image_url}
                                    alt={sparePart.name}
                                    className="w-full h-auto object-cover rounded"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-500">Изображение отсутствует</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="md:w-2/3 p-4">
                            <h1 className="text-2xl font-bold mb-4">{sparePart.name}</h1>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-gray-600">Производитель:</p>
                                    <p className="font-semibold">{sparePart.manufacturer}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Артикул:</p>
                                    <p className="font-semibold">{sparePart.part_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Категория:</p>
                                    <p className="font-semibold">{sparePart.category}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Наличие:</p>
                                    <p className="font-semibold">
                                        {sparePart.is_available ? (
                                            <span className="text-green-600">{sparePart.stock_quantity} шт.</span>
                                        ) : (
                                            <span className="text-red-600">Нет в наличии</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-gray-600">Описание:</p>
                                <p className="mt-2">{sparePart.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600">Цена:</p>
                                    <FormattedPrice 
                                        value={sparePart.price} 
                                        className="text-2xl font-bold text-primary"
                                    />
                                </div>
                                
                                {sparePart.is_available && (
                                    <button
                                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                                        onClick={() => {/* Добавить в корзину */}}
                                    >
                                        В корзину
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Секция с аналогами */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Аналоги и заменители</h2>
                    
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Загрузка аналогов...</p>
                        </div>
                    ) : analogs.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Аналоги не найдены</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {analogs.map((analog) => (
                                <div 
                                    key={`${analog.original_number}-${analog.cross_number}`}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                {analog.name || 'Название не указано'}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Производитель:</p>
                                                    <p className="font-medium">{analog.manufacturer}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Номер:</p>
                                                    <p className="font-medium">{analog.cross_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className={`px-3 py-1 rounded-full text-sm ${
                                                analog.is_verified 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {analog.is_verified ? 'Проверено' : 'Не проверено'}
                                            </div>
                                            <div className={`mt-2 px-3 py-1 rounded-full text-sm ${
                                                analog.type === 'OEM'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {analog.type || 'Аналог'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Show; 