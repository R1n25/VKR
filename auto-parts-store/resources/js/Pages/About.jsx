import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function About({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    const [activeTab, setActiveTab] = useState('company');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">О нас</h2>}
        >
            <Head title="О нас" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Табы для переключения между разделами */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('company')}
                                        className={`${
                                            activeTab === 'company'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        О компании
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('principles')}
                                        className={`${
                                            activeTab === 'principles'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Наши принципы
                                    </button>
                                </nav>
                            </div>

                            {/* Содержимое раздела "О компании" */}
                            {activeTab === 'company' && (
                                <div>
                                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                                        <div className="md:w-1/2">
                                            <h3 className="text-2xl font-bold mb-4">О нашей компании</h3>
                                            <p className="text-gray-600 mb-4">
                                                Компания "АвтоЗапчасти" была основана в 2005 году и за это время заслужила 
                                                репутацию надежного поставщика качественных автомобильных запчастей. 
                                                Мы специализируемся на продаже оригинальных и аналоговых запчастей для 
                                                автомобилей различных марок и моделей.
                                            </p>
                                            <p className="text-gray-600 mb-4">
                                                Наша компания работает напрямую с производителями и крупными дистрибьюторами, 
                                                что позволяет нам предлагать нашим клиентам конкурентоспособные цены и 
                                                гарантировать подлинность продукции.
                                            </p>
                                            <p className="text-gray-600">
                                                Мы гордимся тем, что обслуживаем тысячи клиентов ежегодно и помогаем им 
                                                поддерживать свои автомобили в отличном техническом состоянии.
                                            </p>
                                        </div>
                                        <div className="md:w-1/2 bg-gray-200 flex items-center justify-center h-64 md:h-auto rounded-lg">
                                            <span className="text-gray-400">Фото офиса компании</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-4">Наша команда</h3>
                                    <p className="text-gray-600 mb-6">
                                        Наша команда состоит из опытных специалистов и экспертов в области автомобильных запчастей. 
                                        Каждый сотрудник проходит специальное обучение и регулярно повышает свою квалификацию, 
                                        чтобы предоставлять нашим клиентам наилучший сервис и профессиональные консультации.
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                                        <div className="text-center">
                                            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-4">
                                                <span className="text-gray-400">Фото</span>
                                            </div>
                                            <h4 className="font-semibold">Иванов Иван</h4>
                                            <p className="text-gray-600">Генеральный директор</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-4">
                                                <span className="text-gray-400">Фото</span>
                                            </div>
                                            <h4 className="font-semibold">Петрова Екатерина</h4>
                                            <p className="text-gray-600">Руководитель отдела продаж</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-4">
                                                <span className="text-gray-400">Фото</span>
                                            </div>
                                            <h4 className="font-semibold">Сидоров Алексей</h4>
                                            <p className="text-gray-600">Главный технический специалист</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Содержимое раздела "Наши принципы" */}
                            {activeTab === 'principles' && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Наши принципы работы</h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-semibold mb-2">Качество и подлинность</h4>
                                            <p className="text-gray-600">
                                                Мы гарантируем качество и подлинность всех предлагаемых запчастей. 
                                                Работаем только с проверенными поставщиками и предоставляем гарантию на все товары.
                                            </p>
                                        </div>
                                        
                                        <div className="bg-green-50 p-6 rounded-lg">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-semibold mb-2">Оперативность</h4>
                                            <p className="text-gray-600">
                                                Мы обрабатываем заказы максимально быстро и стараемся сократить сроки доставки. 
                                                Наша цель — предоставить клиентам нужные запчасти в кратчайшие сроки.
                                            </p>
                                        </div>
                                        
                                        <div className="bg-yellow-50 p-6 rounded-lg">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-semibold mb-2">Клиентоориентированность</h4>
                                            <p className="text-gray-600">
                                                Мы ставим интересы клиента на первое место. Наши специалисты всегда готовы 
                                                предоставить профессиональную консультацию и помочь с выбором запчастей.
                                            </p>
                                        </div>
                                        
                                        <div className="bg-red-50 p-6 rounded-lg">
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                            <h4 className="text-xl font-semibold mb-2">Честные цены</h4>
                                            <p className="text-gray-600">
                                                Мы придерживаемся политики честного ценообразования и никогда не завышаем цены. 
                                                Наши клиенты получают качественные запчасти по разумным ценам.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-10 bg-indigo-50 p-6 rounded-lg">
                                        <h4 className="text-xl font-semibold mb-4">Наша миссия</h4>
                                        <p className="text-gray-600">
                                            Обеспечивать автовладельцев качественными запчастями по доступным ценам, 
                                            способствуя безопасности на дорогах и увеличению срока службы автомобилей наших клиентов.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 