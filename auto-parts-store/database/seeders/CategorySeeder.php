<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Очищаем таблицу перед вставкой
        DB::table('part_categories')->truncate();

        $categories = [
            [
                'name' => 'Двигатель',
                'slug' => 'engine-parts',
                'description' => 'Детали двигателя, включая поршни, клапаны, прокладки и другие компоненты.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Car_engine.jpg/800px-Car_engine.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Тормозная система',
                'slug' => 'brake-system',
                'description' => 'Тормозные диски, колодки, суппорты и другие компоненты тормозной системы.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Disk_brake_dsc03680.jpg/800px-Disk_brake.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Подвеска',
                'slug' => 'suspension',
                'description' => 'Амортизаторы, пружины, рычаги и другие элементы подвески.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Car_suspension.jpg/800px-Car_suspension.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Трансмиссия',
                'slug' => 'transmission',
                'description' => 'Компоненты коробки передач, сцепления и других элементов трансмиссии.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Manual_transmission.jpg/800px-Manual_transmission.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Электрика',
                'slug' => 'electrical',
                'description' => 'Генераторы, стартеры, датчики и другие электрические компоненты.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Car_battery.jpg/800px-Car_battery.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Кузовные детали',
                'slug' => 'body-parts',
                'description' => 'Бамперы, крылья, капоты и другие элементы кузова.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Car_body_parts.jpg/800px-Car_body_parts.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Система охлаждения',
                'slug' => 'cooling-system',
                'description' => 'Радиаторы, термостаты, помпы и другие компоненты системы охлаждения.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Car_radiator.jpg/800px-Car_radiator.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Топливная система',
                'slug' => 'fuel-system',
                'description' => 'Топливные насосы, форсунки, фильтры и другие элементы топливной системы.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Fuel_injection.jpg/800px-Fuel_injection.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Выхлопная система',
                'slug' => 'exhaust-system',
                'description' => 'Глушители, катализаторы и другие компоненты выхлопной системы.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Exhaust_system.jpg/800px-Exhaust_system.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Фильтры',
                'slug' => 'filters',
                'description' => 'Воздушные, масляные, топливные и салонные фильтры.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Car_filters.jpg/800px-Car_filters.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($categories as $category) {
            DB::table('part_categories')->insert($category);
        }
    }
} 