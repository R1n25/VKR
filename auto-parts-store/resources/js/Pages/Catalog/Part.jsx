import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { ChevronRightIcon, ShoppingCartIcon, TagIcon, TruckIcon, ArrowPathIcon, CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function Part({ auth, sparePart, similarParts, analogParts }) {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    
    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };
    
    // Увеличение/уменьшение количества
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    
    const increaseQuantity = () => {
        if (quantity < sparePart.stock_quantity) {
            setQuantity(quantity + 1);
        }
    };
    
    // Проверка доступности
    const isAvailable = sparePart.stock_quantity > 0;
    
    return (
        <MainLayout user={auth?.user}>
            <Head title={sparePart.name} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Хлебные крошки */}
                    <div className="mb-4 flex flex-wrap items-center text-sm text-gray-500">
                        <Link href={route('catalog.index')} className="hover:text-indigo-600">
                            Каталог
                        </Link>
                        {sparePart.compatible_models && sparePart.compatible_models.length > 0 && (
                            <>
                                <ChevronRightIcon className="h-4 w-4 mx-2" />
                                <Link href={route('catalog.brand', sparePart.compatible_models[0].brand.slug)} className="hover:text-indigo-600">
                                    {sparePart.compatible_models[0].brand.name}
                                </Link>
                                <ChevronRightIcon className="h-4 w-4 mx-2" />
                                <Link 
                                    href={route('catalog.model', [
                                        sparePart.compatible_models[0].brand.slug, 
                                        sparePart.compatible_models[0].slug
                                    ])} 
                                    className="hover:text-indigo-600"
                                >
                                    {sparePart.compatible_models[0].name}
                                </Link>
                            </>
                        )}
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={`#`} className="hover:text-indigo-600">
                            {sparePart.part_category?.name || 'Запчасти'}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">{sparePart.name}</span>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Основная информация о запчасти */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Изображение */}
                                <div>
                                    <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 h-80">
                                        {sparePart.image_url ? (
                                            <img 
                                                src={`/storage/${sparePart.image_url}`} 
                                                alt={sparePart.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-center">
                                                <QuestionMarkCircleIcon className="h-16 w-16 mx-auto mb-2" />
                                                <p>Изображение отсутствует</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Дополнительные изображения, если они есть */}
                                    {sparePart.additional_images && sparePart.additional_images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-4 gap-2">
                                            {sparePart.additional_images.map((image, index) => (
                                                <div key={index} className="bg-gray-100 rounded-lg p-2 h-20">
                                                    <img 
                                                        src={`/storage/${image}`} 
                                                        alt={`${sparePart.name} - фото ${index + 1}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Информация и покупка */}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {sparePart.name}
                                    </h1>
                                    
                                    <div className="flex items-center mb-4">
                                        {sparePart.part_category && (
                                            <span className="text-sm text-gray-500 mr-4">
                                                Категория: {sparePart.part_category.name}
                                            </span>
                                        )}
                                        {sparePart.article && (
                                            <span className="text-sm text-gray-500 flex items-center">
                                                <TagIcon className="h-4 w-4 mr-1" />
                                                Артикул: {sparePart.article}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {sparePart.short_description && (
                                        <p className="text-gray-700 mb-4">
                                            {sparePart.short_description}
                                        </p>
                                    )}
                                    
                                    <div className="mb-6">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                isAvailable 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {isAvailable ? (
                                                    <>
                                                        <CheckIcon className="h-4 w-4 mr-1" />
                                                        В наличии
                                                    </>
                                                ) : (
                                                    'Нет в наличии'
                                                )}
                                            </span>
                                            
                                            {sparePart.manufacturer && (
                                                <span className="ml-4 text-sm text-gray-500">
                                                    Производитель: {sparePart.manufacturer}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="mt-1">
                                            {isAvailable && (
                                                <span className="text-sm text-gray-500">
                                                    Доступно: {sparePart.stock_quantity} шт.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {formatPrice(sparePart.price)}
                                            </span>
                                            
                                            {sparePart.old_price && (
                                                <span className="ml-2 text-lg text-gray-500 line-through">
                                                    {formatPrice(sparePart.old_price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {isAvailable && (
                                        <div className="mb-6">
                                            <div className="flex items-center">
                                                <div className="mr-4">
                                                    <label htmlFor="quantity" className="sr-only">Количество</label>
                                                    <div className="flex items-center border border-gray-300 rounded-md">
                                                        <button
                                                            type="button"
                                                            className="p-2 text-gray-500 hover:text-gray-700"
                                                            onClick={decreaseQuantity}
                                                            disabled={quantity <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            id="quantity"
                                                            type="number"
                                                            className="w-12 border-0 text-center focus:ring-0"
                                                            value={quantity}
                                                            min="1"
                                                            max={sparePart.stock_quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                if (val >= 1 && val <= sparePart.stock_quantity) {
                                                                    setQuantity(val);
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="p-2 text-gray-500 hover:text-gray-700"
                                                            onClick={increaseQuantity}
                                                            disabled={quantity >= sparePart.stock_quantity}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    className="flex-1 bg-indigo-600 py-3 px-4 rounded-md text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                                        Добавить в корзину
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Информация о доставке */}
                                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                        <div className="flex items-start">
                                            <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                            <div>
                                                <h4 className="font-medium text-gray-900">Доставка</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Доставка в течение 1-3 рабочих дней. Самовывоз из магазина доступен сразу после подтверждения заказа.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Вкладки с подробной информацией */}
                            <div className="mt-10 border-t pt-8">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === 'description'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                            onClick={() => setActiveTab('description')}
                                        >
                                            Описание
                                        </button>
                                        <button
                                            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === 'compatibility'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                            onClick={() => setActiveTab('compatibility')}
                                        >
                                            Совместимость
                                        </button>
                                        {analogParts.length > 0 && (
                                            <button
                                                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === 'analogs'
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                                onClick={() => setActiveTab('analogs')}
                                            >
                                                Аналоги
                                            </button>
                                        )}
                                    </nav>
                                </div>
                                
                                <div className="py-6">
                                    {/* Вкладка с описанием */}
                                    {activeTab === 'description' && (
                                        <div>
                                            {sparePart.description ? (
                                                <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: sparePart.description }} />
                                            ) : (
                                                <p className="text-gray-500">Подробное описание отсутствует.</p>
                                            )}
                                            
                                            {/* Технические характеристики */}
                                            {sparePart.specifications && Object.keys(sparePart.specifications).length > 0 && (
                                                <div className="mt-8">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Технические характеристики</h3>
                                                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <tbody className="divide-y divide-gray-200">
                                                                {Object.entries(sparePart.specifications).map(([key, value]) => (
                                                                    <tr key={key}>
                                                                        <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-100 w-1/3">{key}</td>
                                                                        <td className="px-6 py-3 text-sm text-gray-700">{value}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Вкладка с совместимостью */}
                                    {activeTab === 'compatibility' && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Совместимые автомобили</h3>
                                            
                                            {sparePart.compatible_models && sparePart.compatible_models.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {sparePart.compatible_models.map(model => (
                                                        <div key={model.id} className="bg-gray-50 p-4 rounded-lg">
                                                            <h4 className="font-medium text-gray-900">
                                                                {model.brand.name} {model.name}
                                                            </h4>
                                                            {model.generation && (
                                                                <p className="text-sm text-gray-600">
                                                                    Поколение: {model.generation}
                                                                </p>
                                                            )}
                                                            {model.year_start && (
                                                                <p className="text-sm text-gray-600">
                                                                    Годы: {model.year_start} - {model.year_end || 'н.в.'}
                                                                </p>
                                                            )}
                                                            {model.engine_volume && (
                                                                <p className="text-sm text-gray-600">
                                                                    Двигатель: {model.engine_type} {model.engine_volume}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Информация о совместимости не указана.</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Вкладка с аналогами */}
                                    {activeTab === 'analogs' && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Аналоги запчасти</h3>
                                            
                                            {analogParts.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {analogParts.map(part => (
                                                        <div key={part.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                            <Link href={route('catalog.part', part.slug)}>
                                                                <div className="h-32 bg-gray-100">
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
                                                            
                                                            <div className="p-3">
                                                                <Link 
                                                                    href={route('catalog.part', part.slug)}
                                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                                >
                                                                    {part.name}
                                                                </Link>
                                                                
                                                                {part.manufacturer && (
                                                                    <div className="mt-1 text-xs text-gray-500">
                                                                        Производитель: {part.manufacturer}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="mt-2 flex justify-between items-center">
                                                                    <div className="font-bold text-gray-900">
                                                                        {formatPrice(part.price)}
                                                                    </div>
                                                                    
                                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                        part.stock_quantity > 0 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {part.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Аналоги данной запчасти отсутствуют.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Похожие запчасти */}
                            {similarParts.length > 0 && (
                                <div className="mt-10 border-t pt-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Похожие запчасти</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {similarParts.map(part => (
                                            <div key={part.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                <Link href={route('catalog.part', part.slug)}>
                                                    <div className="h-32 bg-gray-100">
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
                                                
                                                <div className="p-3">
                                                    <Link 
                                                        href={route('catalog.part', part.slug)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                    >
                                                        {part.name}
                                                    </Link>
                                                    
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <div className="font-bold text-gray-900">
                                                            {formatPrice(part.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}