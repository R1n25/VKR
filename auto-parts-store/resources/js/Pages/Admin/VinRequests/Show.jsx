import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';

export default function VinRequestShow({ auth, request, success }) {
    const [selectedStatus, setSelectedStatus] = useState(request.status);
    
    const { data, setData, patch, processing, errors } = useForm({
        status: request.status,
        admin_notes: request.admin_notes || '',
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
        return format(date, 'dd MMMM yyyy HH:mm', { locale: ru });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.vin-requests.update-status', request.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                        Запрос по VIN-коду #{request.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Запрос #${request.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">
                                        {success}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Информация о запросе</h3>
                                <Link
                                    href={route('admin.vin-requests.index')}
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Информация о клиенте</h4>
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
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">ID пользователя</p>
                                            <p className="text-gray-900">{request.user_id || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Информация об автомобиле</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">VIN-код</p>
                                        <p className="text-gray-900 font-mono font-semibold">{request.vin_code}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Описание запроса</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-line">{request.parts_description}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Обработка запроса</h4>
                                
                                <div className="mb-4">
                                    <InputLabel htmlFor="status" value="Статус запроса" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                    >
                                        <option value="new">Новый</option>
                                        <option value="processing">В обработке</option>
                                        <option value="completed">Выполнен</option>
                                        <option value="cancelled">Отменён</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <InputLabel htmlFor="admin_notes" value="Заметки администратора" />
                                    <Textarea
                                        id="admin_notes"
                                        name="admin_notes"
                                        value={data.admin_notes}
                                        className="mt-1 block w-full"
                                        rows={5}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                    />
                                    <InputError message={errors.admin_notes} className="mt-2" />
                                </div>

                                <div className="flex justify-end">
                                    <PrimaryButton disabled={processing}>
                                        Обновить статус
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 