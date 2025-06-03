import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PartCard from '@/Components/Parts/PartCard';
import { formatPrice } from '@/utils/helpers';

export default function PartShow({ auth, part, similarParts = [], recommendedAnalogs = [] }) {
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Получаем информацию о пользователе и его роли
    const isAdmin = auth.user && auth.user.is_admin;

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

    // Функция для предложения аналога
    const handleSuggestAnalog = () => {
        window.location.href = `/suggestions/analog/${part.id}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали запчасти</h2>}
        >
            <Head title={part ? `${part.name} - Детали запчасти` : 'Запчасть не найдена'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщение об успешном добавлении в корзину */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                
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
                                            <Link
                                                href={`/search?q=${part.part_number}`}
                                                className="font-semibold text-blue-600 hover:underline hover:text-blue-800"
                                            >
                                                {part.part_number}
                                            </Link>
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Аналоги запчасти */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Аналоги запчасти</h2>
                        
                        {recommendedAnalogs && recommendedAnalogs.length > 0 ? (
                            <div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Эти запчасти могут быть аналогами, но требуют проверки специалистом.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendedAnalogs.map(analog => (
                                        <PartCard key={analog.id} part={analog} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-gray-600">Для этой запчасти пока нет утвержденных аналогов.</p>
                            </div>
                        )}
                        
                        {/* Кнопка предложить аналог */}
                        <div className="mt-4">
                            <Link
                                href={route('suggestions.create-analog', part.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Предложить аналог
                            </Link>
                        </div>
                    </div>
                    
                    {/* Совместимые модели */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4">Совместимые автомобили</h3>
                            
                            {part.compatibilities && part.compatibilities.length > 0 ? (
                                <ul className="space-y-3 mb-4">
                                    {part.compatibilities.map(compatibility => (
                                        <li key={compatibility.id} className="border-b pb-2">
                                            <span className="font-medium">{compatibility.brand} {compatibility.model}</span>
                                            {compatibility.years && (
                                                <span className="text-sm text-gray-600 ml-2">
                                                    ({compatibility.years})
                                                </span>
                                            )}
                                            {compatibility.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{compatibility.notes}</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    <p className="text-gray-600">Информация о совместимости с автомобилями пока не добавлена.</p>
                                </div>
                            )}
                            
                            <div className="mt-4">
                                <Link 
                                    href={route('suggestions.create-compatibility', part.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V5a1 1 0 00-1-1H3z" />
                                    </svg>
                                    Предложить совместимость
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 