import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';

export default function SuggestCompatibilityForm({ auth, sparePart, carModels, carBrands }) {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [filteredModels, setFilteredModels] = useState([]);
    const [engines, setEngines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const { data, setData, errors, reset } = useForm({
        car_brand_id: '',
        car_model_id: '',
        car_engine_id: '',
        comment: '',
    });

    // Обновляем фильтрованные модели при изменении бренда
    useEffect(() => {
        if (data.car_brand_id) {
            const brandModels = carModels.filter(model => model.brand_id === parseInt(data.car_brand_id));
            setFilteredModels(brandModels);
            setData('car_model_id', '');
            setData('car_engine_id', '');
            setEngines([]);
        } else {
            setFilteredModels([]);
            setData('car_model_id', '');
            setData('car_engine_id', '');
            setEngines([]);
        }
    }, [data.car_brand_id]);

    // Загружаем двигатели для выбранной модели
    useEffect(() => {
        if (data.car_model_id) {
            fetchEngines(data.car_model_id);
        } else {
            setEngines([]);
            setData('car_engine_id', '');
        }
    }, [data.car_model_id]);

    // Функция для загрузки двигателей
    const fetchEngines = async (modelId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/models/${modelId}/engines`);
            if (response.data && response.data.data && response.data.data.engines) {
                setEngines(response.data.data.engines);
            } else {
                setEngines([]);
            }
        } catch (error) {
            console.error('Ошибка при загрузке двигателей:', error);
            setEngines([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        
        setSubmitting(true);
        
        try {
            // Получаем актуальный CSRF токен из мета-тега
            let csrfToken = '';
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            
            if (csrfMeta) {
                csrfToken = csrfMeta.getAttribute('content');
            } else {
                // Если мета-тег не найден, попробуем получить токен из cookie
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith('XSRF-TOKEN=')) {
                        csrfToken = decodeURIComponent(cookie.substring('XSRF-TOKEN='.length));
                        break;
                    }
                }
            }
            
            // Проверяем обязательные поля
            if (!data.car_brand_id || !data.car_model_id) {
                setMessage({
                    text: 'Пожалуйста, заполните все обязательные поля',
                    type: 'error'
                });
                setSubmitting(false);
                return;
            }
            
            // Используем axios для отправки запроса
            const response = await axios({
                method: 'POST',
                url: `/spare-parts/${sparePart.id}/suggest-compatibility`,
                data: data,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.status === 200 || response.status === 201 || response.status === 302) {
                setMessage({
                    text: 'Ваше предложение успешно отправлено',
                    type: 'success'
                });
                
                reset();
                
                // Получаем сохраненный URL, куда нужно вернуться
                const returnUrl = localStorage.getItem('returnToPartDetails') || `/parts/${sparePart.id}`;
                
                // Перенаправляем через таймаут, чтобы пользователь увидел сообщение об успехе
                setTimeout(() => {
                    window.location.href = returnUrl;
                    // Очищаем сохраненный URL
                    localStorage.removeItem('returnToPartDetails');
                }, 1500);
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            setMessage({
                text: 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложить совместимость</h2>}
        >
            <Head title="Предложить совместимость" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщение об успешной отправке или ошибке */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Информация о запчасти</h3>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Артикул</p>
                                        <p className="font-semibold">{sparePart.part_number}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Производитель</p>
                                        <p className="font-semibold">{sparePart.manufacturer}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Наименование</p>
                                        <p className="font-semibold">{sparePart.name}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Информация о совместимости</h3>
                                    
                                    <div className="mb-4">
                                        <InputLabel htmlFor="car_brand_id" value="Бренд автомобиля" />
                                        <select
                                            id="car_brand_id"
                                            name="car_brand_id"
                                            value={data.car_brand_id}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('car_brand_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Выберите бренд автомобиля --</option>
                                            {carBrands.map(brand => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.car_brand_id} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="car_model_id" value="Модель автомобиля" />
                                        <select
                                            id="car_model_id"
                                            name="car_model_id"
                                            value={data.car_model_id}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('car_model_id', e.target.value)}
                                            required
                                            disabled={!data.car_brand_id}
                                        >
                                            <option value="">-- Выберите модель автомобиля --</option>
                                            {filteredModels.map(model => (
                                                <option key={model.id} value={model.id}>
                                                    {model.name} {model.generation ? `(${model.generation})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.car_model_id} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="car_engine_id" value="Двигатель (необязательно)" />
                                        <select
                                            id="car_engine_id"
                                            name="car_engine_id"
                                            value={data.car_engine_id}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('car_engine_id', e.target.value)}
                                            disabled={!data.car_model_id || loading}
                                        >
                                            <option value="">-- Выберите двигатель (если известен) --</option>
                                            {engines.map(engine => (
                                                <option key={engine.id} value={engine.id}>
                                                    {engine.name} {engine.volume && `${engine.volume}л`} {engine.power && `${engine.power}л.с.`} {engine.type && `(${engine.type})`}
                                                </option>
                                            ))}
                                        </select>
                                        {loading && <p className="mt-1 text-sm text-gray-500">Загрузка двигателей...</p>}
                                        <InputError message={errors.car_engine_id} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="comment" value="Ваш комментарий (необязательно)" />
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            value={data.comment}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('comment', e.target.value)}
                                            rows={3}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Укажите дополнительную информацию о совместимости, например, особенности установки.
                                        </p>
                                        <InputError message={errors.comment} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <SecondaryButton className="mr-4" href={route('parts.show', sparePart.id)}>
                                        Отмена
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className={submitting ? 'opacity-75 cursor-not-allowed' : ''}
                                    >
                                        {submitting ? 'Отправка...' : 'Отправить'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 