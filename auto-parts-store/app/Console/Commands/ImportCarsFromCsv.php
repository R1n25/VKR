<?php

namespace App\Console\Commands;

use App\Services\ImportService;
use Illuminate\Console\Command;

class ImportCarsFromCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:cars-from-csv {file : Путь к CSV файлу с моделями автомобилей}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Импорт моделей автомобилей из CSV файла (через старую реализацию)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');
        
        if (!file_exists($filePath)) {
            $this->error("Файл не найден: {$filePath}");
            return 1;
        }
        
        $this->info("Начинаем импорт моделей автомобилей из файла: {$filePath}");
        
        $importService = new ImportService();
        
        try {
            $result = $importService->importCarsFromCsv($filePath);
            
            if ($result['success']) {
                $this->info($result['message']);
                $this->table(
                    ['Брендов создано', 'Моделей создано'],
                    [[
                        $result['brands_count'],
                        $result['models_count'],
                    ]]
                );
                
                return 0;
            } else {
                $this->error($result['message']);
                return 1;
            }
        } catch (\Exception $e) {
            $this->error('Ошибка при импорте моделей автомобилей:');
            $this->error($e->getMessage());
            
            return 1;
        }
    }
} 