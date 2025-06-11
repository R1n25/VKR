import React, { useEffect, useState, useCallback } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatPrice } from '@/utils/helpers';
import AddToCartButton from '@/Components/AddToCartButton';
import PartCard from '@/Components/Parts/PartCard';
import debounce from 'lodash/debounce';
import axios from 'axios';

export default function Search(props) {
    // Деструктурируем пропсы
    const { auth, searchQuery, spareParts = [], isAdmin = false, debug = {} } = props;
    
    // Отладочная информация
    console.log('Search компонент:', {
        auth,
        searchQuery,
        spareParts,
        isAdmin,
        debug
    });
    
    // Состояние для автозаполнения
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Состояние для типа поиска (по умолчанию - поиск по названию)
    const [searchType, setSearchType] = useState('text');
    
    // Состояние для фильтров
    const [filters, setFilters] = useState({
        manufacturer: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sortBy: 'relevance'
    });
    
    // Состояние для отображения фильтров
    const [showFilters, setShowFilters] = useState(false);
    
    // Состояние для отфильтрованных результатов
    const [filteredParts, setFilteredParts] = useState([]);
    
    const { data, setData } = useForm({
        q: searchQuery || '',
        type: searchType,
    });

    // Разделяем запчасти на основные и аналоги
    const [exactMatches, setExactMatches] = useState([]);
    const [analogs, setAnalogs] = useState([]);

    // Функция для получения подсказок поиска
    const fetchSuggestions = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            
            try {
                // Преобразуем запрос к нижнему регистру перед отправкой
                const lowercaseQuery = query.toLowerCase();
                console.log('Запрос подсказок:', {
                    originalQuery: query,
                    lowercaseQuery: lowercaseQuery
                });
                
                const response = await axios.get(`/api/spare-parts/search-suggestions?q=${encodeURIComponent(lowercaseQuery)}&type=${searchType}`);
                if (response.data && response.data.success) {
                    setSuggestions(response.data.suggestions || []);
                }
            } catch (error) {
                console.error('Ошибка при получении подсказок:', error);
                setSuggestions([]);
            }
        }, 300),
        [searchType]
    );

    // Обработчик изменения поискового запроса
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setData('q', value);
        
        if (value.length >= 2) {
            fetchSuggestions(value);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };
    
    // Обработчик изменения типа поиска
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setData('type', type);
        setSuggestions([]);
        setShowSuggestions(false);
    };
    
    // Обработчик выбора подсказки
    const handleSuggestionClick = (suggestion) => {
        setData('q', suggestion);
        setShowSuggestions(false);
        // Преобразуем подсказку к нижнему регистру перед отправкой
        const query = suggestion.toLowerCase();
        console.log('Выбрана подсказка:', {
            originalSuggestion: suggestion,
            lowercaseSuggestion: query
        });
        router.get('/search', { q: query, type: searchType });
    };
    
    // Обработчик изменения фильтров
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Применение фильтров к результатам поиска
    const applyFilters = () => {
        let results = [...spareParts];
        
        // Фильтр по производителю
        if (filters.manufacturer) {
            results = results.filter(part => 
                part.manufacturer && part.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase())
            );
        }
        
        // Фильтр по минимальной цене
        if (filters.minPrice) {
            const minPrice = parseFloat(filters.minPrice);
            results = results.filter(part => part.price >= minPrice);
        }
        
        // Фильтр по максимальной цене
        if (filters.maxPrice) {
            const maxPrice = parseFloat(filters.maxPrice);
            results = results.filter(part => part.price <= maxPrice);
        }
        
        // Фильтр по наличию
        if (filters.inStock) {
            results = results.filter(part => part.stock_quantity > 0);
        }
        
        // Сортировка результатов
        switch (filters.sortBy) {
            case 'price_asc':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                results.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'relevance':
            default:
                // Сохраняем исходный порядок, который определен сервером
                break;
        }
        
        setFilteredParts(results);
    };
    
    // Сбросить фильтры
    const resetFilters = () => {
        setFilters({
            manufacturer: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sortBy: 'relevance'
        });
        setFilteredParts(spareParts);
    };

    // Получение уникальных производителей для фильтра
    const getUniqueManufacturers = () => {
        const manufacturers = spareParts
            .map(part => part.manufacturer)
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index);
        return manufacturers;
    };

    useEffect(() => {
        if (spareParts && spareParts.length > 0) {
            // Проверяем, есть ли в результатах поиска информация о точных совпадениях и аналогах
            const hasExactMatchFlag = spareParts.some(part => 'is_exact_match' in part);
            const hasAnalogFlag = spareParts.some(part => 'is_analog' in part);
            
            console.log('Флаги в результатах:', { hasExactMatchFlag, hasAnalogFlag });
            
            if (hasExactMatchFlag && hasAnalogFlag) {
                // Если в результатах есть флаги, используем их для разделения
                const exact = spareParts.filter(part => part.is_exact_match === true);
                const analogParts = spareParts.filter(part => part.is_analog === true);
                
                console.log('Разделение по флагам:', { exact: exact.length, analogs: analogParts.length });
                
                setExactMatches(exact);
                setAnalogs(analogParts);
            } else if (spareParts.length > 1 && searchQuery && searchQuery.trim()) {
                // Если результатов поиска больше одного, пробуем определить основные и аналоги
                
                // Найти точное совпадение по артикулу (если это поиск по артикулу)
                const query = searchQuery.trim().toUpperCase();
                const isArticleSearch = /^[A-Z0-9-]+$/i.test(query);
                
                console.log('Определение по артикулу:', { isArticleSearch, query });
                
                if (isArticleSearch) {
                    // Найдем основную запчасть - ту, которая точно соответствует запросу
                    const mainPart = spareParts.find(part => 
                        part.part_number && part.part_number.toUpperCase() === query
                    );
                    
                    if (mainPart) {
                        // Разделяем на основные и аналоги
                        const exactParts = [mainPart];
                        const analogParts = spareParts.filter(part => part.id !== mainPart.id);
                        
                        console.log('Разделение по артикулу:', { exactParts: exactParts.length, analogParts: analogParts.length });
                        
                        // Помечаем запчасти
                        exactParts[0].is_exact_match = true;
                        exactParts[0].is_analog = false;
                        
                        analogParts.forEach(part => {
                            part.is_exact_match = false;
                            part.is_analog = true;
                        });
                        
                        setExactMatches(exactParts);
                        setAnalogs(analogParts);
                    } else {
                        // Если нет точного совпадения по артикулу, считаем все результаты аналогами
                        console.log('Нет точного совпадения по артикулу, все результаты считаются аналогами');
                        setExactMatches([]);
                        
                        // Помечаем все как аналоги
                        const allAnalogs = spareParts.map(part => {
                            part.is_exact_match = false;
                            part.is_analog = true;
                            return part;
                        });
                        
                        setAnalogs(allAnalogs);
                    }
                } else {
                    // Для текстового поиска все результаты считаем точными совпадениями
                    console.log('Текстовый поиск, все результаты считаются точными совпадениями');
                    
                    // Помечаем все как точные совпадения
                    const allExact = spareParts.map(part => {
                        part.is_exact_match = true;
                        part.is_analog = false;
                        return part;
                    });
                    
                    setExactMatches(allExact);
                    setAnalogs([]);
                }
            } else {
                // Если не удалось определить по другим признакам, считаем все точными совпадениями
                console.log('Один результат или не удалось определить, все считаются точными совпадениями');
                
                // Помечаем все как точные совпадения
                const allExact = spareParts.map(part => {
                    part.is_exact_match = true;
                    part.is_analog = false;
                    return part;
                });
                
                setExactMatches(allExact);
                setAnalogs([]);
            }
            
            // Инициализируем отфильтрованные результаты
            setFilteredParts(spareParts);
        } else {
            // Если нет результатов, очищаем оба массива
            console.log('Нет результатов поиска');
            setExactMatches([]);
            setAnalogs([]);
            setFilteredParts([]);
        }
    }, [spareParts, searchQuery]);
    
    // Применяем фильтры при их изменении
    useEffect(() => {
        applyFilters();
    }, [filters, spareParts]);

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (data.q.trim()) {
            // Преобразуем запрос к нижнему регистру перед отправкой
            const query = data.q.trim().toLowerCase();
            console.log('Поиск запчастей:', {
                originalQuery: data.q,
                lowercaseQuery: query
            });
            router.get('/search', { q: query, type: searchType });
        }
    };

    // Получаем отфильтрованные точные совпадения и аналоги
    const filteredExactMatches = filteredParts.filter(part => 
        exactMatches.some(exact => exact.id === part.id)
    );
    
    const filteredAnalogs = filteredParts.filter(part => 
        analogs.some(analog => analog.id === part.id)
    );

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
                            {/* Форма поиска с автозаполнением */}
                            <form onSubmit={handleSearch} className="mb-8">
                                {/* Переключатель типа поиска */}
                                <div className="mb-4">
                                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => handleSearchTypeChange('text')}
                                            className={`px-4 py-2 flex-1 ${searchType === 'text' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Поиск по названию
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSearchTypeChange('article')}
                                            className={`px-4 py-2 flex-1 ${searchType === 'article' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Поиск по артикулу
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            value={data.q}
                                            onChange={handleSearchChange}
                                            placeholder={searchType === 'article' 
                                                ? "Введите артикул запчасти (например, K2OTT)" 
                                                : "Введите название запчасти"}
                                            className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            autoComplete="off"
                                        />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
                                                {suggestions.map((suggestion, index) => (
                                                    <div 
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        >
                                            Найти
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Подсказка для поиска по артикулу */}
                                {searchType === 'article' && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Введите точный артикул запчасти для поиска. Например: K2OTT, 90919-01275, NGK5018</p>
                                    </div>
                                )}
                            </form>
                            
                            {/* Панель фильтров */}
                            {showFilters && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Фильтры</h3>
                                        <button
                                            onClick={resetFilters}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Сбросить
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Фильтр по производителю */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Производитель
                                            </label>
                                            <select
                                                value={filters.manufacturer}
                                                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                            >
                                                <option value="">Все производители</option>
                                                {getUniqueManufacturers().map((manufacturer, index) => (
                                                    <option key={index} value={manufacturer}>
                                                        {manufacturer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Фильтр по цене (от) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Цена от
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                placeholder="Мин. цена"
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                            />
                                        </div>
                                        
                                        {/* Фильтр по цене (до) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Цена до
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                placeholder="Макс. цена"
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                            />
                                        </div>
                                        
                                        {/* Сортировка */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Сортировка
                                            </label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                            >
                                                <option value="relevance">По релевантности</option>
                                                <option value="price_asc">По цене (возрастание)</option>
                                                <option value="price_desc">По цене (убывание)</option>
                                                <option value="name_asc">По названию (А-Я)</option>
                                                <option value="name_desc">По названию (Я-А)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Фильтр по наличию */}
                                    <div className="mt-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.inStock}
                                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Только в наличии</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Результаты поиска */}
                            {!searchQuery ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Введите поисковый запрос выше для поиска запчастей</p>
                                </div>
                            ) : filteredParts.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                                    <p className="text-gray-500 mt-2">Попробуйте изменить запрос или просмотреть каталог</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-gray-600">
                                            Найдено результатов: <span className="font-medium">{filteredParts.length}</span>
                                            {filteredParts.length !== spareParts.length && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                    (отфильтровано из {spareParts.length})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    
                                    {/* Точные совпадения */}
                                    {filteredExactMatches.length > 0 && (
                                        <>
                                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                <span>{filteredAnalogs.length > 0 ? 'Точные совпадения' : 'Результаты поиска'}</span>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {filteredExactMatches.length}
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                                                {filteredExactMatches.map(part => (
                                                    <PartCard 
                                                        key={part.id} 
                                                        part={part} 
                                                        isAnalog={false} 
                                                        user={auth.user}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Аналоги */}
                                    {filteredAnalogs.length > 0 && (
                                        <>
                                            <div className={`${filteredExactMatches.length > 0 ? 'border-t border-gray-200 pt-8 mt-2' : ''} mb-4`}>
                                                <h3 className="text-xl font-semibold flex items-center mb-4">
                                                    <span className="mr-2">{filteredExactMatches.length > 0 ? 'Аналоги' : 'Аналоги и альтернативы'}</span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {filteredAnalogs.length}
                                                    </span>
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    {filteredExactMatches.length > 0 
                                                        ? 'Эти товары могут заменить искомую запчасть:' 
                                                        : 'Найдены аналоги и альтернативы для запрошенного артикула:'}
                                                </p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredAnalogs.map(part => (
                                                    <PartCard 
                                                        key={part.id} 
                                                        part={part} 
                                                        isAnalog={true}
                                                        user={auth.user} 
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Другие результаты (если нет ни точных совпадений, ни аналогов) */}
                                    {filteredExactMatches.length === 0 && filteredAnalogs.length === 0 && (
                                        <>
                                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                                <span>Результаты поиска</span>
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {filteredParts.length}
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredParts.map(part => (
                                                    <PartCard 
                                                        key={part.id} 
                                                        part={part} 
                                                        isAnalog={false} 
                                                        user={auth.user}
                                                    />
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