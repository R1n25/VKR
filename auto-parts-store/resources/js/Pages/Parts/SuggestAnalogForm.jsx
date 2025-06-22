import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function SuggestAnalogForm({ auth, sparePart }) {
    const { data, setData, post, processing, errors } = useForm({
        analog_article: '',
        analog_brand: '',
        analog_description: '',
        comment: '',
        analog_type: 'direct',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Проверяем, содержит ли URL строку "parts" вместо "spare-parts"
        const currentUrl = window.location.pathname;
        if (currentUrl.includes('/parts/')) {
            // Если форма открыта со страницы каталога, используем маршрут для ID
            post(route('suggestions.store-analog-by-id', sparePart.id));
        } else {
            // Иначе используем обычный маршрут
            post(route('suggestions.store-analog', sparePart.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложить аналог</h2>}
        >
            <Head title="Предложить аналог" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Информация о запчасти</h3>
                                <div className="flex flex-wrap gap-4 mb-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Артикул</p>
                                        <p className="font-semibold">{sparePart.part_number}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Производитель</p>
                                        <p className="font-semibold">{sparePart.manufacturer}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">Наименование</p>
                                        <p className="font-semibold">{sparePart.name}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Информация об аналоге</h3>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="analog_brand" value="Производитель аналога" />
                                        <TextInput
                                            id="analog_brand"
                                            type="text"
                                            name="analog_brand"
                                            value={data.analog_brand}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('analog_brand', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.analog_brand} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="analog_article" value="Артикул аналога" />
                                        <TextInput
                                            id="analog_article"
                                            type="text"
                                            name="analog_article"
                                            value={data.analog_article}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('analog_article', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.analog_article} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="analog_description" value="Описание аналога" />
                                        <TextInput
                                            id="analog_description"
                                            type="text"
                                            name="analog_description"
                                            value={data.analog_description}
                                            className="mt-1 block w-full"
                                            onChange={e => setData('analog_description', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.analog_description} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="comment" value="Ваш комментарий (необязательно)" />
                                        <textarea
                                            id="comment"
                                            name="comment"
                                            value={data.comment}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('comment', e.target.value)}
                                            rows={3}
                                        />
                                        <InputError message={errors.comment} className="mt-2" />
                                    </div>

                                    <div className="mb-4">
                                        <InputLabel value="Тип аналога" />
                                        <div className="mt-2">
                                            <label className="inline-flex items-center mr-6">
                                                <input
                                                    type="radio"
                                                    name="analog_type"
                                                    value="direct"
                                                    checked={data.analog_type === 'direct'}
                                                    onChange={e => setData('analog_type', e.target.value)}
                                                    className="form-radio h-5 w-5 text-indigo-600"
                                                />
                                                <span className="ml-2 text-gray-700">Прямой аналог (полная замена)</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    name="analog_type"
                                                    value="partial"
                                                    checked={data.analog_type === 'partial'}
                                                    onChange={e => setData('analog_type', e.target.value)}
                                                    className="form-radio h-5 w-5 text-indigo-600"
                                                />
                                                <span className="ml-2 text-gray-700">Заменитель (частичная замена)</span>
                                            </label>
                                        </div>
                                        <InputError message={errors.analog_type} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <Link className="mr-4" href={route('parts.show', sparePart.id)}>
                                        <SecondaryButton>
                                        Отмена
                                    </SecondaryButton>
                                    </Link>
                                    <PrimaryButton processing={processing}>
                                        Отправить
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 