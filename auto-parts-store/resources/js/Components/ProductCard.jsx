import React from 'react';
import { Link } from '@inertiajs/react';

// Функция для формирования URL
const url = (path, params = {}) => {
    if (typeof params === 'string') {
        return `/${path}/${params}`;
    }
    
    let url = '/' + path;
    if (Object.keys(params).length) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        url += `?${queryString}`;
    }
    return url;
};

// Функция для форматирования цены
const formatPrice = (price) => {
    if (!price) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
};

export default function ProductCard({ product, isAnalog = false, horizontal = false }) {
    // Проверка наличия
    const isAvailable = product.stock_quantity > 0;
    
    // Определяем классы в зависимости от ориентации (горизонтальная или вертикальная)
    const containerClasses = horizontal
        ? "flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
        : "border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white";
    
    const imageContainerClasses = horizontal
        ? "w-1/3 bg-gray-100"
        : "h-32 bg-gray-100";
    
    const contentContainerClasses = horizontal
        ? "w-2/3 p-3"
        : "p-3";
    
    return (
        <div className={containerClasses}>
            {/* Изображение */}
            <Link href={url('catalog/part', product.slug)} className={imageContainerClasses}>
                <div className="h-full flex items-center justify-center">
                    {product.image_url ? (
                        <img 
                            src={`/storage/${product.image_url}`} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-2"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">Нет изображения</span>
                        </div>
                    )}
                </div>
            </Link>
            
            {/* Информация о товаре */}
            <div className={contentContainerClasses}>
                {/* Метка "Аналог" */}
                {isAnalog && (
                    <div className="mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Аналог
                        </span>
                    </div>
                )}
                
                {/* Название товара */}
                <Link 
                    href={url('catalog/part', product.slug)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    {product.name}
                </Link>
                
                {/* Артикул и производитель */}
                <div className="mt-1 text-xs text-gray-500">
                    Артикул: {product.part_number}
                </div>
                
                {product.manufacturer && (
                    <div className="text-xs text-gray-500">
                        {product.manufacturer}
                    </div>
                )}
                
                {/* Цена и наличие */}
                <div className="mt-2 flex justify-between items-center">
                    <div className="font-bold text-gray-900">
                        {formatPrice(product.price)}
                    </div>
                    
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {isAvailable ? `В наличии: ${product.stock_quantity} шт.` : 'Нет в наличии'}
                    </span>
                </div>
                
                {/* Кнопка добавления в корзину */}
                {isAvailable && horizontal && (
                    <button 
                        className="mt-2 w-full bg-indigo-600 py-1 px-3 rounded-md text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        В корзину
                    </button>
                )}
            </div>
        </div>
    );
} 