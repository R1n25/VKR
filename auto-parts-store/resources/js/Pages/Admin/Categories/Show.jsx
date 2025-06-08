import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InfoButton from '@/Components/InfoButton';

export default function Show({ auth, category, subcategories, spareParts }) {
    const confirmDelete = () => {
        if (confirm(`Вы действительно хотите удалить категорию "${category.name}"?`)) {
            router.delete(route('admin.part-categories.destroy-inertia', category.id));
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Категория: {category.name}</h2>}
        >
            <Head title={`Категория: ${category.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Информация о категории</h3>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">ID:</div>
                                    <div className="font-medium">{category.id}</div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">Название:</div>
                                    <div className="font-medium">{category.name}</div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">Slug:</div>
                                    <div className="font-medium">{category.slug}</div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">Родительская категория:</div>
                                    <div className="font-medium">
                                        {category.parent ? (
                                            <Link href={route('admin.part-categories.show-inertia', category.parent.id)} className="text-blue-600 hover:underline">
                                                {category.parent.name}
                                            </Link>
                                        ) : (
                                            'Корневая категория'
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">Дата создания:</div>
                                    <div className="font-medium">
                                        {new Date(category.created_at).toLocaleDateString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="text-gray-600 mb-1">Последнее обновление:</div>
                                    <div className="font-medium">
                                        {new Date(category.updated_at).toLocaleDateString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                
                                <div className="flex space-x-3 mt-6">
                                    <Link href={route('admin.part-categories.inertia')}>
                                        <SecondaryButton>
                                            Назад к списку
                                        </SecondaryButton>
                                    </Link>
                                    
                                    <Link href={route('admin.part-categories.edit-inertia', category.id)}>
                                        <PrimaryButton>
                                            Редактировать
                                        </PrimaryButton>
                                    </Link>
                                    
                                    <DangerButton onClick={confirmDelete}>
                                        Удалить
                                    </DangerButton>
                                </div>
                            </div>
                            
                            <div>
                                
                                {category.description && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Описание</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            {category.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Подкатегории */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Подкатегории ({subcategories.length})</h3>
                            
                            {subcategories.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во запчастей</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subcategories.map((subcategory) => (
                                                <tr key={subcategory.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subcategory.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subcategory.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subcategory.spare_parts_count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex justify-center space-x-2">
                                                            <InfoButton
                                                                href={route('admin.part-categories.show-inertia', subcategory.id)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Просмотр
                                                            </InfoButton>
                                                            <SecondaryButton
                                                                href={route('admin.part-categories.edit-inertia', subcategory.id)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Изменить
                                                            </SecondaryButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Нет подкатегорий</p>
                            )}
                        </div>
                        
                        {/* Запчасти в категории */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Запчасти в категории ({spareParts.length})</h3>
                            
                            {spareParts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наличие</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {spareParts.map((part) => (
                                                <tr key={part.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.article_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.price} ₽</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {part.is_available ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                {part.stock_quantity} шт.
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                Нет в наличии
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex justify-center space-x-2">
                                                            <InfoButton
                                                                href={route('admin.spare-parts.show-inertia', part.id)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Просмотр
                                                            </InfoButton>
                                                            <SecondaryButton
                                                                href={route('admin.spare-parts.edit-inertia', part.id)}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                Изменить
                                                            </SecondaryButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Нет запчастей в этой категории</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 