import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminTable from '@/Components/AdminTable';
import AdminAlert from '@/Components/AdminAlert';

// Добавляем функцию url
const url = (path) => {
    return `/${path}`;
};

export default function Show({ auth, category, subcategories, spareParts }) {
    const [notification, setNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Обработчик удаления категории
    const handleDelete = () => {
        router.delete(url(`admin/part-categories/${category.id}`), {
            onSuccess: () => {
                // Перенаправление происходит автоматически
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при удалении категории'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
            }
        });
    };
    
    // Колонки для таблицы подкатегорий
    const subcategoryColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'subcategories_count', label: 'Подкатегории' },
        { key: 'spare_parts_count', label: 'Запчасти' },
        { key: 'actions', label: 'Действия' }
    ];
    
    // Данные для таблицы подкатегорий
    const subcategoryData = subcategories.map(subcategory => ({
        id: subcategory.id,
        name: (
            <Link 
                href={url(`admin/part-categories/${subcategory.id}`)} 
                className="text-blue-600 hover:underline font-medium"
            >
                {subcategory.name}
            </Link>
        ),
        subcategories_count: subcategory.subcategories_count || 0,
        spare_parts_count: subcategory.spare_parts_count || 0,
        actions: (
            <div className="flex space-x-2">
                <Link 
                    href={url(`admin/part-categories/${subcategory.id}`)} 
                    className="btn-sm btn-info"
                >
                    Просмотр
                </Link>
                <Link 
                    href={url(`admin/part-categories/${subcategory.id}/edit`)} 
                    className="btn-sm btn-primary"
                >
                    Редактировать
                </Link>
            </div>
        )
    }));
    
    // Колонки для таблицы запчастей
    const sparePartColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
        { key: 'part_number', label: 'Артикул' },
        { key: 'price', label: 'Цена' },
        { key: 'actions', label: 'Действия' }
    ];
    
    // Данные для таблицы запчастей
    const sparePartData = spareParts.map(part => ({
        id: part.id,
        name: (
            <Link 
                href={url(`admin/spare-parts/${part.id}`)} 
                className="text-blue-600 hover:underline font-medium"
            >
                {part.name}
            </Link>
        ),
        part_number: part.part_number,
        price: `${part.price} ₽`,
        actions: (
            <div className="flex space-x-2">
                <Link 
                    href={url(`admin/spare-parts/${part.id}`)} 
                    className="btn-sm btn-info"
                >
                    Просмотр
                </Link>
                <Link 
                    href={url(`admin/spare-parts/${part.id}/edit`)} 
                    className="btn-sm btn-primary"
                >
                    Редактировать
                </Link>
            </div>
        )
    }));
    
    // Модальное окно подтверждения удаления
    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
                <p className="mb-6">
                    Вы уверены, что хотите удалить категорию "{category.name}"?
                    {subcategories.length > 0 && (
                        <span className="block text-red-600 mt-2">
                            Внимание! У категории есть {subcategories.length} подкатегорий, которые также будут удалены.
                        </span>
                    )}
                    {spareParts.length > 0 && (
                        <span className="block text-red-600 mt-2">
                            Внимание! В категории есть {spareParts.length} запчастей, которые останутся без категории.
                        </span>
                    )}
                </p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="btn-secondary"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={() => {
                            handleDelete();
                            setShowDeleteModal(false);
                        }} 
                        className="btn-danger"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр категории</h2>}
        >
            <Head title={`Категория: ${category.name}`} />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            {/* Модальное окно удаления */}
            {showDeleteModal && <DeleteModal />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Информация о категории */}
                    <AdminCard className="mb-6">
                        <AdminPageHeader 
                            title={category.name} 
                            subtitle={`ID: ${category.id}`}
                            actions={
                                <div className="flex space-x-2">
                                    <Link href={url('admin/part-categories')} className="btn-secondary">
                                        К списку категорий
                                    </Link>
                                    <Link href={url(`admin/part-categories/${category.id}/edit`)} className="btn-primary">
                                        Редактировать
                                    </Link>
                                    <button 
                                        onClick={() => setShowDeleteModal(true)} 
                                        className="btn-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            }
                        />
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Основная информация</h3>
                                
                                <div className="space-y-4">
                                    {category.parent && (
                                        <div>
                                            <div className="text-sm text-gray-600">Родительская категория:</div>
                                            <div className="font-medium">
                                                <Link href={url(`admin/part-categories/${category.parent.id}`)} className="text-blue-600 hover:underline">
                                                    {category.parent.name}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Подкатегорий:</div>
                                        <div className="font-medium">{subcategories.length}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Запчастей в категории:</div>
                                        <div className="font-medium">{spareParts.length}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Дополнительная информация</h3>
                                
                                <div className="space-y-4">
                                    {category.description ? (
                                        <div>
                                            <div className="text-sm text-gray-600">Описание:</div>
                                            <div className="font-medium">{category.description}</div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">Описание отсутствует</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AdminCard>
                    
                    {/* Подкатегории */}
                    {subcategories.length > 0 && (
                        <AdminCard className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Подкатегории</h3>
                            <AdminTable 
                                columns={subcategoryColumns} 
                                data={subcategoryData} 
                                searchPlaceholder="Поиск подкатегорий..."
                            />
                        </AdminCard>
                    )}
                    
                    {/* Запчасти в категории */}
                    {spareParts.length > 0 && (
                        <AdminCard>
                            <h3 className="text-lg font-semibold mb-4">Запчасти в категории</h3>
                            <AdminTable 
                                columns={sparePartColumns} 
                                data={sparePartData} 
                                searchPlaceholder="Поиск запчастей..."
                            />
                        </AdminCard>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 