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

export default function Edit({ auth, category, categories, spareParts, categorySparePartIds }) {
    const [notification, setNotification] = useState(null);
    const [previewImage, setPreviewImage] = useState(category.image_url ? `/storage/${category.image_url}` : null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpareParts, setSelectedSpareParts] = useState(categorySparePartIds || []);

    const { data, setData, post, processing, errors, progress, reset } = useForm({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || '',
        image: null,
        spare_parts: categorySparePartIds || [],
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.part-categories.update-inertia', category.id), {
            onSuccess: () => {
                // Удаляем локальное уведомление, так как будет использоваться серверное flash-сообщение
                // setNotification({ type: 'success', message: 'Категория успешно обновлена' });
                // setTimeout(() => setNotification(null), 3000);
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

    const handleSparePartSelect = (sparePartId) => {
        const isSelected = selectedSpareParts.includes(sparePartId);
        let updatedSelection;
        
        if (isSelected) {
            updatedSelection = selectedSpareParts.filter(id => id !== sparePartId);
        } else {
            updatedSelection = [...selectedSpareParts, sparePartId];
        }
        
        setSelectedSpareParts(updatedSelection);
        setData('spare_parts', updatedSelection);
    };

    const filteredSpareParts = spareParts.filter(part => 
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.part_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Сортируем запчасти так, чтобы выбранные были в конце списка
    const sortedSpareParts = [...filteredSpareParts].sort((a, b) => {
        const aSelected = selectedSpareParts.includes(a.id);
        const bSelected = selectedSpareParts.includes(b.id);
        
        if (aSelected && !bSelected) return 1; // a выбран, b не выбран => a после b
        if (!aSelected && bSelected) return -1; // a не выбран, b выбран => a перед b
        return 0; // оба выбраны или оба не выбраны => порядок не меняется
    });

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

                            <div className="mb-6">
                                <InputLabel htmlFor="spare_parts" value="Запчасти в категории" />
                                <div className="mt-2 border rounded-md p-4">
                                    <div className="mb-3">
                                        <TextInput
                                            type="text"
                                            placeholder="Поиск запчастей..."
                                            className="w-full"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="max-h-60 overflow-y-auto">
                                        {sortedSpareParts.length > 0 ? (
                                            <div className="space-y-2">
                                                {sortedSpareParts.map(part => (
                                                    <div 
                                                        key={part.id} 
                                                        className={`flex items-center p-2 ${selectedSpareParts.includes(part.id) ? 'bg-gray-100' : ''}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`part-${part.id}`}
                                                            checked={selectedSpareParts.includes(part.id)}
                                                            onChange={() => handleSparePartSelect(part.id)}
                                                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`part-${part.id}`} className="flex-grow">
                                                            <span className="font-medium">{part.name}</span>
                                                            <span className="text-gray-500 ml-2">({part.part_number})</span>
                                                            {part.category_id === category.id && (
                                                                <span className="ml-2 text-green-600 text-xs font-medium">
                                                                    ★ В этой категории
                                                                </span>
                                                            )}
                                                        </label>
                                                        <span className="text-sm text-gray-500">{part.price} ₽</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Запчасти не найдены</p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-2 text-sm text-gray-600">
                                        Выбрано запчастей: {selectedSpareParts.length}
                                    </div>
                                </div>
                                <InputError message={errors.spare_parts} className="mt-2" />
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