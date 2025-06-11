<?php

namespace App\Providers;

use App\Services\SparePartService;
use App\Services\SparePartSearchService;
use App\Services\SparePartCompatibilityService;
use App\Services\AnalogService;
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
        // Регистрируем сервисы для работы с запчастями
        $this->app->singleton(SparePartService::class, function ($app) {
            return new SparePartService();
        });
        
        $this->app->singleton(AnalogService::class, function ($app) {
            return new AnalogService();
        });
        
        $this->app->singleton(SparePartSearchService::class, function ($app) {
            return new SparePartSearchService(
                $app->make(SparePartService::class),
                $app->make(AnalogService::class)
            );
        });
        
        $this->app->singleton(SparePartCompatibilityService::class, function ($app) {
            return new SparePartCompatibilityService();
        });
        
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
