import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { ChevronRightIcon, WrenchIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Generation({ auth, brand, model, engineVolumes, bodyTypes }) {
    const [selectedEngine, setSelectedEngine] = useState('');
    const [selectedEngineType, setSelectedEngineType] = useState('');
    const [selectedBodyType, setSelectedBodyType] = useState('');
    
    // Группировка двигателей по типу
    const enginesByType = engineVolumes.reduce((acc, engine) => {
        const type = engine.engine_type || 'Неизвестный тип';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(engine.engine_volume);
        return acc;
    }, {});
    
    // Обработчики выбора
    const handleEngineTypeChange = (type) => {
        setSelectedEngineType(type);
        setSelectedEngine('');
    };
    
    const handleEngineVolumeChange = (volume) => {
        setSelectedEngine(volume);
    };
    
    const handleBodyTypeChange = (type) => {
        setSelectedBodyType(type);
    };
    
    // Проверка возможности перехода к запчастям
    const canProceed = selectedEngine && selectedEngineType;
    
    // Генерация URL для запчастей
    const getPartsUrl = () => {
        const params = new URLSearchParams();
        if (selectedEngineType) params.append('engine_type', selectedEngineType);
        if (selectedEngine) params.append('engine_volume', selectedEngine);
        if (selectedBodyType) params.append('body_type', selectedBodyType);
        
        const baseUrl = url('catalog/parts', { brand: brand.slug, model: model.slug, generation: model.generation });
        return `${baseUrl}?${params.toString()}`;
    };
    
    return (
        <MainLayout user={auth?.user}>
            <Head title={`${brand.name} ${model.name} ${model.generation} - Выбор модификации`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Хлебные крошки */}
                    <div className="mb-4 flex flex-wrap items-center text-sm text-gray-500">
                        <Link href={url('catalog')} className="hover:text-indigo-600">
                            Каталог
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={url('catalog/brand', { slug: brand.slug })} className="hover:text-indigo-600">
                            {brand.name}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <Link href={url('catalog/model', { brand: brand.slug, model: model.slug })} className="hover:text-indigo-600">
                            {model.name}
                        </Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900">{model.generation}</span>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {brand.name} {model.name} {model.generation} - Выбор модификации
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Выберите параметры двигателя и кузова для поиска запчастей
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Информация о модели и изображение */}
                                <div>
                                    {model.image_url && (
                                        <div className="mb-4">
                                            <img 
                                                src={`/storage/${model.image_url}`} 
                                                alt={`${brand.name} ${model.name}`} 
                                                className="w-full max-h-64 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-lg mb-3">Характеристики модели</h3>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-500 text-sm">Марка:</p>
                                                <p className="font-medium">{brand.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Модель:</p>
                                                <p className="font-medium">{model.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Поколение:</p>
                                                <p className="font-medium">{model.generation}</p>
                                            </div>
                                            {model.year_start && (
                                                <div>
                                                    <p className="text-gray-500 text-sm">Годы выпуска:</p>
                                                    <p className="font-medium">
                                                        {model.year_start} - {model.year_end || 'н.в.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Форма выбора модификации */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-medium text-lg mb-4">Выберите модификацию</h3>
                                    
                                    {/* Выбор типа двигателя */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Тип двигателя
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.keys(enginesByType).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`px-4 py-2 text-left border rounded-md ${
                                                        selectedEngineType === type
                                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => handleEngineTypeChange(type)}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Выбор объема двигателя */}
                                    {selectedEngineType && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Объем двигателя
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {enginesByType[selectedEngineType].map(volume => (
                                                    <button
                                                        key={volume}
                                                        type="button"
                                                        className={`px-4 py-2 text-center border rounded-md ${
                                                            selectedEngine === volume
                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                        onClick={() => handleEngineVolumeChange(volume)}
                                                    >
                                                        {volume}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Выбор типа кузова */}
                                    {bodyTypes.length > 0 && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Тип кузова (опционально)
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {bodyTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 text-left border rounded-md ${
                                                            selectedBodyType === type
                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                        onClick={() => handleBodyTypeChange(type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Кнопка перехода к запчастям */}
                                    <div className="mt-8">
                                        <Link
                                            href={canProceed ? getPartsUrl() : '#'}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-semibold text-white ${
                                                canProceed
                                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                            onClick={(e) => !canProceed && e.preventDefault()}
                                        >
                                            Перейти к запчастям
                                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                                        </Link>
                                        
                                        {!canProceed && (
                                            <p className="text-sm text-red-500 mt-2">
                                                * Выберите тип и объем двигателя для продолжения
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}