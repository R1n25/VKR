import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PartShow({ auth, part, similarParts = [] }) {
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Получаем информацию о пользователе и его роли
    const isAdmin = auth.user && auth.user.is_admin;

    // Функция для форматирования цены
    const formatPrice = (price) => {
        if (!price) return '0.00';
        
        // Проверяем, является ли цена строкой или числом
        if (typeof price === 'string') {
            // Уже строка, просто возвращаем
            return price;
        } else {
            // Преобразуем в строку с двумя знаками после запятой
            return Number(price).toFixed(2);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        
        if (value < 1) {
            setQuantity(1);
        } else if (part && value > part.stock_quantity) {
            setQuantity(part.stock_quantity);
        } else {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        setAddingToCart(true);
        
        // Получаем текущую корзину из localStorage или создаем новую
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Проверяем, есть ли уже такая запчасть в корзине
        const existingItemIndex = cart.findIndex(item => item.id === part.id);
        
        if (existingItemIndex !== -1) {
            // Если запчасть уже есть в корзине, обновляем количество
            cart[existingItemIndex].quantity += quantity;
            
            // Проверка на доступное количество
            if (cart[existingItemIndex].quantity > part.stock_quantity) {
                cart[existingItemIndex].quantity = part.stock_quantity;
            }
        } else {
            // Если запчасти нет в корзине, добавляем новый элемент
            cart.push({
                id: part.id,
                name: part.name,
                price: isAdmin ? part.markup_price : part.price,
                image: part.image_url,
                quantity: quantity,
                stock: part.stock_quantity
            });
        }
        
        // Сохраняем обновленную корзину в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        setAddingToCart(false);
        setMessage({ 
            text: 'Запчасть добавлена в корзину', 
            type: 'success' 
        });
        
        // Сбрасываем сообщение через 3 секунды
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали запчасти</h2>}
        >
            <Head title={part ? `${part.name} - Детали запчасти` : 'Запчасть не найдена'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {!part ? (
                                <div className="text-center py-10">
                                    <p className="text-xl text-red-600 mb-4">Запчасть не найдена</p>
                                    <Link 
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Вернуться на главную
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Изображение запчасти */}
                                    <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-80">
                                        {part.image_url ? (
                                            <img 
                                                src={part.image_url} 
                                                alt={part.name} 
                                                className="object-contain h-full w-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                                <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Информация о запчасти */}
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">{part.name}</h1>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Артикул: </span>
                                            <span className="font-semibold">{part.part_number}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Производитель: </span>
                                            <span className="font-semibold">{part.manufacturer}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Категория: </span>
                                            <span className="font-semibold">{part.category}</span>
                                        </div>
                                        
                                        {part.description && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-2">Описание:</h3>
                                                <p className="text-gray-700">{part.description}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Наличие:</h3>
                                            <div className={`text-${part.stock_quantity > 0 ? 'green' : 'red'}-600`}>
                                                {part.stock_quantity > 0 ? `В наличии: ${part.stock_quantity} шт.` : 'Нет в наличии'}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            {isAdmin ? (
                                                <div>
                                                    <div className="flex items-center mb-2">
                                                        <span className="text-gray-600 mr-2">Закупочная цена:</span>
                                                        <span className="text-xl font-bold text-gray-700">
                                                            {part.original_price ? `${formatPrice(part.original_price)} ₽` : '—'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-gray-600 mr-2">Цена продажи:</span>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            {part.markup_price ? `${formatPrice(part.markup_price)} ₽` : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <h3 className="text-2xl font-bold text-green-600">
                                                    {part.price ? `${formatPrice(part.price)} ₽` : '—'}
                                                </h3>
                                            )}
                                        </div>
                                        
                                        {part.stock_quantity > 0 && (
                                            <div className="flex items-center">
                                                <div className="mr-4">
                                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Количество:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="quantity"
                                                        name="quantity"
                                                        value={quantity}
                                                        onChange={handleQuantityChange}
                                                        min="1"
                                                        max={part.stock_quantity}
                                                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm w-20"
                                                    />
                                                </div>
                                                
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={addingToCart}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    {addingToCart ? 'Добавление...' : 'Добавить в корзину'}
                                                </button>
                                            </div>
                                        )}
                                        
                                        {message.text && (
                                            <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {message.text}
                                            </div>
                                        )}
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