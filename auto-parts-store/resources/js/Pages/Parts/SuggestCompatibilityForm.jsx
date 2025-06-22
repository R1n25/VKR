import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';

export default function SuggestCompatibilityForm({ auth, sparePart, carModels, carBrands }) {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [filteredModels, setFilteredModels] = useState([]);
    const [engines, setEngines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(null);
    const [countdownSeconds, setCountdownSeconds] = useState(3);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({
        car_brand_id: '',
        car_model_id: '',
        car_engine_id: '',
        comment: '',
    });
    const [errors, setErrors] = useState({});
    const [currentPath, setCurrentPath] = useState('');

    // При монтировании компонента получаем текущий путь
    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    // Обновляем фильтрованные модели при изменении бренда
    useEffect(() => {
        if (formData.car_brand_id) {
            const brandModels = carModels.filter(model => model.brand_id === parseInt(formData.car_brand_id));
            setFilteredModels(brandModels);
            setFormData(prev => ({ ...prev, car_model_id: '', car_engine_id: '' }));
            setEngines([]);
        } else {
            setFilteredModels([]);
            setFormData(prev => ({ ...prev, car_model_id: '', car_engine_id: '' }));
            setEngines([]);
        }
    }, [formData.car_brand_id]);

    // Загружаем двигатели для выбранной модели
    useEffect(() => {
        if (formData.car_model_id) {
            fetchEngines(formData.car_model_id);
        } else {
            setEngines([]);
            setFormData(prev => ({ ...prev, car_engine_id: '' }));
        }
    }, [formData.car_model_id]);
    
    useEffect(() => {
        // Очистим таймер при размонтировании компонента
        return () => {
            if (redirectTimer) {
                clearInterval(redirectTimer);
            }
        };
    }, [redirectTimer]);

    // Функция для загрузки двигателей
    const fetchEngines = async (modelId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/models/${modelId}/engines`);
            if (response.data && response.data.data && response.data.data.engines) {
                setEngines(response.data.data.engines);
            } else {
                setEngines([]);
            }
        } catch (error) {
            console.error('Ошибка при загрузке двигателей:', error);
            setEngines([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Получение CSRF-токена
    const getCsrfToken = () => {
        // Используем глобальную функцию, если она доступна
        if (typeof window.getCsrfToken === 'function') {
            return window.getCsrfToken();
        }
        
        // Пробуем получить из мета-тега
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag && metaTag.getAttribute('content')) {
            return metaTag.getAttribute('content');
        }
        
        // Пробуем получить из cookies (Laravel хранит токен в зашифрованном виде)
        let match = document.cookie.match(new RegExp('(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)'));
        if (match) {
            // Laravel хранит токен в URL-закодированном виде
            return decodeURIComponent(match[2]);
        }
        
        // Пробуем получить из простого cookie csrf_token
        match = document.cookie.match(new RegExp('(^|;)\\s*csrf_token\\s*=\\s*([^;]+)'));
        if (match) {
            return match[2];
        }
        
        // Последняя попытка - получить из локального хранилища
        const storedToken = localStorage.getItem('csrf_token');
        if (storedToken) {
            return storedToken;
        }
        
        console.warn('CSRF токен не найден, запрос может быть отклонен сервером');
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (submitting) return;
        
        setSubmitting(true);
        setErrors({});
        
        try {
            // Проверяем обязательные поля
            if (!formData.car_brand_id || !formData.car_model_id) {
                setMessage({
                    text: 'Пожалуйста, заполните все обязательные поля',
                    type: 'error'
                });
                setSubmitting(false);
                return;
            }
            
            const csrfToken = getCsrfToken();
            
            // Всегда используем маршрут /parts/{id}/suggest-compatibility, который не требует CSRF защиты
            const submitUrl = `/parts/${sparePart.id}/suggest-compatibility`;
            
            console.log('Отправляем данные на URL:', submitUrl);
            
            // Отправка с помощью axios
            try {
                const response = await axios.post(submitUrl, formData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                console.log('Успешный ответ:', response.data);
                
                // Обновляем состояние UI после успешной отправки
                setSubmittedSuccessfully(true);
                setShowSuccessMessage(true);
                setMessage({
                    text: 'Ваше предложение о совместимости успешно отправлено и будет рассмотрено администратором.',
                    type: 'success'
                });
                
                // Очищаем форму
                setFormData({
                    car_brand_id: '',
                    car_model_id: '',
                    car_engine_id: '',
                    comment: '',
                });
                
                // Прокручиваем страницу вверх, чтобы пользователь увидел сообщение
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
            } catch (axiosError) {
                // Обработка ошибок axios
                console.error('Ошибка при отправке формы через axios:', axiosError);
                
                // Если axios не работает, пробуем отправить через нативную форму
                console.log('Пробуем отправить через нативную форму...');
                
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = submitUrl;
                
                // Добавляем остальные поля из formData
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value;
                        form.appendChild(input);
                    }
                });
                
                // Добавляем форму на страницу и отправляем
                document.body.appendChild(form);
                form.submit();
            }
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
            console.error('Детали ошибки:', error.response?.data);
            
            // Если есть ошибки валидации, отображаем их
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                setMessage({
                    text: 'Пожалуйста, исправьте ошибки в форме',
                    type: 'error'
                });
                
                // Прокручиваем к первой ошибке
                setTimeout(() => {
                    const firstErrorElement = document.querySelector('.text-red-600');
                    if (firstErrorElement) {
                        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else if (error.response?.status === 419) {
                // Обработка ошибки CSRF
                setMessage({
                    text: 'Ошибка безопасности: истек срок действия сессии. Пожалуйста, обновите страницу и попробуйте снова.',
                    type: 'error'
                });
                // Можно перенаправить на страницу с формой заново
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Иначе показываем общую ошибку
                const errorMessage = error.response?.data?.message || 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.';
                setMessage({
                    text: errorMessage,
                    type: 'error'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Функция для получения правильного URL для запчасти
    const getPartUrl = () => {
        // Всегда используем путь /parts/{id}, так как он работает с withoutMiddleware(VerifyCsrfToken::class)
        return `/parts/${sparePart.id}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Предложить совместимость</h2>}
        >
            <Head title="Предложить совместимость" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Сообщение об успешной отправке или ошибке */}
                    {message.text && (
                        <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} role="alert">
                            <div className="flex items-center">
                                <svg className={`w-6 h-6 mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    {message.type === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    )}
                                </svg>
                                <div>
                                    <strong className="font-bold">{message.type === 'success' ? 'Успешно!' : 'Ошибка!'}</strong>
                                    <span className="block sm:inline ml-1">{message.text}</span>
                                </div>
                            </div>
                            {message.type === 'success' && (
                                <div className="mt-2 text-sm flex justify-between items-center">
                                    <span>Вы будете перенаправлены на страницу запчасти через {countdownSeconds} {countdownSeconds === 1 ? 'секунду' : countdownSeconds < 5 ? 'секунды' : 'секунд'}...</span>
                                    <Link 
                                        href={getPartUrl()}
                                        className="underline text-green-700 hover:text-green-800"
                                    >
                                        Перейти сейчас
                                    </Link>
                                </div>
                            )}
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
                                        Ваше предложение о совместимости успешно отправлено и будет рассмотрено администратором.
                                    </p>
                                    <div className="flex justify-center">
                                        <Link 
                                            href={getPartUrl()}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Вернуться к запчасти
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Информация о совместимости</h3>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="car_brand_id" value="Бренд автомобиля" />
                                            <select
                                                id="car_brand_id"
                                                name="car_brand_id"
                                                value={formData.car_brand_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">-- Выберите бренд автомобиля --</option>
                                                {carBrands.map(brand => (
                                                    <option key={brand.id} value={brand.id}>
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.car_brand_id} className="mt-2" />
                                        </div>

                                        <div className="mb-4">
                                            <InputLabel htmlFor="car_model_id" value="Модель автомобиля" />
                                            <select
                                                id="car_model_id"
                                                name="car_model_id"
                                                value={formData.car_model_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
                                                required
                                                disabled={!formData.car_brand_id}
                                            >
                                                <option value="">-- Выберите модель автомобиля --</option>
                                                {filteredModels.map(model => (
                                                    <option key={model.id} value={model.id}>
                                                        {model.name} {model.generation ? `(${model.generation})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.car_model_id} className="mt-2" />
                                        </div>

                                        <div className="mb-4">
                                            <InputLabel htmlFor="car_engine_id" value="Двигатель (необязательно)" />
                                            <select
                                                id="car_engine_id"
                                                name="car_engine_id"
                                                value={formData.car_engine_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={handleChange}
                                                disabled={!formData.car_model_id || loading}
                                            >
                                                <option value="">-- Выберите двигатель (если известен) --</option>
                                                {engines.map(engine => (
                                                    <option key={engine.id} value={engine.id}>
                                                        {engine.name} {engine.volume && `${engine.volume}л`} {engine.power && `${engine.power}л.с.`} {engine.type && `(${engine.type})`}
                                                    </option>
                                                ))}
                                            </select>
                                            {loading && <p className="mt-1 text-sm text-gray-500">Загрузка двигателей...</p>}
                                            <InputError message={errors.car_engine_id} className="mt-2" />
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
                                            <p className="mt-1 text-sm text-gray-500">
                                                Укажите дополнительную информацию о совместимости, например, особенности установки.
                                            </p>
                                            <InputError message={errors.comment} className="mt-2" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end mt-6">
                                        <Link className="mr-4" href={getPartUrl()}>
                                            <SecondaryButton type="button">
                                                Отмена
                                            </SecondaryButton>
                                        </Link>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={submitting}
                                            className={submitting ? 'opacity-75 cursor-not-allowed' : ''}
                                        >
                                            {submitting ? 'Отправка...' : 'Отправить'}
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