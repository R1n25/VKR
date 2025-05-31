<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogManager;
use Illuminate\Console\Command;

class CatalogExportCars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:export-cars 
                            {--output= : Путь для сохранения файла (по умолчанию - автоматически в storage/app/catalog)} 
                            {--brand= : ID бренда для фильтрации} 
                            {--popular : Только популярные модели}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Экспорт моделей автомобилей в CSV файл';

    /**
     * Execute the console command.
     */
    public function handle(CatalogManager $catalogManager)
    {
        $outputPath = $this->option('output');
        
        $filters = [];
        
        if ($brandId = $this->option('brand')) {
            $filters['brand_id'] = $brandId;
        }
        
        if ($this->option('popular')) {
            $filters['is_popular'] = true;
        }
        
        $this->info('Экспорт моделей автомобилей...');
        
        try {
            $filePath = $catalogManager->exportCarModels($outputPath, $filters);
            
            $this->info('Экспорт успешно завершен!');
            $this->info("Файл сохранен: {$filePath}");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Ошибка при экспорте моделей автомобилей:');
            $this->error($e->getMessage());
            
            return 1;
        }
    }
} 