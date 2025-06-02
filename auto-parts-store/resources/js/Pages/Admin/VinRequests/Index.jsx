import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function VinRequestsIndex({ auth, requests }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Фильтрация запросов по поисковому запросу и статусу
    const filteredRequests = requests.filter(request => {
        let matchesSearch = true;
        let matchesStatus = true;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch = 
                request.vin_code.toLowerCase().includes(query) ||
                request.name.toLowerCase().includes(query) ||
                request.email.toLowerCase().includes(query) ||
                (request.phone && request.phone.includes(query));
        }
        
        if (statusFilter && statusFilter !== 'all') {
            matchesStatus = request.status === statusFilter;
        }
        
        return matchesSearch && matchesStatus;
    });
    
    const getStatusBadge = (status) => {
        const statuses = {
            'new': { text: 'Новый', bg: 'bg-blue-100', textColor: 'text-blue-800' },
            'processing': { text: 'В обработке', bg: 'bg-yellow-100', textColor: 'text-yellow-800' },
            'completed': { text: 'Выполнен', bg: 'bg-green-100', textColor: 'text-green-800' },
            'cancelled': { text: 'Отменён', bg: 'bg-red-100', textColor: 'text-red-800' },
        };
        
        const statusConfig = statuses[status] || statuses['new'];
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.textColor}`}>
                {statusConfig.text}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление запросами по VIN-коду</h2>}
        >
            <Head title="Управление VIN-запросами" />

            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Все запросы</h3>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="w-full md:w-auto">
                                <input 
                                    type="text" 
                                    placeholder="Поиск по VIN, имени или email..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                            <div className="w-full md:w-auto">
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                >
                                    <option value="">Все статусы</option>
                                    <option value="new">Новые</option>
                                    <option value="processing">В обработке</option>
                                    <option value="completed">Выполненные</option>
                                    <option value="cancelled">Отмененные</option>
                                </select>
                            </div>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('');
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Сбросить
                            </button>
                        </div>
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Запросов по VIN-коду не найдено</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            № запроса
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            VIN-код
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Клиент
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Дата
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Статус
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Обработан
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Действия
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {request.id}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                {request.vin_code}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {request.name}
                                                <div className="text-xs text-gray-400">{request.email}</div>
                                                {request.phone && <div className="text-xs text-gray-400">{request.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(request.created_at)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(request.processed_at)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route('admin.vin-requests.show', request.id)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Детали
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 