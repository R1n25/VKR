import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { router } from '@inertiajs/react';

export default function CategoriesIndex({ auth }) {
    const [categories, setCategories] = useState([]);
    const [rootCategories, setRootCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    
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
    
    // Обработчик изменения поискового запроса
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    // Компонент для отображения категории и её подкатегорий
    const CategoryItem = ({ category, level = 0 }) => {
        // Все категории теперь развернуты по умолчанию
        const [isExpanded, setIsExpanded] = useState(true);
        
        return (
            <div key={category.id} className="mb-4">
                <Link 
                    href={`/category/${category.id}`}
                    className={`block p-4 border border-gray-200 rounded-lg hover:shadow-md transition ${
                        level === 0 ? 'bg-gray-50' : ''
                    }`}
                >
                    <h4 className={`${level === 0 ? 'text-lg font-semibold' : 'text-base font-medium'} text-gray-900 hover:text-green-600`}>
                        {category.name}
                    </h4>
                    
                    {category.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </Link>
                
                {category.children && category.children.length > 0 && (
                    <div className={`pl-6 mt-2 border-l border-gray-200 space-y-2`}>
                        {category.children.map(child => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Категории запчастей</h2>}
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

                            {/* Список категорий */}
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка категорий...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : searchQuery ? (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Результаты поиска</h3>
                                    
                                    {filteredCategories.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredCategories.map(category => (
                                                <Link
                                                    key={category.id}
                                                    href={`/category/${category.id}`}
                                                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition group"
                                                >
                                                    <h4 className="text-lg font-medium text-gray-900 group-hover:text-green-600 mb-1">
                                                        {category.name}
                                                    </h4>
                                                    
                                                    {category.parent && (
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            <span className="font-medium">В категории:</span> {category.parent.name}
                                                        </div>
                                                    )}
                                                    
                                                    {category.description && (
                                                        <p className="text-sm text-gray-500 line-clamp-2">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {rootCategories.map(category => (
                                        <CategoryItem key={category.id} category={category} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 