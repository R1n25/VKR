<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Auto Parts Store') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Стили и скрипты -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        
        <!-- Регистрация Service Worker для блокировки нежелательных запросов -->
        <script>
            // Регистрируем Service Worker только если он поддерживается браузером
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/blocking-sw.js')
                        .then(function(registration) {
                            console.debug('Service Worker зарегистрирован с областью:', registration.scope);
                        })
                        .catch(function(error) {
                            console.error('Ошибка регистрации Service Worker:', error);
                        });
                });
            }
        </script>
        
        <!-- Блокировка отмененных XHR-запросов -->
        <script>
            // Перехватываем XMLHttpRequest перед выполнением запроса
            (function() {
                // Сохраняем оригинальный XMLHttpRequest
                const originalXHR = window.XMLHttpRequest;
                
                // Создаем список URL-паттернов для блокировки
                const blockedPatterns = [
                    /ca\.onHtml/i,
                    /from\?get/i,
                    /pageHide/i,
                    /\?tm=202[0-9]/i
                ];
                
                // Переопределяем XMLHttpRequest
                window.XMLHttpRequest = function() {
                    const xhr = new originalXHR();
                    const originalOpen = xhr.open;
                    
                    // Переопределяем метод open для проверки URL
                    xhr.open = function(method, url, ...args) {
                        // Проверяем URL на наличие заблокированных паттернов
                        const isBlocked = blockedPatterns.some(pattern => pattern.test(url));
                        
                        if (isBlocked) {
                            // Если URL заблокирован, не выполняем запрос
                            console.debug('Заблокирован XHR-запрос:', url);
                            
                            // Эмулируем отмену запроса
                            setTimeout(() => {
                                if (typeof xhr.onabort === 'function') {
                                    xhr.onabort();
                                }
                            }, 0);
                            
                            // Возвращаем ложный метод, который ничего не делает
                            return;
                        }
                        
                        // Если URL не заблокирован, продолжаем как обычно
                        return originalOpen.apply(xhr, [method, url, ...args]);
                    };
                    
                    return xhr;
                };
            })();
        </script>
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
