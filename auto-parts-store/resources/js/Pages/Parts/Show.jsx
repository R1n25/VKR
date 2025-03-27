import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PartShow({ auth, partId }) {
    const [part, setPart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchPart = async () => {
            try {
                const response = await axios.get(`/api/parts/${partId}`);
                setPart(response.data.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных запчасти:', error);
                setMessage({ 
                    text: 'Не удалось загрузить информацию о запчасти', 
                    type: 'error' 
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchPart();
    }, [partId]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        
        if (value < 1) {
            setQuantity(1);
        } else if (part && value > part.stock) {
            setQuantity(part.stock);
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
            if (cart[existingItemIndex].quantity > part.stock) {
                cart[existingItemIndex].quantity = part.stock;
            }
        } else {
            // Если запчасти нет в корзине, добавляем новый элемент
            cart.push({
                id: part.id,
                name: part.name,
                price: part.price,
                image: part.image,
                quantity: quantity,
                stock: part.stock
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
            <Head title={part ? `${part.name} - Детали запчасти` : 'Загрузка...'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>Загрузка информации о запчасти...</p>
                                </div>
                            ) : part ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Изображение запчасти */}
                                    <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-80">
                                        {part.image ? (
                                            <img 
                                                src={`/storage/${part.image}`} 
                                                alt={part.name} 
                                                className="object-contain h-full w-full"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-center p-6">
                                                Изображение отсутствует
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Информация о запчасти */}
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2">{part.name}</h1>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Артикул: </span>
                                            <span className="font-semibold">{part.sku}</span>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Бренд: </span>
                                            <Link 
                                                href={`/brands/${part.car_model.car_brand.id}`}
                                                className="font-semibold text-indigo-600 hover:text-indigo-800"
                                            >
                                                {part.car_model.car_brand.name}
                                            </Link>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Модель: </span>
                                            <Link 
                                                href={`/models/${part.car_model.id}`}
                                                className="font-semibold text-indigo-600 hover:text-indigo-800"
                                            >
                                                {part.car_model.name}
                                            </Link>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-gray-600">Категория: </span>
                                            <Link 
                                                href={`/categories/${part.category.id}`}
                                                className="font-semibold text-indigo-600 hover:text-indigo-800"
                                            >
                                                {part.category.name}
                                            </Link>
                                        </div>
                                        
                                        {part.description && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-2">Описание:</h3>
                                                <p className="text-gray-700">{part.description}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Наличие:</h3>
                                            <div className={`text-${part.stock > 0 ? 'green' : 'red'}-600`}>
                                                {part.stock > 0 ? `В наличии: ${part.stock} шт.` : 'Нет в наличии'}
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-indigo-600">{part.price} руб.</h3>
                                        </div>
                                        
                                        {part.stock > 0 && (
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
                                                        max={part.stock}
                                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-20"
                                                    />
                                                </div>
                                                
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={addingToCart}
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
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
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xl text-red-600 mb-4">Запчасть не найдена</p>
                                    <Link 
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Вернуться на главную
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