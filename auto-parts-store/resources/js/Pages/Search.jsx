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
    
    // Дебаунсинг для обработки изменения цен
    const debouncedFilterChange = useCallback(
        debounce((name, value) => {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }, 300),
        []
    );

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
    
    // Обработчик изменения фильтров - обновлен для немедленного применения
    const handleFilterChange = (name, value) => {
        // Для полей цены используем дебаунс, для других полей применяем сразу
        if (name === 'minPrice' || name === 'maxPrice') {
            debouncedFilterChange(name, value);
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
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
        
        // Разделение отфильтрованных результатов на основные и аналоги
        if (results && results.length > 0) {
            const hasExactMatchFlag = results.some(part => 'is_exact_match' in part);
            const hasAnalogFlag = results.some(part => 'is_analog' in part);
            
            if (hasExactMatchFlag && hasAnalogFlag) {
                const exact = results.filter(part => part.is_exact_match === true);
                const analogParts = results.filter(part => part.is_analog === true);
                
                setExactMatches(exact);
                setAnalogs(analogParts);
            } else {
                // Если нет флагов разделения, используем все результаты как основные
                setExactMatches(results);
                setAnalogs([]);
            }
        } else {
            setExactMatches([]);
            setAnalogs([]);
        }
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
                        const markedExactParts = exactParts.map(part => ({
                            ...part,
                            is_exact_match: true,
                            is_analog: false
                        }));
                        
                        const markedAnalogParts = analogParts.map(part => ({
                            ...part,
                            is_exact_match: false,
                            is_analog: true
                        }));
                        
                        setExactMatches(markedExactParts);
                        setAnalogs(markedAnalogParts);
                    } else {
                        // Если нет точного совпадения по артикулу, считаем все результаты аналогами
                        console.log('Нет точного совпадения по артикулу, все результаты считаются аналогами');
                        setExactMatches([]);
                        setAnalogs(spareParts.map(part => ({
                            ...part,
                            is_exact_match: false,
                            is_analog: true
                        })));
                    }
                } else {
                    // Для текстового поиска все результаты считаются основными
                    console.log('Текстовый поиск, все результаты считаются основными');
                    setExactMatches(spareParts.map(part => ({
                        ...part,
                        is_exact_match: true,
                        is_analog: false
                    })));
                    setAnalogs([]);
                }
            } else {
                // Если результат один или поисковый запрос пуст, все результаты считаются основными
                console.log('Один результат или пустой запрос, все результаты считаются основными');
                setExactMatches(spareParts);
                setAnalogs([]);
            }
            
            // Инициализация отфильтрованных результатов
            setFilteredParts(spareParts);
        } else {
            // Если результатов нет, очищаем состояния
            setExactMatches([]);
            setAnalogs([]);
            setFilteredParts([]);
        }
    }, [spareParts, searchQuery]);
    
    // Применяем фильтры при их изменении
    useEffect(() => {
        applyFilters();
    }, [filters]);
    
    // Обработчик отправки формы поиска
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: data.q, type: searchType });
    };
    
    // Рендер компонента
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    Поиск запчастей
                </h2>
            }
        >
            <Head title="Поиск запчастей" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Форма поиска */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={data.q}
                                            onChange={handleSearchChange}
                                            placeholder="Введите название или артикул запчасти..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        
                                        {/* Выпадающий список с подсказками */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {suggestions.map((suggestion, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
                                            type="button"
                                            onClick={() => handleSearchTypeChange('text')}
                                            className={`px-4 py-2 rounded-md ${
                                                searchType === 'text'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            По названию
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSearchTypeChange('article')}
                                            className={`px-4 py-2 rounded-md ${
                                                searchType === 'article'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            По артикулу
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                                        >
                                            Найти
                                        </button>
                                    </div>
                                </div>
                            </form>
                            
                            {/* Кнопка для отображения/скрытия фильтров */}
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 ml-1 transition-transform ${
                                            showFilters ? 'transform rotate-180' : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Панель фильтров */}
                            {showFilters && (
                                <div className="bg-gray-50 p-4 rounded-md mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Фильтр по производителю */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Производитель
                                            </label>
                                            <select
                                                value={filters.manufacturer}
                                                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">Все производители</option>
                                                {getUniqueManufacturers().map((manufacturer, index) => (
                                                    <option key={index} value={manufacturer}>
                                                        {manufacturer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Фильтр по минимальной цене */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Минимальная цена
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                placeholder="От"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        
                                        {/* Фильтр по максимальной цене */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Максимальная цена
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                placeholder="До"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                        
                                        {/* Фильтр по наличию */}
                                        <div className="flex items-center mt-8">
                                            <input
                                                type="checkbox"
                                                id="inStock"
                                                checked={filters.inStock}
                                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                                                Только в наличии
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* Сортировка */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Сортировка
                                        </label>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="relevance">По релевантности</option>
                                            <option value="price_asc">По цене (возрастание)</option>
                                            <option value="price_desc">По цене (убывание)</option>
                                            <option value="name_asc">По названию (А-Я)</option>
                                            <option value="name_desc">По названию (Я-А)</option>
                                        </select>
                                    </div>
                                    
                                    {/* Кнопка сброса фильтров */}
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                        >
                                            Сбросить фильтры
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Результаты поиска */}
                            {searchQuery ? (
                                <div>
                                    {/* Информация о количестве найденных запчастей */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold">
                                            {filteredParts.length > 0
                                                ? `Найдено запчастей: ${filteredParts.length}`
                                                : 'По вашему запросу ничего не найдено'}
                                        </h3>
                                        <p className="text-gray-600">
                                            Поисковый запрос: "{searchQuery}" ({searchType === 'text' ? 'по названию' : 'по артикулу'})
                                        </p>
                                    </div>
                                    
                                    {/* Отображение точных совпадений */}
                                    {exactMatches.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="text-lg font-semibold mb-4">Точные совпадения</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {exactMatches
                                                    .filter(part => {
                                                        // Применяем фильтры к точным совпадениям
                                                        if (filters.manufacturer && !part.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase())) {
                                                            return false;
                                                        }
                                                        if (filters.minPrice && part.price < parseFloat(filters.minPrice)) {
                                                            return false;
                                                        }
                                                        if (filters.maxPrice && part.price > parseFloat(filters.maxPrice)) {
                                                            return false;
                                                        }
                                                        if (filters.inStock && part.stock_quantity <= 0) {
                                                            return false;
                                                        }
                                                        return true;
                                                    })
                                                    .map((part) => (
                                                        <PartCard
                                                            key={part.id}
                                                            part={part}
                                                            isAdmin={isAdmin}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Отображение аналогов */}
                                    {analogs.length > 0 && (
                                        <div className="mb-8">
                                            <h4 className="text-lg font-semibold mb-4">Аналоги и похожие запчасти</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {analogs
                                                    .filter(part => {
                                                        // Применяем фильтры к аналогам
                                                        if (filters.manufacturer && !part.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase())) {
                                                            return false;
                                                        }
                                                        if (filters.minPrice && part.price < parseFloat(filters.minPrice)) {
                                                            return false;
                                                        }
                                                        if (filters.maxPrice && part.price > parseFloat(filters.maxPrice)) {
                                                            return false;
                                                        }
                                                        if (filters.inStock && part.stock_quantity <= 0) {
                                                            return false;
                                                        }
                                                        return true;
                                                    })
                                                    .map((part) => (
                                                        <PartCard
                                                            key={part.id}
                                                            part={part}
                                                            isAdmin={isAdmin}
                                                            isAnalog={true}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Если нет разделения на точные совпадения и аналоги, показываем все результаты */}
                                    {exactMatches.length === 0 && analogs.length === 0 && filteredParts.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredParts.map((part) => (
                                                <PartCard
                                                    key={part.id}
                                                    part={part}
                                                    isAdmin={isAdmin}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">
                                        Введите поисковый запрос, чтобы найти запчасти
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 