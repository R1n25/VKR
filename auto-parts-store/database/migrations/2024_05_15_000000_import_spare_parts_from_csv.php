<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Services\SparePartImportService;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Путь к CSV-файлу
        $csvPath = base_path('prise.csv');
        
        // Создаем экземпляр сервиса импорта
        $importService = new SparePartImportService();
        
        // Запускаем импорт
        $result = $importService->importFromCsv($csvPath);
        
        // Выводим информацию о результате
        if ($result['success']) {
            echo $result['message'] . "\n";
        } else {
            echo "Ошибка импорта: " . $result['message'] . "\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // В случае отката миграции просто выводим сообщение
        echo 'Запчасти остаются в базе данных';
    }
}; 