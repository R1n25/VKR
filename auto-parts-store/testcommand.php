<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "Запускаем команду для создания администратора...\n";

try {
    $status = $kernel->call('admin:create', [
        '--name' => 'Администратор',
        '--email' => 'admin@autoparts.ru',
        '--password' => 'admin12345'
    ]);
    
    echo "Статус выполнения: " . $status . "\n";
} catch (Exception $e) {
    echo "Ошибка: " . $e->getMessage() . "\n";
}

echo "Завершено.\n"; 