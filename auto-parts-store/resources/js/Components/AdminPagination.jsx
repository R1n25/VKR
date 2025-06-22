import React from 'react';
import { Link } from '@inertiajs/react';

export default function AdminPagination({ links, className = '' }) {
    // Если нет ссылок или только одна страница, не показываем пагинацию
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className={`flex flex-wrap items-center justify-center gap-1 mt-4 ${className}`}>
            {links.map((link, key) => {
                // Пропускаем метки "Previous" и "Next", так как у нас будут свои иконки
                if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') {
                    return null;
                }

                // Создаем стрелку "Назад"
                if (key === 0) {
                    return (
                        <Link
                            key={key}
                            href={link.url ?? ''}
                            className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors duration-200 ${
                                link.url
                                    ? 'border-[#d1d5db] text-[#3a5085] hover:bg-[#eef2ff] hover:border-[#3a5085]'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                    );
                }

                // Создаем стрелку "Вперед"
                if (key === links.length - 1) {
                    return (
                        <Link
                            key={key}
                            href={link.url ?? ''}
                            className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors duration-200 ${
                                link.url
                                    ? 'border-[#d1d5db] text-[#3a5085] hover:bg-[#eef2ff] hover:border-[#3a5085]'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                            preserveScroll
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    );
                }

                // Обычные ссылки на страницы
                return (
                    <Link
                        key={key}
                        href={link.url ?? ''}
                        className={`flex items-center justify-center w-9 h-9 rounded-md border transition-colors duration-200 ${
                            link.active
                                ? 'bg-[#243969] text-white border-[#243969]'
                                : link.url
                                    ? 'border-[#d1d5db] text-[#3a5085] hover:bg-[#eef2ff] hover:border-[#3a5085]'
                                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        preserveScroll
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
} 