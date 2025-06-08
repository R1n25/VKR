import React from 'react';

export default function DataTable({ 
    headers, 
    data, 
    emptyState = 'Нет данных для отображения', 
    onSort = null,
    sortField = null,
    sortDirection = null,
    className = '' 
}) {
    // Функция для отображения иконки сортировки
    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    header.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                }`}
                                onClick={() => header.sortable && onSort && onSort(header.field)}
                            >
                                <div className="flex items-center">
                                    {header.label}
                                    {header.sortable && getSortIcon(header.field) && (
                                        <span className="ml-1">{getSortIcon(header.field)}</span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {headers.map((header, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {header.render ? header.render(row) : row[header.field]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                {emptyState}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
} 