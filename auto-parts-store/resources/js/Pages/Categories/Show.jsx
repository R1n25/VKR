import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CategoryShow({ auth, categoryId }) {
    const [category, setCategory] = useState(null);
    const [parts, setParts] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем данные о категории
                const categoryResponse = await axios.get(`/api/categories/${categoryId}`);
                setCategory(categoryResponse.data.data);
                
                // Получаем подкатегории
                const subcategoriesResponse = await axios.get(`/api/categories?parent_id=${categoryId}`);
                setSubcategories(subcategoriesResponse.data.data);
                
                // Получаем товары в категории
                const partsResponse = await axios.get(
                    `/api/parts?category_id=${categoryId}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${currentPage}`
                );
                
                setParts(partsResponse.data.data);
                setTotalPages(partsResponse.data.meta.last_page || 1);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных категории:', err);
                setError('Не удалось загрузить информацию о категории. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, sortBy, sortOrder, currentPage]);

    const handleSortChange = (e) => {
        const value = e.target.value;
        if (value === 'price_asc') {
            setSortBy('price');
            setSortOrder('asc');
        } else if (value === 'price_desc') {
            setSortBy('price');
            setSortOrder('desc');
        } else if (value === 'name_asc') {
            setSortBy('name');
            setSortOrder('asc');
        } else if (value === 'name_desc') {
            setSortBy('name');
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {loading ? 'Загрузка категории...' : category ? category.name : 'Категория'}
                </h2>
            }
        >
            <Head title={loading ? 'Категория автозапчастей' : category ? category.name : 'Категория'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка данных...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <div>
                                    {/* Хлебные крошки */}
                                    <nav className="mb-6">
                                        <ol className="flex space-x-2 text-sm text-gray-500">
                                            <li>
                                                <Link href="/" className="hover:text-indigo-600">
                                                    Главная
                                                </Link>
                                            </li>
                                            <li className="flex items-center">
                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <Link href="/" className="hover:text-indigo-600">
                                                    Категории
                                                </Link>
                                            </li>
                                            {category.parent && (
                                                <li className="flex items-center">
                                                    <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <Link 
                                                        href={`/categories/${category.parent.id}`} 
                                                        className="hover:text-indigo-600"
                                                    >
                                                        {category.parent.name}
                                                    </Link>
                                                </li>
                                            )}
                                            <li className="flex items-center">
                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </li>
                                        </ol>
                                    </nav>

                                    {/* Описание категории */}
                                    {category.description && (
                                        <div className="mb-8">
                                            <p className="text-gray-700">{category.description}</p>
                                        </div>
                                    )}

                                    {/* Подкатегории */}
                                    {subcategories.length > 0 && (
                                        <div className="mb-12">
                                            <h3 className="text-lg font-semibold mb-4">Подкатегории</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {subcategories.map(subcategory => (
                                                    <Link 
                                                        key={subcategory.id} 
                                                        href={`/categories/${subcategory.id}`}
                                                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                                    >
                                                        <h4 className="font-medium text-indigo-600">{subcategory.name}</h4>
                                                        {subcategory.description && (
                                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{subcategory.description}</p>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Товары в категории */}
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-semibold">Товары в категории</h3>
                                            
                                            <div className="flex items-center">
                                                <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Сортировка:</label>
                                                <select
                                                    id="sort"
                                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={`${sortBy}_${sortOrder}`}
                                                    onChange={handleSortChange}
                                                >
                                                    <option value="name_asc">По названию (А-Я)</option>
                                                    <option value="name_desc">По названию (Я-А)</option>
                                                    <option value="price_asc">По цене (возрастание)</option>
                                                    <option value="price_desc">По цене (убывание)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {parts.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">В данной категории пока нет товаров</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                    {parts.map(part => (
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
                                                                <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 mb-1">{part.name}</h4>
                                                                
                                                                <div className="flex items-center mb-2">
                                                                    <span className="text-xs text-gray-500 mr-2">Артикул:</span>
                                                                    <span className="text-xs font-medium">{part.sku}</span>
                                                                </div>
                                                                
                                                                {part.brand && (
                                                                    <div className="text-sm text-gray-500 mb-3">
                                                                        {part.brand.name}
                                                                    </div>
                                                                )}
                                                                
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="font-bold text-indigo-600">{part.price} руб.</div>
                                                                    
                                                                    <div className={`text-xs px-2 py-1 rounded ${part.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {part.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                                
                                                {/* Пагинация */}
                                                {totalPages > 1 && (
                                                    <div className="flex justify-center mt-8">
                                                        <nav className="flex items-center">
                                                            <button
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                            >
                                                                &laquo; Предыдущая
                                                            </button>
                                                            
                                                            <div className="mx-4 text-sm text-gray-700">
                                                                Страница {currentPage} из {totalPages}
                                                            </div>
                                                            
                                                            <button
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                            >
                                                                Следующая &raquo;
                                                            </button>
                                                        </nav>
                                                    </div>
                                                )}
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