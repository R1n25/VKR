import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function VinRequestsIndex({ auth, requests }) {
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
        return format(date, 'dd MMMM yyyy HH:mm', { locale: ru });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                        Управление запросами по VIN-коду
                    </h2>
                </div>
            }
        >
            <Head title="Управление VIN-запросами" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Все запросы</h3>
                        </div>

                        {requests.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Запросов по VIN-коду пока нет</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                № запроса
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                VIN-код
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Клиент
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Дата
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Статус
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Обработан
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.map((request) => (
                                            <tr key={request.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {request.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                    {request.vin_code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {request.name}
                                                    <div className="text-xs text-gray-400">{request.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(request.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(request.processed_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <Link
                                                        href={route('admin.vin-requests.show', request.id)}
                                                        className="text-green-600 hover:text-green-900 mr-3"
                                                    >
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
            </div>
        </AuthenticatedLayout>
    );
} 