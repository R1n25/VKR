<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Facades\DB;

// Загружаем окружение Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Функция для распределения запчастей по двигателям с учетом категорий
function assignPartsByCategoriesToEngines() {
    // Получаем все доступные двигатели
    $engines = DB::table('car_engines')->get();
    
    if ($engines->isEmpty()) {
        echo "Двигателей не найдено. Сначала добавьте двигатели в базу.\n";
        return;
    }
    
    // Получаем все категории запчастей
    $categories = DB::table('part_categories')->get();
    
    if ($categories->isEmpty()) {
        echo "Категорий запчастей не найдено. Сначала добавьте категории в базу.\n";
        return;
    }
    
    echo "Найдено двигателей: " . $engines->count() . "\n";
    echo "Найдено категорий: " . $categories->count() . "\n";
    
    // Очищаем существующие связи
    DB::table('car_engine_spare_part')->truncate();
    echo "Очищены существующие связи между двигателями и запчастями.\n";
    
    $totalAssigned = 0;
    
    // Для каждой категории получаем запчасти и распределяем их по двигателям
    foreach ($categories as $category) {
        // Получаем запчасти из текущей категории
        $parts = DB::table('spare_parts')
            ->where('category_id', $category->id)
            ->get();
        
        if ($parts->isEmpty()) {
            echo "В категории '{$category->name}' нет запчастей. Пропускаем.\n";
            continue;
        }
        
        echo "Категория '{$category->name}': найдено {$parts->count()} запчастей.\n";
        
        // Для каждого двигателя привязываем случайное количество запчастей из текущей категории
        foreach ($engines as $engine) {
            // Определяем, сколько запчастей из этой категории привязать к двигателю
            // (от 20% до 80% от общего количества запчастей в категории)
            $totalParts = $parts->count();
            $minParts = max(1, intval($totalParts * 0.2)); // Минимум 20% или хотя бы 1 запчасть
            $maxParts = min($totalParts, intval($totalParts * 0.8)); // Максимум 80% или все запчасти
            $partsToAssign = rand($minParts, $maxParts);
            
            // Случайным образом выбираем запчасти из текущей категории
            $selectedParts = $parts->random(min($partsToAssign, $parts->count()));
            
            $inserted = 0;
            
            // Привязываем выбранные запчасти к текущему двигателю
            foreach ($selectedParts as $part) {
                try {
                    DB::table('car_engine_spare_part')->insert([
                        'car_engine_id' => $engine->id,
                        'spare_part_id' => $part->id,
                        'notes' => "Запчасть из категории '{$category->name}' для двигателя {$engine->name}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $inserted++;
                    $totalAssigned++;
                } catch (\Exception $e) {
                    // Если связь уже существует, пропускаем
                    continue;
                }
            }
            
            $engineName = $engine->name;
            $engineType = $engine->type ?? 'Н/Д';
            $engineVolume = $engine->volume ?? 'Н/Д';
            $enginePower = $engine->power ?? 'Н/Д';
            
            echo "  - Для двигателя {$engineName} ({$engineType}, {$engineVolume} л, {$enginePower} л.с.) привязано {$inserted} запчастей из категории '{$category->name}'\n";
        }
    }
    
    // Считаем общее количество связей
    echo "Всего привязано {$totalAssigned} запчастей к двигателям.\n";
}

// Запускаем функцию
echo "Начинаю распределение запчастей из категорий по двигателям...\n";
assignPartsByCategoriesToEngines();
echo "Готово!\n"; 