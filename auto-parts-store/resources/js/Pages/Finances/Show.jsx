import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PaymentShow({ auth, payment, isAdmin }) {
    const [editMode, setEditMode] = useState(false);
    
    const { data, setData, patch, processing, errors, reset } = useForm({
        status: payment.status,
        note: '',
    });

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Н/Д';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    // Функция для получения текстового статуса платежа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'completed': 'Выполнен',
            'failed': 'Ошибка',
            'refunded': 'Возвращен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };
    
    // Обработчик обновления статуса платежа
    const handleUpdateStatus = (e) => {
        e.preventDefault();
        
        patch(route('finances.update-status', payment.id), {
            onSuccess: () => {
                setEditMode(false);
                reset('note');
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Платеж #{payment.id}</h2>}
        >
            <Head title={`Платеж #${payment.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <Link
                                    href={route('finances.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Назад к списку платежей
                                </Link>
                                
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Информация о платеже */}
                                <div className="md:col-span-2">
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                                        <h3 className="text-lg font-semibold mb-4">Информация о платеже</h3>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">ID платежа</p>
                                                <p className="font-medium">#{payment.id}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500">Дата создания</p>
                                                <p className="font-medium">{formatDate(payment.created_at)}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500">Дата оплаты</p>
                                                <p className="font-medium">{formatDate(payment.payment_date)}</p>
                                            </div>
                                            
                                            {payment.refund_date && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Дата возврата</p>
                                                    <p className="font-medium">{formatDate(payment.refund_date)}</p>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <p className="text-sm text-gray-500">Метод оплаты</p>
                                                <p className="font-medium">{payment.payment_method ? payment.payment_method.name : 'Н/Д'}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm text-gray-500">Сумма</p>
                                                <p className="font-medium">{payment.amount} руб.</p>
                                            </div>
                                            
                                            {payment.transaction_id && (
                                                <div>
                                                    <p className="text-sm text-gray-500">ID транзакции</p>
                                                    <p className="font-medium">{payment.transaction_id}</p>
                                                </div>
                                            )}
                                            
                                            {isAdmin && payment.user && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Пользователь</p>
                                                    <p className="font-medium">{payment.user.name} ({payment.user.email})</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {payment.notes && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500">Примечания</p>
                                                <p className="font-medium whitespace-pre-line">{payment.notes}</p>
                                            </div>
                                        )}
                                        
                                        {payment.payment_data && Object.keys(payment.payment_data).length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500">Дополнительные данные</p>
                                                <div className="bg-white p-3 rounded border mt-2">
                                                    <pre className="text-xs">{JSON.stringify(payment.payment_data, null, 2)}</pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Связанный заказ */}
                                    {payment.order && (
                                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold mb-4">Информация о заказе</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Номер заказа</p>
                                                    <p className="font-medium">
                                                        <Link
                                                            href={route('orders.show', payment.order.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            {payment.order.order_number || `#${payment.order.id}`}
                                                        </Link>
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Дата заказа</p>
                                                    <p className="font-medium">{formatDate(payment.order.created_at)}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Статус заказа</p>
                                                    <p className="font-medium">{getStatusText(payment.order.status)}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Сумма заказа</p>
                                                    <p className="font-medium">{payment.order.total || payment.order.total_price} руб.</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm text-gray-500">Клиент</p>
                                                    <p className="font-medium">{payment.order.customer_name || (payment.order.user ? payment.order.user.name : 'Н/Д')}</p>
                                                </div>
                                            </div>
                                            
                                            {payment.order.orderItems && payment.order.orderItems.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-500 mb-2">Товары в заказе</p>
                                                    <ul className="space-y-2">
                                                        {payment.order.orderItems.map((item) => (
                                                            <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                                <div className="flex items-center">
                                                                    {item.sparePart.image_url && (
                                                                        <img 
                                                                            src={item.sparePart.image_url} 
                                                                            alt={item.sparePart.name}
                                                                            className="w-10 h-10 object-cover mr-3 rounded"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{item.sparePart.name}</p>
                                                                        <p className="text-xs text-gray-500">{item.sparePart.part_number}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium">{item.price} руб.</p>
                                                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Управление платежом */}
                                <div>
                                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-6">
                                        <h3 className="text-lg font-semibold mb-4">Действия</h3>
                                        
                                        {isAdmin && !editMode && (
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(true)}
                                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Изменить статус
                                            </button>
                                        )}
                                        
                                        {isAdmin && editMode && (
                                            <form onSubmit={handleUpdateStatus}>
                                                <div className="mb-3">
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Статус платежа
                                                    </label>
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        value={data.status}
                                                        onChange={(e) => setData('status', e.target.value)}
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                    >
                                                        <option value="pending">Ожидает обработки</option>
                                                        <option value="completed">Выполнен</option>
                                                        <option value="failed">Ошибка</option>
                                                        <option value="refunded">Возвращен</option>
                                                    </select>
                                                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Комментарий
                                                    </label>
                                                    <textarea
                                                        id="note"
                                                        name="note"
                                                        value={data.note}
                                                        onChange={(e) => setData('note', e.target.value)}
                                                        rows="3"
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                                        placeholder="Добавьте комментарий к изменению статуса"
                                                    ></textarea>
                                                    {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note}</p>}
                                                </div>
                                                
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditMode(false);
                                                            reset();
                                                        }}
                                                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Отмена
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                                    >
                                                        {processing ? 'Сохранение...' : 'Сохранить'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                        
                                        {payment.order && (
                                            <div className="mt-4">
                                                <Link
                                                    href={route('orders.show', payment.order.id)}
                                                    className="w-full inline-block text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Перейти к заказу
                                                </Link>
                                            </div>
                                        )}
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