import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminCard from '@/Components/AdminCard';
import AdminPageHeader from '@/Components/AdminPageHeader';

export default function Show({ auth, carModel }) {
    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Просмотр модели автомобиля</h2>}
        >
            <Head title={`Модель: ${carModel.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AdminCard>
                        <AdminPageHeader 
                            title={carModel.name} 
                            subtitle={`${carModel.brand.name}, ${carModel.year_start}-${carModel.year_end || 'н.в.'}`}
                            actions={
                                <div className="flex space-x-2">
                                    <Link href={url(`admin/car-models/${carModel.id}/edit`)} className="btn-primary">
                                        Редактировать
                                    </Link>
                                    <Link href={url('admin/car-models')} className="btn-secondary">
                                        К списку моделей
                                    </Link>
                                </div>
                            }
                        />
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Основная информация</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-600">ID:</div>
                                        <div className="font-medium">{carModel.id}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Название:</div>
                                        <div className="font-medium">{carModel.name}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Бренд:</div>
                                        <div className="font-medium">{carModel.brand.name}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Годы выпуска:</div>
                                        <div className="font-medium">{carModel.year_start} - {carModel.year_end || 'настоящее время'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Дополнительная информация</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Поколение:</div>
                                        <div className="font-medium">{carModel.generation || '—'}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Кузов:</div>
                                        <div className="font-medium">{carModel.body_type || '—'}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm text-gray-600">Популярная модель:</div>
                                        <div className="font-medium">{carModel.is_popular ? 'Да' : 'Нет'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {carModel.image && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4 text-[#2a4075]">Изображение</h3>
                                <div className="mt-2">
                                    <img 
                                        src={`/storage/${carModel.image}`} 
                                        alt={carModel.name} 
                                        className="max-w-md rounded-lg shadow-md"
                                    />
                                </div>
                            </div>
                        )}
                    </AdminCard>
                </div>
            </div>
        </AdminLayout>
    );
} 