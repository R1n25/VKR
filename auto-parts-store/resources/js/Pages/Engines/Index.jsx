import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EnginesIndex({ auth, modelId }) {
    const [model, setModel] = useState(null);
    const [engines, setEngines] = useState([]);
    const [groupedEngines, setGroupedEngines] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем данные о модели и двигателях
                const response = await axios.get(`/api/models/${modelId}/engines`);
                
                // Проверяем структуру ответа и устанавливаем данные
                if (response.data && response.data.status === 'success' && response.data.data) {
                    if (response.data.data.model) {
                        setModel(response.data.data.model);
                    }
                    
                    if (response.data.data.engines) {
                        setEngines(response.data.data.engines);
                    } else {
                        setEngines([]);
                    }
                    
                    if (response.data.data.grouped_engines) {
                        setGroupedEngines(response.data.data.grouped_engines);
                    } else {
                        setGroupedEngines({});
                    }
                } else {
                    setError('Некорректный формат данных от сервера');
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных двигателей:', err);
                setError('Не удалось загрузить информацию о двигателях. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [modelId]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    {loading ? 'Загрузка...' : model ? `Двигатели для ${model.brand_name} ${model.name}` : 'Двигатели'}
                </h2>
            }
        >
            <Head title={loading ? 'Загрузка...' : model ? `Двигатели для ${model.brand_name} ${model.name}` : 'Двигатели'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка данных о двигателях...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <div>
                                    {/* Хлебные крошки */}
                                    <nav className="mb-6">
                                        <ol className="flex space-x-2 text-sm text-gray-500">
                                            <li>
                                                <Link href={route('home')} className="hover:text-indigo-600">
                                                    Главная
                                                </Link>
                                            </li>
                                            <li className="flex items-center">
                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <Link href={route('brands.index')} className="hover:text-indigo-600">
                                                    Бренды
                                                </Link>
                                            </li>
                                            {model && (
                                                <>
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <Link href={route('brands.show', { id: String(model.brand_id) })} className="hover:text-indigo-600">
                                                            {model.brand_name}
                                                        </Link>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <Link href={route('models.show', { id: String(model.id) })} className="hover:text-indigo-600">
                                                            {model.name}
                                                        </Link>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">Двигатели</span>
                                                    </li>
                                                </>
                                            )}
                                        </ol>
                                    </nav>

                                    {/* Заголовок и информация */}
                                    <div className="mb-8">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            Выбор двигателя для {model && `${model.brand_name} ${model.name}`}
                                        </h1>
                                        <p className="text-gray-600">
                                            Выберите двигатель вашего автомобиля для точного подбора запчастей.
                                        </p>
                                    </div>

                                    {/* Двигатели по типам */}
                                    {engines.length === 0 ? (
                                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-700">
                                            К сожалению, для данной модели пока не добавлены двигатели. Пожалуйста, выберите другую модель.
                                        </div>
                                    ) : (
                                        <div>
                                            {Object.entries(groupedEngines).map(([type, typeEngines]) => (
                                                <div key={type} className="mb-10">
                                                    <h2 className="text-xl font-semibold mb-4 capitalize">{type}</h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {typeEngines.map(engine => (
                                                            <div key={engine.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                                                                <div className="p-4">
                                                                    <h3 className="font-medium text-lg mb-2">{engine.name}</h3>
                                                                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                                                                        <li><span className="font-medium">Объем:</span> {engine.volume} л</li>
                                                                        <li><span className="font-medium">Мощность:</span> {engine.power} л.с.</li>
                                                                        <li><span className="font-medium">Годы выпуска:</span> {engine.year_start} - {engine.year_end || 'н.в.'}</li>
                                                                    </ul>
                                                                    <p className="text-sm text-gray-500 italic mb-4">{engine.description}</p>
                                                                </div>
                                                                <div className="px-4 pb-4">
                                                                    <Link
                                                                        href={route('engines.parts', { id: String(engine.id) })}
                                                                        className="inline-flex w-full justify-center items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                                    >
                                                                        Выбрать
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 