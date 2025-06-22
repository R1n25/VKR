import React, { useState, useEffect } from 'react';
import { useCart } from '@/Contexts/CartContext';

export default function AddToCartButton({ sparePart, className = '' }) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    
    // Используем контекст корзины
    const { cart, addToCart, error: cartError } = useCart();
    
    // Проверяем, есть ли товар уже в корзине при загрузке компонента
    useEffect(() => {
        if (sparePart && sparePart.id) {
            const existingItem = cart.find(item => item.id === sparePart.id);
            
            if (existingItem) {
                setIsInCart(true);
                setQuantity(existingItem.quantity);
            } else {
                setIsInCart(false);
                setQuantity(1);
            }
        }
    }, [sparePart, cart]);
    
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
    
    const handleAddToCart = async () => {
        setIsLoading(true);
        
        try {
            const success = await addToCart(sparePart, quantity);
            
            if (success) {
                // Показываем подтверждение
                setIsAdded(true);
                setIsInCart(true);
                
                // Через 2 секунды скрываем подтверждение
                setTimeout(() => {
                    setIsAdded(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className={`flex flex-col w-full ${className}`}>
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
                onClick={handleAddToCart}
                disabled={isAdded || sparePart.stock_quantity === 0 || isLoading}
                className={`w-full h-12 px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center ${
                    isAdded
                        ? 'bg-green-600 text-white'
                        : sparePart.stock_quantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isLoading
                                ? 'bg-[#3a5085] text-white cursor-wait'
                                : isInCart
                                    ? 'bg-[#3a5085] hover:bg-[#243969] text-white'
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
                ) : isInCart ? (
                    <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Обновить корзину
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
            
            {cartError && (
                <p className="text-red-500 text-sm mt-1">{cartError}</p>
            )}
        </div>
    );
} 