<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$count = DB::table('spare_parts')->count();
fwrite(STDERR, "Количество запчастей: " . $count . "\n");

$relationCount = DB::table('car_model_spare_part')->count();
fwrite(STDERR, "Количество связей: " . $relationCount . "\n");

// Выведем конкретные запчасти
$parts = DB::table('spare_parts')->select('name', 'part_number', 'manufacturer', 'category', 'price')->get();
fwrite(STDERR, "\nСписок запчастей:\n");
foreach ($parts as $part) {
    fwrite(STDERR, "- {$part->name} ({$part->part_number}): {$part->price} ₽\n");
} 