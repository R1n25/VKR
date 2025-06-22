import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import OrderStatusBadge from '@/Components/OrderStatusBadge';
import StatCard from '@/Components/StatCard';
import AdminTable from '@/Components/AdminTable';

export default function Dashboard({ auth, stats, recentSuggestions, recentOrders }) {
    // Функция для форматирования даты
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        } catch (error) {
            return dateString;
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Панель администратора</h2>}
        >
            <Head title="Панель администратора" />

            <div className="py-6">
                <div className="w-full px-2">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Управление магазином" 
                            subtitle="Обзор ключевых показателей и быстрый доступ к разделам" 
                        />
                        
                        {/* Статистика */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <StatCard 
                                title="Пользователи" 
                                value={stats.users_count}
                                variant="primary"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                            />
                            <StatCard 
                                title="Запчасти" 
                                value={stats.spare_parts_count}
                                variant="success"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                }
                            />
                            <StatCard 
                                title="Заказы" 
                                value={stats.orders_count}
                                variant="warning"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                }
                            />
                            <StatCard 
                                title="Категории" 
                                value={stats.categories_count || 0}
                                variant="info"
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                }
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <Link 
                                href={url('admin/orders')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#2a4075]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Заказы</h3>
                                            <p className="text-sm text-gray-500">Управление заказами</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            
                            <Link 
                                href={url('admin/part-categories')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0c4a6e] hover:shadow-lg hover:shadow-[#0284c7]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#0c4a6e]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Категории</h3>
                                            <p className="text-sm text-gray-500">Управление категориями</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            
                            <Link 
                                href={url('admin/vin-requests')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#2a4075]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">VIN-запросы</h3>
                                            <p className="text-sm text-gray-500">Управление VIN-запросами</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            
                            <Link 
                                href={url('admin/users')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#2a4075]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Пользователи</h3>
                                            <p className="text-sm text-gray-500">Управление пользователями</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            
                            <Link 
                                href={url('admin/spare-parts')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#2a4075]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Запчасти</h3>
                                            <p className="text-sm text-gray-500">Управление запчастями</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            
                            <Link 
                                href={url('admin/suggestions')} 
                                className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2a4075] hover:shadow-lg hover:shadow-[#2a4075]/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-[#2a4075]/10 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-[#2a4075]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Предложения</h3>
                                            <p className="text-sm text-gray-500">Управление предложениями</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        
                        {/* Последние заказы */}
                        {recentOrders && recentOrders.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xl font-semibold text-[#2a4075] mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Последние заказы
                                </h3>
                                
                                <AdminTable
                                    headers={[
                                        'ID',
                                        'Дата',
                                        'Клиент',
                                        'Сумма',
                                        'Статус',
                                        'Действия'
                                    ]}
                                    data={recentOrders}
                                    renderRow={(order) => (
                                        <>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.order_number || `№${order.id}`}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {order.user ? order.user.name : (order.shipping_name || order.customer_name || 'Н/Д')}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {order.total || order.total_amount || 0} ₽
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                <OrderStatusBadge status={order.status} />
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                                <Link href={url(`admin/orders/${order.id}`)} className="btn-primary text-xs py-1 px-2">
                                                    Просмотреть
                                                </Link>
                                            </td>
                                        </>
                                    )}
                                    compact={true}
                                />
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 