<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CarModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Очищаем таблицу перед вставкой
        DB::table('car_models')->truncate();

        // Получаем ID брендов
        $toyotaId = DB::table('car_brands')->where('slug', 'toyota-motors')->value('id');
        $bmwId = DB::table('car_brands')->where('slug', 'bmw-motors')->value('id');
        $mercedesId = DB::table('car_brands')->where('slug', 'mercedes-benz-auto')->value('id');
        $audiId = DB::table('car_brands')->where('slug', 'audi-auto')->value('id');
        $volkswagenId = DB::table('car_brands')->where('slug', 'volkswagen-auto')->value('id');
        $hondaId = DB::table('car_brands')->where('slug', 'honda-auto')->value('id');

        $models = [
            // Toyota models
            [
                'brand_id' => $toyotaId,
                'name' => 'Camry',
                'slug' => 'toyota-camry',
                'years' => '1982-present',
                'description' => 'Среднеразмерный автомобиль, один из бестселлеров Toyota.',
                'engines' => '2.0L I4, 2.5L I4, 3.5L V6',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/800px-2018_Toyota_Camry.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $toyotaId,
                'name' => 'Corolla',
                'slug' => 'toyota-corolla',
                'years' => '1966-present',
                'description' => 'Компактный автомобиль, самая продаваемая модель в мире.',
                'engines' => '1.6L I4, 1.8L I4, 2.0L I4',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2019_Toyota_Corolla_Design_VVT-i_HEV_1.8_Front.jpg/800px-2019_Toyota_Corolla.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // BMW models
            [
                'brand_id' => $bmwId,
                'name' => '3 Series',
                'slug' => 'bmw-3-series',
                'years' => '1975-present',
                'description' => 'Компактный спортивный седан премиум-класса.',
                'engines' => '2.0L I4, 3.0L I6, 3.0L I6 Turbo',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2019_BMW_320d_M_Sport_2.0.jpg/800px-2019_BMW_320d.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $bmwId,
                'name' => 'X5',
                'slug' => 'bmw-x5',
                'years' => '1999-present',
                'description' => 'Среднеразмерный люксовый кроссовер.',
                'engines' => '3.0L I6, 4.4L V8, 3.0L I6 Diesel',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_BMW_X5_M50d_Automatic_3.0.jpg/800px-2019_BMW_X5.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Mercedes models
            [
                'brand_id' => $mercedesId,
                'name' => 'E-Class',
                'slug' => 'mercedes-e-class',
                'years' => '1953-present',
                'description' => 'Бизнес-седан премиум-класса.',
                'engines' => '2.0L I4, 3.0L I6, 4.0L V8',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/2021_Mercedes-Benz_E220d_AMG_Line_Premium_2.0.jpg/800px-2021_Mercedes-Benz_E220d.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $mercedesId,
                'name' => 'S-Class',
                'slug' => 'mercedes-s-class',
                'years' => '1972-present',
                'description' => 'Флагманский седан представительского класса.',
                'engines' => '3.0L I6, 4.0L V8, 6.0L V12',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2021_Mercedes-Benz_S500_AMG_Line_Premium_Plus_3.0.jpg/800px-2021_Mercedes-Benz_S500.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Audi models
            [
                'brand_id' => $audiId,
                'name' => 'A4',
                'slug' => 'audi-a4',
                'years' => '1994-present',
                'description' => 'Компактный седан премиум-класса.',
                'engines' => '2.0L I4, 3.0L V6',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/2019_Audi_A4_40_TFSI_Sport_2.0.jpg/800px-2019_Audi_A4.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $audiId,
                'name' => 'Q7',
                'slug' => 'audi-q7',
                'years' => '2005-present',
                'description' => 'Полноразмерный люксовый кроссовер.',
                'engines' => '3.0L V6, 4.0L V8',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2020_Audi_Q7_S_Line_50_TDI_Quattro_3.0.jpg/800px-2020_Audi_Q7.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Volkswagen models
            [
                'brand_id' => $volkswagenId,
                'name' => 'Golf',
                'slug' => 'volkswagen-golf',
                'years' => '1974-present',
                'description' => 'Компактный хэтчбек, один из самых успешных автомобилей в истории.',
                'engines' => '1.4L I4, 2.0L I4, 2.0L I4 Turbo',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/VW_Golf_VIII_IMG_3951.jpg/800px-VW_Golf_VIII.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $volkswagenId,
                'name' => 'Passat',
                'slug' => 'volkswagen-passat',
                'years' => '1973-present',
                'description' => 'Среднеразмерный семейный автомобиль.',
                'engines' => '1.8L I4, 2.0L I4, 2.0L TDI',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/VW_Passat_B8_Limousine_2.0_TDI_Highline.jpg/800px-VW_Passat_B8.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Honda models
            [
                'brand_id' => $hondaId,
                'name' => 'Civic',
                'slug' => 'honda-civic',
                'years' => '1972-present',
                'description' => 'Компактный автомобиль с отличной управляемостью.',
                'engines' => '1.5L I4 Turbo, 2.0L I4',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2022_Honda_Civic_e-HEV_Sport_%28FL%29_in_red%2C_front_right.jpg/800px-2022_Honda_Civic.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $hondaId,
                'name' => 'CR-V',
                'slug' => 'honda-cr-v',
                'years' => '1995-present',
                'description' => 'Компактный кроссовер для семейного использования.',
                'engines' => '1.5L I4 Turbo, 2.0L I4 Hybrid',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2019_Honda_CR-V_EX_AWD_2.0L%2C_front_11.30.19.jpg/800px-2019_Honda_CR-V.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($models as $model) {
            DB::table('car_models')->insert($model);
        }
    }
} 