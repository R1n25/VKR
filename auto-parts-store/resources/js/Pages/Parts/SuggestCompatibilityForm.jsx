import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function SuggestCompatibilityForm({ auth, sparePart, carModels }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        car_model_id: '',
        start_year: '',
        end_year: '',
        comment: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('suggestions.store-compatibility', sparePart.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Предложить совместимость</h2>}
        >
            <Head title="Предложить совместимость" />

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
                                    <h3 className="text-lg font-semibold mb-2">Информация о совместимости</h3>

                                    <div className="mb-4">
                                        <InputLabel htmlFor="car_model_id" value="Модель автомобиля" />
                                        <select
                                            id="car_model_id"
                                            name="car_model_id"
                                            value={data.car_model_id}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            onChange={e => setData('car_model_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Выберите модель автомобиля --</option>
                                            {carModels.map(model => (
                                                <option key={model.id} value={model.id}>
                                                    {model.brand.name} {model.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.car_model_id} className="mt-2" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <InputLabel htmlFor="start_year" value="Год начала применимости" />
                                            <TextInput
                                                id="start_year"
                                                type="number"
                                                name="start_year"
                                                value={data.start_year}
                                                className="mt-1 block w-full"
                                                onChange={e => setData('start_year', e.target.value)}
                                                min="1900"
                                                max="2100"
                                            />
                                            <InputError message={errors.start_year} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="end_year" value="Год окончания применимости" />
                                            <TextInput
                                                id="end_year"
                                                type="number"
                                                name="end_year"
                                                value={data.end_year}
                                                className="mt-1 block w-full"
                                                onChange={e => setData('end_year', e.target.value)}
                                                min="1900"
                                                max="2100"
                                            />
                                            <InputError message={errors.end_year} className="mt-2" />
                                        </div>
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
                                        <p className="mt-1 text-sm text-gray-500">
                                            Укажите дополнительную информацию о совместимости, например, особенности установки.
                                        </p>
                                        <InputError message={errors.comment} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <SecondaryButton className="mr-4" as={Link} href={route('parts.show', sparePart.id)}>
                                        Отмена
                                    </SecondaryButton>
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