import React from 'react';
import { Link } from '@inertiajs/react';

export default function PartCard({ part }) {
    // Функция для форматирования цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Проверка наличия товара
    const isInStock = part.stock_qty > 0;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            <Link href={route('parts.show', part.id)}>
                <div className="h-48 overflow-hidden">
                    {part.image_url ? (
                        <img 
                            src={part.image_url} 
                            alt={part.name} 
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

            <div className="p-4">
                <Link href={route('parts.show', part.id)}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300 mb-1">
                        {part.part_number}
                    </h3>
                    <p className="text-sm text-gray-700">
                        {part.manufacturer}
                    </p>
                </Link>
                
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {part.name}
                </p>
                
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <p className="text-xl font-bold text-gray-900">
                            {formatPrice(part.price)}
                        </p>
                        
                        <div className="mt-1">
                            {isInStock ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    В наличии
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    Под заказ
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            // Здесь можно добавить функцию для добавления в корзину
                            console.log(`Добавление в корзину: ${part.id}`);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    );
} 