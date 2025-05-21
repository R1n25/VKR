<?php

namespace App\Services;

use App\Models\SparePart;
use Illuminate\Support\Str;

class SparePartImportService
{
    /**
     * Импортировать запчасти из CSV-файла
     * 
     * @param string $filePath Путь к CSV-файлу
     * @return array Результат импорта: ['success' => bool, 'message' => string, 'count' => int]
     */
    public function importFromCsv(string $filePath): array
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
} 