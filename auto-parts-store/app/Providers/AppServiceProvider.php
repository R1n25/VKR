<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Отключаем логирование запросов в продакшн
        if (!app()->isProduction()) {
            DB::listen(function ($query) {
                if ($query->time > 100) {
                    Log::channel('slow_queries')->info(
                        'Slow query detected',
                        [
                            'sql' => $query->sql,
                            'bindings' => $query->bindings,
                            'time' => $query->time
                        ]
                    );
                }
            });
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Префетч ассетов для ускорения загрузки страниц
        Vite::prefetch(concurrency: 3);
        
        // Оптимизация для быстрой загрузки страниц
        if (app()->isProduction()) {
            \URL::forceScheme('https');
        }
        
        // Установка таймаута для запросов к базе данных
        // чтобы избежать зависания при долгих запросах
        DB::connection()->getPdo()->setAttribute(\PDO::ATTR_TIMEOUT, 10);
    }
}
