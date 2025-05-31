<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogManager;
use Illuminate\Console\Command;

class CatalogImportCars extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:import-cars 
                            {file : Путь к CSV файлу с моделями автомобилей} 
                            {--no-update : Не обновлять существующие записи} 
                            {--no-backup : Не создавать резервную копию перед импортом}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Импорт моделей автомобилей из CSV файла';

    /**
     * Execute the console command.
     */
    public function handle(CatalogManager $catalogManager)
    {
        $filePath = $this->argument('file');
        $updateExisting = !$this->option('no-update');
        $createBackup = !$this->option('no-backup');
        
        if (!file_exists($filePath)) {
            $this->error("Файл не найден: {$filePath}");
            return 1;
        }
        
        $this->info("Начинаем импорт моделей автомобилей из файла: {$filePath}");
        
        if ($createBackup) {
            $this->info('Создание резервной копии...');
            $backupFile = $catalogManager->backupCarModels();
            $this->info("Резервная копия создана: {$backupFile}");
        }
        
        $this->info('Импорт моделей автомобилей...');
        $this->newLine();
        
        $bar = $this->output->createProgressBar(100);
        $bar->start();
        
        try {
            $stats = $catalogManager->importCarModels($filePath, $updateExisting, false);
            
            $bar->finish();
            $this->newLine(2);
            
            $this->info('Импорт завершен успешно!');
            $this->table(
                ['Обработано', 'Брендов создано', 'Моделей создано', 'Моделей обновлено', 'Пропущено', 'Ошибки'],
                [[
                    $stats['processed'],
                    $stats['brands_created'],
                    $stats['created'],
                    $stats['updated'],
                    $stats['skipped'],
                    $stats['errors'],
                ]]
            );
            
            return 0;
        } catch (\Exception $e) {
            $bar->finish();
            $this->newLine(2);
            
            $this->error('Ошибка при импорте моделей автомобилей:');
            $this->error($e->getMessage());
            
            return 1;
        }
    }
} 