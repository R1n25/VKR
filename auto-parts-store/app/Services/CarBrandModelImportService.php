<?php

namespace App\Services;

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Support\Str;

class CarBrandModelImportService
{
    /**
     * Импортировать марки и модели автомобилей из CSV-файла
     * 
     * @param string $filePath Путь к CSV-файлу
     * @return array Результат импорта: ['success' => bool, 'message' => string, 'brands_count' => int, 'models_count' => int]
     */
    public function importFromCsv(string $filePath): array
    {
        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'message' => "Файл {$filePath} не найден!",
                'brands_count' => 0,
                'models_count' => 0
            ];
        }
        
        // Получаем содержимое файла и конвертируем из Windows-1251 в UTF-8
        $content = file_get_contents($filePath);
        $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1251');
        
        // Разбиваем на строки
        $lines = explode("\n", $content);
        
        // Счетчики
        $brandsCount = 0;
        $modelsCount = 0;
        
        // Массив для хранения уникальных марок
        $uniqueBrands = [];
        
        // Обрабатываем каждую строку
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            // Разделяем строку по разделителю ";"
            $data = explode(';', $line);
            
            // Проверяем, что у нас есть хотя бы бренд и модель
            if (count($data) < 2) {
                continue;
            }
            
            $brand = trim($data[0]);
            $model = trim($data[1]);
            
            // Получаем годы выпуска, если указаны
            $startYear = isset($data[2]) && !empty($data[2]) ? trim($data[2]) : null;
            $endYear = isset($data[3]) && !empty($data[3]) && $data[3] !== '-' ? trim($data[3]) : null;
            
            // Если еще не обрабатывали эту марку
            if (!isset($uniqueBrands[$brand])) {
                // Создаем или обновляем запись о марке
                $brandModel = CarBrand::firstOrCreate(
                    ['name' => $brand],
                    [
                        'slug' => Str::slug($brand),
                        'is_popular' => in_array($brand, ['Audi', 'BMW', 'Mercedes', 'Toyota', 'Volkswagen', 'Kia', 'Hyundai', 'Nissan', 'Renault', 'Ford'])
                    ]
                );
                
                $uniqueBrands[$brand] = $brandModel->id;
                
                if ($brandModel->wasRecentlyCreated) {
                    $brandsCount++;
                }
            }
            
            // Создаем или обновляем запись о модели
            $brandId = $uniqueBrands[$brand];
            
            $modelData = [
                'name' => $model,
                'slug' => Str::slug($model),
                'brand_id' => $brandId
            ];
            
            // Добавляем годы выпуска, если они есть
            if ($startYear) {
                $modelData['start_year'] = $startYear;
            }
            
            if ($endYear) {
                $modelData['end_year'] = $endYear;
            }
            
            $carModel = CarModel::firstOrCreate(
                ['name' => $model, 'brand_id' => $brandId],
                $modelData
            );
            
            if ($carModel->wasRecentlyCreated) {
                $modelsCount++;
            }
        }
        
        return [
            'success' => true,
            'message' => "Импорт завершен! Обработано {$brandsCount} марок и {$modelsCount} моделей автомобилей.",
            'brands_count' => $brandsCount,
            'models_count' => $modelsCount
        ];
    }
} 