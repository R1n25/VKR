<?php

namespace App\Services\Catalog;

use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\CarBrand;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExportService
{
    /**
     * Экспортировать запчасти в CSV файл
     *
     * @param string $filePath Путь для сохранения файла
     * @param array $filters Фильтры для выборки запчастей
     * @return string Путь к созданному файлу
     */
    public function exportSpareParts(string $filePath, array $filters = []): string
    {
        try {
            $query = SparePart::query();
            
            // Применяем фильтры, если они есть
            if (!empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }
            
            if (!empty($filters['manufacturer'])) {
                $query->where('manufacturer', 'like', "%{$filters['manufacturer']}%");
            }
            
            // Создаем директорию, если она не существует
            $directory = dirname($filePath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Создаем файл
            $handle = fopen($filePath, 'w');
            
            // Добавляем BOM для UTF-8
            fputs($handle, "\xEF\xBB\xBF");
            
            // Записываем заголовки
            $headers = [
                'part_number',
                'name',
                'description',
                'price',
                'stock_quantity',
                'manufacturer',
                'weight',
                'dimensions',
                'category_id',
                'image',
            ];
            
            // Используем точку с запятой в качестве разделителя
            fputcsv($handle, $headers, ';');
            
            // Записываем данные порциями для экономии памяти
            $query->chunk(100, function ($spareParts) use ($handle) {
                foreach ($spareParts as $part) {
                    $row = [
                        $part->part_number,
                        $part->name,
                        $part->description,
                        $part->price,
                        $part->stock_quantity ?? 0,
                        $part->manufacturer,
                        $part->weight,
                        $part->dimensions,
                        $part->category_id,
                        $part->image,
                    ];
                    
                    // Используем точку с запятой в качестве разделителя
                    fputcsv($handle, $row, ';');
                }
            });
            
            fclose($handle);
            
            Log::info("Экспорт запчастей завершен, файл сохранен: {$filePath}");
            return $filePath;
            
        } catch (\Exception $e) {
            Log::error('Ошибка при экспорте запчастей: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Экспортировать модели автомобилей в CSV файл
     *
     * @param string $filePath Путь для сохранения файла
     * @param array $filters Фильтры для выборки моделей
     * @return string Путь к созданному файлу
     */
    public function exportCarModels(string $filePath, array $filters = []): string
    {
        try {
            $query = CarModel::with('carBrand');
            
            // Применяем фильтры, если они есть
            if (!empty($filters['brand_id'])) {
                $query->where('brand_id', $filters['brand_id']);
            }
            
            if (isset($filters['is_popular'])) {
                $query->where('is_popular', $filters['is_popular']);
            }
            
            // Создаем директорию, если она не существует
            $directory = dirname($filePath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Создаем файл
            $handle = fopen($filePath, 'w');
            
            // Добавляем BOM для UTF-8
            fputs($handle, "\xEF\xBB\xBF");
            
            // Записываем заголовки
            $headers = [
                'brand',
                'model',
                'year_from',
                'year_to',
                'description',
                'is_popular',
                'country',
            ];
            
            // Используем точку с запятой в качестве разделителя
            fputcsv($handle, $headers, ';');
            
            // Записываем данные порциями для экономии памяти
            $query->chunk(100, function ($carModels) use ($handle) {
                foreach ($carModels as $model) {
                    $row = [
                        $model->carBrand->name,
                        $model->name,
                        $model->year_from,
                        $model->year_to,
                        $model->description,
                        $model->is_popular ? '1' : '0',
                        $model->carBrand->country,
                    ];
                    
                    // Используем точку с запятой в качестве разделителя
                    fputcsv($handle, $row, ';');
                }
            });
            
            fclose($handle);
            
            Log::info("Экспорт моделей автомобилей завершен, файл сохранен: {$filePath}");
            return $filePath;
            
        } catch (\Exception $e) {
            Log::error('Ошибка при экспорте моделей автомобилей: ' . $e->getMessage());
            throw $e;
        }
    }
} 