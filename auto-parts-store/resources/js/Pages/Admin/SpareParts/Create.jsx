import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminTextarea from '@/Components/AdminTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminAlert from '@/Components/AdminAlert';

export default function Create({ auth, categories, manufacturers, carModels }) {
    const { data, setData, post, processing, errors, reset } = useForm({
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
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        
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
                    <AdminCard>
                        <AdminPageHeader 
                            title="Добавление новой запчасти" 
                            subtitle="Заполните информацию о новой запчасти" 
                        />

                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Название запчасти */}
                                <AdminFormGroup label="Название запчасти *" name="name" error={errors.name}>
                                    <AdminInput
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        handleChange={handleChange}
                                        required
                                    />
                                </AdminFormGroup>

                                {/* Артикул */}
                                <AdminFormGroup label="Артикул *" name="part_number" error={errors.part_number}>
                                    <AdminInput
                                        type="text"
                                        name="part_number"
                                        value={data.part_number}
                                        handleChange={handleChange}
                                        required
                                    />
                                </AdminFormGroup>

                                {/* Категория */}
                                <AdminFormGroup label="Категория *" name="category_id" error={errors.category_id}>
                                    <AdminSelect
                                        name="category_id"
                                        value={data.category_id}
                                        handleChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </AdminFormGroup>

                                {/* Производитель */}
                                <AdminFormGroup label="Производитель *" name="manufacturer" error={errors.manufacturer}>
                                    <AdminSelect
                                        name="manufacturer"
                                        value={data.manufacturer}
                                        handleChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите производителя</option>
                                        {manufacturers.map((manufacturer) => (
                                            <option key={manufacturer} value={manufacturer}>
                                                {manufacturer}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                    <div className="mt-1 text-sm text-gray-500">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newManufacturer = prompt('Введите название нового производителя:');
                                                if (newManufacturer && newManufacturer.trim()) {
                                                    setData('manufacturer', newManufacturer.trim());
                                                }
                                            }}
                                            className="text-[#2a4075] hover:text-[#1c2d52]"
                                        >
                                            + Добавить нового производителя
                                        </button>
                                    </div>
                                </AdminFormGroup>

                                {/* Цена */}
                                <AdminFormGroup label="Цена *" name="price" error={errors.price}>
                                    <div className="relative">
                                        <AdminInput
                                            type="number"
                                            name="price"
                                            value={data.price}
                                            handleChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500">₽</span>
                                        </div>
                                    </div>
                                </AdminFormGroup>

                                {/* Количество на складе */}
                                <AdminFormGroup label="Количество на складе *" name="stock_quantity" error={errors.stock_quantity}>
                                    <AdminInput
                                        type="number"
                                        name="stock_quantity"
                                        value={data.stock_quantity}
                                        handleChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </AdminFormGroup>

                                {/* Изображение */}
                                <div className="md:col-span-2">
                                    <AdminFormGroup label="Изображение" name="image" error={errors.image}>
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            onChange={handleFileChange}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-[#2a4075]
                                                hover:file:bg-blue-100"
                                            accept="image/*"
                                        />
                                        {preview && (
                                            <div className="mt-2">
                                                <img src={preview} alt="Предпросмотр" className="h-40 object-contain" />
                                            </div>
                                        )}
                                    </AdminFormGroup>
                                </div>

                                {/* Описание */}
                                <div className="md:col-span-2">
                                    <AdminFormGroup label="Описание" name="description" error={errors.description}>
                                        <AdminTextarea
                                            name="description"
                                            value={data.description}
                                            handleChange={handleChange}
                                            rows={5}
                                        />
                                    </AdminFormGroup>
                                </div>
                            </div>

                            {/* Совместимые модели */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Совместимые модели автомобилей</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="mb-4">
                                        <AdminFormGroup label="Выберите бренд" name="brand">
                                            <AdminSelect
                                                name="brand"
                                                value={selectedBrand}
                                                handleChange={(e) => handleBrandSelect(e.target.value)}
                                            >
                                                <option value="">Все бренды</option>
                                                {Object.keys(groupedCarModels).map((brand) => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                            </AdminSelect>
                                        </AdminFormGroup>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {filteredCarModels.map((model) => (
                                            <div 
                                                key={model.id} 
                                                className={`p-2 rounded border cursor-pointer transition-colors ${
                                                    selectedModels.includes(model.id) 
                                                        ? 'bg-[#2a4075] text-white border-[#2a4075]' 
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                                onClick={() => handleModelToggle(model.id)}
                                            >
                                                {model.brand ? `${model.brand.name} ${model.name}` : model.name}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {filteredCarModels.length === 0 && (
                                        <div className="text-gray-500 text-center py-4">
                                            {selectedBrand 
                                                ? 'Нет доступных моделей для выбранного бренда' 
                                                : 'Выберите бренд для отображения моделей'}
                                        </div>
                                    )}
                                    
                                    {selectedModels.length > 0 && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                            <p className="font-medium text-[#2a4075] mb-2">
                                                Выбрано моделей: {selectedModels.length}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedModels.map(modelId => {
                                                    const model = carModels.find(m => m.id === modelId);
                                                    return model ? (
                                                        <div 
                                                            key={model.id}
                                                            className="bg-white text-sm px-2 py-1 rounded-full border border-[#2a4075] text-[#2a4075] flex items-center"
                                                        >
                                                            <span>{model.brand ? `${model.brand.name} ${model.name}` : model.name}</span>
                                                            <button 
                                                                type="button" 
                                                                className="ml-1 text-[#2a4075] hover:text-red-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleModelToggle(model.id);
                                                                }}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <SecondaryButton
                                    href={route('admin.spare-parts.inertia')}
                                    className="flex items-center"
                                >
                                    Отмена
                                </SecondaryButton>
                                <PrimaryButton
                                    type="submit"
                                    className="flex items-center"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Сохранить запчасть
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 