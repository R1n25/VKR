<?php

namespace App\Providers;

use App\Console\Commands\ScrapeAutoPartsCommand;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Регистрируем команду для парсинга запчастей
        if ($this->app->runningInConsole()) {
            $this->commands([
                ScrapeAutoPartsCommand::class,
            ]);
        }
    }
}
