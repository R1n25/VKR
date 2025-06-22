<?php

namespace App\Providers;

use App\Services\Catalog\CatalogManager;
use App\Services\Catalog\ImportService;
use App\Services\Catalog\ExportService;
use Illuminate\Support\ServiceProvider;

class CatalogServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ExportService::class, function ($app) {
            return new ExportService();
        });
        
        $this->app->singleton(ImportService::class, function ($app) {
            return new ImportService(
                $app->make(ExportService::class)
            );
        });
        
        $this->app->singleton(CatalogManager::class, function ($app) {
            return new CatalogManager(
                $app->make(ImportService::class),
                $app->make(ExportService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
} 