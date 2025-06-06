<?php

// Скрипт для добавления категорий запчастей через Laravel

// Загружаем приложение Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PartCategory;
use Illuminate\Support\Str;

echo "Добавление категорий запчастей...\n";

// Очистка таблицы категорий (раскомментируйте, если нужно)
// PartCategory::truncate();
// echo "Таблица категорий очищена.\n";

// Основные категории запчастей
$mainCategories = [
    [
        'name' => 'Двигатель',
        'description' => 'Запчасти для двигателя автомобиля',
        'children' => [
            ['name' => 'Блок цилиндров', 'description' => 'Блоки цилиндров и комплектующие'],
            ['name' => 'Головка блока цилиндров', 'description' => 'ГБЦ и комплектующие'],
            ['name' => 'Поршневая группа', 'description' => 'Поршни, кольца, пальцы'],
            ['name' => 'Система смазки', 'description' => 'Масляные насосы, фильтры, радиаторы'],
            ['name' => 'Система охлаждения', 'description' => 'Радиаторы, термостаты, помпы'],
        ]
    ],
    [
        'name' => 'Трансмиссия',
        'description' => 'Запчасти для трансмиссии автомобиля',
        'children' => [
            ['name' => 'Сцепление', 'description' => 'Корзины, диски, выжимные подшипники'],
            ['name' => 'Коробка передач', 'description' => 'Запчасти для МКПП и АКПП'],
            ['name' => 'Карданная передача', 'description' => 'Карданные валы и крестовины'],
        ]
    ],
    [
        'name' => 'Подвеска',
        'description' => 'Запчасти для подвески автомобиля',
        'children' => [
            ['name' => 'Передняя подвеска', 'description' => 'Амортизаторы, пружины, рычаги'],
            ['name' => 'Задняя подвеска', 'description' => 'Амортизаторы, пружины, рычаги'],
            ['name' => 'Ступицы и подшипники', 'description' => 'Ступичные узлы и подшипники'],
        ]
    ],
    [
        'name' => 'Рулевое управление',
        'description' => 'Запчасти для рулевого управления',
        'children' => [
            ['name' => 'Рулевые механизмы', 'description' => 'Рулевые рейки, редукторы'],
            ['name' => 'Рулевые тяги', 'description' => 'Рулевые тяги и наконечники'],
        ]
    ],
    [
        'name' => 'Тормозная система',
        'description' => 'Запчасти для тормозной системы',
        'children' => [
            ['name' => 'Тормозные диски', 'description' => 'Передние и задние тормозные диски'],
            ['name' => 'Тормозные колодки', 'description' => 'Передние и задние тормозные колодки'],
        ]
    ],
    [
        'name' => 'Электрооборудование',
        'description' => 'Электрические компоненты автомобиля',
        'children' => [
            ['name' => 'Система зажигания', 'description' => 'Свечи, катушки, провода зажигания'],
            ['name' => 'Генераторы и стартеры', 'description' => 'Генераторы, стартеры и комплектующие'],
        ]
    ],
    [
        'name' => 'Кузовные детали',
        'description' => 'Запчасти для кузова автомобиля',
        'children' => [
            ['name' => 'Капот и крылья', 'description' => 'Капоты, крылья, бамперы'],
            ['name' => 'Двери', 'description' => 'Двери и комплектующие'],
        ]
    ],
    [
        'name' => 'Салон',
        'description' => 'Запчасти для салона автомобиля',
        'children' => [
            ['name' => 'Сиденья', 'description' => 'Сиденья и комплектующие'],
            ['name' => 'Панель приборов', 'description' => 'Панели приборов и накладки'],
        ]
    ],
    [
        'name' => 'Расходные материалы',
        'description' => 'Расходные материалы для обслуживания',
        'children' => [
            ['name' => 'Масла и жидкости', 'description' => 'Моторные масла, трансмиссионные масла, тормозные жидкости'],
            ['name' => 'Фильтры', 'description' => 'Масляные, воздушные, топливные, салонные фильтры'],
        ]
    ],
    [
        'name' => 'Аксессуары',
        'description' => 'Автомобильные аксессуары',
        'children' => [
            ['name' => 'Коврики', 'description' => 'Салонные и багажные коврики'],
            ['name' => 'Чехлы', 'description' => 'Чехлы для сидений'],
        ]
    ],
];

// Создаем категории
$totalCategories = 0;
foreach ($mainCategories as $mainCategory) {
    $children = $mainCategory['children'] ?? [];
    unset($mainCategory['children']);
    
    // Создаем основную категорию
    $mainCategory['slug'] = Str::slug($mainCategory['name']);
    $parent = PartCategory::create($mainCategory);
    $totalCategories++;
    
    echo "Создана категория: {$parent->name}\n";
    
    // Создаем подкатегории
    foreach ($children as $child) {
        $child['slug'] = Str::slug($child['name']);
        $child['parent_id'] = $parent->id;
        PartCategory::create($child);
        $totalCategories++;
        
        echo "  - Создана подкатегория: {$child['name']}\n";
    }
}

echo "\nВсего создано категорий: {$totalCategories}\n";
echo "Готово!\n"; 