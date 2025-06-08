import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function Create({ auth, brands }) {
    const [preview, setPreview] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        brand_id: '',
        year_start: '',
        year_end: '',
        generation: '',
        body_type: '',
        engine_type: '',
        engine_volume: '',
        transmission_type: '',
        drive_type: '',
        is_popular: false,
        description: '',
        image: null,
    });
    
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            setData(name, file);
            
            // Создаем предпросмотр изображения
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'checkbox') {
            setData(name, checked);
        } else {
            setData(name, value);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.car-models.store'), {
            onSuccess: () => {
                reset('name', 'brand_id', 'year_start', 'year_end', 'generation', 'body_type', 
                      'engine_type', 'engine_volume', 'transmission_type', 'drive_type', 
                      'is_popular', 'description', 'image');
                setPreview(null);
            },
            forceFormData: true,
        });
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Добавление модели автомобиля</h2>}
        >
            <Head title="Добавление модели автомобиля" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                {/* Основная информация */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="name" value="Название модели *" />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                                required
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="brand_id" value="Бренд *" />
                                            <select
                                                id="brand_id"
                                                name="brand_id"
                                                value={data.brand_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Выберите бренд</option>
                                                {brands.map(brand => (
                                                    <option key={brand.id} value={brand.id}>
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.brand_id} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="year_start" value="Год начала выпуска" />
                                            <TextInput
                                                id="year_start"
                                                type="number"
                                                name="year_start"
                                                value={data.year_start}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 5}
                                            />
                                            <InputError message={errors.year_start} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="year_end" value="Год окончания выпуска" />
                                            <TextInput
                                                id="year_end"
                                                type="number"
                                                name="year_end"
                                                value={data.year_end}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                                min="1900"
                                                max={new Date().getFullYear() + 5}
                                            />
                                            <InputError message={errors.year_end} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="generation" value="Поколение" />
                                            <TextInput
                                                id="generation"
                                                type="text"
                                                name="generation"
                                                value={data.generation}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.generation} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="body_type" value="Тип кузова" />
                                            <TextInput
                                                id="body_type"
                                                type="text"
                                                name="body_type"
                                                value={data.body_type}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.body_type} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Техническая информация */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Техническая информация</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel htmlFor="engine_type" value="Тип двигателя" />
                                            <TextInput
                                                id="engine_type"
                                                type="text"
                                                name="engine_type"
                                                value={data.engine_type}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.engine_type} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="engine_volume" value="Объем двигателя" />
                                            <TextInput
                                                id="engine_volume"
                                                type="text"
                                                name="engine_volume"
                                                value={data.engine_volume}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.engine_volume} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="transmission_type" value="Тип коробки передач" />
                                            <TextInput
                                                id="transmission_type"
                                                type="text"
                                                name="transmission_type"
                                                value={data.transmission_type}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.transmission_type} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="drive_type" value="Тип привода" />
                                            <TextInput
                                                id="drive_type"
                                                type="text"
                                                name="drive_type"
                                                value={data.drive_type}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                            />
                                            <InputError message={errors.drive_type} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Дополнительная информация */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительная информация</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor="description" value="Описание" />
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={data.description}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
                                                rows={4}
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center">
                                                <Checkbox
                                                    id="is_popular"
                                                    name="is_popular"
                                                    checked={data.is_popular}
                                                    onChange={handleChange}
                                                />
                                                <InputLabel htmlFor="is_popular" value="Популярная модель" className="ml-2" />
                                            </div>
                                            <InputError message={errors.is_popular} className="mt-2" />
                                        </div>
                                        
                                        <div>
                                            <InputLabel htmlFor="image" value="Изображение модели" />
                                            <input
                                                id="image"
                                                type="file"
                                                name="image"
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                                accept="image/*"
                                            />
                                            <InputError message={errors.image} className="mt-2" />
                                            
                                            {preview && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-600 mb-2">Предпросмотр изображения:</p>
                                                    <img
                                                        src={preview}
                                                        alt="Предпросмотр"
                                                        className="max-w-xs h-auto rounded-md"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Кнопки действий */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('admin.car-models.index')}
                                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                    >
                                        Отмена
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700"
                                        disabled={processing}
                                    >
                                        {processing ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}