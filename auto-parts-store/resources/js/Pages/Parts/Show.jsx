import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PartCard from '@/Components/Parts/PartCard';
import { formatPrice } from '@/utils/helpers';
import axios from 'axios';

export default function PartShow({ auth, part, similarParts = [], recommendedAnalogs = [], pendingSuggestions = [], pendingAnalogSuggestions = [] }) {
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [localPendingSuggestions, setLocalPendingSuggestions] = useState(pendingSuggestions);
    const [localPendingAnalogSuggestions, setLocalPendingAnalogSuggestions] = useState(pendingAnalogSuggestions);
    const [processing, setProcessing] = useState(false);
    
    // Получаем информацию о пользователе и его роли
    const isAdmin = auth.user && auth.user.is_admin;

    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        return auth.user ? `cart_${auth.user.id}` : 'cart_guest';
    };

    // Сохраняем CSRF-токен для использования в запросах
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Функция для отображения уведомления
    const showNotification = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        
        if (value < 1) {
            setQuantity(1);
        } else if (part && value > part.stock_quantity) {
            setQuantity(part.stock_quantity);
        } else {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        setAddingToCart(true);
        
        // Получаем текущую корзину из localStorage или создаем новую
        const storageKey = getStorageKey();
        let cart = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Проверяем, есть ли уже такая запчасть в корзине
        const existingItemIndex = cart.findIndex(item => item.id === part.id);
        
        if (existingItemIndex !== -1) {
            // Если запчасть уже есть в корзине, обновляем количество
            cart[existingItemIndex].quantity += quantity;
            
            // Проверка на доступное количество
            if (cart[existingItemIndex].quantity > part.stock_quantity) {
                cart[existingItemIndex].quantity = part.stock_quantity;
            }
        } else {
            // Если запчасти нет в корзине, добавляем новый элемент
            cart.push({
                id: part.id,
                name: part.name,
                price: isAdmin ? part.markup_price : part.price,
                image_url: part.image_url,
                quantity: quantity,
                stock: part.stock_quantity
            });
        }
        
        // Сохраняем обновленную корзину в localStorage
        localStorage.setItem(storageKey, JSON.stringify(cart));
        
        // Отправляем событие обновления корзины
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart, storageKey },
            bubbles: true
        }));
        
        setAddingToCart(false);
        setMessage({ 
            text: 'Запчасть добавлена в корзину', 
            type: 'success' 
        });
        
        // Сбрасываем сообщение через 3 секунды
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    // Функция для предложения аналога
    const handleSuggestAnalog = () => {
        window.location.href = `/suggestions/analog/${part.id}`;
    };

    // Обработчик для одобрения предложения
    // Добавляем функцию для безопасного получения CSRF токена
    const getCsrfToken = () => {
        // Пытаемся получить CSRF токен из мета-тегов
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        // Если нет мета-тега, пробуем другие источники
        // Inertia.js обычно хранит CSRF токен в глобальной переменной или в window.Laravel
        if (window.Laravel && window.Laravel.csrfToken) {
            return window.Laravel.csrfToken;
        }
        
        // Возвращаем пустую строку, если не удалось найти токен
        console.warn('CSRF токен не найден. Это может вызвать проблемы с безопасностью запросов.');
        return '';
    };
    
    const handleApprove = async (suggestionId, type) => {
        if (processing) return;
        
        setProcessing(true);
        try {
            // Получаем CSRF токен безопасным способом
            const csrfToken = getCsrfToken();
            
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${suggestionId}/approve`,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
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
            // Получаем CSRF токен безопасным способом
            const csrfToken = getCsrfToken();
            
            const response = await axios({
                method: 'POST',
                url: `/admin/suggestions/${suggestionId}/reject`,
                data: { admin_comment: 'Отклонено администратором' },
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
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
                                        Вернуться на главную
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Изображение запчасти */}
                                    <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-80">
                                        {part.image_url ? (
                                            <img 
                                                src={part.image_url} 
                                                alt={part.name} 
                                                className="object-contain h-full w-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                                <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Информация о запчасти */}
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">{part.name}</h1>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Артикул: </span>
                                            <Link
                                                href={`/search?q=${part.part_number}`}
                                                className="font-semibold text-blue-600 hover:underline hover:text-blue-800"
                                            >
                                                {part.part_number}
                                            </Link>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Производитель: </span>
                                            <span className="font-semibold">{part.manufacturer}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Категория: </span>
                                            <span className="font-semibold">{part.category}</span>
                                        </div>
                                        
                                        {part.description && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-2">Описание:</h3>
                                                <p className="text-gray-700">{part.description}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Наличие:</h3>
                                            <div className={`text-${part.stock_quantity > 0 ? 'green' : 'red'}-600`}>
                                                {part.stock_quantity > 0 ? `В наличии: ${part.stock_quantity} шт.` : 'Нет в наличии'}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            {isAdmin ? (
                                                <div>
                                                    <div className="flex items-center mb-2">
                                                        <span className="text-gray-600 mr-2">Закупочная цена:</span>
                                                        <span className="text-xl font-bold text-gray-700">
                                                            {part.original_price ? `${formatPrice(part.original_price)} ₽` : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-gray-600 mr-2">Цена продажи:</span>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            {part.markup_price ? `${formatPrice(part.markup_price)} ₽` : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <h3 className="text-2xl font-bold text-green-600">
                                                    {part.price ? `${formatPrice(part.price)} ₽` : '—'}
                                                </h3>
                                            )}
                                        </div>
                                        
                                        {part.stock_quantity > 0 && (
                                            <div className="flex items-center">
                                                <div className="mr-4">
                                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Количество:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="quantity"
                                                        name="quantity"
                                                        value={quantity}
                                                        onChange={handleQuantityChange}
                                                        min="1"
                                                        max={part.stock_quantity}
                                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm w-20"
                                                    />
                                                </div>
                                                
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={addingToCart}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    {addingToCart ? 'Добавление...' : 'Добавить в корзину'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Аналоги запчасти */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Аналоги запчасти</h2>
                        
                        {/* Неодобренные предложения аналогов (только для администраторов) */}
                        {isAdmin && localPendingAnalogSuggestions.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-amber-700 mb-3">
                                    Ожидающие проверки предложения аналогов ({localPendingAnalogSuggestions.length})
                                </h4>
                                
                                <div className="bg-amber-50 rounded-lg p-4 mb-4">
                                    <ul className="space-y-4">
                                        {localPendingAnalogSuggestions.map(suggestion => (
                                            <li key={suggestion.id} className="border-b border-amber-200 pb-4">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div>
                                                        {suggestion.analogSparePart ? (
                                                            <p className="font-medium">
                                                                {suggestion.analogSparePart.name} ({suggestion.analogSparePart.part_number})
                                                            </p>
                                                        ) : (
                                                            <p className="font-medium">
                                                                {suggestion.data?.analog_brand} {suggestion.data?.analog_article}
                                                                {suggestion.data?.analog_description && ` - ${suggestion.data.analog_description}`}
                                                            </p>
                                                        )}
                                                        
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <span className="font-medium">Тип аналога: </span>
                                                            {suggestion.data?.analog_type === 'direct' ? 'Прямой аналог' : 
                                                             suggestion.data?.analog_type === 'indirect' ? 'Непрямой аналог' : 
                                                             suggestion.data?.analog_type === 'universal' ? 'Универсальный аналог' : 'Неизвестный тип'}
                                                        </p>
                                                        
                                                        {suggestion.comment && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                <span className="font-medium">Комментарий: </span>
                                                                {suggestion.comment}
                                                            </p>
                                                        )}
                                                        
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Предложено: {suggestion.user?.name || 'Неизвестный пользователь'} 
                                                            {suggestion.created_at && ` • ${new Date(suggestion.created_at).toLocaleDateString()}`}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2 mt-2 md:mt-0">
                                                        <button
                                                            type="button"
                                                            className={`px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleApprove(suggestion.id, 'analog')}
                                                            disabled={processing}
                                                        >
                                                            Одобрить
                                                        </button>
                                                        
                                                        <button
                                                            type="button"
                                                            className={`px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleReject(suggestion.id, 'analog')}
                                                            disabled={processing}
                                                        >
                                                            Отклонить
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        
                        {recommendedAnalogs && recommendedAnalogs.length > 0 ? (
                            <div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Эти запчасти могут быть аналогами, но требуют проверки специалистом.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendedAnalogs.map(analog => (
                                        <PartCard key={analog.id} part={analog} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-gray-600">Для этой запчасти пока нет утвержденных аналогов.</p>
                            </div>
                        )}
                        
                        {/* Кнопка предложить аналог */}
                        <div className="mt-4">
                            <Link
                                href={route('suggestions.create-analog', part.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Предложить аналог
                            </Link>
                        </div>
                    </div>
                    
                    {/* Совместимые модели */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Совместимые автомобили</h3>
                            
                            {/* Отладочная информация */}
                            {/* <div className="bg-blue-50 p-2 mb-4 text-xs">
                                <p>ID запчасти: {part.id}</p>
                                <p>Совместимостей: {part.compatibilities ? part.compatibilities.length : 0}</p>
                                <p>Данные совместимостей: {JSON.stringify(part.compatibilities)}</p>
                            </div> */}
                            
                            {/* Неодобренные предложения совместимости (только для администраторов) */}
                            {isAdmin && localPendingSuggestions.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-medium text-amber-700 mb-3">
                                        Ожидающие проверки предложения совместимости ({localPendingSuggestions.length})
                                    </h4>
                                    
                                    <div className="bg-amber-50 rounded-lg p-4 mb-4">
                                        <ul className="space-y-4">
                                            {localPendingSuggestions.map(suggestion => (
                                                <li key={suggestion.id} className="border-b border-amber-200 pb-4">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-medium">
                                                                {suggestion.carModel?.brand?.name} {suggestion.carModel?.name}
                                                                {suggestion.carModel?.generation && ` (${suggestion.carModel.generation})`}
                                                            </p>
                                                            
                                                            {suggestion.engine && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    <span className="font-medium">Двигатель: </span>
                                                                    {suggestion.engine.name}
                                                                    {suggestion.engine.volume && ` ${suggestion.engine.volume}`}
                                                                    {suggestion.engine.power && ` (${suggestion.engine.power} л.с.)`}
                                                                    {suggestion.engine.fuel_type && `, ${suggestion.engine.fuel_type}`}
                                                                </p>
                                                            )}
                                                            
                                                            {suggestion.comment && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    <span className="font-medium">Комментарий: </span>
                                                                    {suggestion.comment}
                                                                </p>
                                                            )}
                                                            
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Предложено: {suggestion.user?.name || 'Неизвестный пользователь'} 
                                                                {suggestion.created_at && ` • ${new Date(suggestion.created_at).toLocaleDateString()}`}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex space-x-2 mt-2 md:mt-0">
                                                            <button
                                                                type="button"
                                                                className={`px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => handleApprove(suggestion.id, 'compatibility')}
                                                                disabled={processing}
                                                            >
                                                                Одобрить
                                                            </button>
                                                            
                                                            <button
                                                                type="button"
                                                                className={`px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={() => handleReject(suggestion.id, 'compatibility')}
                                                                disabled={processing}
                                                            >
                                                                Отклонить
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            
                            {part.compatibilities && part.compatibilities.length > 0 ? (
                                <ul className="space-y-3 mb-4">
                                    {part.compatibilities.map((compatibility, index) => (
                                        <li key={compatibility.id || `compatibility-${index}`} className="border-b pb-2">
                                            <span className="font-medium">{compatibility.brand} {compatibility.model}</span>
                                            {compatibility.years && (
                                                <span className="text-sm text-gray-600 ml-2">
                                                    ({compatibility.years})
                                                </span>
                                            )}
                                            {compatibility.engine && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Двигатель: </span>
                                                    {compatibility.engine.name}
                                                    {compatibility.engine.volume && ` ${compatibility.engine.volume}`}
                                                    {compatibility.engine.power && ` (${compatibility.engine.power} л.с.)`}
                                                    {compatibility.engine.fuel_type && `, ${compatibility.engine.fuel_type}`}
                                                </div>
                                            )}
                                            {compatibility.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{compatibility.notes}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <p className="text-gray-600">Информация о совместимости с автомобилями пока не добавлена.</p>
                                </div>
                            )}
                            
                            <div className="mt-4">
                                <button 
                                    onClick={() => {
                                        // Сохраняем текущий URL, чтобы после успешного добавления 
                                        // предложения мы могли вернуться на эту страницу
                                        localStorage.setItem('returnToPartDetails', window.location.href);
                                        window.location.href = route('suggestions.create-compatibility', part.id);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V5a1 1 0 00-1-1H3z" />
                                    </svg>
                                    Предложить совместимость
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 