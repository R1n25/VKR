import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function CartIcon({ user = null }) {
    const [itemCount, setItemCount] = useState(0);
    
    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        return user ? `cart_${user.id}` : 'cart_guest';
    };
    
    // Загружаем данные корзины из localStorage
    const loadCart = () => {
        console.log('Загрузка корзины...');
        const storageKey = getStorageKey();
        const storedCart = JSON.parse(localStorage.getItem(storageKey)) || [];
        console.log('Содержимое корзины:', storedCart);
        const count = storedCart.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
        console.log('Количество товаров в корзине:', count);
        setItemCount(count);
    };
    
    // Принудительно обновляем счетчик каждые 2 секунды для отладки
    useEffect(() => {
        loadCart(); // Загружаем при монтировании
        
        const interval = setInterval(() => {
            loadCart();
        }, 2000);
        
        return () => clearInterval(interval);
    }, [user]);
    
    useEffect(() => {
        // Функция для синхронизации локальной корзины с сервером
        const syncCartWithServer = async () => {
            if (user) {
                try {
                    // Получаем локальную корзину
                    const storageKey = getStorageKey();
                    const localCart = JSON.parse(localStorage.getItem(storageKey)) || [];
                    
                    if (localCart.length > 0) {
                        // Если в локальной корзине есть товары, синхронизируем с сервером
                        await axios.post('/api/cart/sync', { 
                            items: localCart 
                        });
                    } else {
                        // Если локальная корзина пуста, проверяем есть ли что-то на сервере
                        const response = await axios.get('/api/cart');
                        
                        if (response.data.success && response.data.data.items.length > 0) {
                            // Если на сервере есть корзина, используем ее
                            const serverCartItems = response.data.data.items.map(item => {
                                // Определяем, откуда брать данные (всегда из sparePart)
                                const itemData = item.sparePart;
                                
                                if (!itemData) return null;
                                
                                return {
                                    id: item.spare_part_id,
                                    name: itemData.name,
                                    price: item.price,
                                    image: itemData.image_url,
                                    quantity: item.quantity,
                                    stock: itemData.stock_quantity
                                };
                            }).filter(Boolean);
                            
                            localStorage.setItem(storageKey, JSON.stringify(serverCartItems));
                            loadCart(); // Обновляем счетчик
                        }
                    }
                } catch (error) {
                    console.error('Ошибка при синхронизации корзины:', error);
                }
            }
        };
        
        // Функция для обработки события обновления корзины
        const handleCartUpdated = (event) => {
            console.log('Событие cartUpdated получено!', event);
            loadCart();
        };
        
        // Синхронизируем корзину при монтировании компонента или изменении пользователя
        syncCartWithServer();
        
        // Добавляем слушатель события для обновления счетчика корзины
        window.addEventListener('cartUpdated', handleCartUpdated);
        
        // Добавляем обработчик для хранилища localStorage
        window.addEventListener('storage', (event) => {
            const storageKey = getStorageKey();
            if (event.key === storageKey) {
                console.log('Событие storage получено!', event);
                loadCart();
            }
        });
        
        // Очистка слушателей при размонтировании
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdated);
            window.removeEventListener('storage', (event) => {
                const storageKey = getStorageKey();
                if (event.key === storageKey) loadCart();
            });
        };
    }, [user]);
    
    return (
        <Link 
            href={route('cart')} 
            className="relative flex items-center text-white hover:text-gray-200 transition-colors duration-300"
        >
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                
                {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </div>
        </Link>
    );
} 