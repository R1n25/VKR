import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { useCart } from '@/Contexts/CartContext';

export default function OrderSuccess({ auth, order }) {
    const { clearCart } = useCart();
    
    // При загрузке компонента очищаем корзину
    useEffect(() => {
        clearCart();
    }, []);
    
    // Если заказ не передан, пытаемся получить его из localStorage
    const [localOrder, setLocalOrder] = React.useState(null);
    
    useEffect(() => {
        if (!order) {
            // Попытаемся получить информацию о заказе из localStorage
            try {
                const savedOrder = localStorage.getItem('last_order');
                if (savedOrder) {
                    setLocalOrder(JSON.parse(savedOrder));
                }
            } catch (error) {
                console.error('Ошибка при получении данных заказа:', error);
            }
        }
    }, [order]);
    
    // Используем либо переданный заказ, либо полученный из localStorage
    const displayOrder = order || localOrder;
    
    const content = (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="text-center py-10">
                            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
                                <h3 className="text-xl font-semibold mb-2">Заказ успешно оформлен!</h3>
                                {displayOrder ? (
                                    <>
                                        <p>Номер заказа: <span className="font-bold">{displayOrder.order_number}</span></p>
                                        <p>Сумма заказа: <span className="font-bold">{displayOrder.total} руб.</span></p>
                                        {displayOrder.created_at && (
                                            <p>Дата создания: <span className="font-bold">{displayOrder.created_at}</span></p>
                                        )}
                                        {displayOrder.status && (
                                            <p>Статус: <span className="font-bold">
                                                {displayOrder.status === 'pending' ? 'Ожидает обработки' : displayOrder.status}
                                            </span></p>
                                        )}
                                    </>
                                ) : (
                                    <p>Ваш заказ был успешно создан. Мы свяжемся с вами в ближайшее время.</p>
                                )}
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-center gap-4">
                                <Link
                                    href={route('orders.index')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Мои заказы
                                </Link>
                                
                                <Link
                                    href={route('home')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Вернуться в магазин
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            <Head title="Заказ успешно оформлен" />
            
            {auth.user ? (
                <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Заказ оформлен</h2>}
                >
                    {content}
                </AuthenticatedLayout>
            ) : (
                <GuestLayout>
                    {content}
                </GuestLayout>
            )}
        </>
    );
} 