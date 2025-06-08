<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Support\Facades\DB;

// Загружаем окружение Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Функция для случайного распределения запчастей по двигателям
function assignRandomPartsToEngines() {
    // Получаем все доступные двигатели
    $engines = DB::table('car_engines')->get();
    
    if ($engines->isEmpty()) {
        echo "Двигателей не найдено. Сначала добавьте двигатели в базу.\n";
        return;
    }
    
    // Получаем все доступные запчасти
    $parts = DB::table('spare_parts')->get();
    
    if ($parts->isEmpty()) {
        echo "Запчастей не найдено. Сначала добавьте запчасти в базу.\n";
        return;
    }
    
    echo "Найдено двигателей: " . $engines->count() . "\n";
    echo "Найдено запчастей: " . $parts->count() . "\n";
    
    // Для каждого двигателя привязываем случайное количество запчастей
    foreach ($engines as $engine) {
        // Очищаем существующие связи для этого двигателя
        DB::table('car_engine_spare_part')->where('car_engine_id', $engine->id)->delete();
        
        // Определяем, сколько запчастей привяжем к этому двигателю (от 10 до 30)
        $partsToAssign = rand(10, 30);
        
        // Случайным образом выбираем запчасти
        $selectedParts = $parts->random($partsToAssign);
        
        $inserted = 0;
        
        // Привязываем выбранные запчасти к текущему двигателю
        foreach ($selectedParts as $part) {
            try {
                DB::table('car_engine_spare_part')->insert([
                    'car_engine_id' => $engine->id,
                    'spare_part_id' => $part->id,
                    'notes' => "Автоматически привязано для двигателя {$engine->name}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $inserted++;
            } catch (\Exception $e) {
                // Если связь уже существует, пропускаем
                continue;
            }
        }
        
        $engineName = $engine->name;
        $engineType = $engine->type;
        $engineVolume = $engine->volume;
        $enginePower = $engine->power;
        
        echo "Для двигателя {$engineName} ({$engineType}, {$engineVolume}, {$enginePower} л.с.) привязано {$inserted} запчастей\n";
    }
    
    // Считаем общее количество связей
    $totalAssigned = DB::table('car_engine_spare_part')->count();
    echo "Всего привязано {$totalAssigned} запчастей к двигателям.\n";
}

// Запускаем функцию
echo "Начинаю привязку запчастей к двигателям...\n";
assignRandomPartsToEngines();
echo "Готово!\n"; 