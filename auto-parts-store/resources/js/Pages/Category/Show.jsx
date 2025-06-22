import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CategoryFilters from '@/Components/Filters/CategoryFilters';
import PartCard from '@/Components/Parts/PartCard';
import Pagination from '@/Components/Pagination';
import axios from 'axios';

export default function Show({ category: initialCategory }) {
    const [category, setCategory] = useState(initialCategory);
    const [parts, setParts] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(3); // Для тестирования установим больше 1
    const [pagination, setPagination] = useState({});
    const [debug, setDebug] = useState(null);
    const [error, setError] = useState(null);

    const loadCategory = async () => {
        try {
            const response = await axios.get(`/api/part-categories/${category.id}`);
            setCategory(response.data.data.category);
            setFilters(response.data.data.filters);
        } catch (error) {
            console.error('Error loading category:', error);
        }
    };

    const loadParts = async (page = 1, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/part-categories/${category.id}/filtered-parts`, {
                params: {
                    page,
                    filters,
                    per_page: 4 // Устанавливаем низкое значение для тестирования пагинации
                }
            });
            
            console.log('API Response:', response.data);
            
            if (!response.data.success) {
                setError(response.data.message || 'Не удалось загрузить запчасти');
                setParts([]);
                return;
            }
            
            // Устанавливаем данные запчастей
            setParts(response.data.data.data || []);
            
            // Устанавливаем информацию о пагинации
            setCurrentPage(response.data.data.current_page || 1);
            
            // Вычисляем общее количество страниц
            let lastPage = response.data.data.last_page || 1;
            
            // Принудительно устанавливаем минимум 3 страницы для тестирования
            lastPage = Math.max(lastPage, 3);
            setTotalPages(lastPage);
            setPagination({
                current_page: response.data.data.current_page,
                last_page: lastPage,
                total: response.data.data.total,
                per_page: response.data.data.per_page,
                links: response.data.data.links || []
            });
            
            // Сохраняем отладочную информацию
            if (response.data.debug) {
                setDebug(response.data.debug);
                console.log('Debug info:', response.data.debug);
            }
            
            console.log('Current page:', response.data.data.current_page);
            console.log('Last page:', response.data.data.last_page);
            console.log('Total items:', response.data.data.total);
            console.log('Per page:', response.data.data.per_page);
            
        } catch (error) {
            console.error('Error loading parts:', error);
            setError('Не удалось загрузить запчасти для выбранной категории');
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategory();
        loadParts(1);
    }, [category.id]);

    const handleFilterChange = (newFilters) => {
        setCurrentPage(1);
        loadParts(1, newFilters);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        loadParts(page, filters);
        
        // Прокрутка наверх страницы
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AppLayout>
            <Head title={category.name} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-8">{category.name}</h1>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Фильтры */}
                                <div className="lg:col-span-1">
                                    <CategoryFilters
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                    />
                                </div>

                                {/* Список товаров */}
                                <div className="lg:col-span-3">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                            <strong className="font-bold">Ошибка!</strong>
                                            <span className="block sm:inline"> {error}</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Отладочная информация (временно) */}
                                            {debug && (
                                                <div className="mb-4 p-2 bg-gray-100 text-xs">
                                                    <pre>{JSON.stringify(debug, null, 2)}</pre>
                                                </div>
                                            )}
                                            
                                            {/* Информация о текущей странице */}
                                            <div className="mb-4 text-sm text-gray-600">
                                                Страница {currentPage} из {totalPages} (всего записей: {parts.length})
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {parts.length > 0 ? (
                                                    parts.map((part) => (
                                                        <PartCard key={part.id} part={part} />
                                                    ))
                                                ) : (
                                                    <div className="col-span-3 text-center py-12 text-gray-500">
                                                        Нет доступных запчастей по вашему запросу
                                                    </div>
                                                )}
                                            </div>

                                            {/* Используем компонент пагинации */}
                                            <Pagination 
                                                links={pagination} 
                                                onPageChange={handlePageChange} 
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 