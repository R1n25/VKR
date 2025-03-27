<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Очищаем таблицу перед вставкой
        DB::table('car_brands')->truncate();

        $brands = [
            [
                'name' => 'Toyota',
                'slug' => 'toyota-motors',
                'country' => 'Япония',
                'description' => 'Японская автомобильная компания, один из крупнейших производителей автомобилей в мире',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'BMW',
                'slug' => 'bmw-motors',
                'country' => 'Германия',
                'description' => 'Bayerische Motoren Werke AG - немецкий производитель автомобилей и мотоциклов премиум класса.',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'Mercedes-Benz',
                'slug' => 'mercedes-benz-auto',
                'country' => 'Германия',
                'description' => 'Немецкий производитель автомобилей премиум-класса, грузовых автомобилей и автобусов.',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'Audi',
                'slug' => 'audi-auto',
                'country' => 'Германия',
                'description' => 'Немецкая автомобилестроительная компания, специализирующаяся на выпуске автомобилей премиум-класса.',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'Volkswagen',
                'slug' => 'volkswagen-auto',
                'country' => 'Германия',
                'description' => 'Немецкий автомобильный концерн, один из крупнейших производителей автомобилей в мире.',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'Honda',
                'slug' => 'honda-auto',
                'country' => 'Япония',
                'description' => 'Японский производитель автомобилей, мотоциклов и силового оборудования.',
                'logo_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
                'vin_required' => true,
            ],
            [
                'name' => 'Bentley',
                'slug' => 'bentley-auto',
                'country' => 'Великобритания',
                'description' => 'Bentley Motors Limited - британский производитель автомобилей класса люкс.',
                'logo_url' => null,
                'vin_required' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bugatti',
                'slug' => 'bugatti-auto',
                'country' => 'Франция',
                'description' => 'Bugatti Automobiles S.A.S. - французский производитель эксклюзивных спортивных автомобилей.',
                'logo_url' => null,
                'vin_required' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cadillac',
                'slug' => 'cadillac-auto',
                'country' => 'США',
                'description' => 'Cadillac - подразделение General Motors, производитель автомобилей класса люкс.',
                'logo_url' => null,
                'vin_required' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Buick',
                'slug' => 'buick-auto',
                'country' => 'США',
                'description' => 'Buick - подразделение General Motors, производитель автомобилей.',
                'logo_url' => null,
                'vin_required' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($brands as $brand) {
            DB::table('car_brands')->insert($brand);
        }
    }
} 