import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ConfirmationModal from '@/Components/ConfirmationModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Show({ auth, suggestion, analogTypeText }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sparePartData, setSparePartData] = useState(null);
    const [analogSparePartData, setAnalogSparePartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sparePartLoading, setSparePartLoading] = useState(false);
    const [analogSparePartLoading, setAnalogSparePartLoading] = useState(false);
    const [sparePart, setSparePart] = useState(suggestion.sparePart || null);
    const [analogSparePart, setAnalogSparePart] = useState(suggestion.analogSparePart || null);
    const [carModel, setCarModel] = useState(suggestion.carModel || null);
    const [carModelLoading, setCarModelLoading] = useState(false);
    const [carEngine, setCarEngine] = useState(suggestion.carEngine || null);
    const [carEngineLoading, setCarEngineLoading] = useState(false);
    
    // Отладка данных
    console.log('Suggestion data:', suggestion);
    console.log('Original part:', suggestion.sparePart);
    console.log('Analog part:', suggestion.analogSparePart);
    console.log('Car model:', suggestion.carModel);
    console.log('Car engine:', suggestion.carEngine);
    console.log('Suggestion type:', suggestion.suggestion_type);
    console.log('Engine:', suggestion.engine);
    console.log('Suggestion data object:', suggestion.data);
    
    // Загружаем данные о запчастях при монтировании компонента
    useEffect(() => {
        // Загрузка данных о запчасти, если есть ID, но нет данных
        if (suggestion.spare_part_id && !sparePart) {
            loadSparePart(suggestion.spare_part_id);
        }
        
        // Загрузка данных об аналоге, если есть ID, но нет данных
        if (suggestion.suggestion_type === 'analog') {
            // Проверяем наличие ID аналога в разных местах
            const analogId = suggestion.analog_spare_part_id || 
                            (suggestion.data && suggestion.data.analog_spare_part_id);
            
            if (analogId && !analogSparePart) {
                loadAnalogSparePart(analogId);
            }
        }
        
        // Загрузка данных о модели автомобиля, если есть ID, но нет данных
        if (suggestion.car_model_id && !carModel) {
            loadCarModel(suggestion.car_model_id);
        }
        
        // Загрузка данных о двигателе автомобиля, если есть ID, но нет данных
        if (suggestion.car_engine_id && !carEngine) {
            loadCarEngine(suggestion.car_engine_id);
        }
    }, [suggestion]);
    
    // Загружаем данные о запчасти
    const loadSparePart = async (id) => {
        setSparePartLoading(true);
        try {
            const response = await axios.get(`/api/spare-parts/${id}/exists`);
            const { exists, spare_part } = response.data;
            
            if (exists && spare_part) {
                console.log('Loaded spare part data:', spare_part);
                setSparePart(spare_part);
            } else {
                console.error('Spare part not found in API response');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных о запчасти:', error);
        } finally {
            setSparePartLoading(false);
        }
    };
    
    // Загружаем данные об аналоге запчасти
    const loadAnalogSparePart = async (id) => {
        setAnalogSparePartLoading(true);
        try {
            const response = await axios.get(`/api/spare-parts/${id}/exists`);
            const { exists, spare_part } = response.data;
            
            if (exists && spare_part) {
                console.log('Loaded analog spare part data:', spare_part);
                setAnalogSparePart(spare_part);
            } else {
                console.error('Analog spare part not found in API response');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных об аналоге запчасти:', error);
        } finally {
            setAnalogSparePartLoading(false);
        }
    };
    
    // Загружаем данные о модели автомобиля
    const loadCarModel = async (id) => {
        setCarModelLoading(true);
        try {
            const response = await axios.get(`/api/car-models/${id}`);
            if (response.data.status === 'success' && response.data.data) {
                console.log('Loaded car model data:', response.data.data);
                setCarModel(response.data.data);
            } else {
                console.error('Car model not found in API response');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных о модели автомобиля:', error);
        } finally {
            setCarModelLoading(false);
        }
    };
    
    // Загружаем данные о двигателе автомобиля
    const loadCarEngine = async (id) => {
        setCarEngineLoading(true);
        try {
            const response = await axios.get(`/api/car-engines/${id}`);
            if (response.data.status === 'success' && response.data.data) {
                console.log('Loaded car engine data:', response.data.data);
                setCarEngine(response.data.data);
            } else {
                console.error('Car engine not found in API response');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных о двигателе автомобиля:', error);
        } finally {
            setCarEngineLoading(false);
        }
    };
    
    const { data, setData, post, processing, reset, errors } = useForm({
        admin_comment: '',
    });
    
    const getSuggestionTypeText = (type) => {
        const types = {
            'compatibility': 'Совместимость',
            'analog': 'Аналог',
            'price': 'Цена',
            'info': 'Информация'
        };
        return types[type] || type;
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
    
    const handleApprove = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/admin/suggestions/${suggestion.id}/approve`, {
                admin_comment: data.admin_comment
            });
            
            if (response.data.success) {
                toast.success('Предложение успешно одобрено');
                window.location.href = url('admin/suggestions');
            } else {
                toast.error('Ошибка при одобрении предложения: ' + (response.data.message || 'Неизвестная ошибка'));
                setLoading(false);
            }
        } catch (error) {
            console.error('Ошибка при одобрении предложения:', error);
            toast.error('Ошибка при одобрении предложения: ' + (error.response?.data?.message || 'Неизвестная ошибка'));
            setLoading(false);
        }
    };
    
    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/admin/suggestions/${suggestion.id}/reject`, {
                admin_comment: data.admin_comment
            });
            
            if (response.data.success) {
                toast.success('Предложение отклонено');
                window.location.href = url('admin/suggestions');
            } else {
                toast.error('Ошибка при отклонении предложения: ' + (response.data.message || 'Неизвестная ошибка'));
                setLoading(false);
            }
        } catch (error) {
            console.error('Ошибка при отклонении предложения:', error);
            toast.error('Ошибка при отклонении предложения: ' + (error.response?.data?.message || 'Неизвестная ошибка'));
            setLoading(false);
        }
    };
    
    const handleDelete = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('_method', 'DELETE');
        
        fetch(url('admin/suggestions') + '/' + suggestion.id, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        }).then(response => {
            if (response.ok) {
                setIsDeleting(false);
                // Перенаправление на список предложений
                window.location.href = url('admin/suggestions');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };
    
    // Определяем, какие данные о запчасти использовать (из отношения или из загруженных данных)
    const actualSparePart = suggestion.sparePart || sparePart;
    const actualAnalogSparePart = suggestion.analogSparePart || analogSparePart;
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложение #{suggestion.id}</h2>}
        >
            <Head title={`Предложение #${suggestion.id}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Заголовок и статус */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {getSuggestionTypeText(suggestion.suggestion_type)}
                                </h2>
                                <div className="flex items-center mt-2">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(suggestion.status)}`}>
                                        {getStatusText(suggestion.status)}
                                    </span>
                                    <span className="ml-4 text-sm text-gray-500">
                                        Создано: {formatDate(suggestion.created_at)}
                                    </span>
                                    {suggestion.approved_at && (
                                        <span className="ml-4 text-sm text-gray-500">
                                            Обработано: {formatDate(suggestion.approved_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Link
                                    href={url('admin/suggestions')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:border-gray-500 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Назад к списку
                                </Link>
                                <button
                                    onClick={() => setIsDeleting(true)}
                                    className="ml-2 inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-800 focus:outline-none focus:border-red-700 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                        
                        {/* Информация о пользователе */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Информация о пользователе</h3>
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Имя:</p>
                                    <p className="font-semibold">{suggestion.user?.name || 'Неизвестный пользователь'}</p>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Email:</p>
                                    <p className="font-semibold">{suggestion.user?.email || 'Email не указан'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Дата регистрации:</p>
                                    <p className="font-semibold">{suggestion.user?.created_at ? formatDate(suggestion.user.created_at) : 'Неизвестно'}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Информация о запчасти */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Информация о запчасти</h3>
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                                {actualSparePart ? (
                                    <div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Название:</p>
                                            <p className="font-semibold">{actualSparePart.name}</p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Артикул:</p>
                                            <p className="font-semibold">{actualSparePart.part_number}</p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Производитель:</p>
                                            <p className="font-semibold">{actualSparePart.manufacturer}</p>
                                        </div>
                                        
                                        {/* Информация о совместимости для предложений совместимости */}
                                        {suggestion.suggestion_type === 'compatibility' && (
                                            <div className="mt-4 border-t pt-4">
                                                <h4 className="text-md font-semibold mb-3">Информация о совместимости</h4>
                                                
                                                {(suggestion.carModel || suggestion.car_model_data || carModel) && (
                                                    <div className="bg-blue-50 p-3 rounded-md">
                                                        {/* Информация о бренде и модели */}
                                                        <div className="mb-2">
                                                            <span className="text-sm text-gray-600 font-semibold">Автомобиль:</span>{' '}
                                                            <span className="font-semibold">
                                                                {suggestion.carModel?.brand?.name || 
                                                                suggestion.car_model_data?.brand?.name || 
                                                                carModel?.brand_name || 'Неизвестный бренд'}{' '}
                                                                {suggestion.carModel?.name || 
                                                                suggestion.car_model_data?.name || 
                                                                carModel?.name || 'Неизвестная модель'}
                                                                {(suggestion.carModel?.generation || 
                                                                  suggestion.car_model_data?.generation || 
                                                                  carModel?.generation) && 
                                                                    ` (${suggestion.carModel?.generation || 
                                                                        suggestion.car_model_data?.generation || 
                                                                        carModel?.generation})`}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Информация о двигателе */}
                                                        {(suggestion.engine || carEngine) && (
                                                            <div className="mb-2">
                                                                <span className="text-sm text-gray-600 font-semibold">Двигатель:</span>{' '}
                                                                <span className="font-semibold">
                                                                    {carEngine ? (
                                                                        <>
                                                                            {carEngine.name}
                                                                            {carEngine.volume && ` ${carEngine.volume}л`}
                                                                            {carEngine.power && ` ${carEngine.power}л.с.`}
                                                                            {carEngine.type && ` (${carEngine.type})`}
                                                                        </>
                                                                    ) : suggestion.engine ? (
                                                                        <>
                                                                            {suggestion.engine.volume && `${suggestion.engine.volume}L `}
                                                                            {suggestion.engine.power && `${suggestion.engine.power} л.с. `}
                                                                            {suggestion.engine.fuel_type && `(${suggestion.engine.fuel_type})`}
                                                                            {suggestion.engine.description && (
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {suggestion.engine.description}
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        'Не указан'
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {!suggestion.carModel && !suggestion.car_model_data && !carModel && suggestion.car_model_id && (
                                                    <div className="mb-2 bg-yellow-50 p-2 rounded">
                                                        <p className="text-sm font-medium text-yellow-700 mb-1">
                                                            Информация о модели загружается напрямую:
                                                        </p>
                                                        <p className="text-sm text-yellow-800">
                                                            {carModelLoading ? 'Загрузка данных о модели...' : (
                                                                `ID модели: ${suggestion.car_model_id}`
                                                            )}
                                                        </p>
                                                        {!carModel && !carModelLoading && (
                                                            <button 
                                                                onClick={() => loadCarModel(suggestion.car_model_id)}
                                                                className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                                                            >
                                                                Загрузить данные о модели
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {!suggestion.engine && !carEngine && suggestion.car_engine_id && (
                                                    <div className="mb-2 bg-blue-50 p-2 rounded">
                                                        <p className="text-sm font-medium text-blue-700 mb-1">
                                                            Информация о двигателе загружается напрямую:
                                                        </p>
                                                        <p className="text-sm text-blue-800">
                                                            {carEngineLoading ? 'Загрузка данных о двигателе...' : (
                                                                `ID двигателя: ${suggestion.car_engine_id}`
                                                            )}
                                                        </p>
                                                        {!carEngine && !carEngineLoading && (
                                                            <button 
                                                                onClick={() => loadCarEngine(suggestion.car_engine_id)}
                                                                className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                                                            >
                                                                Загрузить данные о двигателе
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                
                                        {/* Информация о категории - убираем из блока совместимости, так как она уже отображается выше */}
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
                                            <p className="text-yellow-800 mt-2">
                                                {analogSparePartLoading ? 'Загрузка данных о запчасти-аналоге...' : 'Запчасть-аналог не найдена в базе данных'}
                                            </p>
                                            <button 
                                                onClick={() => loadAnalogSparePart(suggestion.analog_spare_part_id)}
                                                className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                                                disabled={analogSparePartLoading}
                                            >
                                                {analogSparePartLoading ? 'Загрузка...' : 'Попробовать загрузить снова'}
                                            </button>
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
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Отклонить
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Одобрить
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
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