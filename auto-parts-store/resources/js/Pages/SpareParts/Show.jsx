import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FormattedPrice } from '@/utils/helpers';
import axios from 'axios';
import AddToCartButton from '@/Components/AddToCartButton';

const Show = ({ auth, sparePart, isAdmin }) => {
    const { flash } = usePage().props;
    const [analogs, setAnalogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [partData, setPartData] = useState(sparePart);
    const [quantityLoading, setQuantityLoading] = useState(false);
    const [availableQuantity, setAvailableQuantity] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);

    useEffect(() => {
        loadAnalogs();
        updateQuantity();
        
        // Добавляем слушатель события обновления товара
        const handleProductUpdate = (event) => {
            if (event.detail && event.detail.productId === sparePart.id) {
                console.log('Обновление количества товара после добавления в корзину');
                updateQuantity();
            }
        };
        
        window.addEventListener('productUpdated', handleProductUpdate);
        
        // Удаляем слушатель при размонтировании компонента
        return () => {
            window.removeEventListener('productUpdated', handleProductUpdate);
        };
    }, [sparePart.part_number, sparePart.id]);

    // Скрываем сообщение об успехе через 5 секунд
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Функция для обновления количества товара
    const updateQuantity = async () => {
        try {
            setQuantityLoading(true);
            const response = await axios.get(`/api/spare-parts/${sparePart.id}/info`);
            if (response.data && response.data.success) {
                setAvailableQuantity(response.data.stock_quantity);
                setIsAvailable(response.data.is_available);
                
                // Обновляем данные о товаре
                setPartData(prevData => ({
                    ...prevData,
                    stock_quantity: response.data.stock_quantity,
                    is_available: response.data.is_available,
                    price: response.data.price
                }));
                
                console.log('Обновлены данные о товаре:', response.data);
            }
        } catch (error) {
            console.error('Ошибка при обновлении информации о товаре:', error);
        } finally {
            setQuantityLoading(false);
        }
    };

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
                {showSuccessMessage && flash.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between" role="alert">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                        <button onClick={() => setShowSuccessMessage(false)} className="ml-4">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
                
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
                                    <p className="font-semibold">
                                        {sparePart.category_id ? (
                                            sparePart.category_name || 'Без категории'
                                        ) : 'Без категории'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Наличие:</p>
                                    <p className="font-semibold">
                                        {quantityLoading ? (
                                            <span className="text-gray-500">Обновление...</span>
                                        ) : isAvailable ? (
                                            <span className="text-green-600">{availableQuantity} шт.</span>
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
                                        value={partData.price} 
                                        className="text-2xl font-bold text-primary"
                                    />
                                </div>
                                
                                {isAvailable && (
                                    <AddToCartButton 
                                        sparePart={{
                                            id: partData.id,
                                            name: partData.name,
                                            price: partData.price,
                                            image: partData.image_url,
                                            stock: availableQuantity
                                        }}
                                        user={auth.user}
                                        className="w-40"
                                    />
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