import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { toast } from 'react-hot-toast';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminCard from '@/Components/AdminCard';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminTextarea from '@/Components/AdminTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import AdminTable from '@/Components/AdminTable';
import AdminAlert from '@/Components/AdminAlert';
import axios from 'axios';

// Добавляем функцию url
const url = (path) => {
    return `/${path}`;
};

export default function ManageAnalogs({ auth, sparePart = {}, existingAnalogs, potentialAnalogs }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Проверяем, что sparePart не undefined
    const sparePartId = sparePart?.id || '';
    const sparePartName = sparePart?.name || 'Запчасть';
    const sparePartNumber = sparePart?.part_number || '';
    const sparePartManufacturer = sparePart?.manufacturer || '';
    
    // Проверяем, что existingAnalogs не undefined и является массивом
    const safeExistingAnalogs = Array.isArray(existingAnalogs) ? existingAnalogs : [];
    
    const { data, setData, post, processing, errors, reset } = useForm({
        analog_id: '',
        is_direct: true,
        notes: ''
    });
    
    // Проверяем, что potentialAnalogs не undefined и является массивом
    const safeAnalogs = Array.isArray(potentialAnalogs) ? potentialAnalogs : [];
    
    const filteredPotentialAnalogs = safeAnalogs.filter(analog => {
        if (!searchTerm) return true; // Если поисковый запрос пустой, возвращаем все аналоги
        
        // Создаем регулярное выражение с флагом 'i' для игнорирования регистра
        const regex = new RegExp(searchTerm, 'i');
        
        return regex.test(analog.name) || 
               regex.test(analog.part_number) || 
               regex.test(analog.manufacturer);
    });
    
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            console.log('Выполняется поиск запчастей:', {
                originalQuery: searchTerm,
                lowercaseQuery: searchTerm.toLowerCase()
            });
            
            // Преобразуем запрос к нижнему регистру перед отправкой
            const query = searchTerm.toLowerCase();
            
            const response = await axios.get('/api/spare-parts/search', { 
                params: { 
                    query: query,
                    original_query: searchTerm // Сохраняем оригинальный запрос для отладки
                } 
            });
            
            console.log('Результаты поиска:', {
                count: response.data.data ? response.data.data.length : 0,
                firstResult: response.data.data && response.data.data.length > 0 ? response.data.data[0] : null
            });
            
            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error('Ошибка при поиске запчастей:', error);
            setNotification({ type: 'error', message: 'Ошибка при поиске запчастей' });
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(url(`admin/spare-parts/${sparePartId}/add-analog`), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Аналог успешно добавлен'
                });
                reset();
                setShowAddForm(false);
                setTimeout(() => setNotification(null), 3000);
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при добавлении аналога: ' + (errors.message || 'Неизвестная ошибка')
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });
    };
    
    const handleRemoveAnalog = async (analogId) => {
        if (!confirm('Вы действительно хотите удалить этот аналог?')) return;

        try {
            await window.axios.delete(url(`admin/spare-parts/${sparePartId}/analogs/${analogId}`));
            
            // Обновляем список аналогов (без перезагрузки страницы)
            window.location.reload();
            
            setNotification({
                type: 'success',
                message: 'Аналог успешно удален'
            });
        } catch (error) {
            console.error('Ошибка при удалении аналога:', error);
            setNotification({
                type: 'error',
                message: 'Ошибка при удалении аналога: ' + (error.response?.data?.message || 'Неизвестная ошибка')
            });
            setTimeout(() => setNotification(null), 3000);
        }
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление аналогами</h2>}
        >
            <Head title={`Аналоги запчасти: ${sparePartName}`} />
            
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <AdminPageHeader 
                                    title={`Аналоги запчасти: ${sparePartName}`} 
                                    subtitle={`Артикул: ${sparePartNumber} | Производитель: ${sparePartManufacturer}`} 
                                />
                                <div className="mt-4 sm:mt-0">
                                    <SecondaryButton
                                        href={url(`admin/spare-parts/${sparePartId}`)}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Вернуться к запчасти
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 text-[#2a4075]">Существующие аналоги</h2>
                            
                            {safeExistingAnalogs.length === 0 ? (
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <p className="text-gray-600">У этой запчасти пока нет аналогов.</p>
                                </div>
                            ) : (
                                <AdminTable
                                    headers={[
                                        'Название', 
                                        'Артикул', 
                                        'Производитель', 
                                        'Тип аналога', 
                                        'Примечания', 
                                        { content: 'Действия', props: { className: 'text-right' } }
                                    ]}
                                    data={safeExistingAnalogs}
                                    renderRow={(analog) => (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link 
                                                    href={url(`admin/spare-parts/${analog.analog_id}`)}
                                                    className="text-[#2a4075] hover:underline"
                                                >
                                                    {analog.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {analog.part_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {analog.manufacturer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {analog.is_direct ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Прямой аналог
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Заменитель
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {analog.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <DangerButton
                                                    onClick={() => handleRemoveAnalog(analog.id)}
                                                    className="text-xs px-2 py-1"
                                                >
                                                    Удалить
                                                </DangerButton>
                                            </td>
                                        </>
                                    )}
                                    emptyMessage="У этой запчасти пока нет аналогов."
                                />
                            )}
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-[#2a4075]">Добавить аналог</h2>
                                
                                <PrimaryButton
                                    type="button"
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="flex items-center"
                                >
                                    {showAddForm ? (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Скрыть форму
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Показать форму
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                            
                            {showAddForm && (
                                <AdminCard className="!p-6 mb-6 bg-gray-50">
                                    <form onSubmit={handleSearch} className="mb-6">
                                        <AdminFormGroup label="Поиск запчасти" name="search">
                                            <div className="flex">
                                                <AdminInput
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Введите название, артикул или производителя"
                                                    className="rounded-r-none"
                                                />
                                                <PrimaryButton
                                                    type="submit"
                                                    className="rounded-l-none"
                                                    disabled={isSearching}
                                                >
                                                    {isSearching ? 'Поиск...' : 'Найти'}
                                                </PrimaryButton>
                                            </div>
                                        </AdminFormGroup>
                                    </form>
                                    
                                    {searchResults.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-md font-semibold mb-2 text-gray-700">Результаты поиска</h4>
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Артикул
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Название
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Производитель
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Цена
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Действия
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {searchResults.map((part) => (
                                                            <tr key={part.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {part.part_number}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                                    {part.name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {part.manufacturer || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {part.price} ₽
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <button
                                                                        type="button"
                                                                        className="text-indigo-600 hover:text-indigo-900"
                                                                        onClick={() => setData('analog_id', part.id)}
                                                                    >
                                                                        Выбрать
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <AdminFormGroup label="Выберите аналог" name="analog_id" error={errors.analog_id}>
                                                    <AdminSelect
                                                        name="analog_id"
                                                        value={data.analog_id}
                                                        onChange={(e) => setData('analog_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Выберите запчасть --</option>
                                                        {filteredPotentialAnalogs.map((analog) => (
                                                            <option key={analog.id} value={analog.id}>
                                                                {analog.name} ({analog.part_number}, {analog.manufacturer})
                                                            </option>
                                                        ))}
                                                    </AdminSelect>
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        Найдено: {filteredPotentialAnalogs.length} запчастей
                                                    </div>
                                                </AdminFormGroup>
                                            </div>
                                            
                                            <AdminFormGroup label="Тип аналога" name="is_direct" error={errors.is_direct}>
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            id="is_direct_true"
                                                            name="is_direct"
                                                            type="radio"
                                                            checked={data.is_direct}
                                                            onChange={() => setData('is_direct', true)}
                                                            className="h-4 w-4 text-[#2a4075] border-gray-300 focus:ring-[#2a4075]"
                                                        />
                                                        <label htmlFor="is_direct_true" className="ml-2 block text-sm text-gray-700">
                                                            Прямой аналог (полностью взаимозаменяемый)
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            id="is_direct_false"
                                                            name="is_direct"
                                                            type="radio"
                                                            checked={!data.is_direct}
                                                            onChange={() => setData('is_direct', false)}
                                                            className="h-4 w-4 text-[#2a4075] border-gray-300 focus:ring-[#2a4075]"
                                                        />
                                                        <label htmlFor="is_direct_false" className="ml-2 block text-sm text-gray-700">
                                                            Заменитель (частичная совместимость)
                                                        </label>
                                                    </div>
                                                </div>
                                            </AdminFormGroup>
                                            
                                            <div className="md:col-span-2">
                                                <AdminFormGroup label="Примечания" name="notes" error={errors.notes}>
                                                    <AdminTextarea
                                                        name="notes"
                                                        value={data.notes}
                                                        onChange={(e) => setData('notes', e.target.value)}
                                                        rows="3"
                                                        placeholder="Опишите особенности совместимости (необязательно)"
                                                    />
                                                </AdminFormGroup>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end space-x-3">
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => setShowAddForm(false)}
                                            >
                                                Отмена
                                            </SecondaryButton>
                                            <PrimaryButton
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Добавление...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Добавить аналог
                                                    </>
                                                )}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </AdminCard>
                            )}
                        </div>
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 