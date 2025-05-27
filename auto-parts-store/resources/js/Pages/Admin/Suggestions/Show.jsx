import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Show({ auth, suggestion }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        admin_comment: '',
    });
    
    const getSuggestionTypeText = (type) => {
        switch (type) {
            case 'analog': return 'Аналог';
            case 'compatibility': return 'Совместимость';
            default: return 'Неизвестно';
        }
    };
    
    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Ожидает';
            case 'approved': return 'Одобрено';
            case 'rejected': return 'Отклонено';
            default: return 'Неизвестно';
        }
    };
    
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
    };
    
    const handleApprove = (e) => {
        e.preventDefault();
        post(route('admin.suggestions.approve', suggestion.id), {
            onSuccess: () => {
                setIsApproving(false);
                reset();
            },
        });
    };
    
    const handleReject = (e) => {
        e.preventDefault();
        post(route('admin.suggestions.reject', suggestion.id), {
            onSuccess: () => {
                setIsRejecting(false);
                reset();
            },
        });
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр предложения #{suggestion.id}</h2>}
        >
            <Head title={`Предложение #${suggestion.id}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <Link href={route('admin.suggestions.index')} className="text-indigo-600 hover:text-indigo-900">
                                    &larr; Назад к списку предложений
                                </Link>
                            </div>
                            
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">ID:</p>
                                            <p className="font-semibold">{suggestion.id}</p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Тип предложения:</p>
                                            <p className="font-semibold">{getSuggestionTypeText(suggestion.suggestion_type)}</p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Статус:</p>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(suggestion.status)}`}>
                                                {getStatusText(suggestion.status)}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Дата создания:</p>
                                            <p className="font-semibold">{formatDate(suggestion.created_at)}</p>
                                        </div>
                                        {suggestion.approved_at && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Дата одобрения/отклонения:</p>
                                                <p className="font-semibold">{formatDate(suggestion.approved_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Информация о пользователе</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                        {suggestion.user ? (
                                            <>
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">Имя:</p>
                                                    <p className="font-semibold">{suggestion.user.name}</p>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">Email:</p>
                                                    <p className="font-semibold">{suggestion.user.email}</p>
                                                </div>
                                                <div>
                                                    <Link 
                                                        href={route('admin.users.edit', suggestion.user.id)} 
                                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Профиль пользователя
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">Информация о пользователе не найдена</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Информация о запчасти</h3>
                                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                    {suggestion.spare_part ? (
                                        <>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Название:</p>
                                                <p className="font-semibold">{suggestion.spare_part.name}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Артикул:</p>
                                                <p className="font-semibold">{suggestion.spare_part.article_number}</p>
                                            </div>
                                            <div>
                                                <Link 
                                                    href={route('admin.spare-parts.show', suggestion.spare_part.id)} 
                                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Посмотреть запчасть
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">Информация о запчасти не найдена</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Содержание предложения</h3>
                                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                    {suggestion.suggestion_type === 'analog' && (
                                        <>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Предлагаемый аналог (артикул):</p>
                                                <p className="font-semibold">{suggestion.analog_article_number}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Производитель аналога:</p>
                                                <p className="font-semibold">{suggestion.analog_manufacturer}</p>
                                            </div>
                                        </>
                                    )}
                                    
                                    {suggestion.suggestion_type === 'compatibility' && (
                                        <>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Совместимая модель:</p>
                                                <p className="font-semibold">{suggestion.compatible_model}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Годы выпуска:</p>
                                                <p className="font-semibold">{suggestion.year_range}</p>
                                            </div>
                                        </>
                                    )}
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Комментарий пользователя:</p>
                                        <p className="font-semibold">{suggestion.user_comment || 'Нет комментария'}</p>
                                    </div>
                                    
                                    {suggestion.admin_comment && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Комментарий администратора:</p>
                                            <p className="font-semibold">{suggestion.admin_comment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {suggestion.status === 'pending' && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setIsApproving(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Одобрить
                                    </button>
                                    <button
                                        onClick={() => setIsRejecting(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Отклонить
                                    </button>
                                </div>
                            )}
                            
                            {isApproving && (
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                        <h3 className="text-lg font-semibold mb-4">Подтверждение одобрения</h3>
                                        <p className="mb-4">Вы уверены, что хотите одобрить это предложение?</p>
                                        
                                        <form onSubmit={handleApprove}>
                                            <div className="mb-4">
                                                <label htmlFor="admin_comment" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Комментарий (необязательно)
                                                </label>
                                                <textarea
                                                    id="admin_comment"
                                                    name="admin_comment"
                                                    value={data.admin_comment}
                                                    onChange={(e) => setData('admin_comment', e.target.value)}
                                                    className="w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                                    rows="3"
                                                ></textarea>
                                            </div>
                                            
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsApproving(false);
                                                        reset();
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Отмена
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    {processing ? 'Подождите...' : 'Подтвердить'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                            
                            {isRejecting && (
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                        <h3 className="text-lg font-semibold mb-4">Отклонение предложения</h3>
                                        <p className="mb-4">Пожалуйста, укажите причину отклонения предложения:</p>
                                        
                                        <form onSubmit={handleReject}>
                                            <div className="mb-4">
                                                <label htmlFor="admin_comment" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Комментарий <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    id="admin_comment"
                                                    name="admin_comment"
                                                    value={data.admin_comment}
                                                    onChange={(e) => setData('admin_comment', e.target.value)}
                                                    className="w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                                                    rows="3"
                                                    required
                                                ></textarea>
                                                {errors.admin_comment && <p className="text-red-500 text-sm mt-1">{errors.admin_comment}</p>}
                                            </div>
                                            
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsRejecting(false);
                                                        reset();
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Отмена
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    {processing ? 'Подождите...' : 'Отклонить'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 