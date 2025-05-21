<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Services\CarBrandModelImportService;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Путь к CSV-файлу
        $csvPath = base_path('csv.csv');
        
        // Создаем экземпляр сервиса импорта
        $importService = new CarBrandModelImportService();
        
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
        // В случае отката миграции ничего не делаем
        // Марки и модели остаются в базе данных
        echo "Марки и модели автомобилей остаются в базе данных.\n";
    }
}; 