<?php

namespace App\Services;

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Support\Str;

class CarImportService
{
    /**
     * Импортировать автомобили из CSV-файла
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
        
        // Создаем счетчики
        $brandsCount = 0;
        $modelsCount = 0;
        $processedBrands = [];
        
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            // Разделяем строку по разделителю ";"
            $data = explode(';', $line);
            
            // Проверяем, что у нас достаточно данных
            if (count($data) < 4) {
                continue;
            }
            
            $brandName = trim($data[0]);
            $modelName = trim($data[1]);
            $yearFrom = (int)trim($data[2]);
            $yearTo = trim($data[3]) === '-' ? null : (int)trim($data[3]);
            
            // Создаем slug вручную (без использования Str::slug, которому требуется intl)
            $brandSlug = $this->createSlug($brandName);
            
            // Создаем или получаем бренд
            $brand = CarBrand::firstOrCreate(
                ['name' => $brandName],
                [
                    'name' => $brandName,
                    'slug' => $brandSlug,
                    'country' => 'Unknown',
                    'description' => ''
                ]
            );
            
            // Считаем уникальные бренды
            if (!in_array($brandName, $processedBrands)) {
                $brandsCount++;
                $processedBrands[] = $brandName;
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
                $existingModel->year_from = $yearFrom;
                $existingModel->year_to = $yearTo;
                $existingModel->save();
            } else {
                // Создаем новую модель
                $model = CarModel::create([
                    'brand_id' => $brand->id,
                    'name' => $modelName,
                    'slug' => $slug,
                    'description' => '',
                    'year_from' => $yearFrom,
                    'year_to' => $yearTo,
                    'is_popular' => false
                ]);
                
                $modelsCount++;
            }
        }
        
        return [
            'success' => true,
            'message' => "Импорт завершен! Обработано {$brandsCount} брендов и {$modelsCount} моделей.",
            'brands_count' => $brandsCount,
            'models_count' => $modelsCount
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