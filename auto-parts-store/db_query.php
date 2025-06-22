<?php

// Параметры подключения к базе данных PostgreSQL
$host = '127.0.0.1';
$port = '5432';
$database = 'auto_parts_store';
$user = 'postgres';
$password = 'rinatik17';

try {
    // Подключаемся к PostgreSQL
    $dsn = "pgsql:host=$host;port=$port;dbname=$database;user=$user;password=$password";
    $conn = new PDO($dsn);
    
    // Устанавливаем режим ошибок PDO на исключения
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Подключение к PostgreSQL успешно!\n\n";
    
    // Подсчет моделей автомобилей
    $queryCount = "SELECT COUNT(*) as total FROM car_models";
    $totalCount = $conn->query($queryCount)->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Всего моделей автомобилей: $totalCount\n";
    
    // Подсчет популярных моделей
    $queryPopularCount = "SELECT COUNT(*) as popular FROM car_models WHERE is_popular = true";
    $popularCount = $conn->query($queryPopularCount)->fetch(PDO::FETCH_ASSOC)['popular'];
    echo "Популярных моделей: $popularCount\n\n";
    
    // Получаем список брендов
    $brandQuery = "SELECT id, name FROM car_brands ORDER BY name";
    $brands = $conn->query($brandQuery)->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Список брендов:\n";
    foreach ($brands as $brand) {
        echo "{$brand['id']}: {$brand['name']}\n";
    }
    echo "\n";
    
    // Получаем список популярных моделей
    $popularModelsQuery = "SELECT cm.id, cm.name, cm.year_start, cm.year_end, cm.generation, cm.body_type, 
                                  cm.engine_type, cm.engine_volume, cm.transmission_type, cm.drive_type, cb.name as brand_name 
                           FROM car_models cm 
                           JOIN car_brands cb ON cm.brand_id = cb.id 
                           WHERE cm.is_popular = true 
                           ORDER BY cb.name, cm.name 
                           LIMIT 20";
    
    $popularModels = $conn->query($popularModelsQuery)->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Популярные модели (первые 20):\n";
    echo str_repeat('-', 100) . "\n";
    echo sprintf("%-5s | %-15s | %-20s | %-15s | %-15s | %-10s\n", 
                "ID", "Бренд", "Модель", "Годы выпуска", "Двигатель", "Тип кузова");
    echo str_repeat('-', 100) . "\n";
    
    foreach ($popularModels as $model) {
        $years = ($model['year_start'] ?? '?') . ' - ' . ($model['year_end'] ? $model['year_end'] : 'н.в.');
        $engine = ($model['engine_type'] ?? '') . ' ' . ($model['engine_volume'] ?? '');
        
        echo sprintf("%-5s | %-15s | %-20s | %-15s | %-15s | %-10s\n", 
                    $model['id'], 
                    $model['brand_name'], 
                    $model['name'], 
                    $years,
                    $engine,
                    $model['body_type'] ?? '');
    }
    
    // Получаем модели, которые можно отметить как популярные
    echo "\n\nТоп-модели для обновления статуса популярности:\n";
    
    $topBrands = [
        'Toyota', 'Honda', 'Kia', 'Hyundai', 'Volkswagen', 'BMW', 'Mercedes', 
        'Audi', 'Lexus', 'Nissan', 'Mazda', 'Ford', 'Mitsubishi', 'Subaru'
    ];
    
    $placeholders = implode(',', array_fill(0, count($topBrands), '?'));
    
    $topModelsQuery = "SELECT cm.id, cm.name, cm.year_start, cm.year_end, cm.generation, 
                              cm.body_type, cm.is_popular, cb.name as brand_name 
                       FROM car_models cm 
                       JOIN car_brands cb ON cm.brand_id = cb.id 
                       WHERE cb.name IN ($placeholders) AND cm.is_popular = false
                       ORDER BY cb.name, cm.name 
                       LIMIT 50";
    
    $stmt = $conn->prepare($topModelsQuery);
    $stmt->execute($topBrands);
    $topModels = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo str_repeat('-', 100) . "\n";
    echo sprintf("%-5s | %-15s | %-20s | %-15s | %-15s | %-10s\n", 
                "ID", "Бренд", "Модель", "Годы выпуска", "Поколение", "Тип кузова");
    echo str_repeat('-', 100) . "\n";
    
    foreach ($topModels as $model) {
        $years = ($model['year_start'] ?? '?') . ' - ' . ($model['year_end'] ? $model['year_end'] : 'н.в.');
        
        echo sprintf("%-5s | %-15s | %-20s | %-15s | %-15s | %-10s\n", 
                    $model['id'], 
                    $model['brand_name'], 
                    $model['name'], 
                    $years,
                    $model['generation'] ?? '',
                    $model['body_type'] ?? '');
    }
    
    // Создаем SQL для обновления статуса популярности
    echo "\n\nSQL для обновления популярных моделей:\n";
    
    $popularModelIds = [
        // Toyota
        "UPDATE car_models SET is_popular = true WHERE name = 'Camry' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Corolla' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota')",
        "UPDATE car_models SET is_popular = true WHERE name = 'RAV4' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Land Cruiser' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Toyota')",
        
        // Honda
        "UPDATE car_models SET is_popular = true WHERE name = 'Civic' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Accord' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda')",
        "UPDATE car_models SET is_popular = true WHERE name = 'CR-V' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Honda')",
        
        // Kia
        "UPDATE car_models SET is_popular = true WHERE name = 'Rio' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Sportage' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Optima' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Ceed' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Kia')",
        
        // Hyundai
        "UPDATE car_models SET is_popular = true WHERE name = 'Solaris' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Creta' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Tucson' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Santa Fe' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Hyundai')",
        
        // Volkswagen
        "UPDATE car_models SET is_popular = true WHERE name = 'Polo' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Volkswagen')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Golf' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Volkswagen')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Passat' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Volkswagen')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Tiguan' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Volkswagen')",
        
        // BMW
        "UPDATE car_models SET is_popular = true WHERE name = '3 series' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW')",
        "UPDATE car_models SET is_popular = true WHERE name = '5 series' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW')",
        "UPDATE car_models SET is_popular = true WHERE name = 'X5' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW')",
        "UPDATE car_models SET is_popular = true WHERE name = 'X3' AND brand_id = (SELECT id FROM car_brands WHERE name = 'BMW')",
        
        // Mercedes
        "UPDATE car_models SET is_popular = true WHERE name = 'E-class' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes')",
        "UPDATE car_models SET is_popular = true WHERE name = 'C-class' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes')",
        "UPDATE car_models SET is_popular = true WHERE name = 'GLE' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mercedes')",
        
        // Audi
        "UPDATE car_models SET is_popular = true WHERE name = 'A4' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi')",
        "UPDATE car_models SET is_popular = true WHERE name = 'A6' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Q5' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Audi')",
        
        // Nissan
        "UPDATE car_models SET is_popular = true WHERE name = 'Qashqai' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Nissan')",
        "UPDATE car_models SET is_popular = true WHERE name = 'X-Trail' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Nissan')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Almera' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Nissan')",
        
        // Ford
        "UPDATE car_models SET is_popular = true WHERE name = 'Focus' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Ford')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Mondeo' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Ford')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Kuga' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Ford')",
        
        // Mazda
        "UPDATE car_models SET is_popular = true WHERE name = 'Mazda3' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mazda')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Mazda6' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mazda')",
        "UPDATE car_models SET is_popular = true WHERE name = 'CX-5' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mazda')",
        
        // Mitsubishi
        "UPDATE car_models SET is_popular = true WHERE name = 'Outlander' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mitsubishi')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Pajero' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mitsubishi')",
        "UPDATE car_models SET is_popular = true WHERE name = 'ASX' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Mitsubishi')",
        
        // VAZ (Lada)
        "UPDATE car_models SET is_popular = true WHERE name = 'Granta' AND brand_id = (SELECT id FROM car_brands WHERE name = 'VAZ')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Vesta' AND brand_id = (SELECT id FROM car_brands WHERE name = 'VAZ')",
        "UPDATE car_models SET is_popular = true WHERE name = 'XRAY' AND brand_id = (SELECT id FROM car_brands WHERE name = 'VAZ')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Largus' AND brand_id = (SELECT id FROM car_brands WHERE name = 'VAZ')",
        
        // Subaru
        "UPDATE car_models SET is_popular = true WHERE name = 'Forester' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Subaru')",
        "UPDATE car_models SET is_popular = true WHERE name = 'Outback' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Subaru')",
        "UPDATE car_models SET is_popular = true WHERE name = 'XV' AND brand_id = (SELECT id FROM car_brands WHERE name = 'Subaru')",
    ];
    
    foreach ($popularModelIds as $sql) {
        echo $sql . ";\n";
    }
    
} catch (PDOException $e) {
    // Выводим сообщение об ошибке
    echo "Ошибка подключения к PostgreSQL: " . $e->getMessage();
} 