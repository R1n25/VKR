import React, { useState, useEffect } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import toast from 'react-hot-toast';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminInput from '@/Components/AdminInput';
import AdminAlert from '@/Components/AdminAlert';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InfoButton from '@/Components/InfoButton';

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
                    className="mr-2 text-gray-600 hover:text-[#2a4075]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </Link>
                
                <div className="flex-grow">
                    <Link 
                        href={route('admin.part-categories.show-inertia', category.id)}
                        className="font-medium text-[#2a4075] hover:text-[#1e325a] hover:underline cursor-pointer"
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
                    <InfoButton
                        href={route('admin.part-categories.show-inertia', category.id)}
                        className="text-xs py-1 px-3"
                    >
                        Просмотр
                    </InfoButton>
                    <SecondaryButton
                        href={route('admin.part-categories.edit-inertia', category.id)}
                        className="text-xs py-1 px-3"
                    >
                        Изменить
                    </SecondaryButton>
                    <DangerButton
                        onClick={() => onDelete(category.id)}
                        className="text-xs py-1 px-3"
                    >
                        Удалить
                    </DangerButton>
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
                    <AdminCard>
                        <div className="flex justify-between items-center mb-6">
                            <AdminPageHeader 
                                title="Категории запчастей" 
                                subtitle="Управление древовидным каталогом категорий" 
                            />
                            <PrimaryButton
                                href={route('admin.part-categories.create-inertia')}
                                className="flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Добавить категорию
                            </PrimaryButton>
                        </div>

                        {flash && flash.success && (
                            <div className="mb-4">
                                <AdminAlert type="success" message={flash.success} />
                            </div>
                        )}

                        {flash && flash.error && (
                            <div className="mb-4">
                                <AdminAlert type="error" message={flash.error} />
                            </div>
                        )}

                        <div className="mb-4">
                            <AdminInput
                                type="text"
                                placeholder="Поиск по названию"
                                value={searchText}
                                handleChange={handleSearch}
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
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CategoryList; 