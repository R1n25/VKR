import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { ChevronRightIcon, FunnelIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Parts({ auth, brand, model, spareParts, categories, filters }) {
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Отображение фильтров
    const displayFilters = () => {
        const result = [];
        
        if (filters.engine_type) {
            result.push(`Двигатель: ${filters.engine_type}`);
        }
        
        if (filters.engine_volume) {
            result.push(`Объем: ${filters.engine_volume}`);
        }
        
        if (filters.body_type) {
            result.push(`Кузов: ${filters.body_type}`);
        }
        
        return result.join(', ');
    };
    
    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };
    
    // Фильтрация запчастей по категории
    const filteredParts = selectedCategory 
        ? spareParts.data.filter(part => part.part_category_id == selectedCategory)
        : spareParts.data;
    
    return (
        <MainLayout user={auth?.user}>
            <Head title={`${brand.name} ${model.name} - Запчасти`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Хлебные крошки */}
                    <div className="mb-4 flex flex-wrap items-center text-sm text-gray-500">
                        <Link href={url('catalog')} className="hover:text-indigo-600">
                            Каталог
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={url('catalog/brand', { slug: brand.slug })} className="hover:text-indigo-600">
                            {brand.name}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={url('catalog/model', { brand: brand.slug, model: model.slug })} className="hover:text-indigo-600">
                            {model.name}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={url('catalog/generation', { brand: brand.slug, model: model.slug, generation: model.generation })} className="hover:text-indigo-600">
                            {model.generation}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">Запчасти</span>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Запчасти для {brand.name} {model.name} {model.generation}
                                </h1>
                                {displayFilters() && (
                                    <div className="mt-2 flex items-center text-sm text-gray-700">
                                        <FunnelIcon className="h-4 w-4 mr-1 text-gray-500" />
                                        <span>{displayFilters()}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* Сайдбар с категориями */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-50 p-4 rounded-lg sticky top-6">
                                        <h3 className="font-medium text-lg mb-4">Категории запчастей</h3>
                                        
                                        <div className="space-y-2">
                                            <button
                                                className={`w-full text-left py-2 px-3 rounded-md ${
                                                    !selectedCategory 
                                                        ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                                        : 'hover:bg-gray-200'
                                                }`}
                                                onClick={() => setSelectedCategory('')}
                                            >
                                                Все категории
                                            </button>
                                            
                                            {categories.map(category => (
                                                <button
                                                    key={category.id}
                                                    className={`w-full text-left py-2 px-3 rounded-md ${
                                                        selectedCategory == category.id 
                                                            ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                                            : 'hover:bg-gray-200'
                                                    }`}
                                                    onClick={() => setSelectedCategory(category.id)}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Список запчастей */}
                                <div className="lg:col-span-3">
                                    {filteredParts.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredParts.map(part => (
                                                <div key={part.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                    <Link href={url('catalog/part', { slug: part.slug })}>
                                                        <div className="h-40 bg-gray-100">
                                                            {part.image_url ? (
                                                                <img 
                                                                    src={`/storage/${part.image_url}`} 
                                                                    alt={part.name} 
                                                                    className="w-full h-full object-contain p-2"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <span className="text-gray-400">Нет изображения</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Link>
                                                    
                                                    <div className="p-4">
                                                        <Link 
                                                            href={url('catalog/part', { slug: part.slug })}
                                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                        >
                                                            {part.name}
                                                        </Link>
                                                        
                                                        <div className="mt-1 text-sm text-gray-500">
                                                            {part.article && (
                                                                <div>Артикул: {part.article}</div>
                                                            )}
                                                            {part.manufacturer && (
                                                                <div>Производитель: {part.manufacturer}</div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <div className="font-bold text-lg text-gray-900">
                                                                {formatPrice(part.price)}
                                                            </div>
                                                            
                                                            <div className="flex items-center">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                    part.stock_quantity > 5 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : part.stock_quantity > 0 
                                                                            ? 'bg-yellow-100 text-yellow-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {part.stock_quantity > 5 
                                                                        ? 'В наличии' 
                                                                        : part.stock_quantity > 0 
                                                                            ? 'Мало' 
                                                                            : 'Нет в наличии'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <button
                                                            disabled={part.stock_quantity <= 0}
                                                            className={`mt-3 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white ${
                                                                part.stock_quantity > 0
                                                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                                                    : 'bg-gray-300 cursor-not-allowed'
                                                            }`}
                                                            onClick={() => {
                                                                // Здесь будет логика добавления в корзину
                                                            }}
                                                        >
                                                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                                                            В корзину
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            <p>Запчасти не найдены. Попробуйте изменить параметры поиска.</p>
                                        </div>
                                    )}
                                    
                                    {/* Пагинация */}
                                    {spareParts.links && spareParts.links.length > 3 && (
                                        <div className="mt-8 flex justify-center">
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {spareParts.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${!link.url ? 'cursor-not-allowed' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}