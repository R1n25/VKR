<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CarBrand;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CarBrandsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Очищаем таблицу перед заполнением
        DB::statement('TRUNCATE car_brands RESTART IDENTITY CASCADE');
        
        // Массив с данными брендов
        $brands = [
            [
                'name' => 'Toyota',
                'country' => 'Япония',
                'description' => 'Крупнейший японский автопроизводитель, известный своей надежностью и качеством.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Honda',
                'country' => 'Япония',
                'description' => 'Японский производитель автомобилей, мотоциклов и силового оборудования.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Nissan',
                'country' => 'Япония',
                'description' => 'Один из крупнейших японских автопроизводителей с богатой историей.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'BMW',
                'country' => 'Германия',
                'description' => 'Немецкий производитель премиальных автомобилей и мотоциклов.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Mercedes-Benz',
                'country' => 'Германия',
                'description' => 'Немецкий производитель легковых автомобилей грузовиков и автобусов.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Volkswagen',
                'country' => 'Германия',
                'description' => 'Крупнейший немецкий автопроизводитель, выпускающий массовые автомобили.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Audi',
                'country' => 'Германия',
                'description' => 'Немецкий производитель автомобилей премиум-класса.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Hyundai',
                'country' => 'Южная Корея',
                'description' => 'Крупнейший корейский автопроизводитель.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Kia',
                'country' => 'Южная Корея',
                'description' => 'Второй по величине автопроизводитель в Южной Корее.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Ford',
                'country' => 'США',
                'description' => 'Американский производитель автомобилей с более чем вековой историей.',
                'vin_required' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Chevrolet',
                'country' => 'США',
                'description' => 'Один из крупнейших американских автопроизводителей.',
                'vin_required' => true,
                'is_popular' => false,
            ],
            [
                'name' => 'Renault',
                'country' => 'Франция',
                'description' => 'Крупнейший французский производитель автомобилей.',
                'vin_required' => true,
                'is_popular' => false,
            ],
            [
                'name' => 'Peugeot',
                'country' => 'Франция',
                'description' => 'Французский производитель автомобилей с богатыми традициями.',
                'vin_required' => true,
                'is_popular' => false,
            ],
            [
                'name' => 'Volvo',
                'country' => 'Швеция',
                'description' => 'Шведский производитель премиальных автомобилей, известный своей безопасностью.',
                'vin_required' => true,
                'is_popular' => false,
            ],
            [
                'name' => 'LADA',
                'country' => 'Россия',
                'description' => 'Крупнейший российский производитель легковых автомобилей.',
                'vin_required' => true,
                'is_popular' => true,
            ],
        ];

        // Добавляем бренды в базу данных
        foreach ($brands as $brand) {
            // Проверяем, существует ли уже бренд с таким именем
            $existingBrand = CarBrand::where('name', $brand['name'])->first();
            
            if (!$existingBrand) {
                CarBrand::create([
                    'name' => $brand['name'],
                    'slug' => Str::slug($brand['name']),
                    'country' => $brand['country'],
                    'description' => $brand['description'],
                    'vin_required' => $brand['vin_required'],
                    'is_popular' => $brand['is_popular'],
                ]);
            }
        }
    }
}
