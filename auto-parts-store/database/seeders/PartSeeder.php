<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Очищаем таблицу перед вставкой
        DB::table('parts')->truncate();

        // Получаем ID брендов
        $toyotaId = DB::table('car_brands')->where('slug', 'toyota-motors')->value('id');
        $bmwId = DB::table('car_brands')->where('slug', 'bmw-motors')->value('id');
        $hondaId = DB::table('car_brands')->where('slug', 'honda-auto')->value('id');

        // Получаем ID категорий
        $engineId = DB::table('part_categories')->where('slug', 'engine-parts')->value('id');
        $brakeId = DB::table('part_categories')->where('slug', 'brake-system')->value('id');
        $suspensionId = DB::table('part_categories')->where('slug', 'suspension')->value('id');
        $electricalId = DB::table('part_categories')->where('slug', 'electrical')->value('id');
        $filtersId = DB::table('part_categories')->where('slug', 'filters')->value('id');

        // Получаем ID моделей
        $camryId = DB::table('car_models')->where('slug', 'toyota-camry')->value('id');
        $bmw3Id = DB::table('car_models')->where('slug', 'bmw-3-series')->value('id');
        $civicId = DB::table('car_models')->where('slug', 'honda-civic')->value('id');

        $parts = [
            // Запчасти для Toyota Camry
            [
                'name' => 'Воздушный фильтр Toyota Camry 2.5',
                'sku' => 'TOY-AF-2.5-CAM',
                'description' => 'Оригинальный воздушный фильтр для Toyota Camry с двигателем 2.5L. Обеспечивает эффективную защиту двигателя от пыли и загрязнений.',
                'price' => 1500.00,
                'stock' => 50,
                'category_id' => $filtersId,
                'model_id' => $camryId,
                'brand_id' => $toyotaId,
                'image_url' => 'https://example.com/images/toyota-air-filter.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Тормозные колодки передние Toyota Camry',
                'sku' => 'TOY-BP-CAM-F',
                'description' => 'Передние тормозные колодки для Toyota Camry. Обеспечивают эффективное торможение и длительный срок службы.',
                'price' => 3500.00,
                'stock' => 30,
                'category_id' => $brakeId,
                'model_id' => $camryId,
                'brand_id' => $toyotaId,
                'image_url' => 'https://example.com/images/toyota-brake-pads.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Амортизатор передний Toyota Camry',
                'sku' => 'TOY-SH-CAM-F',
                'description' => 'Передний амортизатор для Toyota Camry. Обеспечивает комфортное вождение и отличную управляемость.',
                'price' => 5500.00,
                'stock' => 20,
                'category_id' => $suspensionId,
                'model_id' => $camryId,
                'brand_id' => $toyotaId,
                'image_url' => 'https://example.com/images/toyota-shock.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Запчасти для BMW 3 Series
            [
                'name' => 'Масляный фильтр BMW 3 Series',
                'sku' => 'BMW-OF-3S',
                'description' => 'Оригинальный масляный фильтр для BMW 3 Series. Обеспечивает максимальную защиту двигателя.',
                'price' => 2000.00,
                'stock' => 40,
                'category_id' => $filtersId,
                'model_id' => $bmw3Id,
                'brand_id' => $bmwId,
                'image_url' => 'https://example.com/images/bmw-oil-filter.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Свечи зажигания BMW 3 Series',
                'sku' => 'BMW-SP-3S',
                'description' => 'Комплект свечей зажигания для BMW 3 Series. Обеспечивают оптимальную работу двигателя.',
                'price' => 4500.00,
                'stock' => 25,
                'category_id' => $engineId,
                'model_id' => $bmw3Id,
                'brand_id' => $bmwId,
                'image_url' => 'https://example.com/images/bmw-spark-plugs.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Генератор BMW 3 Series',
                'sku' => 'BMW-ALT-3S',
                'description' => 'Генератор для BMW 3 Series. Обеспечивает надежное электропитание автомобиля.',
                'price' => 25000.00,
                'stock' => 10,
                'category_id' => $electricalId,
                'model_id' => $bmw3Id,
                'brand_id' => $bmwId,
                'image_url' => 'https://example.com/images/bmw-alternator.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Запчасти для Honda Civic
            [
                'name' => 'Топливный фильтр Honda Civic',
                'sku' => 'HON-FF-CIV',
                'description' => 'Топливный фильтр для Honda Civic. Обеспечивает чистоту топлива и защиту топливной системы.',
                'price' => 1800.00,
                'stock' => 35,
                'category_id' => $filtersId,
                'model_id' => $civicId,
                'brand_id' => $hondaId,
                'image_url' => 'https://example.com/images/honda-fuel-filter.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Тормозные диски передние Honda Civic',
                'sku' => 'HON-BD-CIV-F',
                'description' => 'Передние тормозные диски для Honda Civic. Обеспечивают эффективное торможение.',
                'price' => 4500.00,
                'stock' => 15,
                'category_id' => $brakeId,
                'model_id' => $civicId,
                'brand_id' => $hondaId,
                'image_url' => 'https://example.com/images/honda-brake-discs.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Стартер Honda Civic',
                'sku' => 'HON-ST-CIV',
                'description' => 'Стартер для Honda Civic. Обеспечивает надежный запуск двигателя.',
                'price' => 18000.00,
                'stock' => 8,
                'category_id' => $electricalId,
                'model_id' => $civicId,
                'brand_id' => $hondaId,
                'image_url' => 'https://example.com/images/honda-starter.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($parts as $part) {
            DB::table('parts')->insert($part);
        }
    }
}
