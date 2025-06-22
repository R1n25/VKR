import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function TestCheckout() {
    const [formData, setFormData] = useState({
        customer_name: 'Тестовый Клиент',
        email: 'test@example.com',
        phone: '+7 (999) 123-4567',
        address: 'Тестовый адрес, 123',
        notes: 'Тестовый заказ'
    });
    
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        
        // Тестовые товары для корзины
        const cartItems = [
            { id: 1, quantity: 2, price: 1000 },
            { id: 2, quantity: 1, price: 500 }
        ];
        
        const data = {
            ...formData,
            cart_items: cartItems
        };
        
        try {
            const response = await fetch('/test-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const responseData = await response.json();
            
            if (response.ok) {
                setResult(responseData);
            } else {
                setError(responseData.message || 'Ошибка при отправке заказа');
            }
        } catch (err) {
            setError('Не удалось отправить запрос. Пожалуйста, проверьте подключение к интернету.');
            console.error('Ошибка при отправке заказа:', err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            <Head title="Тестовое оформление заказа" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Тестовое оформление заказа</h1>
                            
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <p className="font-bold">Ошибка:</p>
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            {result && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    <p className="font-bold">Успех!</p>
                                    <p>Заказ #{result.order_number} успешно создан.</p>
                                    <p>ID заказа: {result.order_id}</p>
                                    <p>Сумма: {result.total} руб.</p>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">ФИО</label>
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
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Телефон</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Адрес</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Примечания</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {loading ? 'Отправка...' : 'Отправить тестовый заказ'}
                                    </button>
                                </div>
                            </form>
                            
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-2">Тестовые товары в корзине:</h2>
                                <ul className="list-disc pl-5">
                                    <li>Товар #1: 2 шт. × 1000 руб. = 2000 руб.</li>
                                    <li>Товар #2: 1 шт. × 500 руб. = 500 руб.</li>
                                </ul>
                                <p className="font-bold mt-2">Итого: 2500 руб.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 