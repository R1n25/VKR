import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import AdminAlert from '@/Components/AdminAlert';

export default function Edit({ auth, user }) {
    const [notification, setNotification] = useState(null);
    
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        is_admin: user.is_admin ? '1' : '0',
        markup_percent: user.markup_percent || 0,
        _method: 'PATCH'
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch(url(`admin/users/${user.id}`), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Данные пользователя успешно обновлены'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при обновлении данных пользователя'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
                
                console.error('Form errors:', errors);
            }
        });
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование пользователя</h2>}
        >
            <Head title="Редактирование пользователя" />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Редактирование пользователя" 
                            subtitle={`ID: ${user.id}`} 
                        />
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Основная информация */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Основная информация</h3>
                                    
                                    <AdminFormGroup label="Имя" name="name" error={errors.name}>
                                        <AdminInput
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Введите имя пользователя"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Email" name="email" error={errors.email}>
                                        <AdminInput
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Введите email пользователя"
                                        />
                                    </AdminFormGroup>
                                </div>
                                
                                {/* Настройки */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Настройки</h3>
                                    
                                    <AdminFormGroup label="Роль" name="is_admin" error={errors.is_admin}>
                                        <AdminSelect
                                            name="is_admin"
                                            value={data.is_admin}
                                            onChange={(e) => setData('is_admin', e.target.value)}
                                        >
                                            <option value="0">Пользователь</option>
                                            <option value="1">Администратор</option>
                                        </AdminSelect>
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Процент наценки" name="markup_percent" error={errors.markup_percent}>
                                        <AdminInput
                                            type="number"
                                            name="markup_percent"
                                            value={data.markup_percent}
                                            onChange={(e) => setData('markup_percent', e.target.value)}
                                            placeholder="Введите процент наценки"
                                            min="0"
                                            max="100"
                                        />
                                    </AdminFormGroup>
                                </div>
                            </div>
                            
                            {/* Кнопки действий */}
                            <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Сохранение...' : 'Сохранить изменения'}
                                </PrimaryButton>
                                
                                <Link
                                    href={url('admin/users')}
                                    className="btn-secondary"
                                >
                                    Отмена
                                </Link>
                            </div>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 