import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import ConfirmationModal from '@/Components/ConfirmationModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminTable from '@/Components/AdminTable';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminTextarea from '@/Components/AdminTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';
import DangerButton from '@/Components/DangerButton';
import InfoButton from '@/Components/InfoButton';
import axios from 'axios';

export default function Index({ auth, suggestions }) {
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localSuggestions, setLocalSuggestions] = useState(suggestions);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Функция для отображения уведомления
    const showNotification = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };
    
    const { data, setData, reset, errors } = useForm({
        admin_comment: '',
    });

    // Фильтрация предложений
    const filteredSuggestions = localSuggestions.filter(suggestion => {
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
    
    const handleApprove = async () => {
        if (!selectedSuggestion || processing) return;
        
        setProcessing(true);
        try {
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${selectedSuggestion.id}/approve`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200) {
                // Обновляем локальное состояние
                setLocalSuggestions(localSuggestions.map(suggestion => 
                    suggestion.id === selectedSuggestion.id 
                        ? {...suggestion, status: 'approved', approved_at: new Date().toISOString(), approved_by: auth.user.id} 
                        : suggestion
                ));
                
                setIsApproving(false);
                setSelectedSuggestion(null);
                reset();
                showNotification('Предложение успешно одобрено');
            }
        } catch (error) {
            console.error('Ошибка при одобрении предложения:', error);
            showNotification('Произошла ошибка при одобрении предложения', 'error');
        } finally {
            setProcessing(false);
        }
    };
    
    const handleReject = async () => {
        if (!selectedSuggestion || processing) return;
        
        setProcessing(true);
        try {
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${selectedSuggestion.id}/reject`,
                data: { admin_comment: data.admin_comment || 'Отклонено администратором' },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200) {
                // Обновляем локальное состояние
                setLocalSuggestions(localSuggestions.map(suggestion => 
                    suggestion.id === selectedSuggestion.id 
                        ? {...suggestion, status: 'rejected', approved_at: new Date().toISOString(), approved_by: auth.user.id, admin_comment: data.admin_comment || 'Отклонено администратором'} 
                        : suggestion
                ));
                
                setIsRejecting(false);
                setSelectedSuggestion(null);
                reset();
                showNotification('Предложение успешно отклонено');
            }
        } catch (error) {
            console.error('Ошибка при отклонении предложения:', error);
            showNotification('Произошла ошибка при отклонении предложения', 'error');
        } finally {
            setProcessing(false);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedSuggestion || processing) return;
        
        setProcessing(true);
        try {
            // Для Laravel необходимо отправлять DELETE как POST с параметром _method=DELETE
            const formData = new FormData();
            formData.append('_method', 'DELETE');
            
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${selectedSuggestion.id}`,
                data: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200) {
                // Обновляем локальное состояние
                setLocalSuggestions(localSuggestions.filter(suggestion => suggestion.id !== selectedSuggestion.id));
                
                setIsDeleting(false);
                setSelectedSuggestion(null);
                showNotification('Предложение успешно удалено');
            }
        } catch (error) {
            console.error('Ошибка при удалении предложения:', error);
            showNotification('Произошла ошибка при удалении предложения', 'error');
        } finally {
            setProcessing(false);
        }
    };

    // Функция сброса фильтров
    const handleResetFilters = () => {
        setStatusFilter('');
        setTypeFilter('');
        setSearchQuery('');
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложения пользователей</h2>}
        >
            <Head title="Предложения пользователей" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщение об успешном действии */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <AdminCard>
                        <AdminPageHeader 
                            title="Предложения пользователей" 
                            subtitle="Управление предложениями пользователей по аналогам и совместимости запчастей" 
                        />
                        
                        {/* Фильтры */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-[#2a4075]">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Фильтры поиска
                            </h3>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <AdminFormGroup label="Поиск" name="search">
                                        <AdminInput
                                            type="text"
                                            placeholder="Поиск..."
                                            value={searchQuery}
                                            handleChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Статус" name="status">
                                        <AdminSelect
                                            value={statusFilter}
                                            handleChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Все статусы</option>
                                            <option value="pending">Ожидает</option>
                                            <option value="approved">Одобрено</option>
                                            <option value="rejected">Отклонено</option>
                                        </AdminSelect>
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Тип" name="type">
                                        <AdminSelect
                                            value={typeFilter}
                                            handleChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <option value="">Все типы</option>
                                            <option value="analog">Аналог</option>
                                            <option value="compatibility">Совместимость</option>
                                        </AdminSelect>
                                    </AdminFormGroup>
                                </div>
                                
                                <div className="mt-4 flex justify-end">
                                    <SecondaryButton onClick={handleResetFilters} className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Сбросить фильтры
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                        
                        {/* Таблица предложений */}
                        <AdminTable
                            headers={[
                                'ID',
                                'Пользователь',
                                'Тип',
                                'Запчасть',
                                'Статус',
                                'Дата создания',
                                'Действия'
                            ]}
                            data={filteredSuggestions}
                            renderRow={(suggestion) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{suggestion.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{suggestion.user?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {getTypeText(suggestion.suggestion_type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {suggestion.sparePart ? (
                                            <div>
                                                <div>{suggestion.sparePart.part_number}</div>
                                                <div className="text-xs text-gray-400">{suggestion.sparePart.name}</div>
                                                {suggestion.suggestion_type === 'analog' && suggestion.analogSparePart && (
                                                    <div className="mt-1">
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                            Аналог: {suggestion.analogSparePart.part_number}
                                                        </span>
                                                    </div>
                                                )}
                                                {suggestion.suggestion_type === 'analog' && !suggestion.analogSparePart && suggestion.data?.analog_article && (
                                                    <div className="mt-1">
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                            Аналог: {suggestion.data.analog_article}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(suggestion.status)}`}>
                                            {getStatusText(suggestion.status)}
                                        </span>
                                        {suggestion.suggestion_type === 'compatibility' && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {suggestion.brand ? suggestion.brand.name : 
                                                 (suggestion.carModel?.brand ? suggestion.carModel.brand.name : '')}
                                                {suggestion.carModel ? ` ${suggestion.carModel.name}` : ''}
                                                {suggestion.engine ? ` (${suggestion.engine.name})` : ''}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(suggestion.created_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link 
                                                href={url('/admin/suggestions/' + suggestion.id)} 
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <button className="btn btn-sm btn-info">
                                                    <i className="fas fa-eye"></i> Просмотр
                                                </button>
                                            </Link>
                                            
                                            {suggestion.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedSuggestion(suggestion);
                                                            setIsApproving(true);
                                                        }}
                                                        className="btn btn-sm btn-success"
                                                    >
                                                        <i className="fas fa-check"></i> Одобрить
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedSuggestion(suggestion);
                                                            setIsRejecting(true);
                                                        }}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        <i className="fas fa-times"></i> Отклонить
                                                    </button>
                                                </>
                                            )}
                                            
                                            <button 
                                                onClick={() => {
                                                    setSelectedSuggestion(suggestion);
                                                    setIsDeleting(true);
                                                }}
                                                className="btn btn-sm btn-danger"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                            emptyMessage="Нет предложений, соответствующих фильтрам"
                        />
                        
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
                            <AdminTextarea
                                value={data.admin_comment}
                                handleChange={(e) => setData('admin_comment', e.target.value)}
                                rows="3"
                                placeholder="Причина отклонения"
                            />
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
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 