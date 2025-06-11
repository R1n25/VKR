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
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminFormGroup from '@/Components/AdminFormGroup';
import AdminInput from '@/Components/AdminInput';
import AdminSelect from '@/Components/AdminSelect';
import AdminAlert from '@/Components/AdminAlert';

export default function CatalogManager({ auth, backups }) {
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('import');
    
    const importPartsForm = useForm({
        parts_file: null,
    });
    
    const importCarsForm = useForm({
        cars_file: null,
    });
    
    const exportPartsForm = useForm({
        format: 'csv',
    });
    
    const exportCarsForm = useForm({
        format: 'csv',
    });
    
    const handleImportParts = (e) => {
        e.preventDefault();
        
        importPartsForm.post(url('admin/catalog-manager/import-parts'), {
            onSuccess: (response) => {
                setNotification({
                    type: 'success',
                    message: response.message || 'Файл запчастей успешно импортирован'
                });
                setTimeout(() => setNotification(null), 3000);
                importPartsForm.reset();
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: errors.message || 'Ошибка при импорте файла запчастей'
                });
                setTimeout(() => setNotification(null), 3000);
            },
            transform: (data) => ({
                file: data.parts_file,
                update_existing: true,
                create_backup: true
            })
        });
    };
    
    const handleImportCars = (e) => {
        e.preventDefault();
        
        importCarsForm.post(url('admin/catalog-manager/import-cars'), {
            onSuccess: (response) => {
                setNotification({
                    type: 'success',
                    message: response.message || 'Файл автомобилей успешно импортирован'
                });
                setTimeout(() => setNotification(null), 3000);
                importCarsForm.reset();
            },
            onError: (errors) => {
                setNotification({
                    type: 'error',
                    message: errors.message || 'Ошибка при импорте файла автомобилей'
                });
                setTimeout(() => setNotification(null), 3000);
            },
            transform: (data) => ({
                file: data.cars_file,
                update_existing: true,
                create_backup: true
            })
        });
    };
    
    const handleExportParts = (e) => {
        e.preventDefault();
        window.location.href = url('admin/catalog-manager/export-parts', exportPartsForm.data);
    };
    
    const handleExportCars = (e) => {
        e.preventDefault();
        window.location.href = url('admin/catalog-manager/export-cars', exportCarsForm.data);
    };
    
    const handleDownloadBackup = (path) => {
        window.location.href = url('admin/catalog-manager/download-backup', { path });
    };
    
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Управление каталогом</h2>}
        >
            <Head title="Управление каталогом" />
            
            {notification && <AdminAlert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title="Управление каталогом" 
                            subtitle="Импорт, экспорт и резервное копирование данных" 
                        />
                        
                        <div className="mt-6 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('import')}
                                    className={`pb-4 px-1 ${activeTab === 'import' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Импорт данных
                                </button>
                                <button
                                    onClick={() => setActiveTab('export')}
                                    className={`pb-4 px-1 ${activeTab === 'export' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Экспорт данных
                                </button>
                                <button
                                    onClick={() => setActiveTab('backups')}
                                    className={`pb-4 px-1 ${activeTab === 'backups' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Резервные копии
                                </button>
                            </nav>
                        </div>
                        
                        {activeTab === 'import' && (
                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Импорт запчастей</h3>
                                        
                                        <form onSubmit={handleImportParts}>
                                            <AdminFormGroup label="Файл запчастей" name="parts_file" error={importPartsForm.errors.parts_file}>
                                                <AdminInput
                                                    type="file"
                                                    name="parts_file"
                                                    onChange={(e) => importPartsForm.setData('parts_file', e.target.files[0])}
                                                    accept=".csv,.xlsx,.xls"
                                                />
                                            </AdminFormGroup>
                                            
                                            <div className="mt-4">
                                                <PrimaryButton type="submit" disabled={importPartsForm.processing}>
                                                    {importPartsForm.processing ? 'Загрузка...' : 'Импортировать запчасти'}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Импорт автомобилей</h3>
                                        
                                        <form onSubmit={handleImportCars}>
                                            <AdminFormGroup label="Файл автомобилей" name="cars_file" error={importCarsForm.errors.cars_file}>
                                                <AdminInput
                                                    type="file"
                                                    name="cars_file"
                                                    onChange={(e) => importCarsForm.setData('cars_file', e.target.files[0])}
                                                    accept=".csv,.xlsx,.xls"
                                                />
                                            </AdminFormGroup>
                                            
                                            <div className="mt-4">
                                                <PrimaryButton type="submit" disabled={importCarsForm.processing}>
                                                    {importCarsForm.processing ? 'Загрузка...' : 'Импортировать автомобили'}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                
                                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                Перед импортом данных рекомендуется создать резервную копию текущей базы данных.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'export' && (
                            <div className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Экспорт запчастей</h3>
                                        
                                        <form onSubmit={handleExportParts}>
                                            <AdminFormGroup label="Формат файла" name="format">
                                                <AdminSelect
                                                    name="format"
                                                    value={exportPartsForm.data.format}
                                                    onChange={(e) => exportPartsForm.setData('format', e.target.value)}
                                                >
                                                    <option value="csv">CSV</option>
                                                    <option value="xlsx">Excel (XLSX)</option>
                                                </AdminSelect>
                                            </AdminFormGroup>
                                            
                                            <div className="mt-4">
                                                <PrimaryButton type="submit">
                                                    Экспортировать запчасти
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Экспорт автомобилей</h3>
                                        
                                        <form onSubmit={handleExportCars}>
                                            <AdminFormGroup label="Формат файла" name="format">
                                                <AdminSelect
                                                    name="format"
                                                    value={exportCarsForm.data.format}
                                                    onChange={(e) => exportCarsForm.setData('format', e.target.value)}
                                                >
                                                    <option value="csv">CSV</option>
                                                    <option value="xlsx">Excel (XLSX)</option>
                                                </AdminSelect>
                                            </AdminFormGroup>
                                            
                                            <div className="mt-4">
                                                <PrimaryButton type="submit">
                                                    Экспортировать автомобили
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'backups' && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Резервные копии базы данных</h3>
                                
                                {backups.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя файла</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Размер</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {backups.map((backup, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{backup.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <button
                                                                onClick={() => handleDownloadBackup(backup.path)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Скачать
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Резервные копии не найдены</p>
                                )}
                                
                                <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                Резервные копии создаются автоматически по расписанию. Для создания ручной резервной копии обратитесь к администратору сервера.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 