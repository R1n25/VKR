import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Checkout({ auth }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    
    const [formData, setFormData] = useState({
        customer_name: auth.user ? `${auth.user.name}` : '',
        email: auth.user ? auth.user.email : '',
        phone: '',
        address: '',
        notes: ''
    });

    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        // Используем сохраненный ключ корзины
        const storageKey = localStorage.getItem('cart_storage_key');
        if (storageKey) {
            return storageKey;
        }
        
        // Если ключа нет (что странно), используем ключ по умолчанию
        if (auth.user && auth.user.id) {
            return `cart_user_${auth.user.id}`;
        }
        
        // Для гостя используем сохраненный ключ гостя
        const guestKey = localStorage.getItem('cart_guest_key');
        if (guestKey) {
            return guestKey;
        }
        
        // Если ничего не найдено, создаем новый ключ гостя
        const newGuestKey = 'cart_guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cart_guest_key', newGuestKey);
        localStorage.setItem('cart_storage_key', newGuestKey);
        return newGuestKey;
    };

    useEffect(() => {
        // Загружаем корзину из localStorage
        const storageKey = getStorageKey();
        const storedCart = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        if (storedCart.length === 0) {
            router.visit('/cart');
            return;
        }
        
        setCart(storedCart);
        setLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        console.log('Обновлено поле формы:', name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы
        console.log('Форма отправлена, предотвращаем стандартное поведение');
        
        // Предотвращаем двойную отправку формы
        if (submitting) {
            console.log('Форма уже отправляется, отменяем повторную отправку');
            return;
        }
        
        if (cart.length === 0) {
            console.log('Корзина пуста, отмена отправки');
            return;
        }
        
        // Проверяем, что customer_name не пустой
        if (!formData.customer_name.trim()) {
            setError('Пожалуйста, укажите ФИО');
            return;
        }
        
        // Проверяем формат данных в корзине
        const hasValidItems = cart.every(item => item.id && item.quantity);
        if (!hasValidItems) {
            console.error('Ошибка в формате данных корзины:', cart);
            setError('Неверный формат данных в корзине. Пожалуйста, обновите страницу и попробуйте снова.');
            return;
        }
        
        setSubmitting(true);
        setError('');
        
        // Данные для отправки
        const data = {
            cart_items: cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: parseFloat(item.price)
            })),
            customer_name: formData.customer_name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            notes: formData.notes
        };
        
        // Проверяем наличие всех необходимых полей
        if (!data.customer_name) {
            setError('Пожалуйста, укажите ФИО');
            setSubmitting(false);
            return;
        }
        
        if (!data.email) {
            setError('Пожалуйста, укажите Email');
            setSubmitting(false);
            return;
        }
        
        if (!data.phone) {
            setError('Пожалуйста, укажите телефон');
            setSubmitting(false);
            return;
        }
        
        if (!data.address) {
            setError('Пожалуйста, укажите адрес доставки');
            setSubmitting(false);
            return;
        }
        
        if (!data.cart_items || data.cart_items.length === 0) {
            setError('Корзина пуста');
            setSubmitting(false);
            return;
        }
        
        console.log('Отправка заказа с данными:', JSON.stringify(data));
        
        // Используем XMLHttpRequest для отправки POST-запроса
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/process-order', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        // Логируем заголовки запроса
        console.log('Заголовки запроса:', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        });
        
        xhr.onload = function() {
            console.log('Статус ответа:', xhr.status);
            console.log('Текст ответа:', xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('Успешная отправка заказа:', response);
                    
                    // Сохраняем информацию о заказе в localStorage
                    if (response.success && response.order_id) {
                        try {
                            const orderInfo = {
                                id: response.order_id,
                                order_number: response.order_number,
                                total: getTotalAmount(),
                                created_at: new Date().toLocaleString('ru-RU')
                            };
                            localStorage.setItem('last_order', JSON.stringify(orderInfo));
                        } catch (error) {
                            console.error('Ошибка при сохранении информации о заказе:', error);
                        }
                    }
                    
                    // Очищаем корзину
                    try {
                        // Очищаем localStorage напрямую
                        const storageKey = getStorageKey();
                        localStorage.removeItem(storageKey); // Полностью удаляем ключ вместо установки пустого массива
                        console.log('Корзина очищена (ключ удален):', storageKey);
                        
                        // Устанавливаем флаг успешного создания заказа
                        setSuccess(true);
                        setOrderResult(response);
                        
                        // Показываем сообщение об успехе без вызова alert, который может блокировать UI
                        console.log('Заказ успешно оформлен!');
                        
                        // Небольшая задержка перед перенаправлением
                        setTimeout(() => {
                            // Прямой переход на страницу успеха вместо маршрутизатора
                            window.location.href = '/order-success';
                        }, 500);
                    } catch (error) {
                        console.error('Ошибка при очистке корзины:', error);
                    }
                } catch (parseError) {
                    console.error('Ошибка при парсинге ответа:', parseError);
                    setError('Ошибка при обработке ответа сервера');
                }
            } else {
                console.error('Ошибка при отправке заказа:', xhr.status, xhr.statusText);
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    console.error('Ошибка сервера:', errorResponse);
                    
                    if (errorResponse.errors) {
                        // Формируем сообщение об ошибках валидации
                        const validationErrors = [];
                        for (const field in errorResponse.errors) {
                            validationErrors.push(`${field}: ${errorResponse.errors[field].join(', ')}`);
                        }
                        setError(`Ошибка валидации: ${validationErrors.join('; ')}`);
                    } else {
                        setError(errorResponse.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
                    }
                } catch (parseError) {
                    setError('Ошибка при оформлении заказа. Попробуйте еще раз.');
                }
            }
            setSubmitting(false);
        };
        
        xhr.onerror = function() {
            console.error('Ошибка сети при отправке заказа');
            setError('Ошибка сети при отправке заказа. Проверьте подключение к интернету.');
            setSubmitting(false);
        };
        
        xhr.send(JSON.stringify(data));
    };

    // Расчет общей суммы заказа
    const totalAmount = cart.reduce((total, item) => {
        return total + parseFloat(item.price) * item.quantity;
    }, 0);

    // Функция для получения общей суммы
    const getTotalAmount = () => {
        return cart.reduce((total, item) => {
            return total + parseFloat(item.price) * item.quantity;
        }, 0);
    };

    // Определяем контент для отображения
    const content = (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <h1 className="text-2xl font-semibold mb-6">Оформление заказа v2</h1>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                <p className="font-bold">Ошибка при оформлении заказа:</p>
                                <p>{error}</p>
                            </div>
                        )}
                        
                        {loading ? (
                            <div className="text-center py-10">
                                <p>Загрузка данных...</p>
                            </div>
                        ) : success ? (
                            <div className="text-center py-10">
                                <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
                                    <h3 className="text-xl font-semibold mb-2">Заказ успешно оформлен!</h3>
                                    <p>Номер заказа: {orderResult?.order_number || 'N/A'}</p>
                                    <p>Сумма заказа: {orderResult?.total || totalAmount} руб.</p>
                                </div>
                                
                                <div className="flex justify-center space-x-4">
                                    <Link
                                        href={`/orders/${orderResult?.order_id}`}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Просмотреть заказ
                                    </Link>
                                    
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Вернуться в магазин
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Форма для ввода данных */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold mb-6">Контактная информация</h3>
                                    
                                    <form method="POST" action="/process-order" id="checkout-form" onSubmit={handleSubmit}>
                                        
                                        {/* Скрытое поле для метода */}
                                        <input type="hidden" name="_method" value="POST" />
                                        
                                        {/* Данные корзины передаются через fetch API в handleSubmit */}
                                        
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                                                    ФИО
                                                </label>
                                                <input
                                                    type="text"
                                                    id="customer_name"
                                                    name="customer_name"
                                                    value={formData.customer_name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                    Телефон
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="+7 (XXX) XXX-XX-XX"
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </div>
                                            
                                            <div className="sm:col-span-2">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                                    Адрес доставки
                                                </label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    required
                                                    rows="3"
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                ></textarea>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-between">
                                            <Link
                                                href="/cart"
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                ← Вернуться в корзину
                                            </Link>
                                            
                                            <div className="mt-8">
                                                <button
                                                    type="submit"
                                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <span>Оформление заказа...</span>
                                                    ) : (
                                                        <span>Оформить заказ</span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                
                                {/* Сводка заказа */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Ваш заказ</h3>
                                    
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={`${item.id}-${item.name}`} className="flex items-start">
                                                {(item.image || item.image_url) && (
                                                    <img 
                                                        src={item.image || item.image_url} 
                                                        alt={item.name} 
                                                        className="w-16 h-16 object-cover rounded mr-3"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                                    <p className="text-xs text-gray-500">Артикул: {item.part_number || item.id}</p>
                                                    <div className="flex justify-between mt-1">
                                                        <p className="text-sm text-gray-600">{item.quantity} шт.</p>
                                                        <p className="text-sm font-medium">{(parseFloat(item.price) * item.quantity).toFixed(2)} руб.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-gray-200 mt-4 pt-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Товары:</span>
                                            <span className="text-sm font-medium">{totalAmount.toFixed(2)} руб.</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Доставка:</span>
                                            <span className="text-sm font-medium">0.00 руб.</span>
                                        </div>
                                        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                                            <span>Итого:</span>
                                            <span>{totalAmount.toFixed(2)} руб.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Оформление заказа" />
            
            {auth.user ? (
                <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Оформление заказа</h2>}
                >
                    {content}
                </AuthenticatedLayout>
            ) : (
                <GuestLayout>
                    {content}
                </GuestLayout>
            )}
        </>
    );
} 