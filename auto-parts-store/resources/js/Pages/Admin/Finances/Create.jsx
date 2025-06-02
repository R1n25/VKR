import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FinancesCreate({ user, paymentMethods }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        operation_type: 'add',
        payment_method_id: paymentMethods.length > 0 ? paymentMethods[0].id : '',
        description: '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.finances.store', user.id));
    };
    
    // Функция для определения класса баланса
    const getBalanceClass = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <AdminLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Изменение баланса пользователя</h2>}
        >
            <Head title={`Изменение баланса - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">{user.name}</h3>
                                    <p className="text-gray-600">{user.email}</p>
                                    <p className="mt-2">
                                        Текущий баланс: <span className={getBalanceClass(user.balance)}>{user.balance} руб.</span>
                                    </p>
                                </div>
                                
                                <Link
                                    href={route('admin.finances.show', user.id)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Назад к финансам пользователя
                                </Link>
                            </div>
                            
                            <div className="mt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Тип операции */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Тип операции
                                        </label>
                                        <div className="mt-2 flex space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="operation_type"
                                                    value="add"
                                                    checked={data.operation_type === 'add'}
                                                    onChange={() => setData('operation_type', 'add')}
                                                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="ml-2">Пополнение</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="operation_type"
                                                    value="subtract"
                                                    checked={data.operation_type === 'subtract'}
                                                    onChange={() => setData('operation_type', 'subtract')}
                                                    className="form-radio h-4 w-4 text-red-600 transition duration-150 ease-in-out"
                                                />
                                                <span className="ml-2">Списание</span>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {/* Сумма */}
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                            Сумма (руб.)
                                        </label>
                                        <input
                                            type="number"
                                            id="amount"
                                            name="amount"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                        />
                                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                    </div>
                                    
                                    {/* Метод оплаты */}
                                    <div>
                                        <label htmlFor="payment_method_id" className="block text-sm font-medium text-gray-700">
                                            Метод оплаты
                                        </label>
                                        <select
                                            id="payment_method_id"
                                            name="payment_method_id"
                                            value={data.payment_method_id}
                                            onChange={(e) => setData('payment_method_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                        >
                                            {paymentMethods.map((method) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.payment_method_id && <p className="mt-1 text-sm text-red-600">{errors.payment_method_id}</p>}
                                    </div>
                                    
                                    {/* Описание */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Описание
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows="3"
                                            placeholder="Укажите причину изменения баланса"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        ></textarea>
                                    </div>
                                    
                                    {/* Предварительный расчет */}
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Предварительный расчет</h4>
                                        <div className="flex justify-between">
                                            <span>Текущий баланс:</span>
                                            <span className={getBalanceClass(user.balance)}>{user.balance} руб.</span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span>{data.operation_type === 'add' ? 'Пополнение:' : 'Списание:'}</span>
                                            <span className={data.operation_type === 'add' ? 'text-green-600' : 'text-red-600'}>
                                                {data.operation_type === 'add' ? '+' : '-'}{data.amount || 0} руб.
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1 font-semibold border-t border-gray-200 pt-2">
                                            <span>Новый баланс:</span>
                                            <span className={getBalanceClass(Number(user.balance) + (data.operation_type === 'add' ? Number(data.amount || 0) : -Number(data.amount || 0)))}>
                                                {Number(user.balance) + (data.operation_type === 'add' ? Number(data.amount || 0) : -Number(data.amount || 0))} руб.
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Кнопки */}
                                    <div className="flex justify-end space-x-3">
                                        <Link
                                            href={route('admin.finances.show', user.id)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                        >
                                            Отмена
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={`px-4 py-2 rounded-md text-white ${
                                                data.operation_type === 'add'
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-red-600 hover:bg-red-700'
                                            } disabled:opacity-50`}
                                        >
                                            {processing ? 'Обработка...' : data.operation_type === 'add' ? 'Пополнить баланс' : 'Списать с баланса'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 