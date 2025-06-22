<?php

// Путь к исходному файлу
$inputFile = __DIR__ . '/csv.csv';
// Путь к выходному файлу
$outputFile = __DIR__ . '/cars_converted.csv';

// Проверяем наличие исходного файла
if (!file_exists($inputFile)) {
    die("Исходный файл не найден: {$inputFile}\n");
}

// Открываем файлы
$input = fopen($inputFile, 'r');
$output = fopen($outputFile, 'w');

// Записываем заголовки
fputcsv($output, ['brand', 'model', 'year_from', 'year_to', 'country', 'is_popular']);

// Обрабатываем каждую строку
while (($row = fgetcsv($input, 0, ';')) !== false) {
    // Проверяем, что есть достаточно данных
    if (count($row) >= 4) {
        $brand = trim($row[0]);
        $model = trim($row[1]);
        $yearFrom = trim($row[2]);
        $yearTo = trim($row[3]);
        
        // Определяем страну-производителя (упрощенно)
        $country = '';
        
        // Популярные бренды из Японии
        if (in_array($brand, ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Lexus', 'Infiniti', 'Acura'])) {
            $country = 'Japan';
        }
        // Популярные бренды из США
        elseif (in_array($brand, ['Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Cadillac', 'Chrysler', 'GMC', 'Lincoln', 'Buick', 'Tesla'])) {
            $country = 'USA';
        }
        // Популярные бренды из Германии
        elseif (in_array($brand, ['Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Opel'])) {
            $country = 'Germany';
        }
        // Популярные бренды из Кореи
        elseif (in_array($brand, ['Hyundai', 'Kia', 'Daewoo', 'SsangYong'])) {
            $country = 'South Korea';
        }
        // Популярные бренды из Франции
        elseif (in_array($brand, ['Renault', 'Peugeot', 'Citroen', 'Bugatti'])) {
            $country = 'France';
        }
        // Популярные бренды из Италии
        elseif (in_array($brand, ['Fiat', 'Alfa Romeo', 'Ferrari', 'Lamborghini', 'Maserati'])) {
            $country = 'Italy';
        }
        // Популярные бренды из Великобритании
        elseif (in_array($brand, ['Jaguar', 'Land Rover', 'Bentley', 'Aston Martin', 'Mini', 'Rolls-Royce'])) {
            $country = 'UK';
        }
        // Популярные бренды из Швеции
        elseif (in_array($brand, ['Volvo', 'Saab'])) {
            $country = 'Sweden';
        }
        // Популярные бренды из Китая
        elseif (in_array($brand, ['Geely', 'Chery', 'Haval', 'Great Wall', 'BYD'])) {
            $country = 'China';
        }
        // По умолчанию - другие
        else {
            $country = 'Other';
        }
        
        // Определяем популярность (упрощенно - наиболее распространенные бренды)
        $isPopular = in_array($brand, [
            'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi',
            'Ford', 'Chevrolet', 'Volkswagen', 'BMW', 'Mercedes-Benz',
            'Audi', 'Hyundai', 'Kia', 'Renault', 'Peugeot'
        ]) ? 'true' : 'false';
        
        // Записываем строку в выходной файл
        fputcsv($output, [$brand, $model, $yearFrom, $yearTo, $country, $isPopular]);
    }
}

// Закрываем файлы
fclose($input);
fclose($output);

echo "Конвертация завершена. Новый файл создан: {$outputFile}\n"; 