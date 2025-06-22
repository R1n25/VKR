import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminTextarea from '@/Components/AdminTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminAlert from '@/Components/AdminAlert';

// Добавляем функцию url
const url = (path) => {
    return `/${path}`;
};

export default function Create({ auth, categories, spareParts }) {
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpareParts, setSelectedSpareParts] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        parent_id: '',
        spare_parts: [],
        image: null,
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(url('admin/part-categories'), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Категория успешно создана'
                });
                
                // Сбросить форму
                setData({
                    name: '',
                    description: '',
                    parent_id: '',
                    spare_parts: [],
                    image: null,
                });
                setSelectedSpareParts([]);
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при создании категории'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
                
                console.error('Form errors:', errors);
            }
        });
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
        !searchQuery ? true : (
            // Используем регулярное выражение с флагом 'i' для игнорирования регистра
            new RegExp(searchQuery, 'i').test(part.name) || 
            new RegExp(searchQuery, 'i').test(part.part_number)
        )
    );
    
    // Сортируем запчасти так, чтобы выбранные были в конце списка
    const sortedSpareParts = [...filteredSpareParts].sort((a, b) => {
        const aSelected = selectedSpareParts.includes(a.id);
        const bSelected = selectedSpareParts.includes(b.id);
        
        if (aSelected && !bSelected) return 1; // a выбран, b не выбран => a после b
        if (!aSelected && bSelected) return -1; // a не выбран, b выбран => a перед b
        return 0; // оба выбраны или оба не выбраны => порядок не меняется
    });
    
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Создание категории</h2>}
        >
            <Head title="Создание категории" />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Создание новой категории" 
                            subtitle="Заполните форму для создания категории запчастей" 
                        />
                        
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Основная информация */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Основная информация</h3>
                                    
                                    <AdminFormGroup label="Название" name="name" error={errors.name}>
                                        <AdminInput
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Введите название категории"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Родительская категория" name="parent_id" error={errors.parent_id}>
                                        <AdminSelect
                                            name="parent_id"
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                        >
                                            <option value="">Корневая категория</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </AdminSelect>
                                    </AdminFormGroup>
                                </div>
                                
                                {/* Дополнительная информация */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Дополнительная информация</h3>
                                    
                                    <AdminFormGroup label="Описание" name="description" error={errors.description}>
                                        <AdminTextarea
                                            name="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Введите описание категории"
                                            rows={6}
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Изображение" name="image" error={errors.image}>
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                name="image"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100"
                                            />
                                            
                                            {previewImage && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Предпросмотр:</p>
                                                    <img 
                                                        src={previewImage} 
                                                        alt="Предпросмотр" 
                                                        className="h-32 w-auto object-contain border rounded-md" 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </AdminFormGroup>
                                </div>
                            </div>
                            
                            {/* Список запчастей */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Запчасти в категории</h3>
                                
                                <div className="mb-4">
                                    <AdminInput
                                        type="text"
                                        placeholder="Поиск запчастей по названию или артикулу..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                
                                <div className="bg-white rounded-md border border-gray-200 max-h-80 overflow-y-auto">
                                    {sortedSpareParts.length > 0 ? (
                                        <ul className="divide-y divide-gray-200">
                                            {sortedSpareParts.map(part => (
                                                <li 
                                                    key={part.id} 
                                                    className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
                                                        selectedSpareParts.includes(part.id) ? 'bg-blue-50' : ''
                                                    }`}
                                                    onClick={() => handleSparePartSelect(part.id)}
                                                >
                                                    <div>
                                                        <div className="font-medium">{part.name}</div>
                                                        <div className="text-sm text-gray-500">Артикул: {part.part_number}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedSpareParts.includes(part.id)} 
                                                            onChange={() => {}} // Обработка в onClick родителя
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            {searchQuery ? 'Запчасти не найдены' : 'Нет доступных запчастей'}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-2 text-sm text-gray-500">
                                    Выбрано запчастей: {selectedSpareParts.length}
                                </div>
                            </div>
                            
                            {/* Кнопки действий */}
                            <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Создание...' : 'Создать категорию'}
                                </PrimaryButton>
                                
                                <Link
                                    href={url('admin/part-categories')}
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