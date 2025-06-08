<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Загружаем окружение Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Запчасти из категории "Тормозные диски"
function linkBrakeDiscsToEngine() {
    // Находим ID категории "Тормозные диски"
    $category = DB::table('part_categories')
        ->where('name', 'like', '%Тормозные диски%')
        ->orWhere('name', 'like', '%тормозные диски%')
        ->first();
    
    if (!$category) {
        echo "Категория 'Тормозные диски' не найдена.\n";
        
        // Получаем все категории для справки
        echo "Доступные категории:\n";
        $categories = DB::table('part_categories')->get();
        foreach ($categories as $cat) {
            echo "- {$cat->id}: {$cat->name}\n";
        }
        return;
    }
    
    echo "Найдена категория: {$category->name} (ID: {$category->id})\n";
    
    // Получаем запчасти из этой категории
    $brakeParts = DB::table('spare_parts')
        ->where('category_id', $category->id)
        ->get();
    
    if ($brakeParts->isEmpty()) {
        echo "Запчасти в категории 'Тормозные диски' не найдены.\n";
        return;
    }
    
    echo "Найдено {$brakeParts->count()} запчастей в категории 'Тормозные диски'.\n";
    
    // Получаем двигатель Audi A6 3.0L TFSI 340 л.с.
    $engine = DB::table('car_engines')
        ->where('name', 'like', '%3.0L TFSI%')
        ->where('power', 340)
        ->first();
    
    if (!$engine) {
        echo "Двигатель '3.0L TFSI 340 л.с.' не найден.\n";
        
        // Поиск по другим параметрам
        $engines = DB::table('car_engines')
            ->where('name', 'like', '%3.0L%')
            ->orWhere('name', 'like', '%TFSI%')
            ->orWhere('power', 340)
            ->get();
        
        if ($engines->isNotEmpty()) {
            echo "Найдены похожие двигатели:\n";
            foreach ($engines as $eng) {
                echo "- {$eng->id}: {$eng->name} ({$eng->power} л.с.)\n";
            }
            
            // Используем первый найденный двигатель
            $engine = $engines->first();
            echo "Используем двигатель: {$engine->name} (ID: {$engine->id})\n";
        } else {
            echo "Не найдены похожие двигатели. Получаем список всех двигателей:\n";
            $allEngines = DB::table('car_engines')->get();
            foreach ($allEngines as $eng) {
                echo "- {$eng->id}: {$eng->name} ({$eng->power} л.с.)\n";
            }
            
            // Используем первый доступный двигатель
            $engine = $allEngines->first();
            echo "Используем первый доступный двигатель: {$engine->name} (ID: {$engine->id})\n";
        }
    } else {
        echo "Найден двигатель: {$engine->name} (ID: {$engine->id})\n";
    }
    
    // Привязываем все тормозные диски к выбранному двигателю
    $attachedCount = 0;
    foreach ($brakeParts as $part) {
        // Проверяем, существует ли уже связь
        $exists = DB::table('car_engine_spare_part')
            ->where('car_engine_id', $engine->id)
            ->where('spare_part_id', $part->id)
            ->exists();
        
        if (!$exists) {
            DB::table('car_engine_spare_part')->insert([
                'car_engine_id' => $engine->id,
                'spare_part_id' => $part->id,
                'notes' => "Привязано для демонстрации",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $attachedCount++;
        }
    }
    
    echo "Привязано {$attachedCount} запчастей из категории 'Тормозные диски' к двигателю {$engine->name}.\n";
    
    // Проверяем общее количество связей для этого двигателя
    $totalLinks = DB::table('car_engine_spare_part')
        ->where('car_engine_id', $engine->id)
        ->count();
    
    echo "Всего запчастей, привязанных к двигателю {$engine->name}: {$totalLinks}.\n";
}

// Запускаем функцию
echo "Начинаем привязку тормозных дисков к двигателю...\n";
linkBrakeDiscsToEngine();
echo "Готово!\n"; 