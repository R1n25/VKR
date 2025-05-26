import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CreateForOrder({ auth, order, paymentMethods, remainingAmount }) {
    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        payment_method_id: '',
        amount: remainingAmount,
        notes: '',
    });

    // Обработчик отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('finances.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Добавление платежа</h2>}
        >
            <Head title={`Оплата заказа #${order.order_number || order.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <Link
                                    href={route('orders.show', order.id)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    ← Назад к заказу
                                </Link>
                            </div>
                            
                            <div className="max-w-xl">
                                <h3 className="text-lg font-semibold mb-4">
                                    Добавление платежа для заказа #{order.order_number || order.id}
                                </h3>
                                
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Сумма заказа</p>
                                            <p className="font-medium">{order.total || order.total_amount} руб.</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Оплачено</p>
                                            <p className="font-medium">{order.total_paid || 0} руб.</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Осталось оплатить</p>
                                            <p className="font-medium text-red-600">{remainingAmount} руб.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="payment_method_id" className="block text-sm font-medium text-gray-700 mb-1">
                                            Метод оплаты *
                                        </label>
                                        <select
                                            id="payment_method_id"
                                            name="payment_method_id"
                                            value={data.payment_method_id}
                                            onChange={(e) => setData('payment_method_id', e.target.value)}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            required
                                        >
                                            <option value="">Выберите метод оплаты</option>
                                            {paymentMethods.map((method) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.payment_method_id && (
                                            <p className="mt-1 text-xs text-red-500">{errors.payment_method_id}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                            Сумма платежа (руб.) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            id="amount"
                                            name="amount"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            required
                                        />
                                        {errors.amount && (
                                            <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-6">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Примечания
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows="3"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        ></textarea>
                                        {errors.notes && (
                                            <p className="mt-1 text-xs text-red-500">{errors.notes}</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-end">
                                        <Link
                                            href={route('orders.show', order.id)}
                                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                                        >
                                            Отмена
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {processing ? 'Сохранение...' : 'Оплатить'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 