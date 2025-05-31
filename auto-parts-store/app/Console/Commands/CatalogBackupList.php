<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogManager;
use Illuminate\Console\Command;

class CatalogBackupList extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalog:backup-list 
                            {--type=all : Тип резервных копий (all, spare_parts, car_models)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Просмотр списка резервных копий каталогов';

    /**
     * Execute the console command.
     */
    public function handle(CatalogManager $catalogManager)
    {
        $type = $this->option('type');
        $validTypes = ['all', 'spare_parts', 'car_models'];
        
        if (!in_array($type, $validTypes)) {
            $this->error('Недопустимый тип резервных копий. Допустимые значения: ' . implode(', ', $validTypes));
            return 1;
        }
        
        $this->info('Получение списка резервных копий...');
        
        $backups = $catalogManager->getBackupsList($type);
        
        if (empty($backups)) {
            $this->info('Резервные копии не найдены.');
            return 0;
        }
        
        $rows = [];
        foreach ($backups as $backup) {
            $rows[] = [
                $backup['name'],
                $backup['date'],
                $backup['size'],
                $backup['path'],
            ];
        }
        
        $this->table(
            ['Имя файла', 'Дата создания', 'Размер', 'Путь'],
            $rows
        );
        
        return 0;
    }
} 