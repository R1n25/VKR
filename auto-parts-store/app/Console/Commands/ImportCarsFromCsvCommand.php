<?php

namespace App\Console\Commands;

use App\Services\CarImportService;
use Illuminate\Console\Command;

class ImportCarsFromCsvCommand extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'import:cars {file=csv.csv : Путь к CSV-файлу с автомобилями}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Импорт автомобилей из CSV-файла в базу данных';

    /**
     * Выполнить консольную команду.
     */
    public function handle()
    {
        $path = $this->argument('file');
        
        if (!file_exists($path)) {
            $this->error("Файл {$path} не найден!");
            return 1;
        }

        $this->info("Начинаем импорт из файла {$path}");
        
        // Создаем экземпляр сервиса импорта
        $importService = new CarImportService();
        
        // Запускаем импорт
        $result = $importService->importFromCsv($path);
        
        // Выводим информацию о результате
        if ($result['success']) {
            $this->info($result['message']);
        } else {
            $this->error("Ошибка импорта: " . $result['message']);
            return 1;
        }
        
        return 0;
    }
} 