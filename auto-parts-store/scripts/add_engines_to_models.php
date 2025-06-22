<?php

require __DIR__.'/../vendor/autoload.php';

// Загрузка .env и конфигурации Laravel
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

// Функция для создания slug
function createSlug($modelId, $name) {
    return $modelId . '-' . Str::slug($name);
}

// Массив с данными двигателей для популярных моделей
$engineData = [
    // Toyota Camry
    [
        'model_name' => 'Camry',
        'brand_id' => 1822, // Toyota
        'engines' => [
            [
                'name' => '2.0L 150 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 150,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для Toyota Camry'
            ],
            [
                'name' => '2.5L 181 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.5',
                'power' => 181,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Стандартный бензиновый двигатель для Toyota Camry'
            ],
            [
                'name' => '3.5L V6 249 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.5',
                'power' => 249,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный V6 двигатель для Toyota Camry'
            ],
            [
                'name' => '2.5L Hybrid 218 л.с.',
                'type' => 'гибрид',
                'volume' => '2.5',
                'power' => 218,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Toyota Camry'
            ]
        ]
    ],
    
    // Toyota Corolla
    [
        'model_name' => 'Corolla',
        'brand_id' => 1822, // Toyota
        'engines' => [
            [
                'name' => '1.6L 122 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.6',
                'power' => 122,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для Toyota Corolla'
            ],
            [
                'name' => '1.8L 140 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.8',
                'power' => 140,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Средний бензиновый двигатель для Toyota Corolla'
            ],
            [
                'name' => '2.0L 170 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 170,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для Toyota Corolla'
            ],
            [
                'name' => '1.8L Hybrid 122 л.с.',
                'type' => 'гибрид',
                'volume' => '1.8',
                'power' => 122,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Toyota Corolla'
            ]
        ]
    ],
    
    // Toyota RAV4
    [
        'model_name' => 'RAV4',
        'brand_id' => 1822, // Toyota
        'engines' => [
            [
                'name' => '2.0L 149 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 149,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для Toyota RAV4'
            ],
            [
                'name' => '2.5L 199 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.5',
                'power' => 199,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для Toyota RAV4'
            ],
            [
                'name' => '2.5L Hybrid 218 л.с.',
                'type' => 'гибрид',
                'volume' => '2.5',
                'power' => 218,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Toyota RAV4'
            ]
        ]
    ],
    
    // Toyota Land Cruiser
    [
        'model_name' => 'Land Cruiser',
        'brand_id' => 1822, // Toyota
        'engines' => [
            [
                'name' => '3.3L Diesel 299 л.с.',
                'type' => 'дизельный',
                'volume' => '3.3',
                'power' => 299,
                'year_start' => 2020,
                'year_end' => null,
                'description' => 'Дизельный двигатель для Toyota Land Cruiser'
            ],
            [
                'name' => '3.5L V6 Twin-Turbo 415 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.5',
                'power' => 415,
                'year_start' => 2020,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для Toyota Land Cruiser'
            ],
            [
                'name' => '4.0L V6 275 л.с.',
                'type' => 'бензиновый',
                'volume' => '4.0',
                'power' => 275,
                'year_start' => 2018,
                'year_end' => 2021,
                'description' => 'Классический V6 для Toyota Land Cruiser'
            ],
            [
                'name' => '4.6L V8 309 л.с.',
                'type' => 'бензиновый',
                'volume' => '4.6',
                'power' => 309,
                'year_start' => 2018,
                'year_end' => 2021,
                'description' => 'V8 двигатель для Toyota Land Cruiser'
            ]
        ]
    ],
    
    // Honda Civic
    [
        'model_name' => 'Civic',
        'brand_id' => 1823, // Honda
        'engines' => [
            [
                'name' => '1.5L Turbo 182 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.5',
                'power' => 182,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Турбированный двигатель для Honda Civic'
            ],
            [
                'name' => '2.0L 158 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 158,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый атмосферный двигатель для Honda Civic'
            ],
            [
                'name' => '2.0L Type R 320 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 320,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Спортивный двигатель для Honda Civic Type R'
            ]
        ]
    ],
    
    // Honda Accord
    [
        'model_name' => 'Accord',
        'brand_id' => 41, // Honda
        'engines' => [
            [
                'name' => '1.5L Turbo 192 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.5',
                'power' => 192,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый турбированный двигатель для Honda Accord'
            ],
            [
                'name' => '2.0L Turbo 252 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 252,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный турбированный двигатель для Honda Accord'
            ],
            [
                'name' => '2.0L Hybrid 212 л.с.',
                'type' => 'гибрид',
                'volume' => '2.0',
                'power' => 212,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Honda Accord'
            ]
        ]
    ],
    
    // BMW 3 series
    [
        'model_name' => '3 series',
        'brand_id' => 9, // BMW
        'engines' => [
            [
                'name' => '1.5L 136 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.5',
                'power' => 136,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для BMW 3-й серии'
            ],
            [
                'name' => '2.0L 184 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 184,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Средний бензиновый двигатель для BMW 3-й серии'
            ],
            [
                'name' => '2.0L 258 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 258,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для BMW 3-й серии'
            ],
            [
                'name' => '3.0L 374 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.0',
                'power' => 374,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Топовый бензиновый двигатель для BMW 3-й серии'
            ],
            [
                'name' => '2.0L Diesel 190 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 190,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель для BMW 3-й серии'
            ]
        ]
    ],
    
    // BMW 5 series
    [
        'model_name' => '5 series',
        'brand_id' => 9, // BMW
        'engines' => [
            [
                'name' => '2.0L 190 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 190,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для BMW 5-й серии'
            ],
            [
                'name' => '2.0L 252 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 252,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для BMW 5-й серии'
            ],
            [
                'name' => '3.0L 340 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.0',
                'power' => 340,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Топовый бензиновый двигатель для BMW 5-й серии'
            ],
            [
                'name' => '4.4L V8 530 л.с.',
                'type' => 'бензиновый',
                'volume' => '4.4',
                'power' => 530,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'V8 двигатель для BMW 5-й серии M5'
            ],
            [
                'name' => '2.0L Diesel 190 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 190,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель для BMW 5-й серии'
            ],
            [
                'name' => '3.0L Diesel 286 л.с.',
                'type' => 'дизельный',
                'volume' => '3.0',
                'power' => 286,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный дизельный двигатель для BMW 5-й серии'
            ],
            [
                'name' => '2.0L Hybrid 292 л.с.',
                'type' => 'гибрид',
                'volume' => '2.0',
                'power' => 292,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для BMW 5-й серии'
            ]
        ]
    ],
    
    // Mercedes-Benz E-Class
    [
        'model_name' => 'E-Class',
        'brand_id' => 1825, // Mercedes-Benz
        'engines' => [
            [
                'name' => '2.0L 197 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 197,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель для Mercedes-Benz E-Class'
            ],
            [
                'name' => '2.0L 258 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 258,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель для Mercedes-Benz E-Class'
            ],
            [
                'name' => '3.0L 367 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.0',
                'power' => 367,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Топовый бензиновый двигатель для Mercedes-Benz E-Class'
            ],
            [
                'name' => '4.0L V8 612 л.с.',
                'type' => 'бензиновый',
                'volume' => '4.0',
                'power' => 612,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'V8 двигатель для Mercedes-Benz E63 AMG'
            ],
            [
                'name' => '2.0L Diesel 194 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 194,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель для Mercedes-Benz E-Class'
            ],
            [
                'name' => '3.0L Diesel 286 л.с.',
                'type' => 'дизельный',
                'volume' => '3.0',
                'power' => 286,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный дизельный двигатель для Mercedes-Benz E-Class'
            ],
            [
                'name' => '2.0L Hybrid 320 л.с.',
                'type' => 'гибрид',
                'volume' => '2.0',
                'power' => 320,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Mercedes-Benz E-Class'
            ]
        ]
    ],
    
    // Audi A6
    [
        'model_name' => 'A6',
        'brand_id' => 4, // Audi
        'engines' => [
            [
                'name' => '2.0L TFSI 245 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 245,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Базовый бензиновый двигатель TFSI для Audi A6'
            ],
            [
                'name' => '3.0L TFSI 340 л.с.',
                'type' => 'бензиновый',
                'volume' => '3.0',
                'power' => 340,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный бензиновый двигатель TFSI для Audi A6'
            ],
            [
                'name' => '2.0L TDI 204 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 204,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель TDI для Audi A6'
            ],
            [
                'name' => '3.0L TDI 286 л.с.',
                'type' => 'дизельный',
                'volume' => '3.0',
                'power' => 286,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Мощный дизельный двигатель TDI для Audi A6'
            ],
            [
                'name' => '2.0L TFSI Hybrid 299 л.с.',
                'type' => 'гибрид',
                'volume' => '2.0',
                'power' => 299,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Гибридная установка для Audi A6'
            ]
        ]
    ],
    
    // Kia Sportage
    [
        'model_name' => 'Sportage',
        'brand_id' => 54, // Kia
        'engines' => [
            [
                'name' => '1.6L T-GDI 177 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.6',
                'power' => 177,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Турбированный бензиновый двигатель для Kia Sportage'
            ],
            [
                'name' => '2.0L 150 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 150,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Атмосферный бензиновый двигатель для Kia Sportage'
            ],
            [
                'name' => '2.0L CRDi 186 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 186,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель для Kia Sportage'
            ],
            [
                'name' => '1.6L T-GDI Hybrid 230 л.с.',
                'type' => 'гибрид',
                'volume' => '1.6',
                'power' => 230,
                'year_start' => 2020,
                'year_end' => null,
                'description' => 'Гибридная установка для Kia Sportage'
            ]
        ]
    ],
    
    // Hyundai Tucson
    [
        'model_name' => 'Tucson',
        'brand_id' => 44, // Hyundai
        'engines' => [
            [
                'name' => '1.6L T-GDI 177 л.с.',
                'type' => 'бензиновый',
                'volume' => '1.6',
                'power' => 177,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Турбированный бензиновый двигатель для Hyundai Tucson'
            ],
            [
                'name' => '2.0L 150 л.с.',
                'type' => 'бензиновый',
                'volume' => '2.0',
                'power' => 150,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Атмосферный бензиновый двигатель для Hyundai Tucson'
            ],
            [
                'name' => '2.0L CRDi 186 л.с.',
                'type' => 'дизельный',
                'volume' => '2.0',
                'power' => 186,
                'year_start' => 2018,
                'year_end' => null,
                'description' => 'Дизельный двигатель для Hyundai Tucson'
            ],
            [
                'name' => '1.6L T-GDI Hybrid 230 л.с.',
                'type' => 'гибрид',
                'volume' => '1.6',
                'power' => 230,
                'year_start' => 2020,
                'year_end' => null,
                'description' => 'Гибридная установка для Hyundai Tucson'
            ]
        ]
    ]
];

