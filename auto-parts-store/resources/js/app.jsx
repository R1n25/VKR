// Убираем импорт CSS здесь, так как он обрабатывается через vite.config.js
import '../css/app.css';
import './bootstrap';

// Импортируем debug.js только в браузере, но не на сервере
if (typeof window !== 'undefined') {
    import('./debug.js').catch(e => console.error('Ошибка при загрузке debug.js:', e));
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, Link as InertiaLink } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { CartProvider } from './Contexts/CartContext';

// Определяем базовый URL для маршрутов
if (typeof window !== 'undefined') {
    window.BASE_URL = '/';
}

// Создаем функцию для генерации URL вместо Ziggy route()
window.url = function(path, params = {}) {
    // Убираем лишние слеши в начале пути
    let url = '/' + path.replace(/^\/+/, '');
    
    // Обработка параметров
    if (Object.keys(params).length > 0) {
        // Проверяем, есть ли в пути плейсхолдеры для параметров
        for (const key in params) {
            // Заменяем плейсхолдеры вида {key} или :key в пути на значения параметров
            const placeholder1 = `{${key}}`;
            const placeholder2 = `:${key}`;
            
            if (url.includes(placeholder1)) {
                url = url.replace(placeholder1, params[key]);
                delete params[key]; // Удаляем использованный параметр
            } else if (url.includes(placeholder2)) {
                url = url.replace(placeholder2, params[key]);
                delete params[key]; // Удаляем использованный параметр
            }
        }
        
        // Оставшиеся параметры добавляем как query string
        const remainingParams = Object.keys(params);
        if (remainingParams.length > 0) {
            const queryString = remainingParams
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += '?' + queryString;
        }
    }
    
    // Проверяем наличие шаблонных параметров в URL и заменяем их на числовые ID
    // Например, admin/spare-parts/{sparePart} -> admin/spare-parts/123
    const placeholderRegex = /\{([^}]+)\}|\:([^\/]+)/g;
    let match;
    
    // Если в URL остались незамененные плейсхолдеры, выводим предупреждение
    if (placeholderRegex.test(url)) {
        console.warn(`URL содержит незамененные параметры: ${url}`);
    }
    
    return url;
};

// Добавляем функцию route для обратной совместимости
window.route = function(name, params = {}) {
    // Маппинг имен маршрутов на URL-пути
    const routeMap = {
        'home': '/',
        'brands.index': '/brands',
        'brands.show': '/brands/{id}',
        'models.show': '/models/{id}',
        'engines.index': '/models/{id}/engines',
        'engines.parts': '/engines/{id}/parts',
        'profile.edit': '/profile',
        'profile.update': '/profile',
        'profile.destroy': '/profile',
        'password.update': '/password',
        'orders.index': '/orders',
        'cart': '/cart',
        'vin-request.index': '/vin-request',
        'vin-request.show': '/vin-request/{id}',
        'parts.show': '/parts/{id}',
        'spare-parts.show': '/spare-parts/{id}',
        'suggestions.store-analog': '/spare-parts/{sparePart}/suggest-analog',
        'suggestions.store-analog-by-id': '/parts/{id}/suggest-analog',
        'suggestions.create-analog': '/spare-parts/{sparePart}/suggest-analog',
        'suggestions.create-analog-by-id': '/parts/{id}/suggest-analog',
        'suggestions.store-compatibility': '/spare-parts/{sparePart}/suggest-compatibility',
        'suggestions.store-compatibility-by-id': '/parts/{id}/suggest-compatibility',
        'suggestions.create-compatibility': '/spare-parts/{sparePart}/suggest-compatibility',
        'suggestions.create-compatibility-by-id': '/parts/{id}/suggest-compatibility',
        // Добавьте другие маршруты по мере необходимости
    };
    
    // Проверяем, существует ли маршрут в нашей карте
    if (!routeMap[name]) {
        console.warn(`Маршрут "${name}" не найден в карте маршрутов`);
        return '#'; // Возвращаем заглушку, чтобы избежать ошибок навигации
    }
    
    // Получаем шаблон URL из карты маршрутов
    let url = routeMap[name];
    
    // Если params - это не объект, а примитивное значение (например, число или строка),
    // то предполагаем, что это идентификатор и используем его для замены первого плейсхолдера
    if (params !== null && typeof params !== 'undefined' && typeof params !== 'object') {
        // Находим первый плейсхолдер в URL и заменяем его
        const placeholderMatch = url.match(/\{([^}]+)\}/);
        if (placeholderMatch) {
            const placeholder = placeholderMatch[0];
            url = url.replace(placeholder, params);
            return url;
        }
    }
    
    // Заменяем плейсхолдеры вида {параметр} на значения из params
    if (params && typeof params === 'object') {
        for (const key in params) {
            const placeholder = `{${key}}`;
            if (url.includes(placeholder)) {
                url = url.replace(placeholder, params[key]);
                delete params[key]; // Удаляем использованный параметр
            }
        }
        
        // Добавляем оставшиеся параметры как query string
        const remainingParams = Object.keys(params);
        if (remainingParams.length > 0) {
            const queryString = remainingParams
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            url += '?' + queryString;
        }
    }
    
    return url;
};

// Переопределяем компонент Link из Inertia.js
const Link = ({ href, ...props }) => {
    // Преобразуем маршрут, если он передан как строка
    const processedHref = typeof href === 'string' ? href : href;
    return <InertiaLink href={processedHref} {...props} />;
};

// Экспортируем наш компонент Link вместо оригинального
window.Link = Link;

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// Предзагрузка общих компонентов для ускорения рендеринга
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

// Кешируем предзагруженные модули страниц
const pageModules = import.meta.glob('./Pages/**/*.jsx');

// Создаем обертку для приложения с провайдером корзины
const AppWrapper = ({ children, ...props }) => {
    return (
        <CartProvider user={props.auth?.user}>
            {children}
        </CartProvider>
    );
};

// Хранилище для корневых элементов React
window.__REACT_ROOTS__ = window.__REACT_ROOTS__ || {};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        // Проверяем, существует ли уже корневой элемент для этого контейнера
        const rootId = el.id || 'app';
        
        // Если корневой элемент уже существует, используем его
        if (window.__REACT_ROOTS__[rootId]) {
            console.log(`Используем существующий корневой элемент для #${rootId}`);
            const existingRoot = window.__REACT_ROOTS__[rootId];
            
            // Рендерим приложение в существующий корневой элемент
            existingRoot.render(
                <AppWrapper {...props}>
                    <App {...props} />
                </AppWrapper>
            );
            return;
        }
        
        // Если корневого элемента нет, создаем новый
        console.log(`Создаем новый корневой элемент для #${rootId}`);
        const root = createRoot(el);
        window.__REACT_ROOTS__[rootId] = root;
        
        // Отключаем строгий режим в продакшене для улучшения производительности
        const isProd = import.meta.env.PROD;
        
        if (isProd) {
            root.render(
                <AppWrapper {...props}>
                    <App {...props} />
                </AppWrapper>
            );
        } else {
            // В режиме разработки можно использовать строгий режим
            root.render(
                <React.StrictMode>
                    <AppWrapper {...props}>
                        <App {...props} />
                    </AppWrapper>
                </React.StrictMode>
            );
        }
    },
    progress: {
        color: '#4B5563',
        // Увеличиваем задержку показа индикатора загрузки, чтобы не мерцал при быстрых переходах
        delay: 250,
        // Включаем только на медленных страницах
        includeCSS: true,
    },
});
