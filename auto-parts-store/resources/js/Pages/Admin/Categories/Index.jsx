import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import toast from 'react-hot-toast';

// Компонент для отображения одной категории и её подкатегорий
const CategoryItem = ({ category, categories, level = 0, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Находим дочерние категории
    const childCategories = categories.filter(cat => cat.parent_id === category.id);
    
    // Стили для отступов в зависимости от уровня вложенности
    const indentStyle = {
        marginLeft: `${level * 24}px`,
        borderLeft: level > 0 ? '1px dashed #e2e8f0' : 'none',
        paddingLeft: level > 0 ? '12px' : '0',
        marginBottom: '6px',
    };
    
    return (
        <div>
            <div 
                className="flex items-center py-2 px-3 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-200 cursor-pointer"
                style={indentStyle}
                onClick={(e) => {
                    // Проверяем, что клик был не по кнопкам и другим интерактивным элементам
                    if (e.target.closest('button') || e.target.closest('a')) {
                        return;
                    }
                    window.location.href = route('admin.part-categories.show-inertia', category.id);
                }}
            >
                {childCategories.length > 0 && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full focus:outline-none"
                    >
                        {isExpanded ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                )}
                
                {childCategories.length === 0 && (
                    <span className="mr-2 w-6 h-6"></span>
                )}
                
                <Link 
                    href={route('admin.part-categories.show-inertia', category.id)}
                    className="mr-2 text-gray-600 hover:text-blue-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </Link>
                
                <div className="flex-grow">
                    <Link 
                        href={route('admin.part-categories.show-inertia', category.id)}
                        className="font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                    >
                        {category.name}
                    </Link>
                    {category.spare_parts_count > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                            ({category.spare_parts_count} товаров)
                        </span>
                    )}
                </div>
                
                <div className="flex space-x-2">
                    <Link 
                        href={route('admin.part-categories.show-inertia', category.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                    >
                        Просмотр
                    </Link>
                    <Link 
                        href={route('admin.part-categories.edit-inertia', category.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition"
                    >
                        Изменить
                    </Link>
                    <button 
                        onClick={() => onDelete(category.id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    >
                        Удалить
                    </button>
                </div>
            </div>
            
            {isExpanded && childCategories.length > 0 && (
                <div className="category-children">
                    {childCategories.map(childCategory => (
                        <CategoryItem 
                            key={childCategory.id} 
                            category={childCategory} 
                            categories={categories}
                            level={level + 1}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoryList = () => {
    const { categories, flash } = usePage().props;
    const [searchText, setSearchText] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    
    // Получаем только корневые категории для начального отображения
    useEffect(() => {
        if (categories) {
            if (searchText) {
                // При поиске показываем все совпадающие категории вне зависимости от их уровня
                setFilteredCategories(
                    categories.filter(category => 
                        category.name.toLowerCase().includes(searchText.toLowerCase())
                    )
                );
            } else {
                // Без поиска показываем только корневые категории
                setFilteredCategories(
                    categories.filter(category => !category.parent_id)
                );
            }
        }
    }, [categories, searchText]);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleDelete = (categoryId) => {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            router.delete(route('admin.part-categories.destroy-inertia', categoryId), {
                onSuccess: () => {
                    toast.success('Категория успешно удалена');
                },
                onError: () => {
                    toast.error('Ошибка при удалении категории');
                },
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Категории запчастей" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Категории запчастей</h2>
                                <Link
                                    href={route('admin.part-categories.create-inertia')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Добавить категорию
                                </Link>
                            </div>

                            {flash && flash.success && (
                                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                    {flash.success}
                                </div>
                            )}

                            {flash && flash.error && (
                                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {flash.error}
                                </div>
                            )}

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Поиск по названию"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={searchText}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="category-tree bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                {searchText ? (
                                    // При поиске показываем плоский список совпадающих категорий
                                    filteredCategories.length > 0 ? (
                                        filteredCategories.map(category => (
                                            <CategoryItem 
                                                key={category.id} 
                                                category={category} 
                                                categories={categories}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    ) : (
                                        <div className="py-3 text-center text-gray-500">
                                            Категории не найдены
                                        </div>
                                    )
                                ) : (
                                    // Без поиска показываем древовидную структуру, начиная с корневых категорий
                                    filteredCategories.length > 0 ? (
                                        filteredCategories.map(category => (
                                            <CategoryItem 
                                                key={category.id} 
                                                category={category} 
                                                categories={categories}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    ) : (
                                        <div className="py-3 text-center text-gray-500">
                                            Категории не найдены
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CategoryList; 