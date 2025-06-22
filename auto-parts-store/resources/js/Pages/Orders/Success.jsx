import React from 'react';
import { Link, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const Success = ({ auth, order }) => {
    return (
        <MainLayout user={auth.user}>
            <Head title="Заказ успешно оформлен" />
            
            <div className="container mx-auto py-8">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
                    <div className="text-center">
                        <svg 
                            className="w-16 h-16 text-green-500 mx-auto mb-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Заказ успешно оформлен!</h1>
                        
                        {order && (
                            <div className="mb-6">
                                <p className="text-gray-600">
                                    Номер заказа: <span className="font-bold">{order.order_number}</span>
                                </p>
                                <p className="text-gray-600">
                                    Сумма заказа: <span className="font-bold">{order.total} ₽</span>
                                </p>
                                <p className="text-gray-600">
                                    Дата: <span className="font-bold">{order.created_at}</span>
                                </p>
                            </div>
                        )}
                        
                        <p className="text-gray-600 mb-6">
                            Спасибо за ваш заказ! Мы получили информацию и свяжемся с вами в ближайшее время.
                        </p>
                        
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link
                                href={route('orders.index')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Мои заказы
                            </Link>
                            <Link
                                href={route('home')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded"
                            >
                                Вернуться на главную
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Success; 