import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function FinancesIndex({ users, stats }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [balanceFilter, setBalanceFilter] = useState('all');
    
    // Функция для фильтрации пользователей
    const filteredUsers = users.data.filter(user => {
        // Фильтр по поисковому запросу
        const searchMatch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
        // Фильтр по балансу
        let balanceMatch = true;
        if (balanceFilter === 'positive') {
            balanceMatch = user.balance > 0;
        } else if (balanceFilter === 'negative') {
            balanceMatch = user.balance < 0;
        } else if (balanceFilter === 'zero') {
            balanceMatch = user.balance === 0;
        }
        
        return searchMatch && balanceMatch;
    });
    
    // Функция для определения класса строки в зависимости от баланса
    const getRowClass = (balance) => {
        if (balance > 0) return 'bg-green-50';
        if (balance < 0) return 'bg-red-50';
        return '';
    };
    
    // Функция для определения класса текста баланса
    const getBalanceClass = (balance) => {
        if (balance > 0) return 'text-green-600 font-semibold';
        if (balance < 0) return 'text-red-600 font-semibold';
        return 'text-gray-600';
    };

    return (
        <AdminLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Финансы пользователей</h2>}
        >
            <Head title="Финансы пользователей" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Статистика */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Общая статистика</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Общий баланс</p>
                                    <p className={`text-2xl font-bold ${stats.total_balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                        {stats.total_balance} руб.
                                    </p>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Положительный баланс</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.positive_balance} руб.</p>
                                </div>
                                
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Отрицательный баланс</p>
                                    <p className="text-2xl font-bold text-red-700">{stats.negative_balance} руб.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Нулевой баланс</p>
                                    <p className="text-2xl font-bold text-gray-700">{stats.zero_balance} пользователей</p>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Всего пользователей</p>
                                    <p className="text-2xl font-bold text-purple-700">{stats.total_users}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Список пользователей */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h3 className="text-lg font-semibold">Пользователи</h3>
                                
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    {/* Поиск */}
                                    <div className="w-full md:w-64">
                                        <input
                                            type="text"
                                            placeholder="Поиск по имени или email"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                    
                                    {/* Фильтр по балансу */}
                                    <select
                                        value={balanceFilter}
                                        onChange={(e) => setBalanceFilter(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    >
                                        <option value="all">Все балансы</option>
                                        <option value="positive">Положительный</option>
                                        <option value="negative">Отрицательный</option>
                                        <option value="zero">Нулевой</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Таблица пользователей */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Имя
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Баланс
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className={getRowClass(user.balance)}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={getBalanceClass(user.balance)}>
                                                        {user.balance} руб.
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('admin.finances.show', user.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Детали
                                                        </Link>
                                                        <Link
                                                            href={route('admin.finances.create', user.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Изменить баланс
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Пагинация */}
                            {users.links && users.links.length > 3 && (
                                <div className="mt-6">
                                    <nav className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between">
                                            {users.prev_page_url && (
                                                <Link
                                                    href={users.prev_page_url}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Предыдущая
                                                </Link>
                                            )}
                                            
                                            {users.next_page_url && (
                                                <Link
                                                    href={users.next_page_url}
                                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Следующая
                                                </Link>
                                            )}
                                        </div>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 