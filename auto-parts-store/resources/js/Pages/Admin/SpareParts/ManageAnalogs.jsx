import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

export default function ManageAnalogs({ auth, sparePart, existingAnalogs, potentialAnalogs }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [notification, setNotification] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        analog_id: '',
        is_direct: true,
        notes: ''
    });
    
    const filteredPotentialAnalogs = potentialAnalogs.filter(analog => {
        const searchLower = searchTerm.toLowerCase();
        return analog.name.toLowerCase().includes(searchLower) || 
               analog.part_number.toLowerCase().includes(searchLower) ||
               analog.manufacturer.toLowerCase().includes(searchLower);
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('admin.spare-parts.add-analog', sparePart.id), {
            onSuccess: () => {
                setNotification({
                    type: 'success',
                    message: 'Аналог успешно добавлен'
                });
                reset();
                setShowAddForm(false);
                setTimeout(() => setNotification(null), 3000);
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Ошибка при добавлении аналога'
                });
                setTimeout(() => setNotification(null), 3000);
            }
        });
    };
    
    const handleRemoveAnalog = (analogId) => {
        if (confirm('Вы уверены, что хотите удалить этот аналог?')) {
            window.axios.delete(route('admin.spare-parts.remove-analog', [sparePart.id, analogId]))
                .then(() => {
                    setNotification({
                        type: 'success',
                        message: 'Аналог успешно удален'
                    });
                    setTimeout(() => setNotification(null), 3000);
                    window.location.reload();
                })
                .catch(() => {
                    setNotification({
                        type: 'error',
                        message: 'Ошибка при удалении аналога'
                    });
                    setTimeout(() => setNotification(null), 3000);
                });
        }
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление аналогами</h2>}
        >
            <Head title={`Аналоги запчасти: ${sparePart.name}`} />
            
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <AdminPageHeader 
                                    title={`Аналоги запчасти: ${sparePart.name}`} 
                                    subtitle={`Артикул: ${sparePart.part_number} | Производитель: ${sparePart.manufacturer}`} 
                                />
                                <div className="mt-4 sm:mt-0">
                                    <SecondaryButton
                                        href={route('admin.spare-parts.show-inertia', sparePart.id)}
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
                            
                            {existingAnalogs.length === 0 ? (
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
                                    data={existingAnalogs}
                                    renderRow={(analog) => (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link 
                                                    href={route('admin.spare-parts.show-inertia', analog.analog_id)}
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
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <AdminFormGroup label="Поиск запчасти" name="search">
                                                    <AdminInput
                                                        type="text"
                                                        value={searchTerm}
                                                        handleChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Введите название, артикул или производителя"
                                                    />
                                                </AdminFormGroup>
                                            </div>
                                            
                                            <AdminFormGroup label="Выберите аналог" name="analog_id" error={errors.analog_id}>
                                                <AdminSelect
                                                    name="analog_id"
                                                    value={data.analog_id}
                                                    handleChange={(e) => setData('analog_id', e.target.value)}
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
                                                        handleChange={(e) => setData('notes', e.target.value)}
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