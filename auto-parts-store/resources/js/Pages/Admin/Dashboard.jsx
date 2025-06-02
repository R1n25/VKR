import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats, recentSuggestions, recentOrders }) {
    // Функция для получения текстового статуса заказа
    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'processing': 'В работе',
            'ready_for_pickup': 'Готов к выдаче',
            'ready_for_delivery': 'Готов к доставке',
            'shipping': 'В доставке',
            'delivered': 'Выдано',
            'returned': 'Возвращен'
        };
        
        return statusMap[status] || status;
    };

    // Функция для получения класса цвета статуса
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'ready_for_pickup': 'bg-green-100 text-green-800',
            'ready_for_delivery': 'bg-indigo-100 text-indigo-800',
            'shipping': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-200 text-green-900',
            'returned': 'bg-red-100 text-red-800'
        };
        
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Панель администратора</h2>}
        >
            <Head title="Панель администратора" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-[#2a4075] mb-6">Управление магазином</h2>
                        
                        {/* Статистика */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-[#eef2ff] p-4 rounded-lg shadow border border-[#d3deff]">
                                <h3 className="text-lg font-semibold text-[#2a4075]">Пользователи</h3>
                                <p className="text-3xl font-bold text-[#3a5195]">{stats.users_count}</p>
                            </div>
                            <div className="bg-[#f0fdf4] p-4 rounded-lg shadow border border-[#d1fae5]">
                                <h3 className="text-lg font-semibold text-[#166534]">Запчасти</h3>
                                <p className="text-3xl font-bold text-[#16a34a]">{stats.spare_parts_count}</p>
                            </div>
                            <div className="bg-[#fefce8] p-4 rounded-lg shadow border border-[#fef3c7]">
                                <h3 className="text-lg font-semibold text-[#854d0e]">Заказы</h3>
                                <p className="text-3xl font-bold text-[#ca8a04]">{stats.orders_count}</p>
                            </div>
                            <div className="bg-[#fef2f2] p-4 rounded-lg shadow border border-[#fee2e2]">
                                <h3 className="text-lg font-semibold text-[#991b1b]">Ожидающие предложения</h3>
                                <p className="text-3xl font-bold text-[#dc2626]">{stats.pending_suggestions_count}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <Link href={route('admin.orders.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Заказы</h3>
                                </div>
                                <p className="text-gray-600">Управление заказами пользователей и их статусами</p>
                            </Link>
                            
                            <Link href={route('admin.vin-requests.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Запросы по VIN-коду</h3>
                                </div>
                                <p className="text-gray-600">Управление запросами на подбор запчастей по VIN-коду автомобиля</p>
                            </Link>
                            
                            <Link href={route('admin.users.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Пользователи</h3>
                                </div>
                                <p className="text-gray-600">Управление пользователями и настройка индивидуальных наценок</p>
                            </Link>
                            
                            <Link href={route('admin.spare-parts.inertia')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Запчасти</h3>
                                </div>
                                <p className="text-gray-600">Управление каталогом запчастей</p>
                            </Link>
                            
                            <Link href={route('admin.suggestions.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Предложения</h3>
                                </div>
                                <p className="text-gray-600">Управление предложениями пользователей</p>
                            </Link>
                            
                            <Link href={route('admin.finances.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-[#eef2ff] p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-[#2a4075]">Финансы</h3>
                                </div>
                                <p className="text-gray-600">Управление финансовыми операциями и отчетами</p>
                            </Link>
                        </div>
                        
                        {/* Последние заказы */}
                        {recentOrders && recentOrders.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-[#2a4075] mb-4">Последние заказы</h3>
                                <div className="overflow-x-auto rounded-lg shadow">
                                    <table className="min-w-full bg-white border border-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">Дата</th>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">Клиент</th>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">Сумма</th>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">Статус</th>
                                                <th className="px-6 py-3 border-b border-gray-200 bg-[#eef2ff] text-left text-xs font-medium text-[#2a4075] uppercase tracking-wider">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <Link 
                                                            href={route('admin.orders.show', order.id)}
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            {order.order_number || `№${order.id}`}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Н/Д')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total || order.total_amount || 0} ₽</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link href={route('admin.orders.show', order.id)} className="text-[#2a4075] hover:text-[#3a5195]">
                                                            Просмотр
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 