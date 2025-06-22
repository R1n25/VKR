import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function SuggestAnalogForm({ auth, sparePart }) {
    // Состояние формы
    const [formData, setFormData] = useState({
        analog_article: '',
        analog_brand: '',
        analog_description: '',
        comment: '',
        analog_type: 'direct',
    });
    
    // Состояния UI
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(null);
    const [countdownSeconds, setCountdownSeconds] = useState(3);
    
    // Обработчики изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        // Очистим таймер при размонтировании компонента
        return () => {
            if (redirectTimer) {
                clearInterval(redirectTimer);
            }
        };
    }, [redirectTimer]);

    // Получение CSRF-токена
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        return '';
    };
    
    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (processing) {
            return;
        }
        
        setProcessing(true);
        setErrors({});
        
        try {
            const csrfToken = getCsrfToken();
            
            // Получаем URL для запроса
            const submitUrl = `/parts/${sparePart.id}/suggest-analog`;
            
            console.log('Отправляем данные на URL:', submitUrl);
            
            // Отправка с помощью axios
            const response = await axios.post(submitUrl, formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('Успешный ответ:', response.data);
            
            // Обновляем состояние UI после успешной отправки
            setSubmittedSuccessfully(true);
            setShowSuccessMessage(true);
            
            // Очищаем форму
            setFormData({
                analog_article: '',
                analog_brand: '',
                analog_description: '',
                comment: '',
                analog_type: 'direct',
            });
            
            // Прокручиваем страницу вверх
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Запускаем обратный отсчет для перенаправления
            let countdown = 3;
            setCountdownSeconds(countdown);
            
            const timer = setInterval(() => {
                countdown -= 1;
                setCountdownSeconds(countdown);
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    window.location.href = `/parts/${sparePart.id}`;
                }
            }, 1000);
            
            setRedirectTimer(timer);
            
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            console.error('Детали ошибки:', error.response?.data);
            
            // Обработка ошибок валидации
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                
                // Прокручиваем к первой ошибке
                setTimeout(() => {
                    const firstErrorElement = document.querySelector('.text-red-600');
                    if (firstErrorElement) {
                        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else if (error.response?.status === 419) {
                // Обработка ошибки CSRF
                alert('Ошибка безопасности: истек срок действия сессии. Пожалуйста, обновите страницу и попробуйте снова.');
            } else {
                // Общая ошибка
                const errorMessage = error.response?.data?.message || 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.';
                alert(errorMessage);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Предложить аналог</h2>}
        >
            <Head title="Предложить аналог" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {showSuccessMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 transition-all duration-500 ease-in-out" role="alert">
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <div>
                                    <strong className="font-bold">Успешно!</strong>
                                    <span className="block sm:inline ml-1">Ваше предложение аналога успешно отправлено на модерацию.</span>
                                </div>
                            </div>
                            <div className="mt-2 text-sm flex justify-between items-center">
                                <span>Вы будете перенаправлены на страницу запчасти через {countdownSeconds} {countdownSeconds === 1 ? 'секунду' : countdownSeconds < 5 ? 'секунды' : 'секунд'}...</span>
                                <Link 
                                    href={`/parts/${sparePart.id}`} 
                                    className="underline text-green-700 hover:text-green-800"
                                >
                                    Перейти сейчас
                                </Link>
                            </div>
                        </div>
                    )}
                    
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
                            
                            {submittedSuccessfully ? (
                                <div className="bg-green-50 rounded-lg py-10 px-6 text-center border border-green-200">
                                    <div className="text-green-500 mb-4">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-green-800">Предложение успешно отправлено!</h3>
                                    <p className="text-gray-600 mb-4">
                                        Ваше предложение аналога было успешно отправлено и будет рассмотрено модератором.
                                    </p>
                                    <div className="flex justify-center">
                                        <Link 
                                            href={`/parts/${sparePart.id}`}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Вернуться к запчасти
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Информация об аналоге</h3>

                                        <div className="mb-4">
                                            <InputLabel htmlFor="analog_brand" value="Производитель аналога" />
                                            <TextInput
                                                id="analog_brand"
                                                type="text"
                                                name="analog_brand"
                                                value={formData.analog_brand}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
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
                                                value={formData.analog_article}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
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
                                                value={formData.analog_description}
                                                className="mt-1 block w-full"
                                                onChange={handleChange}
                                                required
                                            />
                                            <InputError message={errors.analog_description} className="mt-2" />
                                        </div>

                                        <div className="mb-4">
                                            <InputLabel htmlFor="comment" value="Ваш комментарий (необязательно)" />
                                            <textarea
                                                id="comment"
                                                name="comment"
                                                value={formData.comment}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
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
                                                        checked={formData.analog_type === 'direct'}
                                                        onChange={handleRadioChange}
                                                        className="form-radio h-5 w-5 text-indigo-600"
                                                    />
                                                    <span className="ml-2 text-gray-700">Прямой аналог (полная замена)</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="analog_type"
                                                        value="partial"
                                                        checked={formData.analog_type === 'partial'}
                                                        onChange={handleRadioChange}
                                                        className="form-radio h-5 w-5 text-indigo-600"
                                                    />
                                                    <span className="ml-2 text-gray-700">Заменитель (частичная замена)</span>
                                                </label>
                                            </div>
                                            <InputError message={errors.analog_type} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end mt-6">
                                        <Link className="mr-4" href={`/spare-parts/${sparePart.id}`}>
                                            <SecondaryButton type="button">
                                                Отмена
                                            </SecondaryButton>
                                        </Link>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={processing}
                                            className={processing ? 'opacity-75 cursor-not-allowed' : ''}
                                        >
                                            {processing ? 'Отправка...' : 'Отправить'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 