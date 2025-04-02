import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Панель администратора</h2>}
        >
            <Head title="Панель администратора" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Управление магазином</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <Link href={route('admin.vin-requests.index')} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Запросы по VIN-коду</h3>
                                </div>
                                <p className="text-gray-600">Управление запросами на подбор запчастей по VIN-коду автомобиля</p>
                            </Link>
                            
                            {/* Другие разделы админки */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 