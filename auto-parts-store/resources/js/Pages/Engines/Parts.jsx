import React, { useState, useEffect, Fragment } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Компонент для древовидной категории
const CategoryItem = ({ category, engineId, subcategories = [], level = 0, onSelectCategory, isSelected, selectedCategoryId }) => {
    const isCurrentSelected = selectedCategoryId === category.id;
    // Категория развернута по умолчанию или если она выбрана
    const [isExpanded, setIsExpanded] = useState(true);
    const [childCategories, setChildCategories] = useState(subcategories);
    const [loading, setLoading] = useState(false);
    
    const hasChildren = subcategories.length > 0 || category.has_children;
    
    // Загружаем подкатегории при первом рендере, если они есть
    useEffect(() => {
        const loadSubcategories = async () => {
            if (hasChildren && childCategories.length === 0) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/categories/${category.id}/subcategories`);
                    if (response.data.status === 'success' && response.data.data.subcategories) {
                        setChildCategories(response.data.data.subcategories);
                    }
                } catch (error) {
                    console.error('Ошибка при загрузке подкатегорий:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        
        loadSubcategories();
    }, []);
    
    // Обновляем состояние, когда меняется выбранная категория
    useEffect(() => {
        if (isCurrentSelected && !isExpanded) {
            setIsExpanded(true);
        }
    }, [selectedCategoryId, isCurrentSelected, isExpanded]);
    
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    
    return (
        <div className={`mb-2 ${level > 0 ? 'ml-6' : ''}`}>
            <div className="flex items-center">
                {hasChildren ? (
                    <button 
                        onClick={toggleExpand}
                        className="mr-2 w-5 h-5 flex items-center justify-center text-gray-600 hover:text-indigo-600"
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        )}
                    </button>
                ) : (
                    <div className="mr-2 w-5 h-5"></div> // Пустое место для выравнивания
                )}
                <button
                    onClick={() => onSelectCategory(category)}
                    className={`py-2 px-3 bg-white border border-gray-200 rounded-md flex-1 flex items-center ${
                        isCurrentSelected ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="mr-2">
                        {getCategoryIcon(category.name)}
                    </div>
                    <div className="flex-1 text-left">
                        <div className={`font-medium ${isCurrentSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {category.name}
                        </div>
                        {category.description && (
                            <div className="text-xs text-gray-500">{category.description}</div>
                        )}
                    </div>
                </button>
            </div>
            
            {isExpanded && childCategories.length > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-indigo-100">
                    {childCategories.map(subCategory => (
                        <CategoryItem 
                            key={subCategory.id} 
                            category={subCategory} 
                            engineId={engineId}
                            level={level + 1}
                            onSelectCategory={onSelectCategory}
                            isSelected={isCurrentSelected}
                            selectedCategoryId={selectedCategoryId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Функция для определения иконки категории
const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('двигатель')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
        );
    } else if (name.includes('трансмисс') || name.includes('коробк')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
            </svg>
        );
    } else if (name.includes('тормоз')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        );
    } else if (name.includes('электр')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
        );
    } else if (name.includes('кузов') || name.includes('двер')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
        );
    } else if (name.includes('подвеск')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
        );
    } else {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        );
    }
};

// Компонент для отображения запчасти в списке
const PartItem = ({ part, onAddToCart, engineParts, engine }) => {
    // Проверяем, совместима ли запчасть с текущим двигателем
    const isCompatibleWithEngine = engineParts.some(enginePart => enginePart.id === part.id);
    const [showCompatibility, setShowCompatibility] = useState(false);
    
    // Если запчасть отображается в списке запчастей для категории с фильтром по двигателю,
    // то она уже является совместимой с этим двигателем
    const isCompatible = true; // Всегда считаем совместимой, так как запчасть уже отфильтрована по категории и двигателю
    
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition mb-4">
            <div className="p-4">
                <div className="flex items-start">
                    {part.image_url ? (
                        <img 
                            src={part.image_url} 
                            alt={part.name} 
                            className="w-20 h-20 object-cover rounded mr-4"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded mr-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="font-medium text-lg">{part.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <span className="mr-2">Артикул: <Link href={`/parts/${part.id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">{part.part_number}</Link></span>
                            <span>Производитель: {part.manufacturer}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {part.description || `${part.name} - оригинальная запчасть для вашего автомобиля.`}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-lg text-indigo-600">{part.price} ₽</div>
                            <div className="flex space-x-2">
                                <div className={`text-sm px-2 py-1 rounded ${part.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {part.stock_quantity > 0 ? `В наличии (${part.stock_quantity})` : 'Нет в наличии'}
                                </div>
                                {isCompatible && (
                                    <div className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Совместимо с двигателем
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex items-center space-x-2 mt-3">
                            <button 
                                onClick={() => onAddToCart(part, 1)}
                                disabled={part.stock_quantity <= 0}
                                className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                                    part.stock_quantity > 0 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                В корзину
                            </button>
                            
                            <button 
                                onClick={() => setShowCompatibility(!showCompatibility)}
                                className="flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                                </svg>
                                {showCompatibility ? 'Скрыть совместимость' : 'Показать совместимость'}
                            </button>
                            
                            <Link 
                                href={`/parts/${part.id}`}
                                className="flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Подробнее
                            </Link>
                        </div>
                        
                        {/* Информация о совместимости */}
                        {showCompatibility && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                                <h4 className="font-medium text-sm mb-2">Совместимость с двигателями:</h4>
                                {isCompatible ? (
                                    <div className="flex items-center text-sm text-green-700 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-green-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            {engine ? `${engine.name} (${engine.volume} л, ${engine.power} л.с.)` : 'Текущий двигатель'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-sm text-red-700 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-red-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            Не совместимо с текущим двигателем
                                        </span>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Для получения полной информации о совместимости перейдите на страницу запчасти
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function EngineParts({ auth, engineId }) {
    const [engine, setEngine] = useState(null);
    const [rootCategories, setRootCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Новые состояния для двухпанельного интерфейса
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parts, setParts] = useState([]);
    const [loadingParts, setLoadingParts] = useState(false);
    const [partsError, setPartsError] = useState('');
    const [cartMessage, setCartMessage] = useState('');
    
    // Добавляем состояние для хранения запчастей двигателя
    const [engineParts, setEngineParts] = useState([]);
    
    // Загрузка двигателя и корневых категорий
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Получаем данные о двигателе
                const engineResponse = await axios.get(`/api/engines/${engineId}`);
                
                if (engineResponse.data && engineResponse.data.status === 'success' && engineResponse.data.data) {
                    setEngine(engineResponse.data.data);
                }
                
                // Получаем корневые категории запчастей
                const categoriesResponse = await axios.get('/api/categories?root_only=true');
                
                if (categoriesResponse.data && categoriesResponse.data.status === 'success' && categoriesResponse.data.data) {
                    const categories = categoriesResponse.data.data;
                    setRootCategories(categories);
                    
                    // Выбираем первую категорию по умолчанию
                    if (categories.length > 0) {
                        setSelectedCategory(categories[0]);
                    }
                } else {
                    setRootCategories([]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при получении данных:', err);
                setError('Не удалось загрузить информацию о категориях запчастей. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchData();
    }, [engineId]);
    
    // Загрузка запчастей при изменении выбранной категории
    useEffect(() => {
        if (selectedCategory) {
            const fetchParts = async () => {
                setLoadingParts(true);
                setPartsError('');
                
                try {
                    // Используем правильный API-маршрут для получения запчастей по категории
                    const response = await axios.get(`/api/part-categories/${selectedCategory.id}/filtered-parts`, {
                        params: {
                            engine_id: engineId
                        }
                    });
                    
                    console.log('API Response:', response.data);
                    
                    // Проверяем структуру ответа и извлекаем данные
                    if (response.data && response.data.success) {
                        if (response.data.data && Array.isArray(response.data.data.data)) {
                            // Если данные находятся в data.data.data (пагинированный ответ)
                            setParts(response.data.data.data);
                        } else if (response.data.data && Array.isArray(response.data.data)) {
                            // Если данные находятся в data.data
                            setParts(response.data.data);
                        } else {
                            console.error('Неверная структура данных:', response.data);
                            setPartsError('Не удалось загрузить запчасти для выбранной категории');
                            setParts([]);
                        }
                    } else {
                        console.error('Ошибка в ответе API:', response.data.message || 'Неизвестная ошибка');
                        setPartsError(response.data.message || 'Не удалось загрузить запчасти для выбранной категории');
                        setParts([]);
                    }
                } catch (err) {
                    console.error('Ошибка при получении запчастей:', err);
                    setPartsError('Не удалось загрузить запчасти для выбранной категории');
                    setParts([]);
                } finally {
                    setLoadingParts(false);
                }
            };
            
            fetchParts();
        }
    }, [selectedCategory, engineId]);
    
    // После получения категорий и запчастей, добавляем дополнительный запрос для получения запчастей, совместимых с двигателем
    useEffect(() => {
        if (engineId) {
            axios.get(`/api/engine-parts/engine/${engineId}/parts`)
                .then(response => {
                    if (response.data.status === 'success') {
                        setEngineParts(response.data.data.parts);
                    }
                })
                .catch(error => {
                    console.error('Ошибка при получении запчастей двигателя:', error);
                });
        }
    }, [engineId]);
    
    // Обработчик выбора категории
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
    };
    
    // Обработчик добавления в корзину
    const handleAddToCart = async (part, quantity = 1) => {
        try {
            await axios.post('/api/cart/add', {
                spare_part_id: part.id,
                quantity: quantity
            });
            
            setCartMessage(`${part.name} добавлен в корзину (${quantity} шт.)`);
            
            // Скрываем сообщение через 3 секунды
            setTimeout(() => {
                setCartMessage('');
            }, 3000);
        } catch (err) {
            console.error('Ошибка при добавлении в корзину:', err);
            setCartMessage('Ошибка при добавлении в корзину');
            
            // Скрываем сообщение об ошибке через 3 секунды
            setTimeout(() => {
                setCartMessage('');
            }, 3000);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {loading ? 'Загрузка...' : engine ? `Запчасти для ${engine.brand_name} ${engine.model_name}` : 'Категории запчастей'}
                </h2>
            }
        >
            <Head title={loading ? 'Загрузка...' : engine ? `Запчасти для ${engine.brand_name} ${engine.model_name}` : 'Категории запчастей'} />

            {/* Уведомление о добавлении в корзину */}
            {cartMessage && (
                <div className="fixed top-20 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg max-w-sm">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>{cartMessage}</span>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 text-center">
                                <p className="mb-2">Загрузка данных...</p>
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-md">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Хлебные крошки и информация */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6 text-gray-900">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            {/* Хлебные крошки */}
                                            <nav className="mb-4">
                                                <ol className="flex flex-wrap space-x-2 text-sm text-gray-500">
                                                    <li>
                                                        <Link href="/" className="hover:text-indigo-600">
                                                            Главная
                                                        </Link>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <Link href="/brands" className="hover:text-indigo-600">
                                                            Бренды
                                                        </Link>
                                                    </li>
                                                    {engine && (
                                                        <>
                                                            <li className="flex items-center">
                                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <Link href={`/brands/${engine.brand_id}`} className="hover:text-indigo-600">
                                                                    {engine.brand_name}
                                                                </Link>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <Link href={`/models/${engine.model_id}`} className="hover:text-indigo-600">
                                                                    {engine.model_name}
                                                                </Link>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <Link href={route('engines.index', { id: engine.model_id })} className="hover:text-indigo-600">
                                                                    Двигатели
                                                                </Link>
                                                            </li>
                                                            <li className="flex items-center">
                                                                <svg className="h-4 w-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="font-medium text-gray-900">{engine.name}</span>
                                                            </li>
                                                        </>
                                                    )}
                                                </ol>
                                            </nav>

                                            {/* Заголовок и информация */}
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                Каталог запчастей для {engine && `${engine.brand_name} ${engine.model_name}`}
                                            </h1>
                                            {engine && (
                                                <p className="text-gray-600">
                                                    Двигатель: {engine.name} ({engine.volume} л, {engine.power} л.с., {engine.type})
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Кнопка корзины */}
                                        <Link
                                            href="/cart"
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                            </svg>
                                            Корзина
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Двухпанельный интерфейс */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Левая панель с категориями */}
                                <div className="md:w-1/3 lg:w-1/4">
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-4 border-b border-gray-200">
                                            <h2 className="text-lg font-semibold">Категории запчастей</h2>
                                        </div>
                                        <div className="p-4">
                                            {rootCategories.length === 0 ? (
                                                <div className="text-gray-500 text-center py-4">
                                                    Категории не найдены
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {rootCategories.map(category => (
                                                        <CategoryItem
                                                            key={category.id}
                                                            category={{...category, has_children: true}}
                                                            engineId={engineId}
                                                            onSelectCategory={handleSelectCategory}
                                                            isSelected={selectedCategory && selectedCategory.id === category.id}
                                                            selectedCategoryId={selectedCategory?.id}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Правая панель с запчастями */}
                                <div className="md:w-2/3 lg:w-3/4">
                                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                            <h2 className="text-lg font-semibold">
                                                {selectedCategory ? `Запчасти из категории "${selectedCategory.name}"` : 'Выберите категорию'}
                                            </h2>
                                            <div className="text-sm text-gray-600">
                                                {loadingParts ? 'Загрузка...' : parts.length > 0 ? `Найдено: ${parts.length}` : ''}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            {loadingParts ? (
                                                <div className="text-center py-8">
                                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                    <p>Загрузка запчастей...</p>
                                                </div>
                                            ) : partsError ? (
                                                <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
                                                    {partsError}
                                                </div>
                                            ) : parts.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    <p className="text-gray-500">Запчасти не найдены для выбранной категории и двигателя</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {parts.map(part => (
                                                        <PartItem
                                                            key={part.id}
                                                            part={part}
                                                            onAddToCart={handleAddToCart}
                                                            engineParts={engineParts}
                                                            engine={engine}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 