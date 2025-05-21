import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Index({ auth, cart, cartItems }) {
    const [loading, setLoading] = useState(false);

    const handleQuantityChange = async (cartItemId, quantity) => {
        if (quantity <= 0) {
            await handleRemoveItem(cartItemId);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(route('cart.update-quantity'), {
                cart_item_id: cartItemId,
                quantity: quantity
            });
            
            // Обновляем страницу для отображения актуальных данных
            router.reload();
        } catch (error) {
            console.error('Ошибка при обновлении количества:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        setLoading(true);
        try {
            const response = await axios.delete(route('cart.remove'), {
                data: { cart_item_id: cartItemId }
            });
            
            // Обновляем страницу для отображения актуальных данных
            router.reload();
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Вы уверены, что хотите очистить корзину?')) {
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.delete(route('cart.clear'));
            
            // Обновляем страницу для отображения актуальных данных
            router.reload();
        } catch (error) {
            console.error('Ошибка при очистке корзины:', error);
        } finally {
            setLoading(false);
        }
    };

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
                                    <p>Загрузка...</p>
                                </div>
                            ) : cartItems.length > 0 ? (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">Товары в корзине</h3>
                                        <button
                                            onClick={handleClearCart}
                                            className="text-sm text-red-600 hover:text-red-800"
                                            disabled={loading}
                                        >
                                            Очистить корзину
                                        </button>
                                    </div>
                                    
                                    <div className="divide-y divide-gray-200">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="py-6 flex flex-col sm:flex-row">
                                                {/* Изображение товара */}
                                                <div className="sm:w-1/4 mb-4 sm:mb-0 sm:mr-6">
                                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-40 flex items-center justify-center">
                                                        {item.sparePart.image_url ? (
                                                            <img 
                                                                src={item.sparePart.image_url} 
                                                                alt={item.sparePart.name} 
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
                                                                href={`/spare-parts/${item.sparePart.slug}`}
                                                                className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                {item.sparePart.name}
                                                            </Link>
                                                            <p className="text-gray-600 mt-1">Цена: {item.price} руб.</p>
                                                            <p className="text-gray-600 mt-1">Артикул: {item.sparePart.part_number}</p>
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
                                                                        disabled={loading || item.quantity <= 1}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <input
                                                                        type="number"
                                                                        id={`quantity-${item.id}`}
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                                        min="1"
                                                                        max={item.sparePart.stock_quantity}
                                                                        disabled={loading}
                                                                        className="border-t border-b border-gray-300 w-12 text-center py-1"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                        className="border border-gray-300 px-2 py-1 rounded-r-md"
                                                                        disabled={loading || item.quantity >= item.sparePart.stock_quantity}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right mt-2">
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="text-sm text-red-600 hover:text-red-800"
                                                                    disabled={loading}
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
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {cart.total_price} руб.
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <Link
                                                href="/"
                                                className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Продолжить покупки
                                            </Link>
                                            
                                            <Link
                                                href="/checkout"
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            >
                                                Оформить заказ
                                            </Link>
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