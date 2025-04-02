import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Textarea from '@/Components/Textarea';
import PrimaryButton from '@/Components/PrimaryButton';

export default function VinRequestIndex({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        vin_code: '',
        name: auth.user ? auth.user.name : '',
        email: auth.user ? auth.user.email : '',
        phone: '',
        parts_description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vin-request.store'), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        VIN-запрос
                    </h2>
                    <p className="text-gray-200">
                        Заполните форму, и наши специалисты подберут необходимые запчасти для вашего автомобиля
                    </p>
                </div>
            }
        >
            <Head title="Подбор по VIN" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                        <div className="bg-white p-6 rounded-lg">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="vin_code" value="VIN-код автомобиля" />
                                    <TextInput
                                        id="vin_code"
                                        type="text"
                                        name="vin_code"
                                        value={data.vin_code}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('vin_code', e.target.value)}
                                        required
                                        maxLength={17}
                                        minLength={17}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        VIN-код состоит из 17 символов и находится в техпаспорте или на кузове автомобиля
                                    </p>
                                    <InputError message={errors.vin_code} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="Ваше имя" />
                                        <TextInput
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="Email" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Телефон (необязательно)" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="parts_description" value="Описание необходимых запчастей" />
                                    <Textarea
                                        id="parts_description"
                                        name="parts_description"
                                        value={data.parts_description}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('parts_description', e.target.value)}
                                        required
                                        rows={5}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Укажите, какие запчасти вам нужны, для какой части автомобиля, и любую дополнительную информацию
                                    </p>
                                    <InputError message={errors.parts_description} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Отправить запрос
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