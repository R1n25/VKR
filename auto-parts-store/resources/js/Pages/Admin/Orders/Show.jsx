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

export default function Show({ auth, order }) {
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [noteError, setNoteError] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [statusComment, setStatusComment] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [messageType, setMessageType] = useState('success'); // 'success', 'error', 'info'
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [orderData, setOrder] = useState(order || {});
    
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
        // Используем встроенный перевод
        const statuses = {
            'pending': 'Ожидает обработки',
            'processing': 'В работе',
            'ready_for_pickup': 'Готов к выдаче',
            'ready_for_delivery': 'Готов к доставке',
            'in_delivery': 'В доставке',
            'delivered': 'Выдано',
            'returned': 'Возвращен'
        };
        
        return statuses[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusColorClass = (status) => {
        const classes = {
            'pending': 'bg-blue-100 text-blue-800',
            'processing': 'bg-yellow-100 text-yellow-800',
            'ready_for_pickup': 'bg-green-100 text-green-800',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
            'in_delivery': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'returned': 'bg-red-100 text-red-800'
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

    // Обработчик изменения статуса заказа
    const handleStatusUpdate = async () => {
        try {
            setIsUpdating(true);
            
            // Формируем данные для отправки
            const formData = {
                status: selectedStatus,
                comment: statusComment
            };
            
            // Отправляем запрос на обновление статуса
            const response = await axios.put(`/admin/orders/${orderData.id}/status`, formData);
            
            if (response.data && response.data.success) {
                setFeedbackMessage('Статус заказа успешно обновлен');
                setMessageType('success');
                
                // Обновляем статус заказа в локальном состоянии
                setOrder({
                    ...orderData,
                    status: selectedStatus,
                    status_updated_at: new Date().toISOString()
                });
                
                // Очищаем комментарий
                setStatusComment('');
                
                // Закрываем выпадающий список
                setStatusDropdownOpen(false);
            } else {
                throw new Error('Не удалось обновить статус заказа');
            }
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            setFeedbackMessage(`Ошибка при обновлении статуса: ${error.message}`);
            setMessageType('error');
        } finally {
            setIsUpdating(false);
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
                note: statusComment
            });
            
            setStatusComment('');
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

    // Определение доступных статусов
    const statusOptions = [
        { value: 'pending', label: 'Ожидает обработки' },
        { value: 'processing', label: 'В работе' },
        { value: 'ready_for_pickup', label: 'Готов к выдаче' },
        { value: 'ready_for_delivery', label: 'Готов к доставке' },
        { value: 'in_delivery', label: 'В доставке' },
        { value: 'delivered', label: 'Выдано' },
        { value: 'returned', label: 'Возвращен' }
    ];

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
                                        <div>
                                            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                Выберите новый статус
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="status-select"
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    disabled={isUpdating}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                >
                                                    {statusOptions.map((status) => (
                                                        <option key={status.value} value={status.value}>
                                                            {status.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <label htmlFor="status-comment" className="block text-sm font-medium text-gray-700 mb-2">
                                                Комментарий к изменению статуса (необязательно)
                                            </label>
                                            <textarea
                                                id="status-comment"
                                                value={statusComment}
                                                onChange={(e) => setStatusComment(e.target.value)}
                                                disabled={isUpdating}
                                                rows={2}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="Укажите причину изменения статуса или дополнительную информацию"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={handleStatusUpdate}
                                                disabled={isUpdating || selectedStatus === orderData.status}
                                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                                    isUpdating || selectedStatus === orderData.status ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                            >
                                                {isUpdating ? 'Обновление...' : 'Обновить статус'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                            
                            {/* Информация о клиенте и доставке */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-8">
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-4">Данные клиента</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">ФИО:</span>
                                            <span className="w-2/3 font-medium">{orderData.customer_name || 'Не указано'}</span>
                                        </div>
                                        
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">Email:</span>
                                            <span className="w-2/3">{orderData.customer_email || 'Не указано'}</span>
                                        </div>
                                        
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">Телефон:</span>
                                            <span className="w-2/3">{orderData.customer_phone || 'Не указано'}</span>
                                        </div>
                                        
                                        {orderData.user && (
                                            <div className="flex border-b border-gray-200 pb-2">
                                                <span className="w-1/3 text-gray-600">Аккаунт:</span>
                                                <span className="w-2/3">
                                                    <Link href={route('admin.users.edit', orderData.user.id)} className="text-indigo-600 hover:underline">
                                                        {orderData.user.name} (ID: {orderData.user.id})
                                                    </Link>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold mb-4">Информация о доставке</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">Способ доставки:</span>
                                            <span className="w-2/3">{orderData.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</span>
                                        </div>
                                        
                                        {orderData.delivery_address && (
                                            <div className="flex border-b border-gray-200 pb-2">
                                                <span className="w-1/3 text-gray-600">Адрес доставки:</span>
                                                <span className="w-2/3">{orderData.delivery_address}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">Дата заказа:</span>
                                            <span className="w-2/3">{formatDate(orderData.created_at)}</span>
                                        </div>
                                        
                                        <div className="flex border-b border-gray-200 pb-2">
                                            <span className="w-1/3 text-gray-600">Способ оплаты:</span>
                                            <span className="w-2/3">{getPaymentMethodText(orderData.payment_method)}</span>
                                        </div>
                                    </div>
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
                                            {orderData.orderItems && orderData.orderItems.length > 0 ? (
                                                orderData.orderItems.map((item, index) => (
                                                    <tr key={`orderItem-${item.id}`}>
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">
                                                            {item.sparePart?.brand?.name || item.brand_name || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.sparePart?.part_number || item.part_number || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div>
                                                                <p className="font-medium">{item.sparePart?.name || item.name || `Товар #${item.spare_part_id || 'N/A'}`}</p>
                                                                {item.sparePart?.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{item.sparePart.description}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">{formatPrice(item.price)} ₽</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{formatPrice(item.total || (item.price * item.quantity))} ₽</td>
                                                    </tr>
                                                ))
                                            ) : orderData.direct_items && orderData.direct_items.length > 0 ? (
                                                orderData.direct_items.map((item, index) => (
                                                    <tr key={`directItem-${index}`}>
                                                        <td className="px-4 py-2">{index + 1}</td>
                                                        <td className="px-4 py-2">
                                                            {item.brand_name || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {item.part_number || ''}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div>
                                                                <p className="font-medium">{item.part_name || `Товар #${item.spare_part_id || 'N/A'}`}</p>
                                                                {item.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">{formatPrice(item.price)} ₽</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{formatPrice(item.total || (item.price * item.quantity))} ₽</td>
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
                                                    {formatPrice(orderData.total || 0)} руб.
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Кнопка добавления оплаты */}
                            <Link
                                href={route('admin.orders.add-payment', orderData.id)}
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Добавить оплату
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 