echo "Начинаем добавление двигателей для популярных моделей...\n";

// Счетчики
$totalModels = 0;
$totalEngines = 0;
$skippedEngines = 0;

// Обрабатываем каждую модель и добавляем двигатели
foreach ($engineData as $modelData) {
    // Находим модель по имени и ID бренда
    $model = DB::table('car_models')
        ->where('name', $modelData['model_name'])
        ->where('brand_id', $modelData['brand_id'])
        ->first();
    
    if (!$model) {
        echo "Модель не найдена: {$modelData['model_name']} (ID бренда: {$modelData['brand_id']})\n";
        continue;
    }
    
    $totalModels++;
    echo "Обрабатываем модель: {$modelData['model_name']} (ID: {$model->id})\n";
    
    // Добавляем двигатели для модели
    foreach ($modelData['engines'] as $engine) {
        // Проверяем, существует ли уже такой двигатель
        $existingEngine = DB::table('car_engines')
            ->where('model_id', $model->id)
            ->where('name', $engine['name'])
            ->first();
        
        if ($existingEngine) {
            echo "  - Двигатель уже существует: {$engine['name']}\n";
            $skippedEngines++;
            continue;
        }
        
        // Добавляем новый двигатель с уникальным slug, включающим ID модели
        $engineId = DB::table('car_engines')->insertGetId([
            'model_id' => $model->id,
            'name' => $engine['name'],
            'slug' => createSlug($model->id, $engine['name']),
            'type' => $engine['type'],
            'volume' => $engine['volume'],
            'power' => $engine['power'],
            'year_start' => $engine['year_start'],
            'year_end' => $engine['year_end'],
            'description' => $engine['description'],
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        $totalEngines++;
        echo "  + Добавлен двигатель: {$engine['name']} (ID: {$engineId})\n";
    }
}

echo "\nГотово!\n";
echo "Обработано моделей: {$totalModels}\n";
echo "Добавлено двигателей: {$totalEngines}\n";
echo "Пропущено (уже существуют): {$skippedEngines}\n"; 