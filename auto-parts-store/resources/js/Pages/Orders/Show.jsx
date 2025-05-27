import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function OrderShow({ auth, order }) {
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const { data, setData, post, processing, reset } = useForm({
        status: order.status,
        note: '',
    });

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса заказа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-blue-200 text-blue-900',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };
    
    // Функция для получения текстового статуса платежа
    const getPaymentStatusText = (status) => {
        const statusMap = {
            'paid': 'Оплачен',
            'partially_paid': 'Частично оплачен',
            'unpaid': 'Не оплачен'
        };
        
        return statusMap[status] || status;
    };
    
    // Функция для получения класса цвета статуса оплаты
    const getPaymentStatusClass = (status) => {
        const statusClasses = {
            'paid': 'bg-green-100 text-green-800',
            'partially_paid': 'bg-blue-100 text-blue-800',
            'unpaid': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    // Функция для добавления заказа в корзину
    const addOrderToCart = async () => {
        if (addingToCart) return;
        
        setAddingToCart(true);
        setCartSuccess(false);
        
        try {
            const response = await axios.post('/api/cart/add-order', {
                order_id: order.id
            });
            
            if (response.data.success) {
                setCartSuccess(true);
                
                // Обновляем счетчик корзины
                window.dispatchEvent(new Event('cartUpdated'));
                
                // Через 3 секунды скрываем сообщение об успехе
                setTimeout(() => {
                    setCartSuccess(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Ошибка при добавлении заказа в корзину:', error);
            setError('Не удалось добавить товары из заказа в корзину. Пожалуйста, попробуйте позже.');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказ №{order.order_number}</h2>}
        >
            <Head title={`Заказ №${order.order_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <Link
                                        href="/orders"
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        ← Назад к списку заказов
                                    </Link>
                                    
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusClass(order.payment_status || 'unpaid')}`}>
                                            {getPaymentStatusText(order.payment_status || 'unpaid')}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Прогресс заказа */}
                                <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4">Статус выполнения заказа</h3>
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                            <div
                                                style={{ 
                                                    width: order.status === 'cancelled' ? '0%' :
                                                        order.status === 'pending' ? '20%' :
                                                        order.status === 'processing' ? '40%' :
                                                        order.status === 'shipped' ? '60%' :
                                                        order.status === 'delivered' ? '80%' :
                                                        order.status === 'completed' ? '100%' : '0%'
                                                }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <div className={`text-center ${order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? 'font-bold text-indigo-700' : ''}`}>
                                                Заказ принят
                                            </div>
                                            <div className={`text-center ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? 'font-bold text-indigo-700' : ''}`}>
                                                В обработке
                                            </div>
                                            <div className={`text-center ${order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' ? 'font-bold text-indigo-700' : ''}`}>
                                                Отправлен
                                            </div>
                                            <div className={`text-center ${order.status === 'delivered' || order.status === 'completed' ? 'font-bold text-indigo-700' : ''}`}>
                                                Доставлен
                                            </div>
                                            <div className={`text-center ${order.status === 'completed' ? 'font-bold text-indigo-700' : ''}`}>
                                                Выполнен
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {order.status === 'cancelled' && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-red-800 font-medium">Заказ был отменен</p>
                                        </div>
                                    )}
                                    
                                    {/* История статусов */}
                                    {order.status_history && order.status_history.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-medium mb-3 text-gray-700">История статусов</h4>
                                            <div className="space-y-2">
                                                {order.status_history.map((history, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm text-gray-900">
                                                                Статус изменен с <span className="font-medium">{getStatusText(history.from)}</span> на <span className="font-medium">{getStatusText(history.to)}</span>
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {formatDate(history.changed_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Информация о заказе */}
                                    <div className="md:col-span-2">
                                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                                            <h3 className="text-lg font-semibold mb-4">Информация о заказе</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Номер заказа</p>
                                                    <p className="font-medium">№{order.order_number}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Дата</p>
                                                    <p className="font-medium">{formatDate(order.created_at)}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">ФИО</p>
                                                    <p className="font-medium">{order.customer_name || order.shipping_name}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{order.email}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Телефон</p>
                                                    <p className="font-medium">{order.phone}</p>
                                                </div>
                                                
                                                <div className="sm:col-span-2">
                                                    <p className="text-sm text-gray-500">Адрес доставки</p>
                                                    <p className="font-medium">{order.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Товары заказа */}
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold mb-4">Товары</h3>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Товар
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Артикул
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Цена
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Кол-во
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Сумма
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {order.orderItems.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center">
                                                                        {item.sparePart.image_url && (
                                                                            <img 
                                                                                src={item.sparePart.image_url}
                                                                                alt={item.sparePart.name}
                                                                                className="h-10 w-10 object-cover mr-3"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <p className="font-medium text-gray-900">{item.sparePart.name}</p>
                                                                            {item.sparePart.brand && (
                                                                                <p className="text-xs text-gray-500">{item.sparePart.brand.name}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.sparePart.part_number}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.price} руб.
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {item.quantity}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {(item.price * item.quantity).toFixed(2)} руб.
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        
                                        {/* Платежи */}
                                        {order.payments && order.payments.length > 0 && (
                                            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
                                                <h3 className="text-lg font-semibold mb-4">Платежи</h3>
                                                
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    ID
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Дата
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Метод оплаты
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Сумма
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Статус
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Действия
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {order.payments.map((payment) => (
                                                                <tr key={payment.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {payment.id}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {formatDate(payment.created_at)}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {payment.payment_method ? payment.payment_method.name : 'Н/Д'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {payment.amount} руб.
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                                                                            {getStatusText(payment.status)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                                                        <Link
                                                                            href={route('finances.show', payment.id)}
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            Подробнее
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Сводка заказа */}
                                    <div>
                                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-6">
                                            <h3 className="text-lg font-semibold mb-4">Сводка заказа</h3>
                                            
                                            <div className="space-y-3 mb-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Сумма товаров</span>
                                                    <span className="font-medium">{order.total_amount || order.total} руб.</span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Доставка</span>
                                                    <span className="font-medium">0 руб.</span>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <div className="flex justify-between items-center text-lg font-bold">
                                                    <span>Итого:</span>
                                                    <span className="text-indigo-600">{order.total_amount || order.total} руб.</span>
                                                </div>
                                            </div>
                                            
                                            {/* Информация об оплате */}
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <h4 className="font-medium mb-3">Статус оплаты</h4>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-gray-600">Оплачено:</span>
                                                    <span className="font-medium text-green-600">{order.total_paid || 0} руб.</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-gray-600">Осталось оплатить:</span>
                                                    <span className="font-medium text-red-600">{order.remaining_amount || order.total_amount || order.total} руб.</span>
                                                </div>
                                                
                                                <Link
                                                    href={route('orders.add-payment', order.id)}
                                                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 block text-center mt-2"
                                                >
                                                    Добавить платеж
                                                </Link>
                                            </div>
                                            
                                            {/* Комментарии */}
                                            {order.notes_json && order.notes_json.length > 0 && (
                                                <div className="mt-6 border-t border-gray-200 pt-4">
                                                    <h4 className="font-medium mb-3">Комментарии</h4>
                                                    <div className="space-y-3">
                                                        {order.notes_json.map((note, index) => (
                                                            <div key={index} className="bg-white p-3 rounded-lg text-sm">
                                                                <p className="text-gray-600 text-xs">
                                                                    {formatDate(note.created_at)} · {note.created_by}
                                                                </p>
                                                                <p className="mt-1">{note.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-6">
                                                <button
                                                    onClick={addOrderToCart}
                                                    disabled={addingToCart}
                                                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                >
                                                    {addingToCart ? 'Добавление...' : 'Повторить заказ'}
                                                </button>
                                                
                                                {cartSuccess && (
                                                    <div className="mt-3 text-sm text-green-600">
                                                        Товары добавлены в корзину
                                                    </div>
                                                )}
                                                
                                                {error && (
                                                    <div className="mt-3 text-sm text-red-600">
                                                        {error}
                                                    </div>
                                                )}
                                            </div>
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