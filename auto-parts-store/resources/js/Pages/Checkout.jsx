import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Checkout({ auth }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        customer_name: auth.user ? `${auth.user.name}` : '',
        email: auth.user ? auth.user.email : '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        // Загружаем корзину из localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        
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
        
        setSubmitting(true);
        setError('');
        
        try {
            // Преобразуем корзину в формат для отправки на сервер
            const items = cart.map(item => ({
                part_id: item.id,
                quantity: item.quantity
            }));
            
            // Если пользователь авторизован, добавляем его ID
            const orderData = {
                ...formData,
                items,
            };
            
            if (auth.user) {
                orderData.user_id = auth.user.id;
            }
            
            // Отправляем запрос на создание заказа
            const response = await axios.post('/api/orders', orderData);
            
            // Очищаем корзину
            localStorage.removeItem('cart');
            
            // Устанавливаем флаг успешного создания заказа
            setSuccess(true);
            
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Оформление заказа</h2>}
        >
            <Head title="Оформление заказа" />

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
                                        <p>Мы свяжемся с вами в ближайшее время для подтверждения заказа.</p>
                                    </div>
                                    
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Вернуться в магазин
                                    </Link>
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
                                        
                                        <div className="space-y-4 mb-6">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex justify-between">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-gray-600 text-sm">{item.quantity} шт. × {item.price} руб.</p>
                                                    </div>
                                                    <div className="font-semibold">
                                                        {(item.price * item.quantity).toFixed(2)} руб.
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <div className="flex justify-between items-center text-lg font-bold">
                                                <span>Итого:</span>
                                                <span className="text-indigo-600">{totalAmount.toFixed(2)} руб.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 