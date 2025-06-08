import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function CartIcon({ user = null }) {
    const [itemCount, setItemCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        return user ? `cart_${user.id}` : 'cart_guest';
    };
    
    // Загружаем данные корзины из localStorage
    const loadCart = () => {
        console.log('Загрузка корзины...');
        const storageKey = getStorageKey();
        let storedCart = [];
        try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                storedCart = JSON.parse(storedData);
                console.log('Данные корзины загружены', storedCart);
            } else {
                console.log('Корзина пуста');
            }
        } catch (error) {
            console.error('Ошибка при загрузке корзины из localStorage:', error);
        }
        
        // Подсчитываем общее количество товаров
        const count = Array.isArray(storedCart) ? storedCart.reduce((total, item) => total + (item.quantity || 0), 0) : 0;
        console.log('Количество товаров в корзине:', count);
        setItemCount(count);
        
        if (count > 0) {
            triggerAnimation();
        }
    };
    
    // Функция для запуска анимации
    const triggerAnimation = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 800);
    };
    
    // Обработчик события обновления корзины
    const handleCartUpdate = (event) => {
        console.log('Событие cartUpdated получено!', event);
        loadCart();
    };
    
    // Обработчик события изменения localStorage
    const handleStorageChange = (e) => {
        console.log('storage получено!', e);
        if (e.key === getStorageKey()) {
            loadCart();
        }
    };
    
    useEffect(() => {
        // Загружаем данные корзины при монтировании компонента
        loadCart();
        
        // Добавляем обработчики событий
        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', handleStorageChange);
        
        // Удаляем обработчики событий при размонтировании компонента
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [user]); // Перезагружаем при изменении пользователя
    
    return (
        <Link
            href="/cart"
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 group"
        >
            <div className="relative">
                {isAnimating && (
                    <svg 
                        className="w-6 h-6 animate-ping absolute opacity-70" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        ></path>
                    </svg>
                )}
                
                <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                </svg>
                
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary-600 rounded-full shadow-md transition-all duration-200 group-hover:scale-110 min-w-[20px] h-[20px]">
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                )}
            </div>
        </Link>
    );
} 