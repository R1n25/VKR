import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Cart({ auth }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        return auth.user ? `cart_${auth.user.id}` : 'cart_guest';
    };

    useEffect(() => {
        // Загружаем корзину из localStorage
        const storageKey = getStorageKey();
        const storedCart = JSON.parse(localStorage.getItem(storageKey)) || [];
        setCart(storedCart);
        setLoading(false);
    }, []);

    const handleQuantityChange = (id, newQuantity) => {
        const updatedCart = cart.map(item => {
            if (item.id === id) {
                // Проверяем ограничения на количество
                let quantity = parseInt(newQuantity);
                if (quantity < 1) quantity = 1;
                if (quantity > item.stock) quantity = item.stock;
                
                return { ...item, quantity };
            }
            return item;
        });
        
        setCart(updatedCart);
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updatedCart));
        
        // Отправляем событие обновления корзины
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: updatedCart, storageKey },
            bubbles: true
        }));
    };

    const handleRemoveItem = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updatedCart));
        
        // Отправляем событие обновления корзины
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: updatedCart, storageKey },
            bubbles: true
        }));
    };

    const handleClearCart = () => {
        setCart([]);
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify([]));
        
        // Отправляем событие обновления корзины
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart: [], storageKey },
            bubbles: true
        }));
    };

    const handleCheckout = () => {
        if (cart.length > 0) {
            router.visit('/checkout');
        }
    };

    // Расчет общей суммы заказа
    const totalAmount = cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Корзина</h2>}
        >
            <Head title="Корзина" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка корзины...</p>
                                </div>
                            ) : cart.length > 0 ? (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">Товары в корзине</h3>
                                        <button
                                            onClick={handleClearCart}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Очистить корзину
                                        </button>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-200">
                                        {cart.map(item => (
                                            <div key={item.id} className="py-6 flex flex-col sm:flex-row">
                                                {/* Изображение товара */}
                                                <div className="sm:w-1/4 mb-4 sm:mb-0 sm:mr-6">
                                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-40 flex items-center justify-center">
                                                        {item.image_url ? (
                                                            <img 
                                                                src={item.image_url} 
                                                                alt={item.name} 
                                                                className="object-contain h-full w-full"
                                                            />
                                                        ) : (
                                                            <div className="text-gray-400 text-center p-6">
                                                                Нет изображения
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Информация о товаре */}
                                                <div className="flex-grow">
                                                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                                                        <div>
                                                            <Link
                                                                href={`/parts/${item.id}`}
                                                                className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                            <p className="text-gray-600 mt-1">Цена: {item.price} руб.</p>
                                                        </div>
                                                        
                                                        <div className="mt-4 sm:mt-0">
                                                            <div className="flex items-center">
                                                                <label htmlFor={`quantity-${item.id}`} className="sr-only">
                                                                    Количество
                                                                </label>
                                                                <div className="flex">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                        className="border border-gray-300 px-2 py-1 rounded-l-md"
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        id={`quantity-${item.id}`}
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                                        min="1"
                                                                        max={item.stock}
                                                                        className="border-t border-b border-gray-300 w-12 text-center py-1"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                        className="border border-gray-300 px-2 py-1 rounded-r-md"
                                                                        disabled={item.quantity >= item.stock}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right mt-2">
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="text-sm text-red-600 hover:text-red-800"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right font-bold">
                                                        Сумма: {(item.price * item.quantity).toFixed(2)} руб.
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-6 mt-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-semibold">Итого:</h3>
                                            <span className="text-2xl font-bold text-indigo-600">{totalAmount.toFixed(2)} руб.</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <Link
                                                href="/"
                                                className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Продолжить покупки
                                            </Link>
                                            
                                            <button
                                                onClick={handleCheckout}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Оформить заказ
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xl text-gray-600 mb-6">Ваша корзина пуста</p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Перейти к покупкам
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 