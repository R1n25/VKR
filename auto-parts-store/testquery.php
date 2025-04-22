<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Выполняем простой запрос для подсчета записей
$count = \DB::table('spare_parts')->count();
fwrite(STDERR, "Количество запчастей в базе данных: " . $count . PHP_EOL);

// Пробуем получить несколько запчастей
$parts = \DB::table('spare_parts')->take(5)->get();
fwrite(STDERR, "Первые 5 запчастей:" . PHP_EOL);
foreach ($parts as $part) {
    fwrite(STDERR, "- " . $part->name . " (" . $part->part_number . ")" . PHP_EOL);
}

// Проверяем связи с моделями автомобилей
$relationsCount = \DB::table('car_model_spare_part')->count();
fwrite(STDERR, "Количество связей между запчастями и моделями: " . $relationsCount . PHP_EOL);

// Выводим статистику по категориям
$categories = \DB::table('spare_parts')
    ->select('category', \DB::raw('count(*) as count'))
    ->groupBy('category')
    ->orderBy('count', 'desc')
    ->get();

fwrite(STDERR, "Распределение запчастей по категориям:" . PHP_EOL);
foreach ($categories as $category) {
    fwrite(STDERR, "- " . $category->category . ": " . $category->count . PHP_EOL);
} 