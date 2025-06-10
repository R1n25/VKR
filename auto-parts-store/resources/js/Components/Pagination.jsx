import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, onPageChange }) {
    // Для ссылок в формате Inertia
    if (links && links.length > 3) {
        return (
            <div className="mt-6">
                <div className="flex flex-wrap justify-center">
                    {links.map((link, key) => {
                        if (link.url === null) {
                            return (
                                <span
                                    key={key}
                                    className="mr-1 mb-1 px-4 py-2 text-sm border rounded text-gray-400 bg-gray-100"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={key}
                                className={`mr-1 mb-1 px-4 py-2 text-sm border rounded
                                    ${link.active ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}
                                `}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    // Для обычной пагинации с номерами страниц
    if (typeof onPageChange === 'function') {
        const totalPages = links?.last_page || 5; // По умолчанию 5 страниц
        const currentPage = links?.current_page || 1;

        return (
            <div className="mt-8">
                <div className="flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {/* Кнопка "Предыдущая" */}
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium
                                ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Предыдущая</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Номера страниц */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${currentPage === page
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        {/* Кнопка "Следующая" */}
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium
                                ${currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Следующая</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        );
    }

    return null;
} 