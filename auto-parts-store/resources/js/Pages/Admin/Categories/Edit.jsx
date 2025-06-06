import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextArea from '@/Components/TextArea';
import Notification from '@/Components/Notification';

export default function Edit({ auth, category, categories }) {
    const [notification, setNotification] = useState(null);
    const [previewImage, setPreviewImage] = useState(category.image_url ? `/storage/${category.image_url}` : null);

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || '',
        image: null,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.part-categories.update', category.id), {
            onSuccess: () => {
                setNotification({ type: 'success', message: 'Категория успешно обновлена' });
                setTimeout(() => setNotification(null), 3000);
            },
            preserveScroll: true,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование категории</h2>}
        >
            <Head title="Редактирование категории" />
            
            {notification && <Notification type={notification.type} message={notification.message} />}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Название" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="description" value="Описание" />
                                <TextArea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    className="mt-1 block w-full"
                                    onChange={e => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="parent_id" value="Родительская категория" />
                                <select
                                    id="parent_id"
                                    name="parent_id"
                                    value={data.parent_id}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={e => setData('parent_id', e.target.value)}
                                >
                                    <option value="">Корневая категория</option>
                                    {categories.filter(cat => cat.id !== category.id).map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.parent_id} className="mt-2" />
                            </div>

                            <div className="mb-6">
                                <InputLabel htmlFor="image" value="Изображение" />
                                <input
                                    id="image"
                                    type="file"
                                    name="image"
                                    className="mt-1 block w-full"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                                <InputError message={errors.image} className="mt-2" />
                                
                                {previewImage && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Предпросмотр:</p>
                                        <img src={previewImage} alt="Предпросмотр" className="max-w-xs max-h-40 rounded" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <Link href={route('admin.part-categories.inertia')}>
                                    <SecondaryButton type="button">
                                        Отмена
                                    </SecondaryButton>
                                </Link>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Сохранение...' : 'Сохранить'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 