import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { FormattedPrice } from '@/utils/helpers';

const ByCarModel = ({ auth, spareParts, carModelId, isAdmin }) => {
    return (
        <MainLayout auth={auth}>
            <Head title="Запчасти для модели" />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6">Запчасти для выбранной модели</h1>
                    
                    {spareParts.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Запчасти для данной модели не найдены</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {spareParts.map(part => (
                                <Link
                                    key={part.id}
                                    href={`/spare-parts/${part.id}`}
                                    className="block border border-gray-200 rounded-lg hover:shadow-md transition group"
                                >
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                        {part.image_url ? (
                                            <img
                                                src={part.image_url}
                                                alt={part.name}
                                                className="object-cover w-full h-full rounded-t-lg"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-200 rounded-t-lg">
                                                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-green-600 mb-2">
                                            {part.name}
                                        </h4>
                                        
                                        <div className="flex items-center mb-2">
                                            <span className="text-xs text-gray-500 mr-2">Артикул:</span>
                                            <span className="text-xs font-medium">{part.part_number}</span>
                                        </div>
                                        
                                        <div className="flex items-center mb-3">
                                            <span className="text-sm text-gray-500 mr-2">{part.manufacturer}</span>
                                        </div>
                                        
                                        <div className="text-xs text-gray-500 mb-3">
                                            {part.category}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2">
                                            {isAdmin ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-500 mr-1">Закуп:</span>
                                                        <FormattedPrice 
                                                            value={part.original_price} 
                                                            className="font-bold text-gray-700"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-500 mr-1">Продажа:</span>
                                                        <FormattedPrice 
                                                            value={part.markup_price} 
                                                            className="font-bold text-green-600"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <FormattedPrice 
                                                    value={part.price} 
                                                    className="font-bold text-green-600"
                                                />
                                            )}
                                            
                                            <div className={`text-xs px-2 py-1 rounded ${part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {part.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ByCarModel; 