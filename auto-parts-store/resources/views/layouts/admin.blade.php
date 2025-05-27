<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Админ-панель | {{ config('app.name') }}</title>
    
    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">
    
    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #f8f9fa;
        }
        
        #layoutSidenav {
            display: flex;
        }
        
        #layoutSidenav_nav {
            flex-basis: 225px;
            flex-shrink: 0;
            transition: transform .15s ease-in-out;
            z-index: 1038;
            transform: translateX(0);
        }
        
        #layoutSidenav_content {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-width: 0;
            flex-grow: 1;
            min-height: calc(100vh - 56px);
            margin-left: -225px;
        }
        
        .sb-sidenav-toggled #layoutSidenav_nav {
            transform: translateX(-225px);
        }
        
        .sb-sidenav-toggled #layoutSidenav_content {
            margin-left: -225px;
        }
        
        @media (min-width: 992px) {
            #layoutSidenav_nav {
                transform: translateX(0);
            }
            
            #layoutSidenav_content {
                margin-left: 0;
                transition: margin .15s ease-in-out;
            }
            
            .sb-sidenav-toggled #layoutSidenav_nav {
                transform: translateX(0);
            }
            
            .sb-sidenav-toggled #layoutSidenav_content {
                margin-left: 225px;
            }
        }
        
        .sb-nav-fixed .sb-topnav {
            z-index: 1039;
        }
        
        .sb-nav-fixed #layoutSidenav #layoutSidenav_nav {
            width: 225px;
            height: 100vh;
            z-index: 1038;
        }
        
        .sb-nav-fixed #layoutSidenav #layoutSidenav_nav .sb-sidenav {
            padding-top: 56px;
        }
        
        .sb-nav-fixed #layoutSidenav #layoutSidenav_nav .sb-sidenav .sb-sidenav-menu {
            overflow-y: auto;
        }
        
        .sb-nav-fixed #layoutSidenav #layoutSidenav_content {
            padding-left: 225px;
            top: 56px;
        }
        
        .sb-sidenav {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex-wrap: nowrap;
        }
        
        .sb-sidenav .sb-sidenav-menu {
            flex-grow: 1;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav {
            flex-direction: column;
            flex-wrap: nowrap;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .sb-sidenav-menu-heading {
            padding: 1.75rem 1rem 0.75rem;
            font-size: 0.75rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .nav-link {
            display: flex;
            align-items: center;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
            position: relative;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .nav-link .sb-nav-link-icon {
            font-size: 0.9rem;
            padding-right: 0.5rem;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .nav-link .sb-sidenav-collapse-arrow {
            display: inline-block;
            margin-left: auto;
            transition: transform .15s ease;
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .nav-link.collapsed .sb-sidenav-collapse-arrow {
            transform: rotate(-90deg);
        }
        
        .sb-sidenav .sb-sidenav-menu .nav .sb-sidenav-menu-nested {
            margin-left: 1.5rem;
            flex-direction: column;
        }
        
        .sb-sidenav .sb-sidenav-footer {
            padding: 0.75rem;
            flex-shrink: 0;
        }
        
        .sb-sidenav-dark {
            background-color: #212529;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .sb-sidenav-menu-heading {
            color: rgba(255, 255, 255, 0.25);
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .nav-link {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .nav-link .sb-nav-link-icon {
            color: rgba(255, 255, 255, 0.25);
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .nav-link:hover {
            color: #fff;
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .nav-link.active {
            color: #fff;
        }
        
        .sb-sidenav-dark .sb-sidenav-menu .nav-link.active .sb-nav-link-icon {
            color: #fff;
        }
        
        .sb-sidenav-dark .sb-sidenav-footer {
            background-color: #343a40;
        }
    </style>
    
    @stack('styles')
</head>
<body class="sb-nav-fixed">
    <!-- Верхняя навигационная панель -->
    <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
        <!-- Логотип -->
        <a class="navbar-brand ps-3" href="{{ route('admin.dashboard') }}">Админ-панель</a>
        
        <!-- Переключатель боковой панели -->
        <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!">
            <i class="fas fa-bars"></i>
        </button>
        
        <!-- Поиск -->
        <form class="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
            <div class="input-group">
                <input class="form-control" type="text" placeholder="Поиск..." aria-label="Поиск..." aria-describedby="btnNavbarSearch" />
                <button class="btn btn-primary" id="btnNavbarSearch" type="button"><i class="fas fa-search"></i></button>
            </div>
        </form>
        
        <!-- Пользовательское меню -->
        <ul class="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user fa-fw"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="#!">Настройки</a></li>
                    <li><a class="dropdown-item" href="#!">Журнал активности</a></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li>
                        <a class="dropdown-item" href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                            Выйти
                        </a>
                        <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                            @csrf
                        </form>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
    
    <div id="layoutSidenav">
        <!-- Боковая панель навигации -->
        <div id="layoutSidenav_nav">
            <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div class="sb-sidenav-menu">
                    <div class="nav">
                        <div class="sb-sidenav-menu-heading">Основное</div>
                        <a class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                            Панель управления
                        </a>
                        
                        <div class="sb-sidenav-menu-heading">Каталог</div>
                        <a class="nav-link {{ request()->routeIs('admin.spare-parts.*') ? 'active' : '' }}" href="{{ route('admin.spare-parts.index') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-cogs"></i></div>
                            Запчасти
                        </a>
                        
                        <div class="sb-sidenav-menu-heading">Пользователи</div>
                        <a class="nav-link {{ request()->routeIs('admin.suggestions.*') ? 'active' : '' }}" href="{{ route('admin.suggestions.index') }}">
                            <div class="sb-nav-link-icon"><i class="fas fa-comment"></i></div>
                            Предложения
                            @if(App\Models\UserSuggestion::where('status', 'pending')->count() > 0)
                                <span class="badge bg-danger ms-2">{{ App\Models\UserSuggestion::where('status', 'pending')->count() }}</span>
                            @endif
                        </a>
                        
                        <div class="sb-sidenav-menu-heading">Заказы</div>
                        <a class="nav-link" href="#">
                            <div class="sb-nav-link-icon"><i class="fas fa-shopping-cart"></i></div>
                            Управление заказами
                        </a>
                    </div>
                </div>
                <div class="sb-sidenav-footer">
                    <div class="small">Вы вошли как:</div>
                    {{ Auth::user()->name }}
                </div>
            </nav>
        </div>
        
        <!-- Основное содержимое -->
        <div id="layoutSidenav_content">
            <main>
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show m-3" role="alert">
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show m-3" role="alert">
                        {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif
                
                @yield('content')
            </main>
            
            <footer class="py-4 bg-light mt-auto">
                <div class="container-fluid px-4">
                    <div class="d-flex align-items-center justify-content-between small">
                        <div class="text-muted">Copyright &copy; {{ config('app.name') }} {{ date('Y') }}</div>
                        <div>
                            <a href="#">Политика конфиденциальности</a>
                            &middot;
                            <a href="#">Условия использования</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Переключение боковой панели
        window.addEventListener('DOMContentLoaded', event => {
            const sidebarToggle = document.body.querySelector('#sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', event => {
                    event.preventDefault();
                    document.body.classList.toggle('sb-sidenav-toggled');
                    localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
                });
            }
        });
    </script>
    
    @stack('scripts')
</body>
</html> 