<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CatalogImportParts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:import-parts 
                            {file : Путь к CSV файлу с запчастями} 
                            {--no-update : Не обновлять существующие записи} 
                            {--no-backup : Не создавать резервную копию перед импортом}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Импорт запчастей из CSV файла';

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
        
        $this->info("Начинаем импорт запчастей из файла: {$filePath}");
        
        if ($createBackup) {
            $this->info('Создание резервной копии...');
            $backupFile = $catalogManager->backupSpareParts();
            $this->info("Резервная копия создана: {$backupFile}");
        }
        
        $this->info('Импорт запчастей...');
        $this->newLine();
        
        $bar = $this->output->createProgressBar(100);
        $bar->start();
        
        try {
            $stats = $catalogManager->importSpareParts($filePath, $updateExisting, false);
            
            $bar->finish();
            $this->newLine(2);
            
            $this->info('Импорт завершен успешно!');
            $this->table(
                ['Обработано', 'Создано', 'Обновлено', 'Пропущено', 'Ошибки'],
                [[
                    $stats['processed'],
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
            
            $this->error('Ошибка при импорте запчастей:');
            $this->error($e->getMessage());
            
            return 1;
        }
    }
} 