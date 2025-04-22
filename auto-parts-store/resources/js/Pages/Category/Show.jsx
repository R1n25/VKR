import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CategoryFilters from '@/Components/Filters/CategoryFilters';
import PartCard from '@/Components/Parts/PartCard';
import axios from 'axios';

export default function Show({ category: initialCategory }) {
    const [category, setCategory] = useState(initialCategory);
    const [parts, setParts] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
        try {
            const response = await axios.get(`/api/part-categories/${category.id}/filtered-parts`, {
                params: {
                    page,
                    filters,
                    per_page: 12
                }
            });
            setParts(response.data.data.data);
            setCurrentPage(response.data.data.current_page);
            setTotalPages(Math.ceil(response.data.data.total / response.data.data.per_page));
        } catch (error) {
            console.error('Error loading parts:', error);
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
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {parts.map((part) => (
                                                    <PartCard key={part.id} part={part} />
                                                ))}
                                            </div>

                                            {/* Пагинация */}
                                            {totalPages > 1 && (
                                                <div className="mt-8 flex justify-center">
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                            <button
                                                                key={page}
                                                                onClick={() => handlePageChange(page)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                                    ${currentPage === page
                                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }
                                                                    ${page === 1 ? 'rounded-l-md' : ''}
                                                                    ${page === totalPages ? 'rounded-r-md' : ''}`}
                                                            >
                                                                {page}
                                                            </button>
                                                        ))}
                                                    </nav>
                                                </div>
                                            )}
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