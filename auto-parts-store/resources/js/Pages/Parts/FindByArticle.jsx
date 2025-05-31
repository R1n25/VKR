import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function FindByArticle({ auth, articleNumber, parts, analogs, isAdmin }) {
    const [activeTab, setActiveTab] = useState('catalog');
    
    const { data, setData, get, processing, errors } = useForm({
        article: articleNumber || '',
    });

    useEffect(() => {
        if (analogs && analogs.length > 0) {
            setActiveTab('analogs');
        } else if (parts && parts.length > 0) {
            setActiveTab('catalog');
        }
    }, [articleNumber, parts, analogs]);

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('parts.article-search'), {
            preserveState: true,
        });
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Поиск по артикулу</h2>}
        >
            <Head title="Поиск запчастей по артикулу" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Введите артикул запчасти</h3>
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <TextInput
                                    id="article"
                                    type="text"
                                    placeholder="Введите артикул"
                                    value={data.article}
                                    onChange={e => setData('article', e.target.value)}
                                    className="max-w-sm"
                                />
                                <PrimaryButton type="submit" disabled={processing}>Поиск</PrimaryButton>
                            </form>
                            
                            {errors.article && (
                                <InputError message={errors.article} className="mt-2" />
                            )}
                        </div>
                    </div>

                    {articleNumber && (
                        <div className="mt-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 bg-white border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Результаты поиска для артикула: {articleNumber}</h3>
                                    
                                    <div className="mb-4 border-b border-gray-200">
                                        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                                            <li className="mr-2">
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); setActiveTab('catalog'); }}
                                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'catalog' 
                                                        ? 'active border-indigo-600 text-indigo-600' 
                                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                                                >
                                                    Запчасти из каталога {parts?.length > 0 && `(${parts.length})`}
                                                </a>
                                            </li>
                                            <li className="mr-2">
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); setActiveTab('analogs'); }}
                                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${activeTab === 'analogs' 
                                                        ? 'active border-indigo-600 text-indigo-600' 
                                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                                                >
                                                    Аналоги {analogs?.length > 0 && `(${analogs.length})`}
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className={activeTab === 'catalog' ? 'block' : 'hidden'}>
                                        {parts?.length > 0 ? (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наименование</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Производитель</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {parts.map((part) => (
                                                        <tr key={part.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.article_number}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.manufacturer}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.price?.toFixed(2) || 0} ₽</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <a 
                                                                    href={route('parts.show', part.id)} 
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Подробнее
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Запчасти с таким артикулом не найдены в нашем каталоге
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className={activeTab === 'analogs' ? 'block' : 'hidden'}>
                                        {analogs?.length > 0 ? (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наименование</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Производитель</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {analogs.map((analog) => (
                                                        <tr key={analog.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analog.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analog.article_number}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analog.manufacturer}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analog.price?.toFixed(2) || 0} ₽</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <a 
                                                                    href={route('parts.show', analog.id)} 
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    Подробнее
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Аналоги для данного артикула не найдены
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
} 