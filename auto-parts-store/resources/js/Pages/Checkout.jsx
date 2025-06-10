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
        return auth.user ? `cart_${auth.user.id}` : 'cart_guest';
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            return;
        }
        
        // Проверяем, что customer_name не пустой
        if (!formData.customer_name.trim()) {
            setError('Пожалуйста, укажите ФИО');
            return;
        }
        
        setSubmitting(true);
        setError('');
        
        try {
            // Отправляем запрос на создание заказа
            const response = await axios.post(route('checkout.store'), {
                cart_items: cart,
                customer_name: formData.customer_name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                notes: formData.notes
            });
            
            // Очищаем корзину
            const storageKey = getStorageKey();
            localStorage.setItem(storageKey, JSON.stringify([]));
            
            // Отправляем событие обновления корзины
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: [], storageKey },
                bubbles: true
            }));
            
            // Устанавливаем флаг успешного создания заказа
            setSuccess(true);
            setOrderResult(response.data);
            
        } catch (err) {
            console.error('Ошибка при оформлении заказа:', err);
            
            // Определяем текст ошибки
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Расчет общей суммы заказа
    const totalAmount = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    // Определяем контент для отображения
    const content = (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
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
                                        href={route('orders.show', orderResult?.order_id)}
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
                                    
                                    {error && (
                                        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit}>
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
                                            
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                            >
                                                {submitting ? 'Оформление...' : 'Оформить заказ'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                
                                {/* Сводка заказа */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Ваш заказ</h3>
                                    
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={`${item.id}-${item.name}`} className="flex items-start">
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-16 h-16 object-cover rounded mr-3"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                                    <p className="text-xs text-gray-500">{item.article}</p>
                                                    <div className="flex justify-between mt-1">
                                                        <p className="text-sm text-gray-600">{item.quantity} шт.</p>
                                                        <p className="text-sm font-medium">{(item.price * item.quantity).toFixed(2)} руб.</p>
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