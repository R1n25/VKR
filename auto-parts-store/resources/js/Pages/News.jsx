import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function News({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    const [news, setNews] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Демо-данные для новостей и акций
    const demoNews = [
        {
            id: 1,
            title: 'Поступление новых запчастей для Toyota',
            content: 'В наш магазин поступили новые оригинальные запчасти для моделей Toyota Camry и Corolla. Теперь в наличии полный ассортимент расходных материалов и деталей для планового ТО.',
            date: '2023-03-15',
            image: '/storage/images/news/toyota-parts.jpg'
        },
        {
            id: 2,
            title: 'Открытие нового пункта выдачи заказов',
            content: 'Рады сообщить об открытии нового пункта выдачи заказов в северной части города. Теперь получить свой заказ стало еще удобнее!',
            date: '2023-03-10',
            image: '/storage/images/news/new-location.jpg'
        },
        {
            id: 3,
            title: 'Расширение ассортимента запчастей для европейских автомобилей',
            content: 'Мы значительно расширили ассортимент запчастей для BMW, Mercedes-Benz и Audi. В каталоге теперь доступны как оригинальные, так и качественные аналоги.',
            date: '2023-03-01',
            image: '/storage/images/news/european-parts.jpg'
        }
    ];

    const demoPromotions = [
        {
            id: 1,
            title: 'Скидка 15% на все масляные фильтры',
            content: 'До конца месяца действует специальное предложение: скидка 15% на все масляные фильтры при покупке моторного масла.',
            endDate: '2023-03-31',
            image: '/storage/images/promotions/oil-filters.jpg'
        },
        {
            id: 2,
            title: 'Бесплатная доставка при заказе от 5000 руб.',
            content: 'При заказе запчастей на сумму от 5000 рублей доставка по городу осуществляется бесплатно.',
            endDate: '2023-04-15',
            image: '/storage/images/promotions/free-delivery.jpg'
        }
    ];

    useEffect(() => {
        // В реальном приложении здесь был бы запрос к API
        // Имитируем загрузку данных с сервера
        setTimeout(() => {
            setNews(demoNews);
            setPromotions(demoPromotions);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Новости и акции</h2>}
        >
            <Head title="Новости и акции" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="text-center">
                            <p className="text-gray-500">Загрузка...</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <section className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-6">Новости</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {news.map(item => (
                                            <article key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                                                <div className="p-6">
                                                    <h4 className="text-lg font-semibold mb-2 text-gray-900 hover:text-green-600">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-gray-600 mb-4">{item.content}</p>
                                                    <div className="text-sm text-green-600">
                                                        {new Date(item.date).toLocaleDateString('ru-RU')}
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-6">Акции и специальные предложения</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {promotions.map(promo => (
                                            <article key={promo.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                                                <div className="p-6">
                                                    <h4 className="text-lg font-semibold mb-2 text-gray-900 hover:text-green-600">
                                                        {promo.title}
                                                    </h4>
                                                    <p className="text-gray-600 mb-4">{promo.content}</p>
                                                    <div className="text-sm text-green-600">
                                                        Действует до: {new Date(promo.endDate).toLocaleDateString('ru-RU')}
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 