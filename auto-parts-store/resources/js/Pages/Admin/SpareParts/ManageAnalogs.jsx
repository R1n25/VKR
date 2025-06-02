import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { toast } from 'react-hot-toast';

export default function ManageAnalogs({ auth, sparePart, existingAnalogs, potentialAnalogs }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
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
                toast.success('Аналог успешно добавлен');
                reset();
                setShowAddForm(false);
            },
            onError: () => {
                toast.error('Ошибка при добавлении аналога');
            }
        });
    };
    
    const handleRemoveAnalog = (analogId) => {
        if (confirm('Вы уверены, что хотите удалить этот аналог?')) {
            window.axios.delete(route('admin.spare-parts.remove-analog', [sparePart.id, analogId]))
                .then(() => {
                    toast.success('Аналог успешно удален');
                    window.location.reload();
                })
                .catch(() => {
                    toast.error('Ошибка при удалении аналога');
                });
        }
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление аналогами</h2>}
        >
            <Head title={`Аналоги запчасти: ${sparePart.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <Link
                                    href={route('admin.spare-parts.show', sparePart.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    &larr; Вернуться к запчасти
                                </Link>
                                
                                <h1 className="text-2xl font-semibold mt-4 mb-2">
                                    {sparePart.name}
                                </h1>
                                
                                <div className="text-gray-600 mb-4">
                                    <div>Артикул: <span className="font-semibold">{sparePart.part_number}</span></div>
                                    <div>Производитель: <span className="font-semibold">{sparePart.manufacturer}</span></div>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Существующие аналоги</h2>
                                
                                {existingAnalogs.length === 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-gray-600">У этой запчасти пока нет аналогов.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Название
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Артикул
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Производитель
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Тип аналога
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Примечания
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Действия
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {existingAnalogs.map((analog) => (
                                                    <tr key={analog.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Link 
                                                                href={route('admin.spare-parts.show', analog.analog_id)}
                                                                className="text-blue-600 hover:underline"
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
                                                            <button
                                                                onClick={() => handleRemoveAnalog(analog.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Добавить аналог</h2>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                    >
                                        {showAddForm ? 'Скрыть' : 'Показать'} форму
                                    </button>
                                </div>
                                
                                {showAddForm && (
                                    <div className="bg-gray-50 p-6 rounded-md mb-6">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Поиск запчасти
                                                </label>
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Введите название, артикул или производителя"
                                                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                                />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Выберите аналог
                                                </label>
                                                <select
                                                    value={data.analog_id}
                                                    onChange={(e) => setData('analog_id', e.target.value)}
                                                    className={`w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm ${errors.analog_id ? 'border-red-500' : ''}`}
                                                    required
                                                >
                                                    <option value="">-- Выберите запчасть --</option>
                                                    {filteredPotentialAnalogs.map((analog) => (
                                                        <option key={analog.id} value={analog.id}>
                                                            {analog.name} | {analog.part_number} | {analog.manufacturer}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.analog_id && <div className="text-red-500 text-sm mt-1">{errors.analog_id}</div>}
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Тип аналога
                                                </label>
                                                <div className="flex items-center space-x-4">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="direct"
                                                            checked={data.is_direct}
                                                            onChange={() => setData('is_direct', true)}
                                                            className="border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2">Прямой аналог (полностью заменяемый)</span>
                                                    </label>
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="substitute"
                                                            checked={!data.is_direct}
                                                            onChange={() => setData('is_direct', false)}
                                                            className="border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2">Заменитель (частично совместимый)</span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Примечания
                                                </label>
                                                <textarea
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Особенности замены, ограничения и т.д."
                                                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                                    rows="3"
                                                ></textarea>
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                                                >
                                                    {processing ? 'Добавление...' : 'Добавить аналог'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Все запчасти в категории</h3>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Поиск по названию, артикулу или производителю"
                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mb-4"
                                        />
                                        
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Название
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Артикул
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Производитель
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Действия
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredPotentialAnalogs.slice(0, 10).map((analog) => (
                                                        <tr key={analog.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <Link 
                                                                    href={route('admin.spare-parts.show', analog.id)}
                                                                    className="text-blue-600 hover:underline"
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    onClick={() => {
                                                                        setData('analog_id', analog.id);
                                                                        setShowAddForm(true);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Выбрать
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    
                                                    {filteredPotentialAnalogs.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                                Ничего не найдено. Попробуйте изменить запрос.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                            
                                            {filteredPotentialAnalogs.length > 10 && (
                                                <div className="px-6 py-3 bg-gray-50 text-gray-500 text-sm">
                                                    Показаны первые 10 из {filteredPotentialAnalogs.length} результатов. Уточните поиск, чтобы найти нужную запчасть.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 