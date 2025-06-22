import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { useCart } from '@/Contexts/CartContext';

export default function Index({ auth, cart, cartItems }) {
    const { cart: contextCart, getTotalItems, loadCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [error, setError] = useState(null);

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

    // Загружаем товары из localStorage при монтировании компонента
    useEffect(() => {
        const loadCartFromLocalStorage = () => {
            try {
                const storageKey = getStorageKey();
                const storedCartString = localStorage.getItem(storageKey);
                
                if (storedCartString) {
                    const storedCart = JSON.parse(storedCartString);
                    if (Array.isArray(storedCart) && storedCart.length > 0) {
                        console.log('Загружены товары из localStorage:', storedCart);
                        setItems(storedCart);
                        
                        // Рассчитываем общую сумму
                        const total = storedCart.reduce((sum, item) => {
                            return sum + (parseFloat(item.price) * item.quantity);
                        }, 0);
                        setTotalPrice(total);
                        setError(null);
                        return;
                    }
                }
                
                // Если в localStorage нет товаров, проверяем серверные данные
                if (cartItems && cartItems.length > 0) {
                    console.log('Загружены товары с сервера:', cartItems);
                    setItems(cartItems);
                    setTotalPrice(cart?.total_price || 0);
                    setError(null);
                    return;
                }
                
                // Если нет товаров ни в localStorage, ни на сервере
                console.log('Корзина пуста');
                setItems([]);
                setTotalPrice(0);
            } catch (error) {
                console.error('Ошибка при загрузке корзины:', error);
                setError('Не удалось загрузить корзину. Попробуйте перезагрузить страницу.');
                setItems([]);
                setTotalPrice(0);
            }
        };
        
        loadCartFromLocalStorage();
        
        // Добавляем слушатель события обновления корзины
        const handleCartUpdated = (event) => {
            if (event.detail && event.detail.cart) {
                console.log('Получено событие обновления корзины:', event.detail.cart);
                setItems(event.detail.cart);
                
                // Рассчитываем общую сумму
                const total = event.detail.cart.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) * item.quantity);
                }, 0);
                setTotalPrice(total);
            }
        };
        
        window.addEventListener('cartUpdated', handleCartUpdated);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdated);
        };
    }, []);

    // Функция для обновления общей суммы
    const updateTotalPrice = () => {
        const newTotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);
        setTotalPrice(newTotal);
    };

    const handleQuantityChange = async (itemId, quantity) => {
        if (quantity <= 0) {
            await handleRemoveItem(itemId);
            return;
        }

        // Находим товар в списке
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        // Проверяем, не превышает ли количество доступный остаток
        const maxQuantity = items[itemIndex].stock || 100;
        if (quantity > maxQuantity) {
            quantity = maxQuantity;
        }

        // Обновляем локальное состояние для мгновенной обратной связи
        const updatedItems = [...items];
        updatedItems[itemIndex].quantity = quantity;
        setItems(updatedItems);
        updateTotalPrice();

        // Обновляем localStorage
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));

        // Отправляем запрос на сервер если пользователь авторизован
        if (auth.user) {
            setUpdatingItemId(itemId);
            try {
                // Находим cartItem_id по spare_part_id
                const response = await axios.get('/api/cart');
                if (response.data.success) {
                    const cartItem = response.data.cart.find(item => item.id === itemId);
                    if (cartItem) {
                        await axios.post('/api/cart/update', {
                            cart_item_id: cartItem.id,
                            quantity: quantity
                        });
                    }
                }
                
                // Обновляем событие для CartIcon
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cart: updatedItems, storageKey },
                    bubbles: true
                }));
            } catch (error) {
                console.error('Ошибка при обновлении количества:', error);
                
                // Если произошла ошибка, возвращаем предыдущее состояние
                router.reload();
            } finally {
                setUpdatingItemId(null);
            }
        } else {
            // Для неавторизованных пользователей просто обновляем событие
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: updatedItems, storageKey },
                bubbles: true
            }));
        }
    };

    const handleRemoveItem = async (itemId) => {
        setLoading(true);
        
        // Обновляем локальное состояние для мгновенной обратной связи
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        
        // Обновляем общую сумму
        const newTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        setTotalPrice(newTotal);
        
        // Обновляем localStorage
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        
        // Отправляем запрос на сервер если пользователь авторизован
        if (auth.user) {
            try {
                // Находим cartItem_id по spare_part_id
                const response = await axios.get('/api/cart');
                if (response.data.success) {
                    const cartItem = response.data.cart.find(item => item.id === itemId);
                    if (cartItem) {
                        await axios.delete('/api/cart/remove', {
                            data: { cart_item_id: cartItem.id }
                        });
                    }
                }
                
                // Обновляем событие для CartIcon
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cart: updatedItems, storageKey },
                    bubbles: true
                }));
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                
                // Если произошла ошибка, возвращаем предыдущее состояние
                router.reload();
            } finally {
                setLoading(false);
            }
        } else {
            // Для неавторизованных пользователей просто обновляем событие
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: updatedItems, storageKey },
                bubbles: true
            }));
            setLoading(false);
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Вы уверены, что хотите очистить корзину?')) {
            return;
        }
        
        setLoading(true);
        
        // Обновляем локальное состояние для мгновенной обратной связи
        setItems([]);
        setTotalPrice(0);
        
        // Очищаем localStorage
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify([]));
        
        // Отправляем запрос на сервер если пользователь авторизован
        if (auth.user) {
            try {
                await axios.delete('/api/cart/clear');
                
                // Обновляем событие для CartIcon
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                    detail: { cart: [], storageKey },
                    bubbles: true
                }));
            } catch (error) {
                console.error('Ошибка при очистке корзины:', error);
                
                // Если произошла ошибка, возвращаем предыдущее состояние
                router.reload();
            } finally {
                setLoading(false);
            }
        } else {
            // Для неавторизованных пользователей просто обновляем событие
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: [], storageKey },
                bubbles: true
            }));
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        router.get('/checkout');
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
                            <h1 className="text-2xl font-bold mb-4">Корзина</h1>
                            
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            
                            {loading && (
                                <div className="flex justify-center items-center h-32">
                                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                                        <span className="visually-hidden">Загрузка...</span>
                                    </div>
                                </div>
                            )}
                            
                            {!loading && items.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-xl mb-4">Ваша корзина пуста</p>
                                    <Link
                                        href={route('catalog')}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        ПЕРЕЙТИ К ПОКУПКАМ
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead>
                                                <tr>
                                                    <th className="py-3 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Товар
                                                    </th>
                                                    <th className="py-3 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Цена
                                                    </th>
                                                    <th className="py-3 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Количество
                                                    </th>
                                                    <th className="py-3 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Итого
                                                    </th>
                                                    <th className="py-3 px-4 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                        Действия
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="py-4 px-4 border-b border-gray-200">
                                                            <div className="flex items-center">
                                                                {(item.image || item.image_url) && (
                                                                    <img 
                                                                        src={item.image || item.image_url} 
                                                                        alt={item.name} 
                                                                        className="h-16 w-16 object-cover mr-4"
                                                                    />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">Артикул: {item.part_number || item.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 border-b border-gray-200">
                                                            <span className="text-sm font-medium text-gray-900">{parseFloat(item.price).toFixed(2)} руб.</span>
                                                        </td>
                                                        <td className="py-4 px-4 border-b border-gray-200">
                                                            <div className="flex items-center">
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                                                                    disabled={updatingItemId === item.id}
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path d="M20 12H4"></path>
                                                                    </svg>
                                                                </button>
                                                                <span className="text-gray-700 mx-2 w-8 text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                    className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                                                                    disabled={updatingItemId === item.id || item.quantity >= (item.stock || 100)}
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path d="M12 4v16m8-8H4"></path>
                                                                    </svg>
                                                                </button>
                                                                {updatingItemId === item.id && (
                                                                    <svg className="animate-spin ml-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 border-b border-gray-200">
                                                            <span className="text-sm font-medium text-gray-900">{(parseFloat(item.price) * item.quantity).toFixed(2)} руб.</span>
                                                        </td>
                                                        <td className="py-4 px-4 border-b border-gray-200">
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="text-red-600 hover:text-red-900 focus:outline-none"
                                                                disabled={loading}
                                                            >
                                                                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                                        <button
                                            onClick={handleClearCart}
                                            className="w-full sm:w-auto mb-4 sm:mb-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            disabled={loading || items.length === 0}
                                        >
                                            Очистить корзину
                                        </button>
                                        
                                        <div className="flex flex-col items-end">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="text-xl font-semibold">Итого:</h3>
                                                <span className="text-2xl font-bold text-indigo-600">
                                                    {totalPrice.toFixed(2)} руб.
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={handleCheckout}
                                                className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                disabled={loading || items.length === 0}
                                            >
                                                Оформить заказ
                                            </button>
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