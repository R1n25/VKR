import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // Если нет страниц для пагинации, не отображаем компонент
    if (links.length === 3) return null;
    
    return (
        <div className="flex flex-wrap justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {links.map((link, key) => {
                    // Не отображаем текст "Next &raquo;" и "Previous &laquo;"
                    if (link.url === null) {
                        return (
                            <span
                                key={key}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    
                    return (
                        <Link
                            key={key}
                            href={link.url}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                link.active
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </nav>
        </div>
    );
} 