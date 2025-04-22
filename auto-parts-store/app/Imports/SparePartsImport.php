<?php

namespace App\Imports;

use App\Models\SparePart;
use App\Models\CarModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SparePartsImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Проверяем, что в строке есть необходимые данные
            if (empty($row['name']) || empty($row['artikul'])) {
                continue;
            }

            // Генерируем slug из названия с добавлением части номера детали для уникальности
            $baseSlug = Str::slug($row['name']);
            $uniqueSlugPart = Str::substr(preg_replace('/[^a-zA-Z0-9]/', '', $row['artikul']), 0, 8);
            $slug = $baseSlug . '-' . $uniqueSlugPart;

            // Создаем запчасть
            $sparePart = SparePart::create([
                'name' => $row['name'] ?? 'Неизвестная запчасть',
                'slug' => $slug,
                'description' => $row['description'] ?? 'Описание отсутствует',
                'part_number' => $row['artikul'] ?? null,
                'price' => $row['price'] ?? rand(500, 10000),
                'stock_quantity' => $row['quantity'] ?? rand(1, 50),
                'manufacturer' => $row['manufacturer'] ?? 'Неизвестный производитель',
                'category' => $row['category'] ?? 'Общая категория',
                'image_url' => $row['image'] ?? null,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Получаем случайные модели автомобилей для совместимости
            $carModels = CarModel::inRandomOrder()->limit(rand(1, 5))->get();
            
            // Добавляем связи с моделями автомобилей
            foreach ($carModels as $carModel) {
                $sparePart->carModels()->attach($carModel->id);
            }
        }
    }
} 