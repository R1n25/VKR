import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Создаем контекст для корзины
const CartContext = createContext();

// Хук для использования контекста корзины
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider');
    }
    return context;
};

// Провайдер контекста корзины
export const CartProvider = ({ children, user }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получаем ключ для localStorage в зависимости от пользователя
    const getStorageKey = () => {
        // Для авторизованного пользователя всегда используем его ID
        if (user && user.id) {
            return `cart_user_${user.id}`;
        }
        
        // Для гостя используем сохраненный ключ или создаем новый
        const guestKey = localStorage.getItem('cart_guest_key');
        if (guestKey) {
            return guestKey;
        }
        
        // Если ключа гостя нет, создаем новый
        const newGuestKey = 'cart_guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cart_guest_key', newGuestKey);
        return newGuestKey;
    };

    // Функция загрузки корзины из localStorage
    const loadCart = () => {
        try {
            const storageKey = getStorageKey();
            // Сохраняем текущий ключ корзины для использования в других компонентах
            localStorage.setItem('cart_storage_key', storageKey);
            
            // Получаем данные из localStorage
            const storedCartString = localStorage.getItem(storageKey);
            
            // Проверяем, что данные существуют и являются валидным JSON
            if (storedCartString) {
                try {
                    const storedCart = JSON.parse(storedCartString);
                    if (Array.isArray(storedCart)) {
                        console.log(`Загружена корзина из localStorage (${storageKey}):`, storedCart);
                        setCart(storedCart);
                        setLoading(false);
                        setError(null);
                        return storedCart;
                    } else {
                        console.warn('Данные корзины в localStorage не являются массивом:', storedCartString);
                    }
                } catch (jsonError) {
                    console.error('Ошибка при парсинге JSON корзины:', jsonError);
                }
            } else {
                console.log(`Корзина в localStorage (${storageKey}) пуста или не существует`);
            }
            
            // Если данные не существуют или невалидны, возвращаем пустой массив
            setCart([]);
            setLoading(false);
            setError(null);
            return [];
        } catch (error) {
            console.error('Ошибка при загрузке корзины из localStorage:', error);
            setError('Не удалось загрузить корзину. Попробуйте перезагрузить страницу.');
            setCart([]);
            setLoading(false);
            return [];
        }
    };

    // Функция обновления корзины в localStorage и отправка события
    const updateCart = (updatedCart) => {
        try {
            const storageKey = getStorageKey();
            
            // Проверяем, что updatedCart - это массив
            if (!Array.isArray(updatedCart)) {
                console.error('Попытка обновить корзину с невалидными данными:', updatedCart);
                return false;
            }
            
            // Сохраняем в localStorage
            localStorage.setItem(storageKey, JSON.stringify(updatedCart));
            
            // Обновляем состояние
            setCart(updatedCart);
            
            // Отправляем событие обновления корзины
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: updatedCart, storageKey },
                bubbles: true
            }));
            
            console.log('Корзина обновлена:', updatedCart);
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении корзины в localStorage:', error);
            setError('Не удалось обновить корзину. Попробуйте перезагрузить страницу.');
            return false;
        }
    };

    // Функция добавления товара в корзину
    const addToCart = async (sparePart, quantity) => {
        try {
            // Получаем текущую корзину
            const currentCart = [...cart];
            
            // Проверяем, есть ли уже этот товар в корзине
            const existingItemIndex = currentCart.findIndex(item => item.id === sparePart.id);
            
            if (existingItemIndex !== -1) {
                // Обновляем количество, если товар уже в корзине
                const newQuantity = currentCart[existingItemIndex].quantity + quantity;
                
                // Проверяем, не превышает ли новое количество доступное на складе
                if (newQuantity > sparePart.stock_quantity) {
                    setError(`Максимальное доступное количество: ${sparePart.stock_quantity}`);
                    return false;
                }
                
                currentCart[existingItemIndex].quantity = newQuantity;
                console.log(`Обновлено количество товара ID ${sparePart.id} в корзине: ${newQuantity}`);
            } else {
                // Добавляем новый товар в корзину
                currentCart.push({
                    id: sparePart.id,
                    name: sparePart.name,
                    price: parseFloat(sparePart.price), // Преобразуем в число
                    image: sparePart.image_url || sparePart.image,
                    quantity: quantity,
                    stock: sparePart.stock_quantity,
                    part_number: sparePart.part_number
                });
                console.log(`Добавлен новый товар в корзину: ${sparePart.name} (ID: ${sparePart.id})`);
            }
            
            // Обновляем корзину
            updateCart(currentCart);
            
            // Если пользователь авторизован, также сохраняем в базе данных
            if (user) {
                try {
                    const response = await axios.post('/api/cart/add', {
                        spare_part_id: sparePart.id,
                        quantity: quantity
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (!response.data.success) {
                        console.error('Ошибка при добавлении в корзину:', response.data.message);
                    }
                } catch (error) {
                    console.error('Ошибка при добавлении в корзину на сервере:', error);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
            setError('Не удалось добавить товар в корзину. Попробуйте еще раз.');
            return false;
        }
    };

    // Функция обновления количества товара в корзине
    const updateQuantity = (id, newQuantity) => {
        const updatedCart = cart.map(item => {
            if (item.id === id) {
                // Проверяем ограничения на количество
                let quantity = parseInt(newQuantity);
                if (isNaN(quantity) || quantity < 1) quantity = 1;
                if (quantity > item.stock) quantity = item.stock;
                
                return { ...item, quantity };
            }
            return item;
        });
        
        return updateCart(updatedCart);
    };

    // Функция удаления товара из корзины
    const removeItem = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        return updateCart(updatedCart);
    };

    // Функция очистки корзины
    const clearCart = () => {
        return updateCart([]);
    };

    // Расчет общей суммы заказа
    const getTotalAmount = () => {
        return cart.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    // Расчет общего количества товаров в корзине
    const getTotalItems = () => {
        return cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    };

    // Загружаем корзину при монтировании компонента
    useEffect(() => {
        loadCart();
        
        // Добавляем слушатель события обновления корзины
        const handleCartUpdated = (event) => {
            if (event.detail && event.detail.storageKey === getStorageKey()) {
                if (event.detail.cart) {
                    // Если в событии передана корзина, используем её
                    setCart(event.detail.cart);
                } else {
                    // Иначе загружаем данные из localStorage
                    loadCart();
                }
            }
        };
        
        // Добавляем слушатель события изменения localStorage
        const handleStorageChange = (e) => {
            if (e.key === getStorageKey()) {
                loadCart();
            }
        };
        
        // Регистрируем обработчики событий
        window.addEventListener('cartUpdated', handleCartUpdated);
        window.addEventListener('storage', handleStorageChange);
        
        // Отписываемся от событий при размонтировании
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdated);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [user]); // Перезагружаем корзину при смене пользователя

    // Синхронизация корзины с сервером при авторизации пользователя
    useEffect(() => {
        // При изменении пользователя очищаем старые ключи корзины
        if (user) {
            // Очищаем гостевую корзину, если пользователь авторизовался
            localStorage.removeItem('cart_guest');
            
            // Создаем ключ для текущего пользователя
            const userKey = `cart_user_${user.id}`;
            
            // Очищаем все другие пользовательские корзины
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cart_user_') && key !== userKey) {
                    localStorage.removeItem(key);
                }
            }
            
            // Устанавливаем текущий ключ корзины
            localStorage.setItem('cart_storage_key', userKey);
            
            const syncCartWithServer = async () => {
                console.log('Начинаем синхронизацию корзины с сервером для пользователя:', user.id);
                
                // Сначала загружаем локальную корзину
                const localCart = loadCart();
                
                try {
                    // Получаем корзину с сервера для данного пользователя
                    console.log('Запрашиваем данные корзины с сервера...');
                    const response = await axios.get('/api/cart', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        withCredentials: true
                    });
                    
                    console.log('Получен ответ от сервера:', response.data);
                    
                    // Если на сервере есть корзина и в ней есть товары
                    if (response.data.success && response.data.cart && response.data.cart.length > 0) {
                        console.log('На сервере найдена корзина с товарами:', response.data.cart);
                        // Обновляем локальную корзину данными с сервера
                        updateCart(response.data.cart);
                    } 
                    // Если на сервере нет товаров, но есть локальные товары
                    else if (localCart.length > 0) {
                        console.log('На сервере корзина пуста, но есть локальные товары. Синхронизируем с сервером:', localCart);
                        // Синхронизируем локальную корзину с сервером
                        try {
                            await axios.post('/api/cart/sync', { items: localCart }, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'X-Requested-With': 'XMLHttpRequest'
                                },
                                withCredentials: true
                            });
                            console.log('Локальная корзина успешно синхронизирована с сервером');
                        } catch (syncError) {
                            console.error('Ошибка при синхронизации локальной корзины с сервером:', syncError);
                            // Продолжаем использовать локальную корзину
                        }
                    } else {
                        console.log('И на сервере, и локально корзина пуста');
                    }
                } catch (error) {
                    console.error('Ошибка при получении корзины с сервера:', error);
                    // Если не удалось получить корзину с сервера, продолжаем использовать локальную
                    if (localCart.length > 0) {
                        console.log('Используем локальную корзину:', localCart);
                    }
                }
            };
            
            syncCartWithServer();
        } else {
            // Если пользователь не авторизован, используем гостевую корзину
            const guestKey = localStorage.getItem('cart_guest_key') || 'cart_guest_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('cart_guest_key', guestKey);
            localStorage.setItem('cart_storage_key', guestKey);
            
            // Загружаем гостевую корзину
            loadCart();
        }
    }, [user]);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            error,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            getTotalAmount,
            getTotalItems,
            loadCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
