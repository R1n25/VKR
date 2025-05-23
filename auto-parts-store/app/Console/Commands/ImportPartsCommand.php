<?php

namespace App\Console\Commands;

use App\Services\ImportService;
use Illuminate\Console\Command;

class ImportPartsCommand extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'import:parts {file=parts.csv : Путь к CSV-файлу с запчастями}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Импорт запчастей из CSV-файла в базу данных';

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

        $this->info("Начинаем импорт запчастей из файла {$path}");
        
        // Создаем экземпляр сервиса импорта
        $importService = new ImportService();
        
        // Запускаем импорт
        $result = $importService->importPartsFromCsv($path);
        
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