import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Contacts({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // В реальном приложении здесь был бы API-запрос для отправки сообщения
        console.log('Отправка формы:', formData);
        
        // Имитация успешной отправки
        setFormStatus('success');
        
        // Сброс формы после отправки
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: ''
        });
        
        // Сброс статуса через 5 секунд
        setTimeout(() => {
            setFormStatus(null);
        }, 5000);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Контакты</h2>}
        >
            <Head title="Контакты" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Информация о контактах */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Наши контакты</h3>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-semibold">Адрес</h4>
                                                <p className="text-gray-600 mt-1">
                                                    123456, г. Москва, ул. Примерная, д. 123<br />
                                                    Время работы: Пн-Пт с 9:00 до 20:00, Сб-Вс с 10:00 до 18:00
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-semibold">Телефоны</h4>
                                                <p className="text-gray-600 mt-1">
                                                    Отдел продаж: <a href="tel:+74951234567" className="text-indigo-600 hover:text-indigo-800">+7 (495) 123-45-67</a><br />
                                                    Техническая поддержка: <a href="tel:+74951234568" className="text-indigo-600 hover:text-indigo-800">+7 (495) 123-45-68</a>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-semibold">Email</h4>
                                                <p className="text-gray-600 mt-1">
                                                    Общие вопросы: <a href="mailto:info@auto-parts.ru" className="text-indigo-600 hover:text-indigo-800">info@auto-parts.ru</a><br />
                                                    Отдел продаж: <a href="mailto:sales@auto-parts.ru" className="text-indigo-600 hover:text-indigo-800">sales@auto-parts.ru</a>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-semibold">Социальные сети</h4>
                                                <div className="flex space-x-4 mt-2">
                                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                                        <span className="sr-only">Facebook</span>
                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-blue-400">
                                                        <span className="sr-only">Twitter</span>
                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                                        </svg>
                                                    </a>
                                                    <a href="#" className="text-gray-600 hover:text-pink-600">
                                                        <span className="sr-only">Instagram</span>
                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-10 mb-8 md:mb-0">
                                        <h4 className="text-lg font-semibold mb-4">Карта проезда</h4>
                                        <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500">Здесь будет карта проезда</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Форма обратной связи */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Форма обратной связи</h3>
                                    
                                    {formStatus === 'success' && (
                                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-green-700">
                                                Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Ваше имя *
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email *
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                                Телефон
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                                Сообщение *
                                            </label>
                                            <div className="mt-1">
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    rows={6}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                ></textarea>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                disabled={formStatus === 'sending'}
                                            >
                                                {formStatus === 'sending' ? 'Отправка...' : 'Отправить сообщение'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 