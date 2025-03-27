import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Search({ auth, searchQuery }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    
    const { data, setData, get } = useForm({
        q: searchQuery || '',
    });

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            
            try {
                const params = {
                    search: searchQuery,
                    page: currentPage,
                };
                
                if (sortBy === 'price_asc') {
                    params.sort_by = 'price';
                    params.sort_order = 'asc';
                } else if (sortBy === 'price_desc') {
                    params.sort_by = 'price';
                    params.sort_order = 'desc';
                } else if (sortBy === 'name_asc') {
                    params.sort_by = 'name';
                    params.sort_order = 'asc';
                } else if (sortBy === 'name_desc') {
                    params.sort_by = 'name';
                    params.sort_order = 'desc';
                }
                
                const response = await axios.get('/api/parts', { params });
                
                setResults(response.data.data);
                setTotalPages(response.data.meta.last_page || 1);
                setTotalResults(response.data.meta.total || 0);
                setError('');
            } catch (err) {
                console.error('Ошибка при выполнении поиска:', err);
                setError('Не удалось выполнить поиск. Пожалуйста, попробуйте позже.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchQuery, currentPage, sortBy]);

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/search', { q: data.q });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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
                                            className="px-6 py-3 bg-white text-green-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
                                        >
                                            Найти
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Результаты поиска */}
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Поиск запчастей...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : !searchQuery ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Введите поисковый запрос выше для поиска запчастей</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                                    <p className="text-gray-500 mt-2">Попробуйте изменить запрос или просмотреть каталог</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-gray-600">
                                            Найдено результатов: <span className="font-medium">{totalResults}</span>
                                        </p>
                                        
                                        <div className="flex items-center">
                                            <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Сортировка:</label>
                                            <select
                                                id="sort"
                                                className="border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                                                value={sortBy}
                                                onChange={handleSortChange}
                                            >
                                                <option value="relevance">По релевантности</option>
                                                <option value="name_asc">По названию (А-Я)</option>
                                                <option value="name_desc">По названию (Я-А)</option>
                                                <option value="price_asc">По цене (возрастание)</option>
                                                <option value="price_desc">По цене (убывание)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {results.map(part => (
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
                                                        <span className="text-xs font-medium">{part.sku}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center mb-3">
                                                        {part.brand && (
                                                            <span className="text-sm text-gray-500 mr-2">{part.brand.name}</span>
                                                        )}
                                                        {part.car_model && (
                                                            <span className="text-sm text-gray-500">{part.car_model.name}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {part.category && (
                                                        <div className="text-xs text-gray-500 mb-3">
                                                            {part.category.name}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 