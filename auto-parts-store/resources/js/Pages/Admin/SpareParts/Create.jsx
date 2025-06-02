import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create({ auth, categories, manufacturers, carModels }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        part_number: '',
        description: '',
        price: '',
        stock_quantity: '0',
        category_id: '',
        manufacturer: '',
        compatible_car_models: [],
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [groupedCarModels, setGroupedCarModels] = useState({});
    const [filteredCarModels, setFilteredCarModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState([]);

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
            } else {
                setPreview(null);
            }
        } else if (type === 'checkbox') {
            setData(name, checked);
        } else {
            setData(name, value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.spare-parts.store-inertia'), {
            onSuccess: () => {
                // Перенаправление обрабатывается автоматически
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Добавление запчасти</h2>}
        >
            <Head title="Добавление запчасти" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} encType="multipart/form-data">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Название запчасти */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Название запчасти *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
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
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.part_number && <div className="text-red-500 text-sm mt-1">{errors.part_number}</div>}
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
                                            onChange={handleChange}
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
                                        {errors.category_id && <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>}
                                    </div>

                                    {/* Производитель */}
                                    <div>
                                        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                                            Производитель *
                                        </label>
                                        <select
                                            id="manufacturer"
                                            name="manufacturer"
                                            value={data.manufacturer}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Выберите производителя</option>
                                            {manufacturers.map((manufacturer) => (
                                                <option key={manufacturer} value={manufacturer}>
                                                    {manufacturer}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-1 text-sm text-gray-500">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newManufacturer = prompt('Введите название нового производителя:');
                                                    if (newManufacturer && newManufacturer.trim()) {
                                                        setData('manufacturer', newManufacturer.trim());
                                                    }
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800"
                                            >
                                                + Добавить нового производителя
                                            </button>
                                        </div>
                                        {errors.manufacturer && <div className="text-red-500 text-sm mt-1">{errors.manufacturer}</div>}
                                    </div>

                                    {/* Цена */}
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                            Цена *
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={data.price}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
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
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            min="0"
                                            required
                                        />
                                        {errors.stock_quantity && <div className="text-red-500 text-sm mt-1">{errors.stock_quantity}</div>}
                                    </div>

                                    {/* Изображение */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                            Изображение
                                        </label>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            onChange={handleChange}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            accept="image/*"
                                        />
                                        {errors.image && <div className="text-red-500 text-sm mt-1">{errors.image}</div>}
                                        
                                        {preview && (
                                            <div className="mt-2">
                                                <img src={preview} alt="Preview" className="h-32 w-auto object-cover rounded-md" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Описание */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Описание
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            onChange={handleChange}
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                                    </div>

                                    {/* Совместимые модели автомобилей */}
                                    <div className="md:col-span-2">
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
                                        
                                        {errors.compatible_car_models && <div className="text-red-500 text-sm mt-1">{errors.compatible_car_models}</div>}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        {processing ? 'Сохранение...' : 'Сохранить запчасть'}
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