import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { formatPrice } from '@/utils/helpers';
import AddToCartButton from '@/Components/AddToCartButton';

export default function PartCard({ part, isAnalog = false, user = null }) {
    // Проверка наличия товара
    const isInStock = part.stock_quantity > 0 || part.stock_qty > 0;
    const stockQuantity = part.stock_quantity || part.stock_qty || 0;
    
    // Проверка, является ли пользователь администратором
    const isAdmin = user && user.role === 'admin';
    
    // Отладочная информация
    console.log('PartCard данные:', {
        part,
        isAdmin,
        user,
        stockQuantity,
        basePrice: part.base_price,
        price: part.price
    });
    
    // Стандартизация полей запчасти
    const normalizedPart = {
        id: part.id,
        name: part.name,
        part_number: part.part_number,
        price: part.price,
        base_price: part.base_price || part.price, // Базовая цена из прайса
        manufacturer: part.manufacturer,
        image_url: part.image_url,
        stock_quantity: stockQuantity,
        is_available: isInStock,
        category: part.category_name || part.category || '',
        is_analog: isAnalog
    };

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isAnalog ? 'border-l-4 border-blue-500' : ''} flex flex-col h-full`}>
            <Link href={`/parts/${part.id}`} className="block h-48">
                <div className="h-48 overflow-hidden bg-gray-50">
                    {normalizedPart.image_url ? (
                        <img 
                            src={normalizedPart.image_url} 
                            alt={normalizedPart.name} 
                            className="w-full h-full object-contain p-4"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 flex-grow flex flex-col">
                {isAnalog && (
                    <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Аналог
                        </span>
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/parts/${part.id}`}>
                        <h3 className={`text-lg font-semibold ${isAnalog ? 'text-blue-600' : 'text-gray-900'} hover:text-blue-700 transition-colors duration-300`}>
                            {normalizedPart.name}
                        </h3>
                    </Link>
                </div>
                
                <div className="mb-2">
                    <span className="text-xs text-gray-500 mr-1">Артикул:</span>
                    <Link 
                        href={`/search?q=${normalizedPart.part_number}`}
                        className="text-xs font-medium text-blue-600 hover:underline hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {normalizedPart.part_number}
                    </Link>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                    {normalizedPart.manufacturer}
                </p>
                
                {normalizedPart.category && (
                    <p className="text-xs text-gray-500 mb-3">
                        {normalizedPart.category}
                    </p>
                )}
                
                <div className="flex-grow"></div>
                
                <div className="flex justify-between items-center mt-4">
                    <div>
                        {/* Отображение цены для обычных пользователей */}
                        {!isAdmin && (
                            <p className={`text-xl font-bold ${isAnalog ? 'text-blue-600' : 'text-gray-900'}`}>
                                {formatPrice(normalizedPart.price)} ₽
                            </p>
                        )}
                        
                        {/* Отображение двух цен для администратора */}
                        {isAdmin && (
                            <div>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatPrice(normalizedPart.price)} ₽
                                    <span className="text-xs ml-1 font-normal text-gray-500">(с наценкой)</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatPrice(normalizedPart.base_price)} ₽
                                    <span className="text-xs ml-1 font-normal text-gray-500">(базовая)</span>
                                </p>
                            </div>
                        )}
                        
                        <div className="mt-1 flex items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} mr-2`}>
                                {isInStock ? 'В наличии' : 'Нет в наличии'}
                            </span>
                            
                            {/* Отображение количества товара на складе */}
                            {isInStock && (
                                <span className="text-xs text-gray-600">
                                    {normalizedPart.stock_quantity} шт.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {isInStock && (
                    <div className="mt-4">
                        <AddToCartButton 
                            sparePart={{
                                ...normalizedPart,
                                // Для администратора используем базовую цену при добавлении в корзину
                                price: isAdmin ? normalizedPart.base_price : normalizedPart.price
                            }} 
                            user={user} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 