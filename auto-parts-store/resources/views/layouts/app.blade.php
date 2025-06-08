<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title', config('app.name', 'Auto Parts Store'))</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

        <!-- Стили -->
        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
        
        @stack('styles')
    </head>
    <body>
        <header>
            <!-- Навигационное меню -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container">
                    <a class="navbar-brand" href="{{ route('home') }}">Auto Parts</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('home') }}">Главная</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('brands.index') }}">Бренды</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('categories.index') }}">Категории</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('search') }}">Поиск</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('cart.index') }}">
                                    <i class="bi bi-cart"></i> Корзина
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>

        <main>
            @yield('content')
        </main>

        <footer class="bg-light py-4 mt-5">
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <p>&copy; {{ date('Y') }} Auto Parts Store. Все права защищены.</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p>Интернет-магазин автозапчастей</p>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Bootstrap Bundle with Popper -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        
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
        
        @stack('scripts')
    </body>
</html> 