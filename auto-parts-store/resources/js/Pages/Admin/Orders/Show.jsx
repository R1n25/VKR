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

// Настройка axios
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

export default function Show({ auth, order }) {
    const [statusError, setStatusError] = useState('');
    const [statusComment, setStatusComment] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [messageType, setMessageType] = useState('success'); // 'success', 'error', 'info'
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [orderData, setOrder] = useState(order || {});
    const [activeTab, setActiveTab] = useState('info');
    
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
                                    href={url('admin/orders')}
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
            const response = await axios.put(url(`admin/orders/${orderData.id}/status`), formData);
            
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
    
    // Получение статуса заказа
    const getStatusBadge = (status) => {
        const statusMap = {
            'new': { text: 'Новый', color: 'bg-blue-100 text-blue-800' },
            'processing': { text: 'В обработке', color: 'bg-yellow-100 text-yellow-800' },
            'shipped': { text: 'Отправлен', color: 'bg-purple-100 text-purple-800' },
            'delivered': { text: 'Доставлен', color: 'bg-green-100 text-green-800' },
            'cancelled': { text: 'Отменен', color: 'bg-red-100 text-red-800' }
        };
        
        const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {text}
            </span>
        );
    };
    
    // Получение метода оплаты
    const getPaymentMethod = (method) => {
        const methodMap = {
            'card': 'Банковская карта',
            'cash': 'Наличные при получении',
            'online': 'Онлайн-оплата'
        };
        
        return methodMap[method] || method;
    };
    
    // Получение метода доставки
    const getShippingMethod = (method) => {
        const methodMap = {
            'pickup': 'Самовывоз',
            'courier': 'Курьерская доставка',
            'post': 'Почта России'
        };
        
        return methodMap[method] || method;
    };
    
    // Колонки для таблицы товаров
    const itemColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Наименование' },
        { key: 'part_number', label: 'Артикул' },
        { key: 'price', label: 'Цена' },
        { key: 'quantity', label: 'Количество' },
        { key: 'total', label: 'Сумма' }
    ];
    
    // Данные для таблицы товаров
    const itemsData = order.items && order.items.map ? order.items.map(item => ({
        id: item.spare_part.id,
        name: (
            <Link 
                href={url(`admin/spare-parts/${item.spare_part.id}`)}
                className="text-blue-600 hover:underline font-medium"
            >
                {item.spare_part.name}
            </Link>
        ),
        part_number: item.spare_part.part_number,
        price: `${item.price} ₽`,
        quantity: item.quantity,
        total: `${item.price * item.quantity} ₽`
    })) : [];
    
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
                                    href={url('admin/orders')} 
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
                                                    href={url(`admin/users/${order.user.id}/edit`)}
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
                            data={(order.direct_items || [])}
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
                </div>
            </div>
        </AdminLayout>
    );
} 