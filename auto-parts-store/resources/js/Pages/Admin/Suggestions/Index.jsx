import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import ConfirmationModal from '@/Components/ConfirmationModal';

export default function Index({ auth, suggestions }) {
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        admin_comment: '',
    });

    // Фильтрация предложений
    const filteredSuggestions = suggestions.filter(suggestion => {
        let matchesStatus = true;
        let matchesType = true;
        let matchesSearch = true;

        if (statusFilter && statusFilter !== 'all') {
            matchesStatus = suggestion.status === statusFilter;
        }

        if (typeFilter && typeFilter !== 'all') {
            matchesType = suggestion.suggestion_type === typeFilter;
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            matchesSearch = 
                (suggestion.user?.name?.toLowerCase().includes(lowerCaseQuery)) ||
                (suggestion.sparePart?.name?.toLowerCase().includes(lowerCaseQuery)) ||
                (suggestion.sparePart?.part_number?.toLowerCase().includes(lowerCaseQuery)) ||
                (suggestion.analogSparePart?.part_number?.toLowerCase().includes(lowerCaseQuery));
        }

        return matchesStatus && matchesType && matchesSearch;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Ожидает';
            case 'approved':
                return 'Одобрено';
            case 'rejected':
                return 'Отклонено';
            default:
                return status;
        }
    };

    const getTypeText = (type) => {
        switch (type) {
            case 'analog':
                return 'Аналог';
            case 'compatibility':
                return 'Совместимость';
            default:
                return type;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format(date, 'dd.MM.yyyy HH:mm');
    };
    
    const handleApprove = () => {
        if (!selectedSuggestion) return;
        
        post(route('admin.suggestions.approve', selectedSuggestion.id), {
            onSuccess: () => {
                setIsApproving(false);
                setSelectedSuggestion(null);
                reset();
                window.location.reload();
            },
        });
    };
    
    const handleReject = () => {
        if (!selectedSuggestion) return;
        
        post(route('admin.suggestions.reject', selectedSuggestion.id), {
            onSuccess: () => {
                setIsRejecting(false);
                setSelectedSuggestion(null);
                reset();
                window.location.reload();
            },
        });
    };
    
    const handleDelete = () => {
        if (!selectedSuggestion) return;
        
        const formData = new FormData();
        formData.append('_method', 'DELETE');
        
        fetch(route('admin.suggestions.destroy', selectedSuggestion.id), {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            }
        }).then(response => {
            if (response.ok) {
                setIsDeleting(false);
                setSelectedSuggestion(null);
                window.location.reload();
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложения пользователей</h2>}
        >
            <Head title="Предложения пользователей" />

            <div className="p-4">
                <div className="flex flex-wrap md:flex-row items-center gap-4 mb-4">
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                        <input 
                            type="text" 
                            placeholder="Поиск..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Все статусы</option>
                            <option value="pending">Ожидает</option>
                            <option value="approved">Одобрено</option>
                            <option value="rejected">Отклонено</option>
                        </select>
                    </div>
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                        <select 
                            value={typeFilter} 
                            onChange={e => setTypeFilter(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Все типы</option>
                            <option value="analog">Аналог</option>
                            <option value="compatibility">Совместимость</option>
                        </select>
                    </div>
                    <div className="w-full md:w-auto flex-grow md:flex-grow-0">
                        <button 
                            onClick={() => {
                                setStatusFilter('');
                                setTypeFilter('');
                                setSearchQuery('');
                            }}
                            className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Сбросить
                        </button>
                    </div>
                </div>
                
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Запчасть</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSuggestions.length > 0 ? (
                                    filteredSuggestions.map(suggestion => (
                                        <tr key={suggestion.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{suggestion.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{suggestion.user?.name || '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getTypeText(suggestion.suggestion_type)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {suggestion.sparePart ? (
                                                    <div>
                                                        <div>{suggestion.sparePart.part_number}</div>
                                                        <div className="text-xs">{suggestion.sparePart.name}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(suggestion.status)}`}>
                                                    {getStatusText(suggestion.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(suggestion.created_at)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('admin.suggestions.show-inertia', suggestion.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Просмотр"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    {suggestion.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSuggestion(suggestion);
                                                                    setIsApproving(true);
                                                                }}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Одобрить"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSuggestion(suggestion);
                                                                    setIsRejecting(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Отклонить"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSuggestion(suggestion);
                                                            setIsDeleting(true);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Удалить"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-3 text-sm text-center text-gray-500">
                                            Нет предложений, соответствующих фильтрам
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Модальное окно для одобрения */}
            <ConfirmationModal
                isOpen={isApproving && selectedSuggestion}
                onClose={() => {
                    setIsApproving(false);
                    setSelectedSuggestion(null);
                }}
                onConfirm={handleApprove}
                title="Подтверждение одобрения"
                confirmText="Одобрить"
                confirmButtonClass="bg-green-600 hover:bg-green-700"
            >
                <p className="mb-4">Вы уверены, что хотите одобрить предложение #{selectedSuggestion?.id}?</p>
                
                {selectedSuggestion?.suggestion_type === 'analog' && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-4">
                        <p className="font-medium">Внимание!</p>
                        <p>После одобрения будет создана связь между запчастями как аналогов.</p>
                    </div>
                )}
                
                {selectedSuggestion?.suggestion_type === 'compatibility' && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-4">
                        <p className="font-medium">Внимание!</p>
                        <p>После одобрения будет создана связь совместимости между запчастью и автомобилем.</p>
                    </div>
                )}
            </ConfirmationModal>
            
            {/* Модальное окно для отклонения */}
            <ConfirmationModal
                isOpen={isRejecting && selectedSuggestion}
                onClose={() => {
                    setIsRejecting(false);
                    setSelectedSuggestion(null);
                    reset();
                }}
                onConfirm={handleReject}
                title="Отклонение предложения"
                confirmText="Отклонить"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p className="mb-4">Укажите причину отклонения предложения #{selectedSuggestion?.id}:</p>
                <textarea
                    value={data.admin_comment}
                    onChange={e => setData('admin_comment', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    rows="3"
                    placeholder="Причина отклонения"
                ></textarea>
                {errors.admin_comment && <div className="text-red-500 text-sm mt-1">{errors.admin_comment}</div>}
            </ConfirmationModal>
            
            {/* Модальное окно для удаления */}
            <ConfirmationModal
                isOpen={isDeleting && selectedSuggestion}
                onClose={() => {
                    setIsDeleting(false);
                    setSelectedSuggestion(null);
                }}
                onConfirm={handleDelete}
                title="Подтверждение удаления"
                confirmText="Удалить"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Вы уверены, что хотите удалить предложение #{selectedSuggestion?.id}? Это действие нельзя отменить.</p>
            </ConfirmationModal>
        </AdminLayout>
    );
} 