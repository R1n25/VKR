<?php

namespace App\Services;

use App\Models\CarBrand;
use App\Models\CarModel;
use App\Models\SparePart;
use Illuminate\Support\Str;

class ImportService
{
    /**
     * Импортировать автомобили из CSV-файла
     * 
     * @param string $filePath Путь к CSV-файлу
     * @return array Результат импорта: ['success' => bool, 'message' => string, 'brands_count' => int, 'models_count' => int]
     */
    public function importCarsFromCsv(string $filePath): array
    {
        try {
            // Создаем лог-файл
            $logFile = storage_path('logs/import_cars_' . date('Y-m-d_H-i-s') . '.log');
            file_put_contents($logFile, "Начало импорта: " . date('Y-m-d H:i:s') . "\n");
            
            if (!file_exists($filePath)) {
                file_put_contents($logFile, "Файл {$filePath} не найден!\n", FILE_APPEND);
                return [
                    'success' => false,
                    'message' => "Файл {$filePath} не найден!",
                    'brands_count' => 0,
                    'models_count' => 0
                ];
            }
            
            // Получаем содержимое файла и конвертируем из Windows-1251 в UTF-8
            $content = file_get_contents($filePath);
            file_put_contents($logFile, "Файл прочитан, размер: " . strlen($content) . " байт\n", FILE_APPEND);
            $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1251');
            
            // Разбиваем на строки
            $lines = explode("\n", $content);
            file_put_contents($logFile, "Количество строк: " . count($lines) . "\n", FILE_APPEND);
            
            // Пропускаем заголовок
            $header = array_shift($lines);
            file_put_contents($logFile, "Заголовок: " . $header . "\n", FILE_APPEND);
            
            // Создаем счетчики
            $brandsCount = 0;
            $modelsCount = 0;
            $processedBrands = [];
            $lineNumber = 1;
            
            foreach ($lines as $line) {
                $lineNumber++;
                if (empty(trim($line))) {
                    continue;
                }
                
                // Разделяем строку по разделителю ","
                $data = explode(',', $line);
                
                // Проверяем, что у нас достаточно данных
                if (count($data) < 4) {
                    file_put_contents($logFile, "Строка {$lineNumber}: недостаточно данных: " . $line . "\n", FILE_APPEND);
                    continue;
                }
                
                $brandName = trim($data[0]);
                $modelName = trim($data[1]);
                $yearFrom = (int)trim($data[2]);
                $yearTo = isset($data[3]) && trim($data[3]) !== '-' ? (int)trim($data[3]) : null;
                $country = isset($data[4]) ? trim($data[4]) : 'Unknown';
                $isPopular = isset($data[5]) ? (trim($data[5]) === 'true') : false;
                
                file_put_contents($logFile, "Строка {$lineNumber}: Бренд: {$brandName}, Модель: {$modelName}\n", FILE_APPEND);
                
                // Создаем slug вручную (без использования Str::slug, которому требуется intl)
                $brandSlug = $this->createSlug($brandName);
                
                // Проверяем существование slug и создаем уникальный при необходимости
                $counter = 1;
                $originalSlug = $brandSlug;
                while (CarBrand::where('slug', $brandSlug)->where('name', '!=', $brandName)->exists()) {
                    $brandSlug = $originalSlug . '-' . $counter;
                    $counter++;
                }
                
                // Ищем бренд по имени
                $brand = CarBrand::where('name', $brandName)->first();
                
                if (!$brand) {
                    // Создаем новый бренд, если не существует
                    $brand = CarBrand::create([
                        'name' => $brandName,
                        'slug' => $brandSlug,
                        'country' => $country,
                        'description' => '',
                        'is_popular' => $isPopular
                    ]);
                    
                    file_put_contents($logFile, "Строка {$lineNumber}: Создан бренд ID:{$brand->id}\n", FILE_APPEND);
                    
                    // Считаем уникальные бренды
                    if (!in_array($brandName, $processedBrands)) {
                        $brandsCount++;
                        $processedBrands[] = $brandName;
                    }
                } else {
                    file_put_contents($logFile, "Строка {$lineNumber}: Найден существующий бренд ID:{$brand->id}\n", FILE_APPEND);
                }
                
                // Создаем базовый slug
                $baseSlug = $this->createSlug($brandName . '-' . $modelName);
                $slug = $baseSlug;
                
                // Проверяем существование slug и создаем уникальный при необходимости
                $counter = 1;
                while (CarModel::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                // Проверяем, существует ли уже модель с таким именем у этого бренда
                $existingModel = CarModel::where('brand_id', $brand->id)
                    ->where('name', $modelName)
                    ->first();
                    
                if ($existingModel) {
                    // Если модель уже существует, обновляем ее данные
                    $existingModel->year_start = $yearFrom;
                    $existingModel->year_end = $yearTo;
                    $existingModel->is_popular = $isPopular;
                    $existingModel->save();
                    
                    file_put_contents($logFile, "Строка {$lineNumber}: Обновлена модель ID:{$existingModel->id}\n", FILE_APPEND);
                } else {
                    try {
                        // Создаем новую модель
                        $model = CarModel::create([
                            'brand_id' => $brand->id,
                            'name' => $modelName,
                            'slug' => $slug,
                            'description' => '',
                            'year_start' => $yearFrom,
                            'year_end' => $yearTo,
                            'is_popular' => $isPopular
                        ]);
                        
                        file_put_contents($logFile, "Строка {$lineNumber}: Создана модель ID:{$model->id}\n", FILE_APPEND);
                        $modelsCount++;
                    } catch (\Exception $e) {
                        file_put_contents($logFile, "Строка {$lineNumber}: Ошибка при создании модели: " . $e->getMessage() . "\n", FILE_APPEND);
                    }
                }
            }
            
            file_put_contents($logFile, "Импорт завершен. Брендов: {$brandsCount}, Моделей: {$modelsCount}\n", FILE_APPEND);
            
            return [
                'success' => true,
                'message' => "Импорт завершен! Обработано {$brandsCount} брендов и {$modelsCount} моделей.",
                'brands_count' => $brandsCount,
                'models_count' => $modelsCount
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => "Ошибка при импорте: " . $e->getMessage(),
                'brands_count' => 0,
                'models_count' => 0
            ];
        }
    }
    
    /**
     * Импортировать запчасти из CSV-файла
     * 
     * @param string $filePath Путь к CSV-файлу
     * @return array Результат импорта: ['success' => bool, 'message' => string, 'count' => int]
     */
    public function importPartsFromCsv(string $filePath): array
    {
        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'message' => "Файл {$filePath} не найден!",
                'count' => 0
            ];
        }
        
