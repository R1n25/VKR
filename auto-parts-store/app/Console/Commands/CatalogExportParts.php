<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogManager;
use Illuminate\Console\Command;

class CatalogExportParts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:export-parts 
                            {--output= : Путь для сохранения файла (по умолчанию - автоматически в storage/app/catalog)} 
                            {--category= : ID категории для фильтрации} 
                            {--manufacturer= : Производитель для фильтрации}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Экспорт запчастей в CSV файл';

    /**
     * Execute the console command.
     */
    public function handle(CatalogManager $catalogManager)
    {
        $outputPath = $this->option('output');
        
        $filters = [];
        
        if ($categoryId = $this->option('category')) {
            $filters['category_id'] = $categoryId;
        }
        
        if ($manufacturer = $this->option('manufacturer')) {
            $filters['manufacturer'] = $manufacturer;
        }
        
        $this->info('Экспорт запчастей...');
        
        try {
            $filePath = $catalogManager->exportSpareParts($outputPath, $filters);
            
            $this->info('Экспорт успешно завершен!');
            $this->info("Файл сохранен: {$filePath}");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Ошибка при экспорте запчастей:');
            $this->error($e->getMessage());
            
            return 1;
        }
    }
} 