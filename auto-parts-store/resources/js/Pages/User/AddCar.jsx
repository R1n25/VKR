import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function AddCar({ auth, brand, model }) {
    const engineTypes = ['Бензин', 'Дизель', 'Гибрид', 'Электро'];
    const transmissionTypes = ['Механическая', 'Автоматическая', 'Робот', 'Вариатор'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
    
    const { data, setData, post, processing, errors } = useForm({
        brand_id: brand?.id || '',
        model_id: model?.id || '',
        year: '',
        vin: '',
        engine_type: 'Бензин',
        engine_volume: '',
        transmission: 'Автоматическая',
        color: '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('user.save-car'));
    };
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Добавление автомобиля</h2>}
        >
            <Head title="Добавление автомобиля" />
            
            <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-8">
                            {/* Хлебные крошки */}
                            <nav className="mb-8">
                                <ol className="flex space-x-2 text-sm text-gray-500">
                                    <li>
                                        <Link href={route('dashboard')} className="hover:text-green-600 transition-colors duration-200 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Личный кабинет
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <Link href={route('brands.index', { add_car: 'true' })} className="hover:text-green-600">
                                            Выбор марки
                                        </Link>
                                    </li>
                                    {brand && (
                                        <li className="flex items-center">
                                            <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <Link href={route('brands.show', { id: brand.id, add_car: 'true' })} className="hover:text-green-600">
                                                {brand.name}
                                            </Link>
                                        </li>
                                    )}
                                    <li className="flex items-center">
                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium text-gray-900">Параметры автомобиля</span>
                                    </li>
                                </ol>
                            </nav>
                            
                            {/* Шаги добавления автомобиля */}
                            <div className="mb-10">
                                <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        Шаг 3: Укажите параметры автомобиля {model ? `${brand.name} ${model.name}` : brand?.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Заполните информацию о вашем автомобиле, которая поможет точнее подобрать запчасти.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 mr-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Выбор марки</span>
                                        <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 mr-2">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>Выбор модели</span>
                                        <svg className="w-4 h-4 mx-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-700 mr-2">3</div>
                                        <span>Параметры автомобиля</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Форма с параметрами */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Информация о выбранном автомобиле */}
                                        <div className="md:col-span-2 mb-4">
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">Выбранный автомобиль</h4>
                                            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="mr-4">
                                                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {brand?.name} {model?.name}
                                                    </div>
                                                    {model && (
                                                        <div className="text-sm text-gray-600">
                                                            {model.years}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Год выпуска */}
                                        <div>
                                            <InputLabel htmlFor="year" value="Год выпуска" />
                                            <select
                                                id="year"
                                                value={data.year}
                                                onChange={(e) => setData('year', e.target.value)}
                                                className="w-full mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            >
                                                <option value="">Выберите год</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.year} className="mt-2" />
                                        </div>
                                        
                                        {/* VIN-номер */}
                                        <div>
                                            <InputLabel htmlFor="vin" value="VIN-номер (необязательно)" />
                                            <TextInput
                                                id="vin"
                                                type="text"
                                                value={data.vin}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('vin', e.target.value)}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                VIN-номер позволит точнее подобрать запчасти для вашего автомобиля
                                            </p>
                                            <InputError message={errors.vin} className="mt-2" />
                                        </div>
                                        
                                        {/* Тип двигателя */}
                                        <div>
                                            <InputLabel htmlFor="engine_type" value="Тип двигателя" />
                                            <select
                                                id="engine_type"
                                                value={data.engine_type}
                                                onChange={(e) => setData('engine_type', e.target.value)}
                                                className="w-full mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            >
                                                {engineTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.engine_type} className="mt-2" />
                                        </div>
                                        
                                        {/* Объем двигателя */}
                                        <div>
                                            <InputLabel htmlFor="engine_volume" value="Объем двигателя" />
                                            <TextInput
                                                id="engine_volume"
                                                type="text"
                                                value={data.engine_volume}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('engine_volume', e.target.value)}
                                                placeholder="Например: 2.0"
                                            />
                                            <InputError message={errors.engine_volume} className="mt-2" />
                                        </div>
                                        
                                        {/* Трансмиссия */}
                                        <div>
                                            <InputLabel htmlFor="transmission" value="Коробка передач" />
                                            <select
                                                id="transmission"
                                                value={data.transmission}
                                                onChange={(e) => setData('transmission', e.target.value)}
                                                className="w-full mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                            >
                                                {transmissionTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.transmission} className="mt-2" />
                                        </div>
                                        
                                        {/* Цвет */}
                                        <div>
                                            <InputLabel htmlFor="color" value="Цвет (необязательно)" />
                                            <TextInput
                                                id="color"
                                                type="text"
                                                value={data.color}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('color', e.target.value)}
                                            />
                                            <InputError message={errors.color} className="mt-2" />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex items-center justify-end">
                                        <Link
                                            href={route('dashboard')}
                                            className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                        >
                                            Отмена
                                        </Link>
                                        <PrimaryButton className="bg-green-600 hover:bg-green-700" processing={processing}>
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Добавить автомобиль
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 