import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import { formatPrice } from '@/utils/helpers';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminTable from '@/Components/AdminTable';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminTextarea from '@/Components/AdminTextarea';
import AdminAlert from '@/Components/AdminAlert';
import OrderStatusBadge from '@/Components/OrderStatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';
import DangerButton from '@/Components/DangerButton';

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
                        <AdminCard>
                            <div className="p-6 text-gray-900 text-center">
                                <p className="mb-4">Запрашиваемый заказ не найден.</p>
                                <Link
                                    href={route('admin.orders.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Вернуться к списку заказов
                                </Link>
                            </div>
                        </AdminCard>
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
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Детали заказа</h2>}
        >
            <Head title={`Заказ №${order.order_number || order.id}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщения обратной связи */}
                    {feedbackMessage && (
                        <div className="mb-4">
                            <AdminAlert 
                                type={messageType} 
                                message={feedbackMessage} 
                                onClose={() => setFeedbackMessage(null)} 
                            />
                        </div>
                    )}
                    
                    {/* Шапка заказа */}
                    <AdminCard className="mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <AdminPageHeader 
                                    title={`Заказ ${order.order_number || `№${order.id}`}`} 
                                    subtitle={`от ${formatDate(order.created_at)}`} 
                                />
                            </div>
                            <div className="mt-2 sm:mt-0">
                                <Link 
                                    href={route('admin.orders.index')} 
                                    className="flex items-center text-gray-600 hover:text-[#2a4075]"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Назад к списку
                                </Link>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2 text-[#2a4075]">Статус заказа</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="mr-2">
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                
                                <SecondaryButton 
                                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                    className="flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Изменить статус
                                </SecondaryButton>
                            </div>
                            
                            {statusDropdownOpen && (
                                <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Выберите новый статус:</label>
                                            <select 
                                                value={selectedStatus} 
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="pending">Ожидает обработки</option>
                                                <option value="processing">В работе</option>
                                                <option value="ready_for_pickup">Готов к выдаче</option>
                                                <option value="ready_for_delivery">Готов к доставке</option>
                                                <option value="in_delivery">В доставке</option>
                                                <option value="delivered">Выдано</option>
                                                <option value="returned">Возвращен</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к смене статуса:</label>
                                            <textarea 
                                                value={statusComment} 
                                                onChange={(e) => setStatusComment(e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                placeholder="Необязательный комментарий"
                                                rows="2"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <SecondaryButton 
                                            onClick={() => setStatusDropdownOpen(false)}
                                            className="mr-2"
                                        >
                                            Отмена
                                        </SecondaryButton>
                                        <PrimaryButton 
                                            onClick={handleStatusUpdate}
                                            disabled={isUpdating || selectedStatus === order.status}
                                        >
                                            {isUpdating ? 'Обновление...' : 'Сохранить статус'}
                                        </PrimaryButton>
                                    </div>
                                    {statusError && (
                                        <div className="mt-2 text-sm text-red-600">{statusError}</div>
                                    )}
                                </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                <SuccessButton
                                    onClick={() => handleQuickStatusChange('processing')}
                                    disabled={processing || order.status === 'processing'}
                                    className="text-xs"
                                >
                                    В работу
                                </SuccessButton>
                                <PrimaryButton
                                    onClick={() => handleQuickStatusChange('ready_for_pickup')}
                                    disabled={processing || order.status === 'ready_for_pickup'}
                                    className="text-xs"
                                >
                                    Готов к выдаче
                                </PrimaryButton>
                                <PrimaryButton
                                    onClick={() => handleQuickStatusChange('delivered')}
                                    disabled={processing || order.status === 'delivered'}
                                    className="text-xs"
                                >
                                    Выдано клиенту
                                </PrimaryButton>
                                <DangerButton
                                    onClick={() => handleQuickStatusChange('returned')}
                                    disabled={processing || order.status === 'returned'}
                                    className="text-xs"
                                >
                                    Возврат
                                </DangerButton>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Данные клиента */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-[#2a4075]">Данные клиента</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <dl className="grid grid-cols-1 gap-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">ФИО:</dt>
                                            <dd className="text-sm font-medium">
                                                {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Не указано')}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email:</dt>
                                            <dd className="text-sm font-medium">
                                                {order.user ? order.user.email : (order.email || 'Не указано')}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Телефон:</dt>
                                            <dd className="text-sm font-medium">
                                                {order.phone || 'Не указано'}
                                            </dd>
                                        </div>
                                        {order.user && (
                                            <div className="mt-2">
                                                <Link
                                                    href={route('admin.users.edit', order.user.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Просмотреть профиль пользователя
                                                </Link>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            </div>
                            
                            {/* Информация о доставке */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-[#2a4075]">Информация о доставке</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <dl className="grid grid-cols-1 gap-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Способ доставки:</dt>
                                            <dd className="text-sm font-medium">
                                                {order.shipping_method || 'Не указано'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Адрес доставки:</dt>
                                            <dd className="text-sm font-medium">
                                                {order.shipping_address || 'Не указано'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Способ оплаты:</dt>
                                            <dd className="text-sm font-medium">
                                                {getPaymentMethodText(order.payment_method) || 'Не указано'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Статус оплаты:</dt>
                                            <dd className="text-sm font-medium">
                                                <span className={`px-2 py-1 text-xs rounded-full ${order.is_paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.is_paid ? 'Оплачено' : 'Не оплачено'}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </AdminCard>
                    
                    {/* Товары в заказе */}
                    <AdminCard className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Товары в заказе</h3>
                        
                        <AdminTable
                            headers={[
                                '№',
                                'Артикул',
                                'Наименование',
                                'Цена',
                                'Кол-во',
                                'Сумма'
                            ]}
                            data={order.direct_items || []}
                            renderRow={(item, index) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.part_number || 'Н/Д'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div>{item.part_name || 'Без названия'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatPrice(item.price)} ₽
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatPrice(item.price * item.quantity)} ₽
                                    </td>
                                </>
                            )}
                            footerContent={
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-right text-sm font-medium">
                                        Итого:
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatPrice(order.total || order.total_amount || 0)} ₽
                                    </td>
                                </tr>
                            }
                            emptyMessage="В заказе нет товаров"
                        />
                    </AdminCard>
                    
                    {/* Комментарии к заказу */}
                    <AdminCard className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Комментарии к заказу</h3>
                        
                        {order.notes && order.notes.length > 0 ? (
                            <div className="space-y-4 mb-6">
                                {order.notes.map((noteItem, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-[#2a4075]">
                                                {noteItem.admin_name || 'Администратор'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(noteItem.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{noteItem.note}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-4">Нет комментариев к заказу</p>
                        )}
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-md font-medium mb-3 text-[#2a4075]">Добавить комментарий</h4>
                            <form onSubmit={handleAddNote}>
                                <AdminFormGroup>
                                    <AdminTextarea
                                        value={note}
                                        handleChange={(e) => setNote(e.target.value)}
                                        rows="3"
                                        placeholder="Введите текст комментария"
                                        error={noteError}
                                    />
                                </AdminFormGroup>
                                <div className="flex justify-end">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={addingNote || !note.trim()}
                                        className="flex items-center"
                                    >
                                        {addingNote ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Добавление...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                Добавить комментарий
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 