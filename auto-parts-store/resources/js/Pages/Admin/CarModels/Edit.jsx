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
import AdminAlert from '@/Components/AdminAlert';

export default function Edit({ auth, carModel, brands }) {
    const [notification, setNotification] = useState(null);
    const [previewImage, setPreviewImage] = useState(carModel.image ? `/storage/${carModel.image}` : null);
    
    const { data, setData, post, processing, errors, progress } = useForm({
        name: carModel.name || '',
        brand_id: carModel.brand_id || '',
        year_start: carModel.year_start || '',
        year_end: carModel.year_end || '',
        generation: carModel.generation || '',
        body_type: carModel.body_type || '',
        is_popular: carModel.is_popular ? '1' : '0',
        description: carModel.description || '',
        image: null,
        _method: 'PUT'
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(url(`admin/car-models/${carModel.id}`), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Модель успешно обновлена'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при обновлении модели'
                });
                
                // Скрыть уведомление через 3 секунды
                setTimeout(() => setNotification(null), 3000);
                
                console.error('Form errors:', errors);
            }
        });
    };
    
    const handleDeleteImage = () => {
        if (confirm('Вы уверены, что хотите удалить изображение?')) {
            post(url(`admin/car-models/${carModel.id}/delete-image`), {
                onSuccess: () => {
                    setPreviewImage(null);
                    setNotification({
                        type: 'success',
                        message: 'Изображение успешно удалено'
                    });
                    setTimeout(() => setNotification(null), 3000);
                },
                onError: () => {
                    setNotification({
                        type: 'error',
                        message: 'Ошибка при удалении изображения'
                    });
                    setTimeout(() => setNotification(null), 3000);
                }
            });
        }
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование модели автомобиля</h2>}
        >
            <Head title="Редактирование модели автомобиля" />
            
            {/* Отображение уведомления */}
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Редактирование модели автомобиля" 
                            subtitle={`ID: ${carModel.id}`} 
                        />
                        
                        <form onSubmit={handleSubmit}>
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
                                            placeholder="Введите название модели"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Бренд" name="brand_id" error={errors.brand_id}>
                                        <AdminSelect
                                            name="brand_id"
                                            value={data.brand_id}
                                            onChange={(e) => setData('brand_id', e.target.value)}
                                        >
                                            <option value="">Выберите бренд</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </AdminSelect>
                                    </AdminFormGroup>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <AdminFormGroup label="Год начала выпуска" name="year_start" error={errors.year_start}>
                                            <AdminInput
                                                type="number"
                                                name="year_start"
                                                value={data.year_start}
                                                onChange={(e) => setData('year_start', e.target.value)}
                                                placeholder="Например: 2010"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                            />
                                        </AdminFormGroup>
                                        
                                        <AdminFormGroup label="Год окончания выпуска" name="year_end" error={errors.year_end}>
                                            <AdminInput
                                                type="number"
                                                name="year_end"
                                                value={data.year_end}
                                                onChange={(e) => setData('year_end', e.target.value)}
                                                placeholder="Оставьте пустым, если выпускается"
                                                min="1900"
                                                max={new Date().getFullYear() + 10}
                                            />
                                        </AdminFormGroup>
                                    </div>
                                    
                                    <AdminFormGroup label="Поколение" name="generation" error={errors.generation}>
                                        <AdminInput
                                            type="text"
                                            name="generation"
                                            value={data.generation}
                                            onChange={(e) => setData('generation', e.target.value)}
                                            placeholder="Например: III (F30/F31/F34)"
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Тип кузова" name="body_type" error={errors.body_type}>
                                        <AdminSelect
                                            name="body_type"
                                            value={data.body_type}
                                            onChange={(e) => setData('body_type', e.target.value)}
                                        >
                                            <option value="">Выберите тип кузова</option>
                                            <option value="sedan">Седан</option>
                                            <option value="hatchback">Хэтчбек</option>
                                            <option value="universal">Универсал</option>
                                            <option value="suv">Внедорожник</option>
                                            <option value="crossover">Кроссовер</option>
                                            <option value="coupe">Купе</option>
                                            <option value="cabriolet">Кабриолет</option>
                                            <option value="pickup">Пикап</option>
                                            <option value="minivan">Минивэн</option>
                                        </AdminSelect>
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Популярная модель" name="is_popular" error={errors.is_popular}>
                                        <AdminSelect
                                            name="is_popular"
                                            value={data.is_popular}
                                            onChange={(e) => setData('is_popular', e.target.value)}
                                        >
                                            <option value="0">Нет</option>
                                            <option value="1">Да</option>
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
                                            placeholder="Введите описание модели"
                                            rows={5}
                                        />
                                    </AdminFormGroup>
                                    
                                    <AdminFormGroup label="Изображение" name="image" error={errors.image}>
                                        <AdminInput
                                            type="file"
                                            name="image"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        
                                        {progress && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${progress.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {progress.percentage}% загружено
                                                </p>
                                            </div>
                                        )}
                                        
                                        {previewImage && (
                                            <div className="mt-4">
                                                <div className="relative inline-block">
                                                    <img
                                                        src={previewImage}
                                                        alt="Предпросмотр"
                                                        className="max-w-xs rounded-lg shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteImage}
                                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </AdminFormGroup>
                                </div>
                            </div>
                            
                            {/* Кнопки действий */}
                            <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Сохранение...' : 'Сохранить изменения'}
                                </PrimaryButton>
                                
                                <Link
                                    href={url('admin/car-models')}
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