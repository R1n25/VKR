import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function UserEdit({ auth, user }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        is_admin: user.is_admin,
        markup_percent: user.markup_percent,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Редактирование пользователя</h2>}
        >
            <Head title="Редактирование пользователя" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="name" value="Имя" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="password" value="Пароль (оставьте пустым, если не хотите менять)" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center">
                                        <Checkbox
                                            id="is_admin"
                                            name="is_admin"
                                            checked={data.is_admin}
                                            onChange={handleChange}
                                        />
                                        <InputLabel htmlFor="is_admin" value="Администратор" className="ml-2" />
                                    </div>
                                    <InputError message={errors.is_admin} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="markup_percent" value="Наценка (%)" />
                                    <div className="flex items-center">
                                        <TextInput
                                            id="markup_percent"
                                            type="number"
                                            name="markup_percent"
                                            value={data.markup_percent}
                                            className="mt-1 block w-full"
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            required
                                        />
                                        <span className="ml-2">%</span>
                                    </div>
                                    <InputError message={errors.markup_percent} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <Link
                                        href={route('admin.users.index')}
                                        className="mr-4 underline text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Отмена
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        disabled={processing}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 