import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Success({ auth, order }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказ оформлен</h2>}
        >
            <Head title="Заказ успешно оформлен" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="text-center mb-8">
                                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <h2 className="mt-3 text-2xl font-bold text-gray-900">Заказ успешно оформлен!</h2>
                                <p className="mt-2 text-gray-600">Номер заказа: <span className="font-semibold">{order.order_number}</span></p>
                                <p className="mt-1 text-gray-600">Сумма заказа: <span className="font-semibold">{order.total_price} руб.</span></p>
                            </div>

                            <div className="mt-6 border-t border-b py-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-sm text-gray-600 mb-1">Информация о заказе</h4>
                                </div>

                                <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Номер заказа:</span>
                                        <span className="font-semibold">#{order.order_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Статус:</span>
                                        <span className="font-semibold">{getStatusText(order.status)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Дата заказа:</span>
                                        <span className="font-semibold">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Итоговая сумма:</span>
                                        <span className="font-semibold">{formatPrice(order.total)} руб.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold mb-4">Информация о заказе</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-1">Данные получателя</h4>
                                        <p className="text-gray-900">{order.shipping_name}</p>
                                        <p className="text-gray-900">{order.shipping_phone}</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-1">Адрес доставки</h4>
                                        <p className="text-gray-900">{order.shipping_address}</p>
                                        <p className="text-gray-900">
                                            {order.shipping_city}
                                            {order.shipping_zip && `, ${order.shipping_zip}`}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-1">Статус</h4>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            {order.status === 'pending' && 'Ожидает обработки'}
                                            {order.status === 'processing' && 'В обработке'}
                                            {order.status === 'completed' && 'Выполнен'}
                                            {order.status === 'cancelled' && 'Отменен'}
                                        </span>
                                    </div>
                                </div>
                                
                                {order.notes && (
                                    <div className="mt-4">
                                        <h4 className="font-medium text-sm text-gray-600 mb-1">Примечания</h4>
                                        <p className="text-gray-900">{order.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Товары в заказе</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Товар
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Цена
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Кол-во
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Сумма
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.orderItems.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {item.part_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Артикул: {item.part_number}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {item.price} руб.
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {(item.price * item.quantity).toFixed(2)} руб.
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-right font-bold">
                                                    Итого:
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                                    {order.total_price} руб.
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="mb-6 text-gray-600">
                                    Спасибо за заказ! Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.
                                </p>
                                
                                <div className="flex justify-center space-x-4">
                                    <Link
                                        href={route('orders.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Мои заказы
                                    </Link>
                                    
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        На главную
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 