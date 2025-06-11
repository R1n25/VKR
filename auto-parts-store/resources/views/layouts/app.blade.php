<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <title>{{ config('app.name', 'Auto Parts Store') }}</title>
        
        <!-- Стили -->
        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        
        <!-- Скрипты -->
        <script src="{{ asset('js/app.js') }}" defer></script>
        
        <!-- Дополнительные стили -->
        @yield('styles')
    </head>
    <body class="bg-gray-100">
        <div id="app">
            @include('parts.header')
            
            <main class="py-4">
                @yield('content')
            </main>
            
            @include('parts.footer')
        </div>
        
        <!-- Дополнительные скрипты -->
        @yield('scripts')
    </body>
</html> 