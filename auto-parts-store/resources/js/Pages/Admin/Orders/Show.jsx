import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import { formatPrice } from '@/utils/helpers';

// Настройка axios для работы с CSRF-защитой
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

export default function Show({ auth, order, availableStatuses }) {
    const [processing, setProcessing] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(order.status || 'pending');
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [messageType, setMessageType] = useState('success'); // 'success', 'error', 'info'
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    
    // Добавим отладочную информацию в консоль
    useEffect(() => {
        if (order) {
            console.log("Данные заказа:", order);
            console.log("Товары заказа:", order.direct_items);
            
            if (order.direct_items && order.direct_items.length > 0) {
                console.log("Первый товар:", order.direct_items[0]);
                console.log("Бренд:", order.direct_items[0].brand_name);
                console.log("Артикул:", order.direct_items[0].part_number);
                console.log("Описание:", order.direct_items[0].description);
            }
        }
    }, [order]);

    // Оставляем только эффект для сброса сообщения обратной связи
    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => {
                setFeedbackMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    // Проверка наличия order
    if (!order) {
        return (
            <AdminLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказ не найден</h2>}
            >
                <Head title="Заказ не найден" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 text-center">
                                <p className="mb-4">Запрашиваемый заказ не найден.</p>
                                <Link
                                    href={route('admin.orders.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Вернуться к списку заказов
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Функция для получения текстового представления статуса заказа
    const getStatusText = (status) => {
        // Если передан объект availableStatuses с сервера, используем его
        if (availableStatuses && availableStatuses[status]) {
            return availableStatuses[status];
        }
        
        // Иначе используем встроенный перевод
        const statuses = {
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        
        return statuses[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        const classes = {
            'pending': 'bg-blue-100 text-blue-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-indigo-100 text-indigo-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        return classes[status] || 'bg-gray-100 text-gray-800';
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
        const methods = {
            'cash': 'Наличными',
            'card': 'Банковской картой',
            'online': 'Онлайн-оплата',
        };
        
        return methods[method] || method;
    };

    // Функция для обновления статуса заказа
    const handleStatusChange = async (e) => {
        e.preventDefault();
        
        // Проверяем, изменился ли статус
        if (selectedStatus === order.status) {
            setFeedbackMessage('Статус не изменился, выберите другой статус');
            setMessageType('info');
            return;
        }

        if (processing) return;
        
        if (!confirm(`Изменить статус заказа на "${getStatusText(selectedStatus)}"?`)) {
            return;
        }
        
        setProcessing(true);
        setStatusError('');
        setFeedbackMessage(null);
        
        try {
            const response = await axios.put(route('admin.orders.update-status', order.id), {
                status: selectedStatus,
                note: statusNote
            });
            
            setStatusNote('');
            setFeedbackMessage('Статус заказа успешно обновлен');
            setMessageType('success');
            
            // Обновляем страницу через 1 секунду, чтобы пользователь успел увидеть сообщение
            setTimeout(() => {
                router.reload();
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            
            if (error.response && error.response.data && error.response.data.error) {
                setStatusError(error.response.data.error);
                setFeedbackMessage(error.response.data.error);
            } else {
                setStatusError('Не удалось обновить статус заказа.');
                setFeedbackMessage('Не удалось обновить статус заказа.');
            }
            
            setMessageType('error');
        } finally {
            setProcessing(false);
        }
    };

    // Функция для быстрого изменения статуса через кнопку
    const handleQuickStatusChange = async (newStatus) => {
        if (processing) return;
        
        if (newStatus === order.status) {
            setFeedbackMessage('Заказ уже имеет этот статус');
            setMessageType('info');
            return;
        }
        
        if (!confirm(`Изменить статус заказа на "${getStatusText(newStatus)}"?`)) {
            return;
        }
        
        setSelectedStatus(newStatus);
        setProcessing(true);
        setStatusError('');
        setFeedbackMessage(null);
        
        try {
            const response = await axios.put(route('admin.orders.update-status', order.id), {
                status: newStatus,
                note: statusNote
            });
            
            setStatusNote('');
            setFeedbackMessage('Статус заказа успешно обновлен');
            setMessageType('success');
            
            // Обновляем страницу через 1 секунду, чтобы пользователь успел увидеть сообщение
            setTimeout(() => {
                router.reload();
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            
            if (error.response && error.response.data && error.response.data.error) {
                setStatusError(error.response.data.error);
                setFeedbackMessage(error.response.data.error);
            } else {
                setStatusError('Не удалось обновить статус заказа.');
                setFeedbackMessage('Не удалось обновить статус заказа.');
            }
            
            setMessageType('error');
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
        setFeedbackMessage(null);
        
        try {
            const response = await axios.post(route('admin.orders.add-note', order.id), {
                note: note
            });
            
            // Очищаем форму и обновляем страницу
            setNote('');
            setFeedbackMessage('Комментарий успешно добавлен');
            setMessageType('success');
            
            // Обновляем страницу через 1 секунду, чтобы пользователь успел увидеть сообщение
            setTimeout(() => {
                router.reload();
            }, 1000);
        } catch (error) {
            console.error('Ошибка при добавлении заметки:', error);
            
            if (error.response && error.response.data && error.response.data.error) {
                setNoteError(error.response.data.error);
                setFeedbackMessage(error.response.data.error);
            } else {
                setNoteError('Не удалось добавить заметку к заказу.');
                setFeedbackMessage('Не удалось добавить заметку к заказу.');
            }
            
            setMessageType('error');
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
                                        Заказ №{order.order_number || order.id}
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
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                                        <h3 className="text-md font-semibold mb-3">Управление статусом заказа</h3>
                                        <form onSubmit={handleStatusChange}>
                                            <div>
                                                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Выберите новый статус
                                                </label>
                                                <div className="flex items-center">
                                                    <select
                                                        id="status-select"
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                        disabled={processing}
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mr-2"
                                                    >
                                                        {Object.entries(availableStatuses || {
                                                            'pending': 'Ожидает обработки',
                                                            'processing': 'В обработке',
                                                            'shipped': 'Отправлен',
                                                            'delivered': 'Доставлен',
                                                            'completed': 'Выполнен',
                                                            'cancelled': 'Отменен'
                                                        }).map(([value, label]) => (
                                                            <option key={value} value={value}>{label}</option>
                                                        ))}
                                                    </select>

                                                    <button 
                                                        type="submit"
                                                        disabled={processing || selectedStatus === order.status}
                                                        className="inline-flex justify-center items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                                    >
                                                        {processing ? 'Обновление...' : 'Обновить статус'}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3">
                                                <label htmlFor="status-note" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Комментарий к изменению статуса (необязательно)
                                                </label>
                                                <textarea
                                                    id="status-note"
                                                    value={statusNote}
                                                    onChange={(e) => setStatusNote(e.target.value)}
                                                    disabled={processing}
                                                    rows={2}
                                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    placeholder="Добавьте комментарий к изменению статуса"
                                                ></textarea>
                                            </div>
                                        </form>
                                        
                                        {/* Сообщение обратной связи */}
                                        {feedbackMessage && (
                                            <div className={`mt-3 p-2 rounded-md ${
                                                messageType === 'success' ? 'bg-green-100 text-green-800' : 
                                                messageType === 'error' ? 'bg-red-100 text-red-800' : 
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {feedbackMessage}
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <button 
                                                type="button" 
                                                onClick={() => handleQuickStatusChange('processing')}
                                                disabled={processing || order.status === 'processing'}
                                                className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-blue-700 focus:bg-blue-700 disabled:opacity-50 transition"
                                            >
                                                {processing && selectedStatus === 'processing' ? 'Обновление...' : 'В работу'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => handleQuickStatusChange('delivered')}
                                                disabled={processing || order.status === 'delivered'}
                                                className="inline-flex justify-center items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-green-700 focus:bg-green-700 disabled:opacity-50 transition"
                                            >
                                                {processing && selectedStatus === 'delivered' ? 'Обновление...' : 'Выдано'}
                                            </button>
                                        </div>
                                        
                                        {statusError && !feedbackMessage && (
                                            <p className="mt-3 text-sm text-red-600">{statusError}</p>
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
                                                        {item.changed_at} • {item.changed_by || 'Система'}
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
                                                    {note.created_at} • {note.created_by || 'Система'}
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
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    №
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Бренд
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Артикул
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Товар
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Цена
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Кол-во
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.orderItems && order.orderItems.length > 0 ? (
                                                order.orderItems.map((item, index) => (
                                                    <tr key={`orderItem-${item.id}`}>
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">
                                                            {item.sparePart?.brand?.name || item.brand_name || (item.manufacturer || '')}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.sparePart?.part_number || item.part_number || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.sparePart?.name || item.part_name || `Товар #${item.spare_part_id || 'N/A'}`}
                                                        </td>
                                                        <td className="px-4 py-2">{formatPrice(item.price)} ₽</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{formatPrice(item.price * item.quantity)} ₽</td>
                                                    </tr>
                                                ))
                                            ) : order.direct_items && order.direct_items.length > 0 ? (
                                                order.direct_items.map((item, index) => (
                                                    <tr key={`directItem-${index}`}>
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">
                                                            {item.brand_name || item.manufacturer || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.part_number || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.part_name || `Товар #${item.spare_part_id || 'N/A'}`}
                                                        </td>
                                                        <td className="px-4 py-2">{formatPrice(item.price)} ₽</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{formatPrice(item.price * item.quantity)} ₽</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-2 text-center">
                                                        Товары не найдены
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-right text-sm font-medium">
                                                    Итого:
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {formatPrice(order.total || 0)} руб.
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {order.payment_status !== 'paid' && (
                                <Link
                                    href={route('admin.orders.add-payment', order.id)}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Добавить оплату
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 