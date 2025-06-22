import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Компонент отображения одной запчасти (для повторного использования)
const PartItem = ({ part, isCompact = false }) => {
    // Расчет наличия и отображение соответствующего текста и класса
    const stockText = part.stock_quantity > 10 
        ? `В наличии (10+)`
        : part.stock_quantity > 0 
            ? `В наличии (${part.stock_quantity})`
            : 'Нет в наличии';
            
    const stockClass = part.stock_quantity > 0
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';
        
    // Компактный вид для списка похожих/аналогичных запчастей
    if (isCompact) {
        return (
            <div className="border border-gray-200 rounded-md p-3 mb-2 bg-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium text-gray-900">
                            <Link href={`/parts/${part.id}`} className="hover:text-indigo-600">
                                {part.name}
                            </Link>
                        </h4>
                        <div className="text-sm text-gray-600">
                            Артикул: <Link href={`/parts/${part.id}`} className="text-blue-600 hover:underline">{part.part_number}</Link>
                            {part.manufacturer && ` | ${part.manufacturer}`}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-indigo-600">{part.price} ₽</div>
                        <div className={`text-xs ${stockClass} px-2 py-1 rounded-full`}>{stockText}</div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Полный вид для основной запчасти
    return (
        <div className="border border-gray-200 rounded-md p-4 bg-white">
            <div className="flex items-start">
                <div className="w-24 h-24 flex-shrink-0 mr-6 bg-gray-100 flex items-center justify-center rounded">
                    {part.image_url ? (
                        <img src={part.image_url} alt={part.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m-6-8h6M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z"></path>
                        </svg>
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-medium text-gray-900">{part.name}</h3>
                    <div className="mt-1">
                        <p className="text-sm text-gray-600">
                            Артикул: <span className="font-medium">{part.part_number}</span>
                            {part.manufacturer && ` | Производитель: ${part.manufacturer}`}
                        </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-indigo-600">{part.price} ₽</div>
                            {part.original_price !== part.price && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Базовая цена: {part.original_price} ₽
                                </div>
                            )}
                        </div>
                        <div className={`px-4 py-1 rounded-full text-sm font-medium ${stockClass}`}>
                            {stockText}
                        </div>
                    </div>
                </div>
            </div>
            
            {part.description && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">Описание</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p>{part.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Компонент для отображения совместимых двигателей
const CompatibleEngines = ({ compatibilities }) => {
    // Функция для группировки двигателей по моделям автомобилей
    const groupEnginesByCarModel = () => {
        if (!compatibilities || compatibilities.length === 0) {
            return {};
        }

        const groupedEngines = {};
        
        compatibilities.forEach(compatibility => {
            if (compatibility.engine) {
                const modelKey = compatibility.brand ? 
                    `${compatibility.brand.name} ${compatibility.model.name}` : 
                    'Универсальные';
                
                if (!groupedEngines[modelKey]) {
                    groupedEngines[modelKey] = {
                        brand: compatibility.brand,
                        model: compatibility.model,
                        engines: []
                    };
                }
                
                groupedEngines[modelKey].engines.push({
                    ...compatibility.engine,
                    notes: compatibility.notes
                });
            }
        });
        
        return groupedEngines;
    };

    const groupedEngines = groupEnginesByCarModel();
    const hasCompatibleEngines = Object.keys(groupedEngines).length > 0;

    if (!hasCompatibleEngines) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Информация о совместимости с двигателями не найдена</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedEngines).map(([modelName, data]) => (
                <div key={modelName} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold mb-2">{modelName}</h3>
                    
                    <div className="grid gap-3 mt-2">
                        {data.engines.map((engine, index) => (
                            <div key={`${engine.id || index}`} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{engine.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {engine.volume && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {engine.volume} л
                                                </span>
                                            )}
                                            {engine.power && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    {engine.power} л.с.
                                                </span>
                                            )}
                                            {engine.fuel_type && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {engine.fuel_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {engine.notes && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p className="italic">{engine.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function Detail({ auth, part, analogs, similarParts, compatibilities = [] }) {
    const [activeTab, setActiveTab] = useState('details');
    const [categoryName, setCategoryName] = useState(part.category?.name || part.category_name || null);
    
    // Загрузка названия категории при монтировании компонента
    useEffect(() => {
        // Если у нас есть ID категории, но нет названия категории
        if (part.category_id && !categoryName) {
            // Делаем запрос к API для получения названия категории
            fetch(`/api/categories/${part.category_id}/name`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        setCategoryName(data.data.name);
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке названия категории:', error);
                });
        }
    }, [part.category_id, categoryName]);
    
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={part.name} />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Навигационные хлебные крошки */}
                    <div className="mb-4">
                        <nav className="flex text-sm text-gray-500">
                            <Link href="/" className="hover:text-gray-700">Главная</Link>
                            <span className="mx-2">/</span>
                            <Link href="/search" className="hover:text-gray-700">Поиск запчастей</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900">{part.name}</span>
                        </nav>
                    </div>
                    
                    {/* Основная информация о запчасти */}
                    <PartItem part={part} />
                    
                    {/* Табы с дополнительной информацией */}
                    <div className="mt-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button 
                                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                        activeTab === 'details'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Детальная информация
                                </button>
                                
                                <button 
                                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                        activeTab === 'analogs'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveTab('analogs')}
                                >
                                    Аналоги {analogs.length > 0 && `(${analogs.length})`}
                                </button>
                                
                                <button 
                                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                        activeTab === 'compatibility'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveTab('compatibility')}
                                >
                                    Совместимость с двигателями
                                </button>
                                
                                <button 
                                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                        activeTab === 'similar'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                    onClick={() => setActiveTab('similar')}
                                >
                                    Похожие запчасти
                                </button>
                            </nav>
                        </div>
                        
                        {/* Содержимое активного таба */}
                        <div className="mt-6">
                            {activeTab === 'details' && (
                                <div className="bg-white p-6 rounded-md shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Технические характеристики</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <table className="min-w-full border-collapse">
                                                <tbody>
                                                    <tr className="border-t">
                                                        <td className="py-2 pr-4 text-sm text-gray-600 align-top">Артикул:</td>
                                                        <td className="py-2 text-sm font-medium text-gray-900">{part.part_number}</td>
                                                    </tr>
                                                    
                                                    <tr className="border-t">
                                                        <td className="py-2 pr-4 text-sm text-gray-600 align-top">Производитель:</td>
                                                        <td className="py-2 text-sm font-medium text-gray-900">{part.manufacturer || 'Не указан'}</td>
                                                    </tr>
                                                    
                                                    <tr className="border-t">
                                                        <td className="py-2 pr-4 text-sm text-gray-600 align-top">Категория:</td>
                                                        <td className="py-2 text-sm font-medium text-gray-900">
                                                            {categoryName || 
                                                             part.category?.name || 
                                                             part.category_name || 
                                                             (part.category_id ? `Загрузка...` : 'Не указана')}
                                                        </td>
                                                    </tr>
                                                    
                                                    <tr className="border-t">
                                                        <td className="py-2 pr-4 text-sm text-gray-600 align-top">Наличие:</td>
                                                        <td className="py-2 text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {part.stock_quantity > 0 ? `В наличии (${part.stock_quantity})` : 'Нет в наличии'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'analogs' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Аналогичные запчасти</h3>
                                    
                                    {analogs.length > 0 ? (
                                        <div>
                                            {/* Группируем аналоги по типу связи */}
                                            {analogs.some(analog => analog.analog_type === 'direct') && (
                                                <div className="mb-6">
                                                    <h4 className="text-md font-medium text-gray-700 mb-2">Прямые аналоги</h4>
                                                    <div className="space-y-2">
                                                        {analogs
                                                            .filter(analog => analog.analog_type === 'direct')
                                                            .map((analog, index) => (
                                                                <PartItem key={`direct-${analog.id || index}`} part={analog} isCompact={true} />
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {analogs.some(analog => analog.analog_type !== 'direct') && (
                                                <div>
                                                    <h4 className="text-md font-medium text-gray-700 mb-2">Косвенные аналоги (через связанные запчасти)</h4>
                                                    <div className="space-y-2">
                                                        {analogs
                                                            .filter(analog => analog.analog_type !== 'direct')
                                                            .map((analog, index) => (
                                                                <PartItem key={`indirect-${analog.id || index}`} part={analog} isCompact={true} />
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 p-4 rounded-md">
                                            <p className="text-yellow-700">Для этой запчасти аналогов не найдено.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === 'compatibility' && (
                                <div className="bg-white p-6 rounded-md shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Совместимость с двигателями</h3>
                                    <CompatibleEngines compatibilities={compatibilities} />
                                </div>
                            )}
                            
                            {activeTab === 'similar' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Похожие запчасти в этой категории</h3>
                                    
                                    {similarParts.length > 0 ? (
                                        <div className="space-y-2">
                                            {similarParts.map((similarPart, index) => (
                                                <PartItem key={similarPart.id || index} part={similarPart} isCompact={true} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 p-4 rounded-md">
                                            <p className="text-yellow-700">Похожих запчастей не найдено.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Кнопки действий для запчасти */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link 
                            href={`/parts/${part.id}/suggest-analog`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Предложить аналог
                        </Link>
                        <Link 
                            href={`/parts/${part.id}/suggest-compatibility`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v6h4a1 1 0 001-1V8a1 1 0 00-1-1z" />
                            </svg>
                            Совместимость с авто
                        </Link>
                    </div>
                    
                    {/* Кнопка для возврата к поиску */}
                    <div className="mt-8">
                        <Link 
                            href="/search" 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Вернуться к поиску
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 