import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';

export default function Show({ auth, order }) {
    const [processing, setProcessing] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    // Функция для получения текстового представления статуса заказа
    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Ожидает обработки';
            case 'processing':
                return 'В обработке';
            case 'completed':
                return 'Выполнен';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
        } catch (error) {
            return dateString;
        }
    };

    // Функция для получения текста способа оплаты
    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'cash':
                return 'Наличными при получении';
            case 'card':
                return 'Картой при получении';
            case 'online':
                return 'Онлайн-оплата';
            default:
                return method;
        }
    };

    // Функция для обновления статуса заказа
    const handleStatusChange = async (newStatus) => {
        if (processing) return;
        
        if (!confirm(`Изменить статус заказа на "${getStatusText(newStatus)}"?`)) {
            return;
        }
        
        setProcessing(true);
        setStatusError('');
        
        try {
            await axios.put(route('admin.orders.update-status', order.id), {
                status: newStatus
            });
            
            router.reload();
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            setStatusError('Не удалось обновить статус заказа.');
        } finally {
            setProcessing(false);
        }
    };

    // Функция для добавления заметки к заказу
    const handleAddNote = async (e) => {
        e.preventDefault();
        
        if (!note.trim()) {
            setNoteError('Введите текст заметки');
            return;
        }
        
        setAddingNote(true);
        setNoteError('');
        
        try {
            await axios.post(route('admin.orders.add-note', order.id), {
                note: note
            });
            
            // Очищаем форму и обновляем страницу
            setNote('');
            router.reload();
        } catch (error) {
            console.error('Ошибка при добавлении заметки:', error);
            setNoteError('Не удалось добавить заметку к заказу.');
        } finally {
            setAddingNote(false);
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали заказа</h2>}
        >
            <Head title={`Заказ №${order.order_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <Link
                                    href={route('admin.orders.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Назад к списку заказов
                                </Link>
                            </div>

                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Заказ №{order.order_number}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        от {formatDate(order.created_at)}
                                    </p>
                                </div>
                                
                                <div className="mt-4 md:mt-0">
                                    <div className="flex items-center mb-2">
                                        <span className="mr-2">Статус:</span>
                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClass(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    
                                    {/* Форма для изменения статуса */}
                                    <div className="mt-2">
                                        <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                                            Изменить статус
                                        </label>
                                        <div className="flex items-center">
                                            <select
                                                id="status-select"
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                disabled={processing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mr-2"
                                            >
                                                <option value="pending">Ожидает обработки</option>
                                                <option value="processing">В обработке</option>
                                                <option value="completed">Выполнен</option>
                                                <option value="cancelled">Отменен</option>
                                            </select>
                                        </div>
                                        
                                        {statusError && (
                                            <p className="mt-1 text-sm text-red-600">{statusError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Данные покупателя</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">ФИО</h4>
                                            <p className="text-gray-900">{order.shipping_name}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Телефон</h4>
                                            <p className="text-gray-900">{order.shipping_phone}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Пользователь</h4>
                                            <p className="text-gray-900">
                                                {order.user ? order.user.name : 'Не зарегистрирован'}
                                                {order.user && order.user.email && ` (${order.user.email})`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Информация о доставке</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Адрес</h4>
                                            <p className="text-gray-900">{order.shipping_address}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Город</h4>
                                            <p className="text-gray-900">{order.shipping_city}</p>
                                        </div>
                                        
                                        {order.shipping_zip && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-600 mb-1">Индекс</h4>
                                                <p className="text-gray-900">{order.shipping_zip}</p>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-600 mb-1">Способ оплаты</h4>
                                            <p className="text-gray-900">{getPaymentMethodText(order.payment_method)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* История статусов */}
                            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">История изменений статуса</h3>
                                
                                {order.status_history && order.status_history.length > 0 ? (
                                    <div className="space-y-4">
                                        {order.status_history.map((item, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-gray-900">
                                                        Статус изменен с <span className="font-medium">{getStatusText(item.from)}</span> на <span className="font-medium">{getStatusText(item.to)}</span>
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {item.changed_at} • {item.changed_by}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">История изменений статуса отсутствует</p>
                                )}
                            </div>
                            
                            {/* Заметки к заказу */}
                            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">Заметки к заказу</h3>
                                
                                <form onSubmit={handleAddNote} className="mb-6">
                                    <div>
                                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                            Добавить заметку
                                        </label>
                                        <textarea
                                            id="note"
                                            name="note"
                                            rows={3}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Введите текст заметки..."
                                        ></textarea>
                                        
                                        {noteError && (
                                            <p className="mt-1 text-sm text-red-600">{noteError}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-3">
                                        <button
                                            type="submit"
                                            disabled={addingNote}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            {addingNote ? 'Добавление...' : 'Добавить заметку'}
                                        </button>
                                    </div>
                                </form>
                                
                                <div className="space-y-4">
                                    {order.notes_json && order.notes_json.length > 0 ? (
                                        order.notes_json.map((note, index) => (
                                            <div key={index} className="bg-white p-4 rounded-md shadow-sm">
                                                <p className="text-gray-900">{note.text}</p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {note.created_at} • {note.created_by}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Нет заметок к этому заказу</p>
                                    )}
                                </div>
                            </div>

                            {/* Товары заказа */}
                            <div className="bg-white border rounded-lg overflow-hidden mb-8">
                                <div className="px-6 py-4 border-b bg-gray-50">
                                    <h3 className="text-lg font-semibold">Товары заказа</h3>
                                </div>
                                
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
                                                    Количество
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.orderItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {item.sparePart && item.sparePart.image_url && (
                                                                <img 
                                                                    src={item.sparePart.image_url} 
                                                                    alt={item.sparePart.name}
                                                                    className="h-10 w-10 object-cover mr-3"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {item.sparePart ? item.sparePart.name : 'Товар не найден'}
                                                                </p>
                                                                {item.sparePart && item.sparePart.brand && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {item.sparePart.brand.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.sparePart ? item.sparePart.part_number : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.price} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.quantity} шт.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {(item.price * item.quantity).toFixed(2)} руб.
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium">
                                                    Итого:
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {order.total} руб.
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 