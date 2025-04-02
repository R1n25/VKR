import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CategoriesIndex({ auth }) {
    const [categories, setCategories] = useState([]);
    const [rootCategories, setRootCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parts, setParts] = useState([]);
    const [filteredParts, setFilteredParts] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);
    
    // Фильтры
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('name_asc');
    const [availableBrands, setAvailableBrands] = useState([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Получаем все категории
                const response = await axios.get('/api/categories');
                const allCategories = response.data.data;
                
                // Создаем мапу категорий по ID для быстрого доступа
                const categoriesMap = {};
                allCategories.forEach(category => {
                    categoriesMap[category.id] = {
                        ...category,
                        children: []
                    };
                });
                
                // Выделяем корневые категории и строим дерево
                const rootCats = [];
                
                allCategories.forEach(category => {
                    if (category.parent_id) {
                        // Это дочерняя категория
                        if (categoriesMap[category.parent_id]) {
                            categoriesMap[category.parent_id].children.push(categoriesMap[category.id]);
                        }
                    } else {
                        // Это корневая категория
                        rootCats.push(categoriesMap[category.id]);
                    }
                });
                
                setCategories(allCategories);
                setRootCategories(rootCats);
                setFilteredCategories(allCategories);
                setLoading(false);
                
                // Проверяем URL на наличие параметра категории
                const url = new URL(window.location.href);
                const categoryId = url.searchParams.get('category');
                if (categoryId) {
                    const category = allCategories.find(c => c.id.toString() === categoryId);
                    if (category) {
                        setSelectedCategory(category);
                    }
                }
            } catch (err) {
                console.error('Ошибка при получении списка категорий:', err);
                setError('Не удалось загрузить список категорий. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);
    
    // Фильтрация категорий при изменении поискового запроса
    useEffect(() => {
        if (categories.length === 0) return;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = categories.filter(category => 
                category.name.toLowerCase().includes(query) || 
                (category.description && category.description.toLowerCase().includes(query))
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [categories, searchQuery]);
    
    // Загрузка запчастей при выборе категории
    useEffect(() => {
        if (!selectedCategory) {
            setParts([]);
            setFilteredParts([]);
            return;
        }
        
        const fetchParts = async () => {
            setLoadingParts(true);
            try {
                const response = await axios.get(`/api/categories/${selectedCategory.id}/parts`);
                const partsData = response.data.data.parts || [];
                setParts(partsData);
                setFilteredParts(partsData);
                
                // Извлекаем уникальные бренды из полученных запчастей
                const brands = [...new Set(partsData.map(part => part.brand_name).filter(Boolean))];
                setAvailableBrands(brands);
                
                setLoadingParts(false);
                
                // Обновляем URL, чтобы можно было сохранить/поделиться текущей категорией
                const url = new URL(window.location.href);
                url.searchParams.set('category', selectedCategory.id);
                window.history.pushState({}, '', url);
            } catch (err) {
                console.error('Ошибка при получении запчастей:', err);
                setParts([]);
                setFilteredParts([]);
                setAvailableBrands([]);
                setLoadingParts(false);
            }
        };
        
        fetchParts();
        
        // Сбрасываем фильтры при смене категории
        setPriceRange({ min: '', max: '' });
        setSelectedBrands([]);
        setInStockOnly(false);
        setSortBy('name_asc');
    }, [selectedCategory]);
    
    // Применение фильтров к запчастям
    useEffect(() => {
        if (parts.length === 0) return;
        
        let filtered = [...parts];
        
        // Фильтр по цене
        if (priceRange.min) {
            filtered = filtered.filter(part => part.price >= Number(priceRange.min));
        }
        if (priceRange.max) {
            filtered = filtered.filter(part => part.price <= Number(priceRange.max));
        }
        
        // Фильтр по брендам
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(part => selectedBrands.includes(part.brand_name));
        }
        
        // Фильтр по наличию
        if (inStockOnly) {
            filtered = filtered.filter(part => part.stock > 0);
        }
        
        // Сортировка
        if (sortBy === 'name_asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name_desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortBy === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
        }
        
        setFilteredParts(filtered);
    }, [parts, priceRange, selectedBrands, inStockOnly, sortBy]);
    
    // Обработчик клика по категории
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };
    
    // Обработчик изменения поискового запроса
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    // Обработчик изменения диапазона цен
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({ ...prev, [name]: value }));
    };
    
    // Обработчик изменения выбранных брендов
    const handleBrandChange = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand)
                ? prev.filter(b => b !== brand)
                : [...prev, brand]
        );
    };
    
    // Обработчик изменения фильтра наличия
    const handleInStockChange = () => {
        setInStockOnly(prev => !prev);
    };
    
    // Обработчик изменения сортировки
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };
    
    // Сброс всех фильтров
    const resetFilters = () => {
        setPriceRange({ min: '', max: '' });
        setSelectedBrands([]);
        setInStockOnly(false);
        setSortBy('name_asc');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Категории запчастей</h2>}
        >
            <Head title="Категории запчастей" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Хлебные крошки */}
                            <nav className="mb-6">
                                <ol className="flex space-x-2 text-sm text-gray-500">
                                    <li>
                                        <Link href="/" className="hover:text-green-600">
                                            Главная
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium text-gray-900">Категории</span>
                                    </li>
                                    {selectedCategory && (
                                        <li className="flex items-center">
                                            <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium text-gray-900">{selectedCategory.name}</span>
                                        </li>
                                    )}
                                </ol>
                            </nav>
                            
                            {/* Поиск */}
                            <div className="mb-8">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Поиск по названию или описанию"
                                    className="w-full sm:w-96 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                />
                            </div>

                            {/* Двухколоночный макет: категории слева, запчасти справа */}
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка категорий...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Левая колонка - категории */}
                                    <div className="md:col-span-1">
                                        <h3 className="text-lg font-semibold mb-4">Категории запчастей</h3>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <ul className="divide-y divide-gray-200">
                                                {rootCategories.map(category => (
                                                    <li key={category.id}>
                                                        <button
                                                            onClick={() => handleCategoryClick(category)}
                                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition ${
                                                                selectedCategory && selectedCategory.id === category.id 
                                                                ? 'bg-green-50 text-green-700 font-medium' 
                                                                : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {category.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    {/* Правая колонка - запчасти */}
                                    <div className="md:col-span-3">
                                        {selectedCategory ? (
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4">{selectedCategory.name}</h3>
                                                
                                                {loadingParts ? (
                                                    <div className="text-center py-10">
                                                        <p>Загрузка запчастей...</p>
                                                    </div>
                                                ) : parts.length === 0 ? (
                                                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                        <p className="text-gray-500">В данной категории пока нет запчастей</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {/* Фильтры и сортировка */}
                                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                                <h4 className="text-sm font-medium">Фильтры</h4>
                                                                <button
                                                                    onClick={resetFilters}
                                                                    className="text-xs text-green-600 hover:text-green-800"
                                                                >
                                                                    Сбросить все фильтры
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                {/* Фильтр по цене */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Цена (руб.)
                                                                    </label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            name="min"
                                                                            placeholder="От"
                                                                            value={priceRange.min}
                                                                            onChange={handlePriceChange}
                                                                            className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm text-sm"
                                                                        />
                                                                        <span className="text-gray-500">-</span>
                                                                        <input
                                                                            type="number"
                                                                            name="max"
                                                                            placeholder="До"
                                                                            value={priceRange.max}
                                                                            onChange={handlePriceChange}
                                                                            className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm text-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Фильтр по брендам */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Бренд
                                                                    </label>
                                                                    <div className="max-h-32 overflow-y-auto">
                                                                        {availableBrands.length === 0 ? (
                                                                            <p className="text-xs text-gray-500">Нет данных о брендах</p>
                                                                        ) : (
                                                                            <div className="space-y-1">
                                                                                {availableBrands.map(brand => (
                                                                                    <div key={brand} className="flex items-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            id={`brand-${brand}`}
                                                                                            checked={selectedBrands.includes(brand)}
                                                                                            onChange={() => handleBrandChange(brand)}
                                                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                                                        />
                                                                                        <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-700">
                                                                                            {brand}
                                                                                        </label>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Фильтр по наличию */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Наличие
                                                                    </label>
                                                                    <div className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            id="in-stock"
                                                                            checked={inStockOnly}
                                                                            onChange={handleInStockChange}
                                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                                        />
                                                                        <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700">
                                                                            Только в наличии
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Сортировка */}
                                                                <div>
                                                                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Сортировка
                                                                    </label>
                                                                    <select
                                                                        id="sort"
                                                                        value={sortBy}
                                                                        onChange={handleSortChange}
                                                                        className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm text-sm"
                                                                    >
                                                                        <option value="name_asc">По названию (А-Я)</option>
                                                                        <option value="name_desc">По названию (Я-А)</option>
                                                                        <option value="price_asc">По цене (возрастанию)</option>
                                                                        <option value="price_desc">По цене (убыванию)</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Результаты */}
                                                        <div className="mb-4">
                                                            <p className="text-sm text-gray-500">
                                                                Найдено: {filteredParts.length} из {parts.length}
                                                            </p>
                                                        </div>
                                                        
                                                        {/* Список запчастей */}
                                                        {filteredParts.length === 0 ? (
                                                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                                <p className="text-gray-500">Нет запчастей, соответствующих выбранным фильтрам</p>
                                                                <button
                                                                    onClick={resetFilters}
                                                                    className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                                                                >
                                                                    Сбросить фильтры
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {filteredParts.map(part => (
                                                                    <Link
                                                                        key={part.id}
                                                                        href={`/parts/${part.id}`}
                                                                        className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group"
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
                                                                            <h4 className="font-medium text-gray-900 group-hover:text-green-600 mb-1">{part.name}</h4>
                                                                            
                                                                            <div className="flex items-center mb-2">
                                                                                <span className="text-xs text-gray-500 mr-2">Артикул:</span>
                                                                                <span className="text-xs font-medium">{part.sku}</span>
                                                                            </div>
                                                                            
                                                                            {part.brand_name && (
                                                                                <div className="text-sm text-gray-500 mb-3">
                                                                                    {part.brand_name}
                                                                                </div>
                                                                            )}
                                                                            
                                                                            <div className="flex items-center justify-between mt-2">
                                                                                <div className="font-bold text-green-600">{part.price} руб.</div>
                                                                                
                                                                                <div className={`text-xs px-2 py-1 rounded ${part.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                    {part.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">Выберите категорию из списка слева, чтобы увидеть запчасти</p>
                                            </div>
                                        )}
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