import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PaperClipIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';

export default function CatalogManager({ auth, backups }) {
    const [activeTab, setActiveTab] = useState('import-parts');
    
    const importPartsForm = useForm({
        file: null,
        update_existing: true,
        create_backup: true,
    });
    
    const importCarsForm = useForm({
        file: null,
        update_existing: true,
        create_backup: true,
    });
    
    const exportPartsForm = useForm({
        category_id: '',
        manufacturer: '',
    });
    
    const exportCarsForm = useForm({
        brand_id: '',
        is_popular: false,
    });
    
    const handleImportPartsSubmit = (e) => {
        e.preventDefault();
        importPartsForm.post(route('admin.catalog-manager.import-parts'), {
            preserveScroll: true,
            onSuccess: () => {
                importPartsForm.reset();
            },
        });
    };
    
    const handleImportCarsSubmit = (e) => {
        e.preventDefault();
        importCarsForm.post(route('admin.catalog-manager.import-cars'), {
            preserveScroll: true,
            onSuccess: () => {
                importCarsForm.reset();
            },
        });
    };
    
    const handleExportPartsSubmit = (e) => {
        e.preventDefault();
        window.location.href = route('admin.catalog-manager.export-parts', exportPartsForm.data);
    };
    
    const handleExportCarsSubmit = (e) => {
        e.preventDefault();
        window.location.href = route('admin.catalog-manager.export-cars', exportCarsForm.data);
    };
    
    const downloadBackup = (path) => {
        window.location.href = route('admin.catalog-manager.download-backup', { path });
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление каталогом</h2>}
        >
            <Head title="Управление каталогом" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-6">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        className={`px-4 py-2 ${activeTab === 'import-parts' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
                                        onClick={() => setActiveTab('import-parts')}
                                    >
                                        Импорт запчастей
                                    </button>
                                    <button
                                        className={`px-4 py-2 ${activeTab === 'import-cars' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
                                        onClick={() => setActiveTab('import-cars')}
                                    >
                                        Импорт моделей авто
                                    </button>
                                    <button
                                        className={`px-4 py-2 ${activeTab === 'export-parts' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
                                        onClick={() => setActiveTab('export-parts')}
                                    >
                                        Экспорт запчастей
                                    </button>
                                    <button
                                        className={`px-4 py-2 ${activeTab === 'export-cars' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
                                        onClick={() => setActiveTab('export-cars')}
                                    >
                                        Экспорт моделей авто
                                    </button>
                                    <button
                                        className={`px-4 py-2 ${activeTab === 'backups' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600'}`}
                                        onClick={() => setActiveTab('backups')}
                                    >
                                        Резервные копии
                                    </button>
                                </div>
                            </div>
                            
                            {activeTab === 'import-parts' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Импорт запчастей из CSV</h3>
                                    <form onSubmit={handleImportPartsSubmit}>
                                        <div className="mb-4">
                                            <InputLabel htmlFor="file" value="CSV файл с запчастями" />
                                            <input
                                                type="file"
                                                id="file"
                                                accept=".csv"
                                                className="mt-1 block w-full"
                                                onChange={(e) => importPartsForm.setData('file', e.target.files[0])}
                                            />
                                            <InputError message={importPartsForm.errors.file} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4 flex items-center">
                                            <Checkbox
                                                id="update_existing"
                                                checked={importPartsForm.data.update_existing}
                                                onChange={(e) => importPartsForm.setData('update_existing', e.target.checked)}
                                            />
                                            <InputLabel htmlFor="update_existing" value="Обновлять существующие записи" className="ml-2" />
                                        </div>
                                        
                                        <div className="mb-4 flex items-center">
                                            <Checkbox
                                                id="create_backup"
                                                checked={importPartsForm.data.create_backup}
                                                onChange={(e) => importPartsForm.setData('create_backup', e.target.checked)}
                                            />
                                            <InputLabel htmlFor="create_backup" value="Создать резервную копию перед импортом" className="ml-2" />
                                        </div>
                                        
                                        <div className="flex items-center justify-end mt-4">
                                            <PrimaryButton
                                                className="ml-4"
                                                disabled={importPartsForm.processing || !importPartsForm.data.file}
                                            >
                                                {importPartsForm.processing ? 'Импорт...' : 'Импортировать'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}
                            
                            {activeTab === 'import-cars' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Импорт моделей автомобилей из CSV</h3>
                                    <form onSubmit={handleImportCarsSubmit}>
                                        <div className="mb-4">
                                            <InputLabel htmlFor="file" value="CSV файл с моделями автомобилей" />
                                            <input
                                                type="file"
                                                id="file"
                                                accept=".csv"
                                                className="mt-1 block w-full"
                                                onChange={(e) => importCarsForm.setData('file', e.target.files[0])}
                                            />
                                            <InputError message={importCarsForm.errors.file} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4 flex items-center">
                                            <Checkbox
                                                id="update_existing"
                                                checked={importCarsForm.data.update_existing}
                                                onChange={(e) => importCarsForm.setData('update_existing', e.target.checked)}
                                            />
                                            <InputLabel htmlFor="update_existing" value="Обновлять существующие записи" className="ml-2" />
                                        </div>
                                        
                                        <div className="mb-4 flex items-center">
                                            <Checkbox
                                                id="create_backup"
                                                checked={importCarsForm.data.create_backup}
                                                onChange={(e) => importCarsForm.setData('create_backup', e.target.checked)}
                                            />
                                            <InputLabel htmlFor="create_backup" value="Создать резервную копию перед импортом" className="ml-2" />
                                        </div>
                                        
                                        <div className="flex items-center justify-end mt-4">
                                            <PrimaryButton
                                                className="ml-4"
                                                disabled={importCarsForm.processing || !importCarsForm.data.file}
                                            >
                                                {importCarsForm.processing ? 'Импорт...' : 'Импортировать'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}
                            
                            {activeTab === 'export-parts' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Экспорт запчастей в CSV</h3>
                                    <form onSubmit={handleExportPartsSubmit}>
                                        <div className="mb-4">
                                            <InputLabel htmlFor="category_id" value="ID категории (опционально)" />
                                            <TextInput
                                                id="category_id"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={exportPartsForm.data.category_id}
                                                onChange={(e) => exportPartsForm.setData('category_id', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="manufacturer" value="Производитель (опционально)" />
                                            <TextInput
                                                id="manufacturer"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={exportPartsForm.data.manufacturer}
                                                onChange={(e) => exportPartsForm.setData('manufacturer', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-end mt-4">
                                            <PrimaryButton className="ml-4">
                                                Экспортировать
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}
                            
                            {activeTab === 'export-cars' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Экспорт моделей автомобилей в CSV</h3>
                                    <form onSubmit={handleExportCarsSubmit}>
                                        <div className="mb-4">
                                            <InputLabel htmlFor="brand_id" value="ID бренда (опционально)" />
                                            <TextInput
                                                id="brand_id"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={exportCarsForm.data.brand_id}
                                                onChange={(e) => exportCarsForm.setData('brand_id', e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="mb-4 flex items-center">
                                            <Checkbox
                                                id="is_popular"
                                                checked={exportCarsForm.data.is_popular}
                                                onChange={(e) => exportCarsForm.setData('is_popular', e.target.checked)}
                                            />
                                            <InputLabel htmlFor="is_popular" value="Только популярные модели" className="ml-2" />
                                        </div>
                                        
                                        <div className="flex items-center justify-end mt-4">
                                            <PrimaryButton className="ml-4">
                                                Экспортировать
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}
                            
                            {activeTab === 'backups' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Резервные копии</h3>
                                    
                                    {backups.length === 0 ? (
                                        <p className="text-gray-500">Резервные копии не найдены</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Имя файла
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Дата создания
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Размер
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Действия
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {backups.map((backup, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {backup.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {backup.date}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {backup.size}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => downloadBackup(backup.path)}
                                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                >
                                                                    <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                                                                    Скачать
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 