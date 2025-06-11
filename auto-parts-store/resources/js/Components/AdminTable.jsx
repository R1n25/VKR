import React from 'react';

export default function AdminTable({
    headers = [],
    data = [],
    emptyMessage = 'Нет данных для отображения',
    className = '',
    renderRow = null,
    hover = true,
    striped = false,
    compact = false,
    headerClassName = '',
    bodyClassName = '',
    rowClassName = '',
    cellClassName = '',
}) {
    // Стили для разных размеров таблицы
    const sizeClasses = compact 
        ? { 
            header: 'px-2 py-2 text-xs',
            cell: 'px-2 py-2 text-xs' 
        } 
        : { 
            header: 'px-3 py-2 text-xs',
            cell: 'px-3 py-3 text-sm' 
        };

    return (
        <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm ${className}`}>
            <table className="w-full divide-y divide-gray-200">
                <thead className="bg-[#eef2ff]">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={`${sizeClasses.header} text-left font-medium text-[#2a4075] uppercase tracking-wider ${headerClassName}`}
                                {...(header.props || {})}
                            >
                                {header.content || header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
                    {data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <tr 
                                key={rowIndex} 
                                className={`
                                    ${hover ? 'hover:bg-gray-50' : ''} 
                                    ${striped && rowIndex % 2 ? 'bg-gray-50' : ''}
                                    transition-colors duration-150
                                    ${rowClassName}
                                `}
                            >
                                {renderRow 
                                    ? renderRow(item, rowIndex) 
                                    : Object.values(item).map((cell, cellIndex) => (
                                        <td 
                                            key={cellIndex} 
                                            className={`${sizeClasses.cell} text-gray-500 ${cellClassName}`}
                                        >
                                            {cell}
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td 
                                colSpan={headers.length} 
                                className={`${sizeClasses.cell} text-center text-gray-500`}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
} 