        // Получаем содержимое файла и конвертируем из Windows-1251 в UTF-8
        $content = file_get_contents($filePath);
        $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1251');
        
        // Разбиваем на строки
        $lines = explode("\n", $content);
        
        // Пропускаем заголовок
        $header = array_shift($lines);
        
        // Создаем счетчик для отображения прогресса
        $counter = 0;
        
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            // Разделяем строку по разделителю ";"
            $data = explode(';', $line);
            
            // Проверяем, что у нас достаточно данных
            if (count($data) < 5) {
                continue;
            }
            
            $manufacturer = trim($data[0]);
            $partNumber = trim($data[1]);
            $name = trim($data[2]);
            $quantity = (int)trim($data[3]);
            $price = (float)str_replace(' ', '', trim($data[4]));
            
            // Формируем slug
            $slug = Str::slug($name . '-' . $partNumber);
            
            // Проверяем, существует ли уже запчасть с таким part_number
            $sparePart = SparePart::where('part_number', $partNumber)->first();
            
            if ($sparePart) {
                // Обновляем существующую запчасть
                $sparePart->update([
                    'stock_quantity' => $quantity,
                    'price' => $price,
                    'is_available' => $quantity > 0,
                ]);
            } else {
                // Создаем новую запчасть
                SparePart::create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $name,
                    'part_number' => $partNumber,
                    'price' => $price,
                    'stock_quantity' => $quantity,
                    'manufacturer' => $manufacturer,
                    'category' => 'Запчасти', // Категория по умолчанию
                    'is_available' => $quantity > 0,
                ]);
            }
            
            $counter++;
        }
        
        return [
            'success' => true,
            'message' => "Импорт завершен! Обработано {$counter} запчастей.",
            'count' => $counter
        ];
    }
    
    /**
     * Создать slug из строки без использования Str::slug (не требует intl)
     * 
     * @param string $string Исходная строка
     * @return string Slug
     */
    private function createSlug(string $string): string
    {
        // Удаляем кавычки и другие специальные символы
        $string = str_replace(['"', "'", '«', '»'], '', $string);
        
        // Приводим к нижнему регистру
        $string = mb_strtolower($string, 'UTF-8');
        
        // Заменяем кириллицу на латиницу
        $converter = [
            'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd',
            'е' => 'e', 'ё' => 'e', 'ж' => 'zh', 'з' => 'z', 'и' => 'i',
            'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm', 'н' => 'n',
            'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
            'у' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch',
            'ш' => 'sh', 'щ' => 'sch', 'ъ' => '', 'ы' => 'y', 'ь' => '',
            'э' => 'e', 'ю' => 'yu', 'я' => 'ya'
        ];
        
        $string = strtr($string, $converter);
        
        // Заменяем все символы, кроме букв и цифр, на дефис
        $string = preg_replace('/[^a-z0-9]+/', '-', $string);
        
        // Удаляем начальные и конечные дефисы
        $string = trim($string, '-');
        
        return $string;
    }
} 