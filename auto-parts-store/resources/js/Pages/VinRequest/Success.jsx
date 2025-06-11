import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VinRequestSuccess({ auth, requestId }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                        VIN-запрос
                    </h2>
                </div>
            }
        >
            <Head title="Запрос отправлен" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-8 text-center">
                        <div className="mb-6">
                            <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ваш запрос успешно отправлен!</h3>
                        
                        <p className="text-lg text-gray-700 mb-2">
                            Номер вашего запроса: <span className="font-bold">{requestId}</span>
                        </p>
                        
                        <p className="text-gray-600 mb-8">
                            Наши специалисты рассмотрят ваш запрос и свяжутся с вами в ближайшее время.
                            Мы отправим результаты подбора запчастей на указанный вами email.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={url('home')} className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-gray-800 hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                Вернуться на главную
                            </Link>
                            
                            {auth.user && (
                                <Link href={url('vin-request/user')} className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-white hover:bg-green-700 focus:bg-green-700 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                    Мои VIN-запросы
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 