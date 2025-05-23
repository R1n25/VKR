import React, { useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Search(props) {
    // Деструктурируем пропсы
    const { auth, searchQuery, spareParts = [], isAdmin = false } = props;
    
    const { data, setData } = useForm({
        q: searchQuery || '',
    });

    // Добавляем отладочный код
    useEffect(() => {
        console.log('Все пропсы:', props);
        
        if (spareParts.length > 0) {
            console.log('Данные запчастей:', spareParts);
            console.log('Первая запчасть:', spareParts[0]);
            console.log('Цена первой запчасти:', spareParts[0].price);
            
            // Проверяем все поля первой запчасти
            console.log('Все поля первой запчасти:');
            for (const key in spareParts[0]) {
                console.log(`${key}: ${spareParts[0][key]}`);
            }
        }
    }, [props, spareParts]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: data.q });
    };

    // Функция для форматирования цены
    const formatPrice = (price) => {
        if (!price) return '0.00';
        
        // Проверяем, является ли цена строкой или числом
        if (typeof price === 'string') {
            // Уже строка, просто возвращаем
            return price;
        } else {
            // Преобразуем в строку с двумя знаками после запятой
            return Number(price).toFixed(2);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Поиск запчастей</h2>}
        >
            <Head title="Поиск запчастей" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Форма поиска */}
                            <form onSubmit={handleSearch} className="mb-8">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            value={data.q}
                                            onChange={e => setData('q', e.target.value)}
                                            placeholder="Введите название или артикул запчасти"
                                            className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        >
                                            Найти
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Результаты поиска */}
                            {!searchQuery ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Введите поисковый запрос выше для поиска запчастей</p>
                                </div>
                            ) : spareParts.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                                    <p className="text-gray-500 mt-2">Попробуйте изменить запрос или просмотреть каталог</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-gray-600">
                                            Найдено результатов: <span className="font-medium">{spareParts.length}</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {spareParts.map(part => (
                                            <Link
                                                key={part.id}
                                                href={`/parts/${part.id}`}
                                                className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition group"
                                            >
                                                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                                                    {part.image_url ? (
                                                        <img
                                                            src={part.image_url}
                                                            alt={part.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-gray-200">
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
                                                                    <span className="font-bold text-gray-700">
                                                                        {part.original_price ? `${formatPrice(part.original_price)} ₽` : '—'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="text-sm text-gray-500 mr-1">Продажа:</span>
                                                                    <span className="font-bold text-green-600">
                                                                        {part.markup_price ? `${formatPrice(part.markup_price)} ₽` : '—'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="font-bold text-green-600">
                                                                {part.price ? `${formatPrice(part.price)} ₽` : '—'}
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`text-xs px-2 py-1 rounded ${part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {part.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 