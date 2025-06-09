import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ConfirmationModal from '@/Components/ConfirmationModal';
import axios from 'axios';

export default function Show({ auth, suggestion, analogTypeText }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sparePartData, setSparePartData] = useState(null);
    const [analogSparePartData, setAnalogSparePartData] = useState(null);
    
    // Отладка данных
    console.log('Suggestion data:', suggestion);
    console.log('Original part:', suggestion.sparePart);
    console.log('Analog part:', suggestion.analogSparePart);
    console.log('Car model:', suggestion.carModel);
    console.log('Suggestion type:', suggestion.suggestion_type);
    console.log('Engine:', suggestion.engine);
    
    // Загружаем данные о запчастях при монтировании компонента
    useEffect(() => {
        // Если sparePart не загружен, но есть ID, сначала проверяем существование запчасти
        if (!suggestion.sparePart && suggestion.spare_part_id) {
            // Сначала проверяем, существует ли запчасть
            fetch(`/api/spare-parts/${suggestion.spare_part_id}/exists`)
                .then(response => response.json())
                .then(data => {
                    console.log('Spare part exists check:', data);
                    
                    if (data.exists) {
                        // Если запчасть существует, загружаем полные данные
                        fetch(`/api/spare-parts/${suggestion.spare_part_id}/full`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Ошибка загрузки данных о запчасти');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Loaded spare part data:', data);
                                setSparePartData(data);
                            })
                            .catch(error => {
                                console.error('Ошибка при загрузке данных о запчасти:', error);
                            });
                    } else {
                        console.warn(`Запчасть с ID ${suggestion.spare_part_id} не существует в базе данных`);
                    }
                })
                .catch(error => {
                    console.error('Ошибка при проверке существования запчасти:', error);
                });
        }
        
        // Если analogSparePart не загружен, но есть ID, сначала проверяем существование запчасти-аналога
        if (!suggestion.analogSparePart && suggestion.analog_spare_part_id) {
            // Сначала проверяем, существует ли запчасть-аналог
            fetch(`/api/spare-parts/${suggestion.analog_spare_part_id}/exists`)
                .then(response => response.json())
                .then(data => {
                    console.log('Analog spare part exists check:', data);
                    
                    if (data.exists) {
                        // Если запчасть-аналог существует, загружаем полные данные
                        fetch(`/api/spare-parts/${suggestion.analog_spare_part_id}/full`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Ошибка загрузки данных о запчасти-аналоге');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Loaded analog spare part data:', data);
                                setAnalogSparePartData(data);
                            })
                            .catch(error => {
                                console.error('Ошибка при загрузке данных о запчасти-аналоге:', error);
                            });
                    } else {
                        console.warn(`Запчасть-аналог с ID ${suggestion.analog_spare_part_id} не существует в базе данных`);
                    }
                })
                .catch(error => {
                    console.error('Ошибка при проверке существования запчасти-аналога:', error);
                });
        }
    }, [suggestion]);
    
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
        
        // Добавляем отладочную информацию
        console.log('Approving suggestion:', suggestion.id);
        
        // Закрываем модальное окно, так как теперь у нас есть отдельная форма для одобрения
        setIsApproving(false);
    };
    
    const handleReject = (e) => {
        e.preventDefault();
        
        // Добавляем отладочную информацию
        console.log('Rejecting suggestion:', suggestion.id);
        
        // Отправляем форму для POST-запроса
        document.getElementById('rejectForm').submit();
    };
    
    const handleDelete = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('_method', 'DELETE');
        
        fetch(route('admin.suggestions.destroy', suggestion.id), {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = route('admin.suggestions.inertia');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };
    
    // Определяем, какие данные о запчасти использовать (из отношения или из загруженных данных)
    const actualSparePart = suggestion.sparePart || sparePartData;
    const actualAnalogSparePart = suggestion.analogSparePart || analogSparePartData;
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложение #{suggestion.id}</h2>}
        >
            <Head title={`Предложение #${suggestion.id}`} />
            
            <div className="p-4">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <span className="text-lg font-medium">Информация о предложении</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Link href={route('admin.suggestions.inertia')} className="text-blue-600 hover:text-blue-900 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Назад к списку
                                </Link>
                                
                                <button
                                    onClick={() => setIsDeleting(true)}
                                    className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4">
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
                                {actualSparePart ? (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Название:</p>
                                            <p className="font-semibold">{actualSparePart.name}</p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Артикул:</p>
                                            <p className="font-semibold">{actualSparePart.part_number}</p>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-gray-600">Производитель:</h3>
                                            <p className="font-semibold">{actualSparePart.manufacturer}</p>
                                        </div>
                                        
                                        {/* Совместимость с автомобилем */}
                                        <div className="mt-6 border-t pt-4">
                                            <h3 className="text-base font-semibold mb-3">Совместимость с автомобилем:</h3>
                                            
                                            {(suggestion.carModel || suggestion.car_model_data) && (
                                                <div className="bg-blue-50 p-3 rounded-md">
                                                    {/* Информация о бренде */}
                                                    <div className="mb-2">
                                                        <span className="text-sm text-gray-600">Бренд:</span>{' '}
                                                        <span className="font-semibold">
                                                            {suggestion.carModel?.brand?.name || 
                                                             suggestion.car_model_data?.brand?.name || 
                                                             'Не указан'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Информация о модели */}
                                                    <div className="mb-2">
                                                        <span className="text-sm text-gray-600">Модель:</span>{' '}
                                                        <span className="font-semibold">
                                                            {suggestion.carModel?.name || suggestion.car_model_data?.name}
                                                            {(suggestion.carModel?.generation || suggestion.car_model_data?.generation) && 
                                                                ` (${suggestion.carModel?.generation || suggestion.car_model_data?.generation})`}
                                                        </span>
                                                    </div>
                                                    
                                                                                                            {/* Информация о двигателе */}
                                                        {suggestion.engine && (
                                                            <div className="mb-2">
                                                                <span className="text-sm text-gray-600">Двигатель:</span>{' '}
                                                                <span className="font-semibold">
                                                                    {suggestion.engine.volume && `${suggestion.engine.volume}L `}
                                                                    {suggestion.engine.power && `${suggestion.engine.power} л.с. `}
                                                                    {suggestion.engine.fuel_type && `(${suggestion.engine.fuel_type})`}
                                                                </span>
                                                                {suggestion.engine.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {suggestion.engine.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                            
                                            {!suggestion.carModel && !suggestion.car_model_data && suggestion.car_model_id && (
                                                <div className="mb-2 bg-yellow-50 p-2 rounded">
                                                    <p className="text-sm font-medium text-yellow-700 mb-1">
                                                        Информация о модели загружается напрямую:
                                                    </p>
                                                    <p className="text-sm text-yellow-800">
                                                        ID модели: {suggestion.car_model_id}
                                                    </p>
                                                    <button 
                                                        onClick={() => window.location.reload()}
                                                        className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                                                    >
                                                        Обновить страницу
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : suggestion.spare_part_id ? (
                                    <div className="p-3 bg-yellow-50 rounded-md">
                                        <p className="text-yellow-800">
                                            <span className="font-semibold">ID запчасти:</span> {suggestion.spare_part_id}
                                        </p>
                                        <p className="text-yellow-800 mt-2">Проверка наличия запчасти в базе данных...</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Информация о запчасти не найдена</p>
                                )}
                            </div>
                        </div>
                        
                        {suggestion.suggestion_type === 'analog' && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Информация о запчасти-аналоге</h3>
                                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                    {actualAnalogSparePart ? (
                                        <>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Название:</p>
                                                <p className="font-semibold">{actualAnalogSparePart.name}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Артикул:</p>
                                                <p className="font-semibold">{actualAnalogSparePart.part_number}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Производитель:</p>
                                                <p className="font-semibold">{actualAnalogSparePart.manufacturer}</p>
                                            </div>
                                        </>
                                    ) : suggestion.analog_spare_part_id ? (
                                        <div className="p-3 bg-yellow-50 rounded-md">
                                            <p className="text-yellow-800">
                                                <span className="font-semibold">ID запчасти-аналога:</span> {suggestion.analog_spare_part_id}
                                            </p>
                                            <p className="text-yellow-800 mt-2">Проверка наличия запчасти-аналога в базе данных...</p>
                                        </div>
                                    ) : suggestion.data?.analog_article ? (
                                        <>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Артикул:</p>
                                                <p className="font-semibold">{suggestion.data.analog_article}</p>
                                            </div>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">Производитель:</p>
                                                <p className="font-semibold">{suggestion.data.analog_brand || 'Не указан'}</p>
                                            </div>
                                            {suggestion.data.analog_description && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">Описание:</p>
                                                    <p className="font-semibold">{suggestion.data.analog_description}</p>
                                                </div>
                                            )}
                                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md">
                                                <p className="text-sm">Запчасть-аналог еще не существует в базе данных и будет создана при одобрении.</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">Информация о запчасти-аналоге не найдена</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Содержание предложения</h3>
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                {suggestion.suggestion_type === 'analog' && (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Тип аналога:</p>
                                            <p className="font-semibold">{analogTypeText}</p>
                                        </div>
                                    </>
                                )}
                                
                                {/* Информация о совместимости перенесена в блок запчасти */}
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Комментарий пользователя:</p>
                                    <p className="font-semibold">{suggestion.comment || 'Нет комментария'}</p>
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
                                <form method="POST" action={route('admin.suggestions.approve', suggestion.id)}>
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Одобрить
                                    </button>
                                </form>
                                
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Отклонить
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Модальное окно для одобрения */}
            <ConfirmationModal
                isOpen={isApproving}
                onClose={() => setIsApproving(false)}
                onConfirm={handleApprove}
                title="Подтверждение одобрения"
                confirmText="Одобрить"
                confirmButtonClass="bg-green-600 hover:bg-green-700"
            >
                <p className="mb-4">Вы уверены, что хотите одобрить это предложение?</p>
                
                {suggestion.suggestion_type === 'analog' && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-4">
                        <p className="font-medium">Внимание!</p>
                        <p>После одобрения будет создана связь между запчастями как аналогов.</p>
                    </div>
                )}
                
                {suggestion.suggestion_type === 'compatibility' && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md mb-4">
                        <p className="font-medium">Внимание!</p>
                        <p>После одобрения будет создана связь совместимости между запчастью и автомобилем.</p>
                    </div>
                )}
            </ConfirmationModal>
            
            {/* Модальное окно для отклонения */}
            <ConfirmationModal
                isOpen={isRejecting}
                onClose={() => setIsRejecting(false)}
                onConfirm={handleReject}
                title="Отклонение предложения"
                confirmText="Отклонить"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <form id="rejectForm" method="POST" action={route('admin.suggestions.reject', suggestion.id)}>
                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                    
                    <p className="mb-4">Укажите причину отклонения предложения:</p>
                    <textarea
                        name="admin_comment"
                        value={data.admin_comment}
                        onChange={e => setData('admin_comment', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows="3"
                        placeholder="Причина отклонения"
                    ></textarea>
                    {errors.admin_comment && <div className="text-red-500 text-sm mt-1">{errors.admin_comment}</div>}
                </form>
            </ConfirmationModal>
            
            {/* Модальное окно для удаления */}
            <ConfirmationModal
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={handleDelete}
                title="Подтверждение удаления"
                confirmText="Удалить"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Вы уверены, что хотите удалить это предложение? Это действие нельзя отменить.</p>
            </ConfirmationModal>
        </AdminLayout>
    );
} 