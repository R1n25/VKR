import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PartCard from '@/Components/Parts/PartCard';
import AddToCartButton from '@/Components/AddToCartButton';
import { formatPrice } from '@/utils/helpers';
import axios from 'axios';

export default function PartShow({ auth, part, similarParts = [], recommendedAnalogs = [], pendingSuggestions = [], pendingAnalogSuggestions = [] }) {
    const [message, setMessage] = useState({ text: '', type: '' });
    const [localPendingSuggestions, setLocalPendingSuggestions] = useState(pendingSuggestions);
    const [localPendingAnalogSuggestions, setLocalPendingAnalogSuggestions] = useState(pendingAnalogSuggestions);
    const [processing, setProcessing] = useState(false);
    const [compatibilities, setCompatibilities] = useState([]);
    const [loadingCompatibilities, setLoadingCompatibilities] = useState(false);
    
    // Получаем информацию о пользователе и его роли
    const isAdmin = auth.user && auth.user.is_admin;

    // Загружаем совместимости при монтировании компонента
    useEffect(() => {
        const fetchCompatibilities = async () => {
            if (!part || !part.id) return;
            
            setLoadingCompatibilities(true);
            try {
                const response = await axios.get(`/api/spare-parts/${part.id}/compatibilities`);
                if (response.data && response.data.success) {
                    setCompatibilities(response.data.data || []);
                }
            } catch (error) {
                console.error('Ошибка при загрузке совместимостей:', error);
            } finally {
                setLoadingCompatibilities(false);
            }
        };
        
        fetchCompatibilities();
    }, [part]);

    // Функция для отображения уведомления
    const showNotification = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    // Нормализуем данные запчасти для компонента AddToCartButton
    const normalizedPart = {
        id: part.id,
        name: part.name,
        part_number: part.part_number,
        price: isAdmin ? part.markup_price : part.price,
        manufacturer: part.manufacturer,
        image_url: part.image_url,
        stock_quantity: part.stock_quantity,
        is_available: part.stock_quantity > 0,
        category: part.category ? part.category.name : '',
        description: part.description
    };

    // Функция для предложения аналога
    const handleSuggestAnalog = () => {
        window.location.href = `/suggestions/analog/${part.id}`;
    };

    // Обработчик для одобрения предложения
    const handleApprove = async (suggestionId, type) => {
        if (processing) return;
        
        setProcessing(true);
        try {
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${suggestionId}/approve`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200) {
                // Удалить одобренное предложение из списка ожидающих
                if (type === 'compatibility') {
                    setLocalPendingSuggestions(localPendingSuggestions.filter(s => s.id !== suggestionId));
                } else if (type === 'analog') {
                    setLocalPendingAnalogSuggestions(localPendingAnalogSuggestions.filter(s => s.id !== suggestionId));
                }
                
                showNotification('Предложение успешно одобрено');
                
                // Обновляем страницу через небольшую задержку, чтобы увидеть результат
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Ошибка при одобрении предложения:', error);
            
            // Детальный вывод ошибки
            let errorMessage = 'Произошла ошибка при одобрении предложения';
            
            if (error.response) {
                // Извлекаем сообщение об ошибке из ответа сервера
                const serverError = error.response.data;
                console.log('Серверная ошибка:', serverError);
                
                if (serverError.message) {
                    errorMessage = `Ошибка сервера: ${serverError.message}`;
                } else if (typeof serverError === 'string') {
                    errorMessage = `Ошибка сервера: ${serverError}`;
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен
                errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.';
            } else {
                // Что-то пошло не так при настройке запроса
                errorMessage = `Ошибка при настройке запроса: ${error.message}`;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setProcessing(false);
        }
    };
    
    // Обработчик для отклонения предложения
    const handleReject = async (suggestionId, type) => {
        if (processing) return;
        
        setProcessing(true);
        try {
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${suggestionId}/reject`,
                data: { admin_comment: 'Отклонено администратором' },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200) {
                // Удалить отклоненное предложение из списка ожидающих
                if (type === 'compatibility') {
                    setLocalPendingSuggestions(localPendingSuggestions.filter(s => s.id !== suggestionId));
                } else if (type === 'analog') {
                    setLocalPendingAnalogSuggestions(localPendingAnalogSuggestions.filter(s => s.id !== suggestionId));
                }
                
                showNotification('Предложение успешно отклонено');
            }
        } catch (error) {
            console.error('Ошибка при отклонении предложения:', error);
            showNotification('Произошла ошибка при отклонении предложения', 'error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали запчасти</h2>}
        >
            <Head title={part ? `${part.name} - Детали запчасти` : 'Запчасть не найдена'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщение об успешном добавлении в корзину */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {!part ? (
                                <div className="text-center py-10">
                                    <p className="text-xl text-red-600 mb-4">Запчасть не найдена</p>
                                    <Link 
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        На главную
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    {/* Хлебные крошки */}
                                    <div className="mb-6">
                                        <nav className="flex" aria-label="Breadcrumb">
                                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                                <li className="inline-flex items-center">
                                                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                                                        <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                                                        </svg>
                                                        Главная
                                                    </Link>
                                                </li>
                                                <li>
                                                    <div className="flex items-center">
                                                        <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                                        </svg>
                                                        <Link href="/search" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Поиск</Link>
                                                    </div>
                                                </li>
                                                <li aria-current="page">
                                                    <div className="flex items-center">
                                                        <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                                        </svg>
                                                        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{part.name}</span>
                                                    </div>
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>

                                    {/* Основная информация о запчасти */}
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Изображение запчасти */}
                                        <div className="md:w-1/3">
                                            <div className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center">
                                                {part.image_url ? (
                                                    <img 
                                                        src={part.image_url} 
                                                        alt={part.name} 
                                                        className="object-contain h-full w-full p-4"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-center p-6">
                                                        <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="mt-2">Нет изображения</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Информация о запчасти */}
                                        <div className="md:w-2/3">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{part.name}</h1>
                                            
                                            <div className="mb-4">
                                                <span className="text-sm text-gray-500 mr-2">Артикул:</span>
                                                <Link 
                                                    href={`/search?q=${part.part_number}`}
                                                    className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800"
                                                >
                                                    {part.part_number}
                                                </Link>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <span className="text-sm text-gray-500 mr-2">Производитель:</span>
                                                <span className="text-sm font-medium">{part.manufacturer}</span>
                                            </div>
                                            
                                            {part.category && (
                                                <div className="mb-4">
                                                    <span className="text-sm text-gray-500 mr-2">Категория:</span>
                                                    <span className="text-sm font-medium">{part.category.name}</span>
                                                </div>
                                            )}
                                            
                                            <div className="mb-4">
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {part.stock_quantity > 0 ? `В наличии: ${part.stock_quantity} шт.` : 'Нет в наличии'}
                                                </div>
                                            </div>
                                            
                                            {/* Добавляем информацию о совместимых двигателях */}
                                            {!loadingCompatibilities && compatibilities.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-sm text-gray-500 mr-2">Совместимость:</span>
                                                    <div className="mt-1">
                                                        {compatibilities
                                                            .filter(comp => comp.engine)
                                                            .filter((comp, index, self) => 
                                                                index === self.findIndex(c => 
                                                                    c.engine && comp.engine && c.engine.id === comp.engine.id
                                                                )
                                                            )
                                                            .slice(0, 3)
                                                            .map((compatibility, index) => (
                                                                <span key={index} className="inline-flex items-center mr-2 mb-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {compatibility.engine.name}
                                                                    {compatibility.engine.volume && ` ${compatibility.engine.volume}л`}
                                                                </span>
                                                            ))
                                                        }
                                                        {compatibilities.filter(comp => comp.engine).length > 3 && (
                                                            <a 
                                                                href="#compatibility-section" 
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                            >
                                                                +{compatibilities.filter(comp => comp.engine).length - 3} ещё
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mb-6">
                                                {isAdmin ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-gray-500 mr-2">Закупочная цена:</span>
                                                            <span className="text-xl font-bold text-gray-900">{formatPrice(part.price)} ₽</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 mr-2">Цена продажи:</span>
                                                            <span className="text-2xl font-bold text-green-600">{formatPrice(part.markup_price)} ₽</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <span className="text-2xl font-bold text-green-600">{formatPrice(part.price)} ₽</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Кнопка добавления в корзину */}
                                            {part.stock_quantity > 0 && (
                                                <div className="mb-6">
                                                    <AddToCartButton 
                                                        sparePart={normalizedPart} 
                                                        user={auth.user} 
                                                        className="w-full sm:w-auto"
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Кнопка предложения аналога */}
                                            {auth.user && (
                                                <div className="mt-4 flex space-x-3">
                                                    <button
                                                        onClick={handleSuggestAnalog}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Предложить аналог
                                                    </button>
                                                    
                                                    <a 
                                                        href="#compatibility-section"
                                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                        </svg>
                                                        Совместимость с авто
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Описание запчасти */}
                                    {part.description && (
                                        <div className="mt-8">
                                            <h2 className="text-xl font-semibold mb-4">Описание</h2>
                                            <div className="bg-gray-50 p-4 rounded-md">
                                                <p className="text-gray-700">{part.description}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Совместимость с автомобилями */}
                                    <div id="compatibility-section" className="mt-8">
                                        <h2 className="text-xl font-semibold mb-4">Совместимость с автомобилями</h2>
                                            <div className="bg-gray-50 p-4 rounded-md">
                                            {loadingCompatibilities ? (
                                                <div className="flex justify-center items-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                                    <span className="ml-2 text-gray-600">Загрузка информации о совместимости...</span>
                                                </div>
                                            ) : compatibilities.length > 0 ? (
                                                <div className="overflow-hidden">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                                                        {compatibilities.map((compatibility, index) => (
                                                            <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50 hover:bg-blue-50 transition-colors">
                                                                <div className="flex items-center mb-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mr-2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                                    </svg>
                                                                    <span className="font-medium text-blue-800">
                                                                        {compatibility.brand_name || 'Бренд не указан'} {compatibility.model_name || 'Модель не указана'}
                                                                    </span>
                                                                </div>
                                                                
                                                                {compatibility.engine && (
                                                                    <div className="text-sm text-gray-600 mb-1 ml-7">
                                                                        <span className="font-medium">Двигатель:</span> {compatibility.engine.name}
                                                                        {compatibility.engine.volume && ` (${compatibility.engine.volume} л)`}
                                                                        {compatibility.engine.power && `, ${compatibility.engine.power} л.с.`}
                                                                    </div>
                                                                )}
                                                                
                                                                {compatibility.notes && (
                                                                    <div className="text-sm text-gray-600 ml-7">
                                                                        <span className="font-medium">Примечание:</span> {compatibility.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    <p className="text-gray-500">Информация о совместимости отсутствует</p>
                                                    
                                                    {auth.user && (
                                                        <div className="mt-4">
                                                            <Link
                                                                href={`/spare-parts/${part.id}/suggest-compatibility`}
                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                            >
                                                                Предложить совместимость
                                                            </Link>
                                                        </div>
                                                    )}
                                        </div>
                                    )}
                                    
                                            {compatibilities.length > 0 && auth.user && (
                                                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-right">
                                                    <Link
                                                        href={`/spare-parts/${part.id}/suggest-compatibility`}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Добавить совместимость
                                                    </Link>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Совместимые двигатели (отдельный раздел) */}
                                    {!loadingCompatibilities && compatibilities.filter(comp => comp.engine).length > 0 && (
                                        <div className="mt-8">
                                            <h2 className="text-xl font-semibold mb-4">Совместимые двигатели</h2>
                                            <div className="bg-gray-50 p-4 rounded-md">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {compatibilities
                                                        .filter(comp => comp.engine)
                                                        .filter((comp, index, self) => 
                                                            index === self.findIndex(c => 
                                                                c.engine && comp.engine && c.engine.id === comp.engine.id
                                                            )
                                                        )
                                                        .map((compatibility, index) => (
                                                            <div key={index} className="flex items-start p-3 bg-white rounded-md shadow-sm border border-gray-200">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                                                </svg>
                                                                <div>
                                                                    <div className="font-medium text-gray-800">
                                                                        {compatibility.engine.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {compatibility.engine.volume && <span>Объем: {compatibility.engine.volume} л</span>}
                                                                        {compatibility.engine.power && <span> • {compatibility.engine.power} л.с.</span>}
                                                                        {compatibility.engine.fuel_type && <span> • {compatibility.engine.fuel_type}</span>}
                                                                    </div>
                                                                    {compatibility.brand_name && compatibility.model_name && (
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            Устанавливается на: {compatibility.brand_name} {compatibility.model_name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Секция для администраторов - Ожидающие предложения */}
                                    {isAdmin && (localPendingSuggestions.length > 0 || localPendingAnalogSuggestions.length > 0) && (
                                        <div className="mt-12 bg-yellow-50 p-6 rounded-lg">
                                            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Ожидающие предложения</h2>
                                            
                                            {localPendingSuggestions.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-medium mb-3 text-yellow-700">Предложения по совместимости</h3>
                                                    <div className="space-y-4">
                                                        {localPendingSuggestions.map(suggestion => (
                                                            <div key={suggestion.id} className="bg-white p-4 rounded-md shadow-sm">
                                                                <p className="mb-2">
                                                                    <span className="font-medium">Пользователь:</span> {suggestion.user ? suggestion.user.name : 'Неизвестно'}
                                                                </p>
                                                                <p className="mb-2">
                                                                    <span className="font-medium">Совместимость с:</span> {suggestion.car_model ? suggestion.car_model.name : 'Неизвестно'}
                                                                </p>
                                                                <p className="mb-4">
                                                                    <span className="font-medium">Комментарий:</span> {suggestion.comment || 'Без комментария'}
                                                                </p>
                                                                <div className="flex space-x-3">
                                                                    <button
                                                                        onClick={() => handleApprove(suggestion.id, 'compatibility')}
                                                                        disabled={processing}
                                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                                                    >
                                                                        {processing ? 'Обработка...' : 'Одобрить'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(suggestion.id, 'compatibility')}
                                                                        disabled={processing}
                                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                                                    >
                                                                        {processing ? 'Обработка...' : 'Отклонить'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {localPendingAnalogSuggestions.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-medium mb-3 text-yellow-700">Предложения по аналогам</h3>
                                                    <div className="space-y-4">
                                                        {localPendingAnalogSuggestions.map(suggestion => (
                                                            <div key={suggestion.id} className="bg-white p-4 rounded-md shadow-sm">
                                                                <p className="mb-2">
                                                                    <span className="font-medium">Пользователь:</span> {suggestion.user ? suggestion.user.name : 'Неизвестно'}
                                                                </p>
                                                                <p className="mb-2">
                                                                    <span className="font-medium">Предложенный аналог:</span> {suggestion.analog_part ? suggestion.analog_part.name : 'Неизвестно'}
                                                                </p>
                                                                <p className="mb-4">
                                                                    <span className="font-medium">Комментарий:</span> {suggestion.comment || 'Без комментария'}
                                                                </p>
                                                                <div className="flex space-x-3">
                                                                    <button
                                                                        onClick={() => handleApprove(suggestion.id, 'analog')}
                                                                        disabled={processing}
                                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                                                    >
                                                                        {processing ? 'Обработка...' : 'Одобрить'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(suggestion.id, 'analog')}
                                                                        disabled={processing}
                                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                                                    >
                                                                        {processing ? 'Обработка...' : 'Отклонить'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 