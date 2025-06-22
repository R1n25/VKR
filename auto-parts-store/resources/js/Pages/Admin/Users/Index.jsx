import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTable from '@/Components/AdminTable';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminAlert from '@/Components/AdminAlert';

export default function Index({ auth, users }) {
    const [notification, setNotification] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        router.delete(url(`admin/users/${userToDelete.id}`), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: `Пользователь "${userToDelete.name}" успешно удален`
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при удалении пользователя'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    // Колонки для таблицы
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Имя' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Роль' },
        { key: 'created_at', label: 'Дата регистрации' },
        { key: 'actions', label: 'Действия' }
    ];

    // Форматирование данных для таблицы
    const data = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.is_admin ? 'Администратор' : 'Пользователь',
        created_at: new Date(user.created_at).toLocaleDateString('ru-RU'),
        actions: (
            <div className="flex space-x-2">
                <Link 
                    href={url(`admin/users/${user.id}/edit`)} 
                    className="btn-sm btn-primary"
                >
                    Редактировать
                </Link>
                <button 
                    onClick={() => handleDeleteClick(user)} 
                    className="btn-sm btn-danger"
                    disabled={user.id === auth.user.id}
                >
                    Удалить
                </button>
            </div>
        )
    }));

    // Фильтрация данных по поисковому запросу
    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).includes(searchTerm)
    );

    // Модальное окно подтверждения удаления
    const DeleteModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
                <p className="mb-6">
                    Вы уверены, что хотите удалить пользователя "{userToDelete?.name}"?
                </p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="btn-secondary"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={handleDeleteConfirm} 
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление пользователями</h2>}
        >
            <Head title="Управление пользователями" />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            {/* Модальное окно удаления */}
            {showDeleteModal && <DeleteModal />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Пользователи" 
                            subtitle={`Всего пользователей: ${users.length}`}
                        />
                        
                        <div className="mt-6">
                            <AdminTable 
                                columns={columns} 
                                data={filteredData} 
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                searchPlaceholder="Поиск по имени, email или роли..."
                            />
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 