<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Стили и скрипты -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        <!-- Скрипт для исправления ссылок на API -->
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Функция для обработки и исправления ссылок
                function fixApiLinks() {
                    // Находим все ссылки на странице
                    const links = document.querySelectorAll('a[href*="/api/brands"]');
                    
                    // Исправляем каждую ссылку
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && href.includes('/api/brands')) {
                            // Заменяем /api/brands на /brands
                            const newHref = href.replace('/api/brands', '/brands');
                            link.setAttribute('href', newHref);
                        }
                    });
                }
                
                // Запускаем исправление ссылок при загрузке страницы
                fixApiLinks();
                
                // Наблюдатель за изменениями в DOM для динамически добавляемых элементов
                const observer = new MutationObserver(function(mutations) {
                    fixApiLinks();
                });
                
                // Начинаем наблюдение за изменениями в DOM
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        </script>
    </body>
</html>
