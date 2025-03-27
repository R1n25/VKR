<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CarBrand;
use Illuminate\Support\Str;

class CarBrandsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Toyota',
                'country' => 'Япония',
                'description' => 'Крупнейший японский автопроизводитель, известный своей надежностью и качеством.',
                'vin_required' => true
            ],
            [
                'name' => 'Honda',
                'country' => 'Япония',
                'description' => 'Японский производитель автомобилей, мотоциклов и силового оборудования.',
                'vin_required' => true
            ],
            [
                'name' => 'Nissan',
                'country' => 'Япония',
                'description' => 'Один из крупнейших японских автопроизводителей с богатой историей.',
                'vin_required' => true
            ],
            [
                'name' => 'BMW',
                'country' => 'Германия',
                'description' => 'Немецкий производитель премиальных автомобилей и мотоциклов.',
                'vin_required' => true
            ],
            [
                'name' => 'Mercedes-Benz',
                'country' => 'Германия',
                'description' => 'Немецкий производитель люксовых автомобилей, грузовиков и автобусов.',
                'vin_required' => true
            ],
            [
                'name' => 'Volkswagen',
                'country' => 'Германия',
                'description' => 'Крупнейший немецкий автопроизводитель, выпускающий массовые модели.',
                'vin_required' => true
            ],
            [
                'name' => 'Audi',
                'country' => 'Германия',
                'description' => 'Немецкий производитель автомобилей премиум-класса.',
                'vin_required' => true
            ],
            [
                'name' => 'Hyundai',
                'country' => 'Южная Корея',
                'description' => 'Крупнейший корейский автопроизводитель с широким модельным рядом.',
                'vin_required' => true
            ],
            [
                'name' => 'KIA',
                'country' => 'Южная Корея',
                'description' => 'Второй по величине автопроизводитель в Южной Корее.',
                'vin_required' => true
            ],
            [
                'name' => 'Ford',
                'country' => 'США',
                'description' => 'Американский производитель автомобилей с более чем вековой историей.',
                'vin_required' => true
            ],
            [
                'name' => 'Chevrolet',
                'country' => 'США',
                'description' => 'Один из крупнейших американских автопроизводителей.',
                'vin_required' => true
            ],
            [
                'name' => 'Renault',
                'country' => 'Франция',
                'description' => 'Крупнейший французский производитель автомобилей.',
                'vin_required' => true
            ],
            [
                'name' => 'Peugeot',
                'country' => 'Франция',
                'description' => 'Французский производитель автомобилей с богатыми традициями.',
                'vin_required' => true
            ],
            [
                'name' => 'Volvo',
                'country' => 'Швеция',
                'description' => 'Шведский производитель премиальных автомобилей, известный своей безопасностью.',
                'vin_required' => true
            ],
            [
                'name' => 'LADA',
                'country' => 'Россия',
                'description' => 'Крупнейший российский производитель легковых автомобилей.',
                'vin_required' => true
            ]
        ];

        foreach ($brands as $brand) {
            CarBrand::create([
                'name' => $brand['name'],
                'country' => $brand['country'],
                'description' => $brand['description'],
                'slug' => Str::slug($brand['name']),
                'vin_required' => $brand['vin_required']
            ]);
        }
    }
}
