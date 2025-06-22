<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ClearCarTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cars:clear {--models-only : Очистить только таблицу моделей}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Очистить таблицы брендов и моделей автомобилей';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            if ($this->option('models-only')) {
                $this->info('Очистка только таблицы моделей автомобилей...');
                DB::statement('TRUNCATE TABLE car_models CASCADE');
                $this->info('Таблица car_models успешно очищена.');
            } else {
                $this->info('Очистка таблиц брендов и моделей автомобилей...');
                
                // Для PostgreSQL используем TRUNCATE CASCADE
                DB::statement('TRUNCATE TABLE car_models CASCADE');
                DB::statement('TRUNCATE TABLE car_brands CASCADE');
                
                $this->info('Таблицы car_brands и car_models успешно очищены.');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Произошла ошибка при очистке таблиц: ' . $e->getMessage());
            Log::error('Ошибка при очистке таблиц автомобилей: ' . $e->getMessage());
            
            return 1;
        }
    }
} 