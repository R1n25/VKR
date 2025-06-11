import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ModelShow({ auth, modelId }) {
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем данные о модели
                const modelResponse = await axios.get(`/api/models/${modelId}`);
                setModel(modelResponse.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных модели:', err);
                setError('Не удалось загрузить информацию о модели. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [modelId]);

    // Перенаправляем на страницу выбора двигателей
    useEffect(() => {
        if (!loading && model) {
            // Используем функцию route вместо прямого URL и преобразуем id к строке
            window.location.href = route('engines.index', { id: String(modelId) });
        }
    }, [loading, model, modelId]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {loading ? 'Загрузка модели...' : model ? (model.brand_name ? `${model.brand_name.replace(/^"(.+)"$/, '$1')} ${model.name}` : model.name) : 'Модель'}
                </h2>
            }
        >
            <Head title={loading ? 'Модель автомобиля' : model ? (model.brand_name ? `${model.brand_name.replace(/^"(.+)"$/, '$1')} ${model.name}` : model.name) : 'Модель'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {loading ? (
                                <div className="text-center py-10">
                                    <p>Загрузка данных...</p>
                                </div>
                            ) : error ? (
                                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p>Перенаправление на страницу выбора двигателей...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 