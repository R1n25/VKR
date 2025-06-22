import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCart } from '@/Contexts/CartContext';

export default function Cart({ auth }) {
    // Используем контекст корзины
    const { 
        cart, 
        loading, 
        error, 
        updateQuantity, 
        removeItem, 
        clearCart, 
        getTotalAmount, 
        loadCart 
    } = useCart();

    // Перезагружаем корзину при изменении пользователя
    useEffect(() => {
        loadCart();
    }, [auth.user]);

    const handleQuantityChange = (id, newQuantity) => {
        updateQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id) => {
        removeItem(id);
    };

    const handleClearCart = () => {
        if (confirm('Вы уверены, что хотите очистить корзину?')) {
            clearCart();
        }
    };

    const handleCheckout = () => {
        if (cart.length > 0) {
            router.visit('/checkout');
        }
    };

    // Расчет общей суммы заказа
    const totalAmount = getTotalAmount();

    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Корзина</h2>}
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
                            ) : error ? (
                                <div className="text-center py-10">
                                    <p className="text-red-500">{error}</p>
                                    <button 
                                        onClick={loadCart}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Попробовать снова
                                    </button>
                                </div>
                            ) : cart.length > 0 ? (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">Товары в корзине ({cart.length})</h3>
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
                                                    <a href={`/parts/${item.id}`} className="block">
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
                                                    </a>
                                                </div>
                                                
                                                {/* Информация о товаре */}
                                                <div className="flex-grow">
                                                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                                                        <div>
                                                            <a
                                                                href={`/parts/${item.id}`}
                                                                className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                {item.name}
                                                            </a>
                                                            {item.part_number && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Артикул: {item.part_number}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 sm:mt-0">
                                                            <p className="text-lg font-semibold">
                                                                {formatPrice(item.price)} ₽
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mt-4">
                                                        <div className="flex items-center">
                                                            <label htmlFor={`quantity-${item.id}`} className="mr-2 text-sm">
                                                                Количество:
                                                            </label>
                                                            <div className="flex rounded-md">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                    className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    -
                                                                </button>
                                                                <input
                                                                    id={`quantity-${item.id}`}
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.stock}
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                                    className="w-14 border-t border-b border-gray-300 text-center py-1"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                    className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                                    disabled={item.quantity >= item.stock}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <span className="text-sm text-gray-500 ml-3">
                                                                В наличии: {item.stock} шт.
                                                            </span>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="mt-4 text-right">
                                                        <p className="text-sm text-gray-600">
                                                            Итого: <span className="font-semibold">{formatPrice(item.price * item.quantity)} ₽</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Итого к оплате:</h3>
                                            <p className="text-xl font-bold">{formatPrice(totalAmount)} ₽</p>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={handleCheckout}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                Перейти к оформлению
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-semibold text-gray-900">Ваша корзина пуста</h3>
                                    <p className="mt-1 text-gray-500">Добавьте товары в корзину, чтобы продолжить покупки.</p>
                                    <div className="mt-6">
                                        <a
                                            href="/"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Перейти к каталогу
                                        </a>
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