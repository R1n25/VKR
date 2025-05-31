<?php

namespace App\Console\Commands;

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetPopularCars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cars:set-popular';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Установить популярные марки и модели автомобилей';

    /**
     * Популярные марки автомобилей
     */
    protected $popularBrands = [
        'Toyota',
        'Honda',
        'Volkswagen',
        'BMW',
        'Mercedes-Benz',
        'Audi',
        'Ford',
        'Nissan',
        'Hyundai',
        'Kia'
    ];

    /**
     * Популярные модели автомобилей по маркам
     */
    protected $popularModels = [
        'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'],
        'Honda' => ['Civic', 'Accord', 'CR-V'],
        'Volkswagen' => ['Golf', 'Passat', 'Tiguan', 'Polo'],
        'BMW' => ['3 Series', '5 Series', 'X5', 'X3'],
        'Mercedes-Benz' => ['C-Class', 'E-Class', 'S-Class', 'GLE'],
        'Audi' => ['A4', 'A6', 'Q5', 'Q7'],
        'Ford' => ['Focus', 'Mustang', 'F-150', 'Explorer'],
        'Nissan' => ['Qashqai', 'X-Trail', 'Juke', 'Leaf'],
        'Hyundai' => ['Solaris', 'Tucson', 'Santa Fe', 'Creta'],
        'Kia' => ['Rio', 'Sportage', 'Optima', 'Sorento']
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем установку популярных марок и моделей автомобилей');
        
        // Устанавливаем популярные марки
        $this->setPopularBrands();
        
        // Устанавливаем популярные модели
        $this->setPopularModels();
        
        $this->info('Установка популярных марок и моделей завершена');
        
        return 0;
    }
    
    /**
     * Установить популярные марки
     */
    protected function setPopularBrands()
    {
        $this->info('Установка популярных марок автомобилей...');
        
        // Сначала сбрасываем все популярные марки
        DB::table('car_brands')->update(['is_popular' => false]);
        
        $counter = 0;
        
        // Устанавливаем популярные марки
        foreach ($this->popularBrands as $brandName) {
            $updated = DB::table('car_brands')
                ->where('name', $brandName)
                ->update(['is_popular' => true]);
            
            if ($updated) {
                $counter++;
                $this->line("- Марка {$brandName} установлена как популярная");
            }
        }
        
        $this->info("Установлено {$counter} популярных марок");
    }
    
    /**
     * Установить популярные модели
     */
    protected function setPopularModels()
    {
        $this->info('Установка популярных моделей автомобилей...');
        
        // Сначала сбрасываем все популярные модели
        DB::table('car_models')->update(['is_popular' => false]);
        
        $counter = 0;
        
        // Устанавливаем популярные модели
        foreach ($this->popularModels as $brandName => $models) {
            // Получаем ID бренда
            $brand = CarBrand::where('name', $brandName)->first();
            
            if ($brand) {
                foreach ($models as $modelName) {
                    $updated = DB::table('car_models')
                        ->where('brand_id', $brand->id)
                        ->where('name', $modelName)
                        ->update(['is_popular' => true]);
                    
                    if ($updated) {
                        $counter++;
                        $this->line("- Модель {$brandName} {$modelName} установлена как популярная");
                    }
                }
            }
        }
        
        $this->info("Установлено {$counter} популярных моделей");
    }
} 