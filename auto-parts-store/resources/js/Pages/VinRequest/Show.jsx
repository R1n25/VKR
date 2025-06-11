import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function VinRequestShow({ auth, request }) {
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
                        Детали VIN-запроса #{request.id}
                    </h2>
                </div>
            }
        >
            <Head title={`VIN-запрос #${request.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Информация о запросе</h3>
                            <Link
                                href={url('vin-request/user')}
                                className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-300 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Назад к списку
                            </Link>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Номер запроса</p>
                                    <p className="text-gray-900 font-semibold">{request.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Статус</p>
                                    <p>{getStatusBadge(request.status)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Дата создания</p>
                                    <p className="text-gray-900">{formatDate(request.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Дата обработки</p>
                                    <p className="text-gray-900">{formatDate(request.processed_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Информация о клиенте</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Имя</p>
                                        <p className="text-gray-900 font-semibold">{request.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <p className="text-gray-900">{request.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Телефон</p>
                                        <p className="text-gray-900">{request.phone || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Информация об автомобиле</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">VIN-код</p>
                                    <p className="text-gray-900 font-mono font-semibold">{request.vin}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-3">Описание запроса</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-900 whitespace-pre-line">{request.parts_description}</p>
                            </div>
                        </div>

                        {request.admin_notes && (
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Ответ администратора</h4>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-gray-900 whitespace-pre-line">{request.admin_notes}</p>
                                </div>
                            </div>
                        )}

                        {request.status === 'completed' && !request.admin_notes && (
                            <div className="mb-6">
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <p className="text-yellow-800">
                                        Ваш запрос обработан, но администратор не оставил комментариев.
                                        Пожалуйста, свяжитесь с нами по телефону для получения дополнительной информации.
                                    </p>
                                </div>
                            </div>
                        )}

                        {['new', 'processing'].includes(request.status) && (
                            <div className="mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-blue-800">
                                        Ваш запрос находится в обработке. Как только наши специалисты подберут подходящие запчасти,
                                        вы получите уведомление по электронной почте.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 