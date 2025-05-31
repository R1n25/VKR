import '../css/app.css';
import './bootstrap';

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Предзагрузка общих компонентов для ускорения рендеринга
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

// Кешируем предзагруженные модули страниц
const pageModules = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Удаляем лишний console.log для повышения производительности
        
        // Проверка для страниц админ-панели
        if (name.startsWith('Admin/')) {
            return resolvePageComponent(
                `./Pages/${name}.jsx`,
                pageModules, // Используем кешированные модули
            );
        }
        
        return resolvePageComponent(
            `./Pages/${name}.jsx`,
            pageModules, // Используем кешированные модули
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        // Удаляем лишний console.log для повышения производительности
        
        // Отключаем строгий режим в продакшене для улучшения производительности
        const isProd = import.meta.env.PROD;
        
        if (isProd) {
            root.render(<App {...props} />);
        } else {
            // В режиме разработки можно использовать строгий режим
            root.render(
                <React.StrictMode>
                    <App {...props} />
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
