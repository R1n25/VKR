<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Загружаем окружение Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Привязка запчастей из разных категорий к двигателям
function linkDiversePartsToEngines() {
    // Получаем все категории
    $categories = DB::table('part_categories')->get();
    echo "Найдено категорий: " . $categories->count() . "\n";
    
    // Получаем все двигатели
    $engines = DB::table('car_engines')->get();
    echo "Найдено двигателей: " . $engines->count() . "\n";
    
    if ($engines->isEmpty()) {
        echo "Двигатели не найдены.\n";
        return;
    }
    
    $totalLinked = 0;
    
    // Для каждой категории привязываем запчасти к двигателям
    foreach ($categories as $category) {
        // Получаем запчасти из этой категории
        $parts = DB::table('spare_parts')
            ->where('category_id', $category->id)
            ->limit(500) // Ограничиваем выборку для производительности
            ->get();
        
        if ($parts->isEmpty()) {
            echo "Категория {$category->name}: запчасти не найдены\n";
            continue;
        }
        
        echo "Категория {$category->name}: найдено {$parts->count()} запчастей\n";
        
        // Для каждого двигателя привязываем несколько случайных запчастей из текущей категории
        foreach ($engines as $engine) {
            // Определяем, сколько запчастей привязать (от 5 до 20% от доступных, но не меньше 3 и не больше 30)
            $partsToLinkCount = min(30, max(3, rand(5, intval($parts->count() * 0.2))));
            
            // Выбираем случайные запчасти для привязки
            $partsToLink = $parts->random(min($partsToLinkCount, $parts->count()));
            
            $linkedCount = 0;
            
            // Привязываем выбранные запчасти к двигателю
            foreach ($partsToLink as $part) {
                // Проверяем, существует ли уже связь
                $exists = DB::table('car_engine_spare_part')
                    ->where('car_engine_id', $engine->id)
                    ->where('spare_part_id', $part->id)
                    ->exists();
                
                if (!$exists) {
                    try {
                        DB::table('car_engine_spare_part')->insert([
                            'car_engine_id' => $engine->id,
                            'spare_part_id' => $part->id,
                            'notes' => "Автоматически привязано из категории {$category->name}",
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $linkedCount++;
                        $totalLinked++;
                    } catch (\Exception $e) {
                        // Игнорируем ошибки дубликатов
                    }
                }
            }
            
            echo "  - Двигатель {$engine->name}: привязано {$linkedCount} запчастей из категории {$category->name}\n";
        }
    }
    
    echo "Всего привязано {$totalLinked} запчастей к двигателям\n";
    
    // Считаем общее количество связей для каждого двигателя
    foreach ($engines as $engine) {
        $count = DB::table('car_engine_spare_part')
            ->where('car_engine_id', $engine->id)
            ->count();
        
        echo "Двигатель {$engine->name}: всего привязано {$count} запчастей\n";
    }
}

// Запускаем функцию
echo "Начинаем привязку запчастей из разных категорий к двигателям...\n";
linkDiversePartsToEngines();
echo "Готово!\n"; 