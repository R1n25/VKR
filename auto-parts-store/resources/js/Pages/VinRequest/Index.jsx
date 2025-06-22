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
        vin_code: '', // Оставляем это поле для совместимости с формой
        name: auth.user ? auth.user.name : '',
        email: auth.user ? auth.user.email : '',
        phone: '',
        parts_description: '',
    });
    
    // Состояние для ошибок клиентской валидации
    const [validationErrors, setValidationErrors] = useState({
        phone: '',
    });
    
    // Функция для валидации телефонного номера в российском формате
    const validatePhone = (phoneNumber) => {
        // Если телефон не обязателен и пустой, пропускаем валидацию
        if (!phoneNumber) return { isValid: true, error: '' };
        
        // Удаляем все нецифровые символы для проверки
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Проверка основных форматов российских номеров
        if (/^7\d{10}$/.test(digits) || /^8\d{10}$/.test(digits)) {
            return { isValid: true, error: '' };
        } else if (digits.length !== 11) {
            return { 
                isValid: false, 
                error: 'Номер телефона должен содержать 11 цифр'
            };
        } else if (!/^[78]/.test(digits)) {
            return { 
                isValid: false, 
                error: 'Номер должен начинаться с 7 или 8'
            };
        } else {
            return { 
                isValid: false, 
                error: 'Неверный формат номера телефона'
            };
        }
    };
    
    // Форматирование телефонного номера
    const formatPhone = (phoneNumber) => {
        // Удаляем все нецифровые символы
        const digits = phoneNumber.replace(/\D/g, '');
        
        // Если номер пустой, возвращаем пустую строку
        if (!digits) return '';
        
        // Форматируем номер в формате +7 (XXX) XXX-XX-XX
        if (digits.length <= 1) {
            return digits;
        } else if (digits.length <= 4) {
            return `+7 (${digits.substring(1)}`;
        } else if (digits.length <= 7) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4)}`;
        } else if (digits.length <= 9) {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
        } else {
            return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7, 9)}-${digits.substring(9, 11)}`;
        }
    };
    
    // Обработчик изменения полей формы с добавлением валидации телефона
    const handleInputChange = (field, value) => {
        if (field === 'phone') {
            // Форматируем номер и валидируем его
            const formattedValue = formatPhone(value);
            const { isValid, error } = validatePhone(value);
            
            // Устанавливаем ошибку только если поле не пустое и невалидно
            if (value && !isValid) {
                setValidationErrors(prev => ({ ...prev, phone: error }));
            } else {
                setValidationErrors(prev => ({ ...prev, phone: '' }));
            }
            
            // Обновляем значение в форме
            setData(field, formattedValue);
        } else {
            // Для других полей - стандартная обработка
            setData(field, value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Проверяем валидность телефона перед отправкой
        if (data.phone) {
            const { isValid, error } = validatePhone(data.phone);
            if (!isValid) {
                setValidationErrors(prev => ({ ...prev, phone: error }));
                return;
            }
        }
        
        post(url('vin-request/store'), { onSuccess: () => reset() });
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
                                        onChange={(e) => handleInputChange('vin_code', e.target.value)}
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
                                            onChange={(e) => handleInputChange('name', e.target.value)}
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
                                            onChange={(e) => handleInputChange('email', e.target.value)}
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
                                        className={`mt-1 block w-full ${validationErrors.phone ? 'border-red-500' : ''}`}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+7 (XXX) XXX-XX-XX"
                                    />
                                    {validationErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                    )}
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="parts_description" value="Описание необходимых запчастей" />
                                    <Textarea
                                        id="parts_description"
                                        name="parts_description"
                                        value={data.parts_description}
                                        className="mt-1 block w-full"
                                        onChange={(e) => handleInputChange('parts_description', e.target.value)}
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