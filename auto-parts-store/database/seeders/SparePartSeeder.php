<?php

namespace Database\Seeders;

use App\Models\CarModel;
use App\Models\SparePart;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SparePartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            $this->command->info('Начинаем импорт запчастей...');
            
            // Очищаем таблицы перед заполнением
            DB::table('car_model_spare_part')->truncate();
            DB::table('spare_parts')->truncate();
            
            $this->command->info('Таблицы очищены.');
            
            // Базовые запчасти
            $spareParts = [
                [
                    'name' => 'Воздушный фильтр',
                    'description' => 'Высококачественный воздушный фильтр для оптимальной фильтрации воздуха',
                    'part_number' => 'AF-1234',
                    'price' => 1500,
                    'stock_quantity' => 50,
                    'manufacturer' => 'Bosch',
                    'category' => 'Фильтры',
                ],
                [
                    'name' => 'Масляный фильтр',
                    'description' => 'Высококачественный масляный фильтр для эффективной фильтрации масла',
                    'part_number' => 'OF-5678',
                    'price' => 900,
                    'stock_quantity' => 35,
                    'manufacturer' => 'Mann',
                    'category' => 'Фильтры',
                ],
                [
                    'name' => 'Тормозные колодки передние',
                    'description' => 'Усиленные передние тормозные колодки для надежного торможения',
                    'part_number' => 'BP-9012',
                    'price' => 3500,
                    'stock_quantity' => 20,
                    'manufacturer' => 'Brembo',
                    'category' => 'Тормозная система',
                ],
                [
                    'name' => 'Тормозные колодки задние',
                    'description' => 'Надежные задние тормозные колодки для безопасного торможения',
                    'part_number' => 'BP-9013',
                    'price' => 3200,
                    'stock_quantity' => 18,
                    'manufacturer' => 'Brembo',
                    'category' => 'Тормозная система',
                ],
                [
                    'name' => 'Свечи зажигания',
                    'description' => 'Иридиевые свечи зажигания для улучшенной производительности двигателя',
                    'part_number' => 'SP-3456',
                    'price' => 1800,
                    'stock_quantity' => 40,
                    'manufacturer' => 'NGK',
                    'category' => 'Система зажигания',
                ],
            ];
            
            // Дополняем массив запчастями для объемной базы данных
            $categories = ['Фильтры', 'Тормозная система', 'Система зажигания', 'Подвеска', 'Двигатель', 
                          'Трансмиссия', 'Охлаждение', 'Электрика', 'Кузов', 'Топливная система', 
                          'Система смазки', 'Выхлопная система', 'Рулевое управление', 'Сцепление'];
            $manufacturers = ['Bosch', 'Mann', 'Brembo', 'NGK', 'Sachs', 'Lemforder', 'Valeo', 'ATE', 
                             'Febi', 'Hella', 'Denso', 'Monroe', 'Delphi', 'LUK', 'SKF', 'Gates', 'Mahle',
                             'Magneti Marelli', 'Bilstein', 'KYB', 'Nissens', 'Pierburg', 'Continental'];
            
            $this->command->info('Генерируем объемную базу данных...');
            
            // Дополняем массив еще 500 запчастями для объемной базы данных
            for ($i = 0; $i < 500; $i++) {
                $category = $categories[array_rand($categories)];
                $manufacturer = $manufacturers[array_rand($manufacturers)];
                $price = rand(300, 15000);
                
                $spareParts[] = [
                    'name' => $manufacturer . ' ' . $category . ' ' . rand(1000, 9999),
                    'description' => 'Запчасть ' . $category . ' производства ' . $manufacturer,
                    'part_number' => strtoupper(substr($manufacturer, 0, 2)) . '-' . rand(1000, 9999),
                    'price' => $price,
                    'stock_quantity' => rand(1, 100),
                    'manufacturer' => $manufacturer,
                    'category' => $category,
                ];
            }
            
            $counter = 0;
            $totalParts = count($spareParts);
            
            $this->command->info("Всего запчастей для импорта: {$totalParts}");
            
            $carModels = CarModel::all();
            if ($carModels->isEmpty()) {
                $this->command->error('Нет моделей автомобилей в базе. Пожалуйста, сначала запустите сидер для моделей автомобилей.');
                return;
            }
            
            $this->command->info('Найдено моделей автомобилей: ' . $carModels->count());
            $this->command->info('Импортируем запчасти в базу данных...');
            
            foreach ($spareParts as $partData) {
                try {
                    // Генерируем slug из названия
                    $slug = Str::slug($partData['name']);
                    
                    // Создаем запчасть
                    $sparePart = SparePart::create([
                        'name' => $partData['name'],
                        'slug' => $slug,
                        'description' => $partData['description'],
                        'part_number' => $partData['part_number'],
                        'price' => $partData['price'],
                        'stock_quantity' => $partData['stock_quantity'],
                        'manufacturer' => $partData['manufacturer'],
                        'category' => $partData['category'],
                        'image_url' => null,
                        'is_available' => true,
                    ]);
                    
                    // Получаем случайные модели автомобилей для совместимости
                    $randomModelCount = rand(1, min(3, $carModels->count()));
                    $randomModels = $carModels->random($randomModelCount);
                    
                    // Добавляем связи с моделями автомобилей
                    foreach ($randomModels as $carModel) {
                        $sparePart->carModels()->attach($carModel->id);
                    }
                    
                    $counter++;
                    
                    if ($counter % 5 == 0 || $counter == $totalParts) {
                        $this->command->info("Добавлено {$counter} из {$totalParts} запчастей...");
                    }
                } catch (\Exception $e) {
                    $this->command->error("Ошибка при добавлении запчасти: " . $e->getMessage());
                    Log::error("Ошибка сидера запчастей: " . $e->getMessage());
                }
            }
            
            $this->command->info("Импорт завершен. Добавлено {$counter} запчастей.");
        } catch (\Exception $e) {
            $this->command->error("Общая ошибка: " . $e->getMessage());
            Log::error("Общая ошибка сидера запчастей: " . $e->getMessage());
        }
    }
} 