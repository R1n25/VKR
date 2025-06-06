import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import toast from 'react-hot-toast';

const CategoryList = () => {
    const { categories, flash } = usePage().props;
    const [searchText, setSearchText] = useState('');
    const [filteredCategories, setFilteredCategories] = useState(categories || []);
    
    React.useEffect(() => {
        if (categories) {
            setFilteredCategories(
                categories.filter(category => 
                    category.name.toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }
    }, [categories, searchText]);

    const handleDelete = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            router.delete(route('admin.part-categories.destroy', id), {
                onSuccess: () => {
                    toast.success('Категория успешно удалена');
                },
                onError: () => {
                    toast.error('Ошибка при удалении категории');
                }
            });
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const actionButtons = (
        <div className="flex space-x-2">
            <Link href={route('admin.part-categories.create-inertia')} className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить категорию
            </Link>
            
            <a href={route('admin.part-categories.index')} className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Blade-версия
            </a>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Категории запчастей" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Список категорий запчастей</h2>
                                {actionButtons}
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

                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">ID</th>
                                            <th className="py-3 px-6 text-left">Изображение</th>
                                            <th className="py-3 px-6 text-left">Название</th>
                                            <th className="py-3 px-6 text-left">Родительская категория</th>
                                            <th className="py-3 px-6 text-left">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category) => (
                                                <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-100">
                                                    <td className="py-3 px-6 text-left whitespace-nowrap">{category.id}</td>
                                                    <td className="py-3 px-6 text-left">
                                                        {category.image_url ? (
                                                            <img src={category.image_url} alt={category.name} className="h-10 w-10 object-cover" />
                                                        ) : (
                                                            <span className="text-gray-400">Нет изображения</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-6 text-left">{category.name}</td>
                                                    <td className="py-3 px-6 text-left">
                                                        {category.parent ? category.parent.name : (
                                                            <span className="text-gray-400">Корневая категория</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <div className="flex space-x-2">
                                                            <Link 
                                                                href={route('admin.part-categories.show', category.id)}
                                                                className="px-3 py-1 text-blue-600 hover:text-blue-900"
                                                            >
                                                                Просмотр
                                                            </Link>
                                                            <Link 
                                                                href={route('admin.part-categories.edit', category.id)}
                                                                className="px-3 py-1 text-yellow-600 hover:text-yellow-900"
                                                            >
                                                                Редактировать
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleDelete(category.id)}
                                                                className="px-3 py-1 text-red-600 hover:text-red-900"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-3 px-6 text-center">
                                                    Категории не найдены
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CategoryList; 