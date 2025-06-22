import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

export default function Edit({ auth, sparePart, categories, manufacturers, carModels, compatibleCarIds, carEngines, compatibleEngineIds }) {
    const [previewUrl, setPreviewUrl] = useState(sparePart.image_url ? `/storage/${sparePart.image_url}` : null);
    const [uploadFileName, setUploadFileName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [groupedCarModels, setGroupedCarModels] = useState({});
    const [filteredCarModels, setFilteredCarModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState(compatibleCarIds || []);
    const [availableEngines, setAvailableEngines] = useState([]);
    const [selectedEngines, setSelectedEngines] = useState(compatibleEngineIds || []);
    const [notification, setNotification] = useState(null);

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
        
        // Инициализируем доступные двигатели при загрузке страницы
        updateAvailableEngines(compatibleCarIds || []);
    }, [carModels, compatibleCarIds]);

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
        
        // Обновляем список доступных двигателей при изменении выбранных моделей
        updateAvailableEngines(newSelectedModels);
    };
    
    // Обновление списка доступных двигателей для выбранных моделей
    const updateAvailableEngines = (selectedModelIds) => {
        if (selectedModelIds.length === 0) {
            setAvailableEngines([]);
            return;
        }
        
        // Фильтруем двигатели, которые соответствуют выбранным моделям
        const engines = carEngines.filter(engine => 
            selectedModelIds.includes(engine.model_id)
        );
        
        setAvailableEngines(engines);
    };
    
    // Обработка выбора/отмены выбора двигателя
    const handleEngineToggle = (engineId) => {
        let newSelectedEngines;
        if (selectedEngines.includes(engineId)) {
            newSelectedEngines = selectedEngines.filter(id => id !== engineId);
        } else {
            newSelectedEngines = [...selectedEngines, engineId];
        }
        setSelectedEngines(newSelectedEngines);
        setData('compatible_car_engines', newSelectedEngines);
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
        compatible_car_engines: compatibleEngineIds || [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        setUploadFileName(file ? file.name : '');
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(url(`admin/spare-parts/${sparePart.id}`), data, {
            forceFormData: true,
            preserveState: false,
            preserveScroll: true,
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Запчасть успешно обновлена'
                });
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: 'Произошла ошибка при обновлении запчасти'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование запчасти</h2>}
        >
            <Head title={`Редактирование: ${sparePart.name}`} />

            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <AdminPageHeader 
                                title={`Редактирование запчасти: ${sparePart.name}`} 
                                subtitle={`Артикул: ${sparePart.part_number}`} 
                            />
                            <div className="mt-4 sm:mt-0">
                                <SecondaryButton
                                    href={url(`admin/spare-parts/${sparePart.id}`)}
                                    className="flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Вернуться к просмотру
                                </SecondaryButton>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Название запчасти */}
                                <AdminFormGroup label="Название *" name="name" error={errors.name}>
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
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-grow">
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
                                                {uploadFileName && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Выбран файл: {uploadFileName}
                                                    </p>
                                                )}
                                            </div>
                                            {previewUrl && (
                                                <div className="flex-shrink-0">
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Предпросмотр" 
                                                        className="h-24 w-auto object-contain border rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
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

                            {/* Совместимые двигатели */}
                            {selectedModels.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Совместимые двигатели</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {availableEngines.length > 0 ? (
                                            <>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Выберите двигатели, совместимые с данной запчастью:
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {availableEngines.map((engine) => {
                                                        const carModel = carModels.find(m => m.id === engine.model_id);
                                                        const brandName = carModel && carModel.brand ? carModel.brand.name : '';
                                                        const modelName = carModel ? carModel.name : '';
                                                        
                                                        return (
                                                            <div 
                                                                key={engine.id} 
                                                                className={`p-2 rounded border cursor-pointer transition-colors ${
                                                                    selectedEngines.includes(engine.id) 
                                                                        ? 'bg-[#2a4075] text-white border-[#2a4075]' 
                                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                                onClick={() => handleEngineToggle(engine.id)}
                                                            >
                                                                <div className="font-medium">{brandName} {modelName}</div>
                                                                <div className="text-sm">
                                                                    {engine.name} {engine.volume && `${engine.volume}л`} {engine.power && `${engine.power}л.с.`}
                                                                </div>
                                                                {engine.type && (
                                                                    <div className="text-xs mt-1">
                                                                        Тип: {engine.type}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {selectedEngines.length > 0 && (
                                                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                                                        <p className="font-medium text-green-700 mb-2">
                                                            Выбрано двигателей: {selectedEngines.length}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-gray-500 text-center py-4">
                                                Для выбранных моделей автомобилей не найдено доступных двигателей
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end space-x-3">
                                <SecondaryButton
                                    href={url(`admin/spare-parts/${sparePart.id}`)}
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
                                            Сохранить изменения
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