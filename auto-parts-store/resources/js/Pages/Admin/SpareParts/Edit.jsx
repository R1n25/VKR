import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';

export default function Edit({ auth, sparePart, categories, manufacturers, carModels, compatibleCarIds }) {
    const [previewUrl, setPreviewUrl] = useState(sparePart.image_url ? `/storage/${sparePart.image_url}` : null);
    const [uploadFileName, setUploadFileName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [groupedCarModels, setGroupedCarModels] = useState({});
    const [filteredCarModels, setFilteredCarModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState(compatibleCarIds || []);

    // Группировка моделей автомобилей по брендам
    useEffect(() => {
        const grouped = {};
        carModels.forEach(model => {
            if (model.brand) {
                const brandName = model.brand.name;
                if (!grouped[brandName]) {
                    grouped[brandName] = [];
                }
                grouped[brandName].push(model);
            }
        });
        setGroupedCarModels(grouped);
    }, [carModels]);

    // Обработка выбора бренда
    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        setFilteredCarModels(groupedCarModels[brand] || []);
    };

    // Обработка выбора/отмены выбора модели
    const handleModelToggle = (modelId) => {
        let newSelectedModels;
        if (selectedModels.includes(modelId)) {
            newSelectedModels = selectedModels.filter(id => id !== modelId);
        } else {
            newSelectedModels = [...selectedModels, modelId];
        }
        setSelectedModels(newSelectedModels);
        setData('compatible_car_models', newSelectedModels);
    };

    const { data, setData, put, processing, errors, transform } = useForm({
        name: sparePart.name || '',
        part_number: sparePart.part_number || '',
        description: sparePart.description || '',
        price: sparePart.price || 0,
        stock_quantity: sparePart.stock_quantity || 0,
        category_id: sparePart.category_id || '',
        manufacturer: sparePart.manufacturer || '',
        image: null,
        compatible_car_models: compatibleCarIds || [],
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            setData('image', file);
            setUploadFileName(file ? file.name : '');
            
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'checkbox') {
            setData(name, checked);
        } else if (name === 'compatible_car_models') {
            // Обработка множественного выбора в select
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setData(name, selectedOptions);
        } else {
            setData(name, value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Отладочный вывод
        console.log('Отправляем данные:', data);
        console.log('URL маршрута:', route('admin.spare-parts.update-inertia', sparePart.id));
        
        try {
            // Используем правильное имя маршрута
            put(route('admin.spare-parts.update-inertia', sparePart.id), data, {
            forceFormData: true,
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Успешно обновлено!');
                },
                onError: (errors) => {
                    console.error('Ошибки валидации:', errors);
                },
                onFinish: () => {
                    console.log('Запрос завершен');
                }
            });
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
        }
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование запчасти</h2>}
        >
            <Head title={`Редактирование: ${sparePart.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-gray-800">Редактирование запчасти</h1>
                                <Link
                                    href={route('admin.spare-parts.show-inertia', sparePart.id)}
                                    className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                >
                                    Вернуться к просмотру
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Левая колонка */}
                                    <div className="space-y-6">
                                        {/* Название */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Название *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        {/* Артикул */}
                                        <div>
                                            <label htmlFor="part_number" className="block text-sm font-medium text-gray-700">
                                                Артикул *
                                            </label>
                                            <input
                                                type="text"
                                                id="part_number"
                                                name="part_number"
                                                value={data.part_number}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            />
                                            <InputError message={errors.part_number} className="mt-2" />
                                        </div>

                                        {/* Категория */}
                                        <div>
                                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                                                Категория *
                                            </label>
                                            <select
                                                id="category_id"
                                                name="category_id"
                                                value={data.category_id}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-2" />
                                        </div>

                                        {/* Производитель */}
                                        <div>
                                            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                                                Производитель *
                                            </label>
                                            <input
                                                type="text"
                                                id="manufacturer"
                                                name="manufacturer"
                                                value={data.manufacturer}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                list="manufacturers-list"
                                            />
                                            <datalist id="manufacturers-list">
                                                {manufacturers && manufacturers.map((manufacturer, index) => (
                                                    <option key={index} value={manufacturer} />
                                                ))}
                                            </datalist>
                                            <InputError message={errors.manufacturer} className="mt-2" />
                                        </div>

                                        {/* Цена */}
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                                Цена *
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <input
                                                    type="number"
                                                    id="price"
                                                    name="price"
                                                    value={data.price}
                                                    onChange={handleInputChange}
                                                    className="block w-full rounded-md border-gray-300 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="text-gray-500">₽</span>
                                                </div>
                                            </div>
                                            <InputError message={errors.price} className="mt-2" />
                                        </div>

                                        {/* Количество на складе */}
                                        <div>
                                            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
                                                Количество на складе *
                                            </label>
                                            <input
                                                type="number"
                                                id="stock_quantity"
                                                name="stock_quantity"
                                                value={data.stock_quantity}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                min="0"
                                                required
                                            />
                                            <InputError message={errors.stock_quantity} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Правая колонка */}
                                    <div className="space-y-6">
                                        {/* Описание */}
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Описание
                                            </label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={data.description}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>

                                        {/* Изображение */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Изображение</label>
                                            <div className="mt-2 flex items-center">
                                                <div className="flex-shrink-0 h-24 w-24 overflow-hidden bg-gray-100">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                                                            Нет изображения
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-col">
                                                    <label
                                                        htmlFor="image"
                                                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Выбрать файл
                                                        <input
                                                            id="image"
                                                            name="image"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={handleInputChange}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                    <span className="mt-2 text-xs text-gray-500">
                                                        {uploadFileName || (sparePart.image_url ? 'Текущее изображение' : 'Нет выбранного файла')}
                                                    </span>
                                                </div>
                                            </div>
                                            <InputError message={errors.image} className="mt-2" />
                                        </div>

                                        {/* Совместимые модели автомобилей */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Совместимые модели автомобилей
                                            </label>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Колонка брендов */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Марка автомобиля</h3>
                                                    <div className="overflow-y-auto h-60 border rounded-md p-2">
                                                        {Object.keys(groupedCarModels).sort().map(brand => (
                                                            <div 
                                                                key={brand}
                                                                className={`p-2 cursor-pointer rounded-md mb-1 ${selectedBrand === brand ? 'bg-indigo-100 font-medium' : 'hover:bg-gray-100'}`}
                                                                onClick={() => handleBrandSelect(brand)}
                                                            >
                                                                {brand.replace(/^"(.+)"$/, '$1')}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Колонка моделей */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Модели {selectedBrand && `(${selectedBrand})`}</h3>
                                                    <div className="overflow-y-auto h-60 border rounded-md p-2">
                                                        {filteredCarModels.length > 0 ? (
                                                            filteredCarModels.map(model => (
                                                                <div 
                                                                    key={model.id}
                                                                    className={`p-2 cursor-pointer rounded-md mb-1 flex items-center ${
                                                                        selectedModels.includes(model.id) ? 'bg-indigo-100' : 'hover:bg-gray-100'
                                                                    }`}
                                                                    onClick={() => handleModelToggle(model.id)}
                                                                >
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
                                                                        checked={selectedModels.includes(model.id)}
                                                                        onChange={() => {}} // Обработка в onClick родителя
                                                                    />
                                                                    {model.name}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-gray-500 p-2">
                                                                {selectedBrand ? 'Нет доступных моделей для этой марки' : 'Выберите марку автомобиля'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">Выбрано моделей: {selectedModels.length}</p>
                                                {selectedModels.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {selectedModels.map(modelId => {
                                                            const model = carModels.find(m => m.id === modelId);
                                                            return model && (
                                                                <span 
                                                                    key={modelId}
                                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                                                                >
                                                                    {model.brand?.name.replace(/^"(.+)"$/, '$1')} {model.name}
                                                                    <button
                                                                        type="button"
                                                                        className="ml-1 text-indigo-600 hover:text-indigo-900"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleModelToggle(modelId);
                                                                        }}
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <InputError message={errors.compatible_car_models} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={route('admin.spare-parts.inertia')}
                                        className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
                                    >
                                        Отмена
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700"
                                        disabled={processing}
                                    >
                                        {processing ? 'Сохранение...' : 'Сохранить изменения'}
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