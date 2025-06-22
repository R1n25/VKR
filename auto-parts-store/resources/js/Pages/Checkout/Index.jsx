import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, cart, cartItems, user }) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [validationErrors, setValidationErrors] = useState({
        shipping_phone: '',
    });
    const [formData, setFormData] = useState({
        shipping_name: user ? user.name : '',
        shipping_phone: user ? user.phone || '' : '',
        shipping_address: '',
        shipping_city: '',
        shipping_zip: '',
        notes: '',
    });
    
    // Функция для валидации телефонного номера в российском формате
    const validatePhone = (phoneNumber) => {
        // Удаляем все нецифровые символы для проверки
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Проверка основных форматов российских номеров:
        // 1. Начинается с 7 или 8, всего 11 цифр
        // 2. Начинается с +7, всего 11 цифр (+ не считается)
        if (/^7\d{10}$/.test(digits) || /^8\d{10}$/.test(digits)) {
            return { isValid: true, error: '' };
        } else if (digits.length !== 11) {
            return { 
                isValid: false, 
                error: 'Номер телефона должен содержать 11 цифр'
            };
        } else if (!/^[78]/.test(digits)) {
            return { 
                isValid: false, 
                error: 'Номер должен начинаться с 7 или 8'
            };
        } else {
            return { 
                isValid: false, 
                error: 'Неверный формат номера телефона'
            };
        }
    };
    
    // Форматирование телефонного номера для удобного отображения
    const formatPhone = (phoneNumber) => {
        // Удаляем все нецифровые символы
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Если номер пустой, возвращаем пустую строку
        if (!digits) return '';
        
        // Форматируем номер в формате +7 (XXX) XXX-XX-XX
        if (digits.length <= 1) {
            return digits;
        } else if (digits.length <= 4) {
            return `+7 (${digits.substring(1)}`;
        } else if (digits.length <= 7) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4)}`;
        } else if (digits.length <= 9) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
        } else {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Специальная обработка для телефона
        if (name === 'shipping_phone') {
            // Форматируем номер и сохраняем его
            const formattedValue = formatPhone(value);
            
            // Проверяем валидность номера
            const { isValid, error } = validatePhone(value);
            
            // Устанавливаем ошибку только если поле не пустое
            if (value && !isValid) {
                setValidationErrors(prev => ({
                    ...prev,
                    shipping_phone: error
                }));
            } else {
                setValidationErrors(prev => ({
                    ...prev,
                    shipping_phone: ''
                }));
            }
            
            // Обновляем значение поля
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            // Для других полей стандартная обработка
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Проверяем валидность телефона перед отправкой
        const { isValid, error } = validatePhone(formData.shipping_phone);
        if (!isValid && formData.shipping_phone) {
            setValidationErrors(prev => ({
                ...prev,
                shipping_phone: error
            }));
            return;
        }
        
        setProcessing(true);
        setErrors({});

        router.post(url('checkout/store'), formData, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    // Если корзина пуста, перенаправляем на страницу корзины
    if (!cartItems || cartItems.length === 0) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-white leading-tight">Оформление заказа</h2>}
            >
                <Head title="Оформление заказа" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 text-center">
                                <p className="mb-4">Ваша корзина пуста. Добавьте товары для оформления заказа.</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                >
                                    Перейти к покупкам
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Расчет общей суммы (хотя обычно она уже должна быть в объекте cart)
    const totalPrice = cart.total_price || 
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Оформление заказа</h2>}
        >
            <Head title="Оформление заказа" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Форма для ввода данных */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold mb-6">Данные доставки</h3>
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="shipping_name" className="block text-sm font-medium text-gray-700">
                                                    ФИО получателя
                                                </label>
                                                <input
                                                    type="text"
                                                    id="shipping_name"
                                                    name="shipping_name"
                                                    value={formData.shipping_name}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shipping_name ? 'border-red-500' : ''}`}
                                                />
                                                {errors.shipping_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.shipping_name}</p>
                                                )}
                                            </div>
                                            
                                            <div className="sm:col-span-2">
                                                <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700">
                                                    Телефон
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="shipping_phone"
                                                    name="shipping_phone"
                                                    value={formData.shipping_phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+7 (XXX) XXX-XX-XX"
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shipping_phone || validationErrors.shipping_phone ? 'border-red-500' : ''}`}
                                                />
                                                {validationErrors.shipping_phone && (
                                                    <p className="mt-1 text-sm text-red-600">{validationErrors.shipping_phone}</p>
                                                )}
                                                {errors.shipping_phone && !validationErrors.shipping_phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.shipping_phone}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700">
                                                    Город
                                                </label>
                                                <input
                                                    type="text"
                                                    id="shipping_city"
                                                    name="shipping_city"
                                                    value={formData.shipping_city}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shipping_city ? 'border-red-500' : ''}`}
                                                />
                                                {errors.shipping_city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.shipping_city}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="shipping_zip" className="block text-sm font-medium text-gray-700">
                                                    Почтовый индекс
                                                </label>
                                                <input
                                                    type="text"
                                                    id="shipping_zip"
                                                    name="shipping_zip"
                                                    value={formData.shipping_zip}
                                                    onChange={handleInputChange}
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shipping_zip ? 'border-red-500' : ''}`}
                                                />
                                                {errors.shipping_zip && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.shipping_zip}</p>
                                                )}
                                            </div>
                                            
                                            <div className="sm:col-span-2">
                                                <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                                                    Адрес доставки
                                                </label>
                                                <textarea
                                                    id="shipping_address"
                                                    name="shipping_address"
                                                    value={formData.shipping_address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.shipping_address ? 'border-red-500' : ''}`}
                                                ></textarea>
                                                {errors.shipping_address && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                                                )}
                                            </div>
                                            
                                            <div className="sm:col-span-2">
                                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                                    Примечания к заказу
                                                </label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.notes ? 'border-red-500' : ''}`}
                                                ></textarea>
                                                {errors.notes && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-between">
                                            <Link
                                                href={url('cart')}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                ← Вернуться в корзину
                                            </Link>
                                            
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                            >
                                                {processing ? 'Оформление...' : 'Оформить заказ'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                
                                {/* Сводка заказа */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Ваш заказ</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between">
                                                <div>
                                                    <p className="font-medium">{item.sparePart.name}</p>
                                                    <p className="text-gray-600 text-sm">{item.quantity} шт. × {item.price} руб.</p>
                                                </div>
                                                <div className="font-semibold">
                                                    {(item.price * item.quantity).toFixed(2)} руб.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Итого:</span>
                                            <span className="text-indigo-600">{totalPrice} руб.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}