import React, { useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice } from '@/utils/helpers';

export default function Search(props) {
    // Деструктурируем пропсы
    const { auth, searchQuery, spareParts = [], isAdmin = false } = props;
    
    // Добавляем отладочный вывод для анализа данных
    console.log('Search component props:', props);
    console.log('spareParts length:', spareParts.length);
    console.log('Sample sparePart item:', spareParts[0]);
    
    const { data, setData } = useForm({
        q: searchQuery || '',
    });

    // Разделяем запчасти на основные и аналоги
    const [exactMatches, setExactMatches] = useState([]);
    const [analogs, setAnalogs] = useState([]);

    useEffect(() => {
        if (spareParts && spareParts.length > 0) {
            // Если результатов поиска больше одного, будем считать, что первый - основной, остальные - аналоги
            if (spareParts.length > 1 && searchQuery && searchQuery.trim()) {
                console.log('Разделяем результаты на основные и аналоги');
                
                // Найти точное совпадение по артикулу (если это поиск по артикулу)
                const query = searchQuery.trim().toUpperCase();
                const isArticleSearch = /^[A-Z0-9-]+$/i.test(query);
                
                if (isArticleSearch) {
                    // Найдем основную запчасть - ту, которая точно соответствует запросу
                    const mainPart = spareParts.find(part => 
                        part.part_number && part.part_number.toUpperCase() === query
                    );
                    
                    if (mainPart) {
                        console.log('Найдена основная запчасть:', mainPart);
                        
                        // Разделяем на основные и аналоги
                        const exactParts = [mainPart];
                        const analogParts = spareParts.filter(part => part.id !== mainPart.id);
                        
                        console.log('Точные совпадения:', exactParts.length, exactParts);
                        console.log('Аналоги:', analogParts.length, analogParts);
                        
                        setExactMatches(exactParts);
                        setAnalogs(analogParts);
                        return;
                    }
                }
            }
            
            // Стандартная обработка, если выше не сработало
            const processed = spareParts.map(part => ({
                ...part,
                is_analog: Boolean(part.is_analog)
            }));
            
            const exact = processed.filter(part => !part.is_analog);
            const analogParts = processed.filter(part => part.is_analog);
            
            console.log('Все запчасти:', processed);
            console.log('Точные совпадения:', exact.length, exact);
            console.log('Аналоги:', analogParts.length, analogParts);
            
            setExactMatches(exact);
            setAnalogs(analogParts);
        }
    }, [spareParts, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: data.q });
    };

    // Компонент карточки товара
    const PartCard = ({ part, isAnalog = false }) => {
        // Обработчик клика по артикулу
        const handleArticleClick = (e, partNumber) => {
            e.preventDefault(); // Предотвращаем переход по ссылке карточки
            e.stopPropagation(); // Останавливаем всплытие события
            
            console.log('Поиск по артикулу:', partNumber);
            router.get('/search', { q: partNumber });
        };
        
        return (
            <Link
                key={part.id}
                href={`/parts/${part.id}`}
                className={`block p-6 border ${isAnalog ? 'border-blue-100' : 'border-gray-200'} rounded-lg hover:shadow-md transition group`}
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
                    {isAnalog && (
                        <div className="mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Аналог
                            </span>
                        </div>
                    )}
                    
                    <h4 className={`text-lg font-medium text-gray-900 group-hover:${isAnalog ? 'text-blue-600' : 'text-green-600'} mb-2`}>
                        {part.name}
                    </h4>
                    
                    <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 mr-2">Артикул:</span>
                        <button
                            onClick={(e) => handleArticleClick(e, part.part_number)}
                            className="text-xs font-medium text-blue-600 hover:underline hover:text-blue-800 focus:outline-none"
                        >
                            {part.part_number}
                        </button>
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
                                    <span className={`font-bold ${isAnalog ? 'text-blue-600' : 'text-green-600'}`}>
                                        {part.markup_price ? `${formatPrice(part.markup_price)} ₽` : '—'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className={`font-bold ${isAnalog ? 'text-blue-600' : 'text-green-600'}`}>
                                {part.price ? `${formatPrice(part.price)} ₽` : '—'}
                            </div>
                        )}
                        
                        <div className={`text-xs px-2 py-1 rounded ${part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {part.stock_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                        </div>
                    </div>
                </div>
            </Link>
        );
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
                                    
                                    {/* Точные совпадения */}
                                    {exactMatches.length > 0 && (
                                        <>
                                            <h3 className="text-xl font-semibold mb-4">Точные совпадения</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                                                {exactMatches.map(part => (
                                                    <PartCard key={part.id} part={part} isAnalog={false} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Аналоги */}
                                    {analogs.length > 0 && (
                                        <>
                                            <div className="border-t border-gray-200 pt-8 mt-2 mb-4">
                                                <h3 className="text-xl font-semibold flex items-center mb-4">
                                                    <span className="mr-2">Аналоги</span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {analogs.length}
                                                    </span>
                                                </h3>
                                                <p className="text-gray-600 mb-4">Эти товары могут заменить искомую запчасть:</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {analogs.map(part => (
                                                    <PartCard key={part.id} part={part} isAnalog={true} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 