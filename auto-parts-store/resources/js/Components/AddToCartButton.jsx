import React, { useState } from 'react';
import axios from 'axios';

export default function AddToCartButton({ sparePart, className = '', user = null }) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        return user ? `cart_${user.id}` : 'cart_guest';
    };
    
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) {
            setQuantity(1);
        } else if (value > sparePart.stock_quantity) {
            setQuantity(sparePart.stock_quantity);
        } else {
            setQuantity(value);
        }
    };
    
    // Функция для обновления счетчика корзины
    const updateCartCounter = (cart) => {
        const storageKey = getStorageKey();
        
        // Отправляем событие обновления корзины с использованием CustomEvent
        const cartUpdatedEvent = new CustomEvent('cartUpdated', {
            detail: { cart, storageKey },
            bubbles: true
        });
        window.dispatchEvent(cartUpdatedEvent);
        
        // Также напрямую обновляем localStorage
        localStorage.setItem(storageKey, JSON.stringify(cart));
    };
    
    const addToCart = async () => {
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            // Получаем текущую корзину из localStorage
            const storageKey = getStorageKey();
            const cart = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Проверяем, есть ли уже этот товар в корзине
            const existingItemIndex = cart.findIndex(item => item.id === sparePart.id);
            
            if (existingItemIndex !== -1) {
                // Обновляем количество, если товар уже в корзине
                const newQuantity = cart[existingItemIndex].quantity + quantity;
                
                // Проверяем, не превышает ли новое количество доступное на складе
                if (newQuantity > sparePart.stock_quantity) {
                    setErrorMessage(`Максимальное доступное количество: ${sparePart.stock_quantity}`);
                    setIsLoading(false);
                    return;
                }
                
                cart[existingItemIndex].quantity = newQuantity;
            } else {
                // Добавляем новый товар в корзину
                cart.push({
                    id: sparePart.id,
                    name: sparePart.name,
                    price: sparePart.price,
                    image_url: sparePart.image_url || sparePart.image,
                    quantity: quantity,
                    stock: sparePart.stock_quantity
                });
            }
            
            // Обновляем корзину в localStorage и счетчик
            updateCartCounter(cart);
            
            // Если пользователь авторизован, также сохраняем в базе данных
            if (user) {
                try {
                    const response = await axios.post('/api/cart/add', {
                        spare_part_id: sparePart.id,
                        quantity: quantity
                    });
                    
                    if (!response.data.success) {
                        console.error('Ошибка при добавлении в корзину:', response.data.message);
                        // Не выводим ошибку пользователю, так как товар уже добавлен в localStorage
                    }
                } catch (error) {
                    console.error('Ошибка при добавлении в корзину на сервере:', error);
                    // Не выводим ошибку пользователю, так как товар уже добавлен в localStorage
                }
            }
            
            // Отправляем событие обновления количества товара
            const productUpdatedEvent = new CustomEvent('productUpdated', {
                detail: { 
                    productId: sparePart.id,
                    action: 'addToCart',
                    quantity: quantity
                },
                bubbles: true
            });
            window.dispatchEvent(productUpdatedEvent);
            
            // Показываем подтверждение
            setIsAdded(true);
            
            // Через 2 секунды скрываем подтверждение
            setTimeout(() => {
                setIsAdded(false);
            }, 2000);
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            setErrorMessage('Не удалось добавить товар в корзину. Попробуйте еще раз.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center mb-2">
                <div className="flex rounded-md">
                    <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="px-2 py-1 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                        disabled={quantity <= 1 || isLoading}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={sparePart.stock_quantity}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-14 border-t border-b border-gray-300 text-center py-1"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.min(sparePart.stock_quantity, prev + 1))}
                        className="px-2 py-1 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                        disabled={quantity >= sparePart.stock_quantity || isLoading}
                    >
                        +
                    </button>
                </div>
                <span className="text-sm text-gray-500 ml-3">В наличии: {sparePart.stock_quantity} шт.</span>
            </div>
            
            <button
                onClick={addToCart}
                disabled={isAdded || sparePart.stock_quantity === 0 || isLoading}
                className={`px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center ${
                    isAdded
                        ? 'bg-green-600 text-white'
                        : sparePart.stock_quantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isLoading
                                ? 'bg-[#3a5085] text-white cursor-wait'
                                : 'bg-[#243969] hover:bg-[#3a5085] text-white'
                }`}
            >
                {isAdded ? (
                    <>
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Добавлено
                    </>
                ) : sparePart.stock_quantity === 0 ? (
                    'Нет в наличии'
                ) : isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Добавление...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        В корзину
                    </>
                )}
            </button>
            
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
} 