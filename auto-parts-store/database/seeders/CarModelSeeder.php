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
        $toyotaId = DB::table('car_brands')->where('slug', 'toyota')->value('id');
        $bmwId = DB::table('car_brands')->where('slug', 'bmw')->value('id');
        $mercedesId = DB::table('car_brands')->where('slug', 'mercedes-benz')->value('id');
        $audiId = DB::table('car_brands')->where('slug', 'audi')->value('id');
        $volkswagenId = DB::table('car_brands')->where('slug', 'volkswagen')->value('id');
        $hondaId = DB::table('car_brands')->where('slug', 'honda')->value('id');

        $models = [
            // Toyota models
            [
                'brand_id' => $toyotaId,
                'name' => 'Camry',
                'slug' => 'toyota-camry',
                'description' => 'Среднеразмерный автомобиль, один из бестселлеров Toyota.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/2018_Toyota_Camry_%28ASV70R%29_Ascent_sedan_%282018-08-27%29_01.jpg/800px-2018_Toyota_Camry.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $toyotaId,
                'name' => 'Corolla',
                'slug' => 'toyota-corolla',
                'description' => 'Компактный автомобиль, самая продаваемая модель в мире.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2019_Toyota_Corolla_Design_VVT-i_HEV_1.8_Front.jpg/800px-2019_Toyota_Corolla.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // BMW models
            [
                'brand_id' => $bmwId,
                'name' => '3 Series',
                'slug' => 'bmw-3-series',
                'description' => 'Компактный спортивный седан премиум-класса.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/2019_BMW_320d_M_Sport_2.0.jpg/800px-2019_BMW_320d.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $bmwId,
                'name' => 'X5',
                'slug' => 'bmw-x5',
                'description' => 'Среднеразмерный люксовый кроссовер.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_BMW_X5_M50d_Automatic_3.0.jpg/800px-2019_BMW_X5.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Mercedes models
            [
                'brand_id' => $mercedesId,
                'name' => 'E-Class',
                'slug' => 'mercedes-benz-e-class',
                'description' => 'Бизнес-седан премиум-класса.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/2021_Mercedes-Benz_E220d_AMG_Line_Premium_2.0.jpg/800px-2021_Mercedes-Benz_E220d.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $mercedesId,
                'name' => 'S-Class',
                'slug' => 'mercedes-benz-s-class',
                'description' => 'Флагманский седан представительского класса.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2021_Mercedes-Benz_S500_AMG_Line_Premium_Plus_3.0.jpg/800px-2021_Mercedes-Benz_S500.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Audi models
            [
                'brand_id' => $audiId,
                'name' => 'A4',
                'slug' => 'audi-a4',
                'description' => 'Компактный седан премиум-класса.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/2019_Audi_A4_40_TFSI_Sport_2.0.jpg/800px-2019_Audi_A4.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $audiId,
                'name' => 'Q7',
                'slug' => 'audi-q7',
                'description' => 'Полноразмерный люксовый кроссовер.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2020_Audi_Q7_S_Line_50_TDI_Quattro_3.0.jpg/800px-2020_Audi_Q7.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Volkswagen models
            [
                'brand_id' => $volkswagenId,
                'name' => 'Golf',
                'slug' => 'volkswagen-golf',
                'description' => 'Компактный хэтчбек, один из самых успешных автомобилей в истории.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/VW_Golf_VIII_IMG_3951.jpg/800px-VW_Golf_VIII.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $volkswagenId,
                'name' => 'Passat',
                'slug' => 'volkswagen-passat',
                'description' => 'Среднеразмерный семейный автомобиль.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/VW_Passat_B8_Limousine_2.0_TDI_Highline.jpg/800px-VW_Passat_B8.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Honda models
            [
                'brand_id' => $hondaId,
                'name' => 'Civic',
                'slug' => 'honda-civic',
                'description' => 'Компактный автомобиль с отличной управляемостью.',
                'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2022_Honda_Civic_e-HEV_Sport_%28FL%29_in_red%2C_front_right.jpg/800px-2022_Honda_Civic.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'brand_id' => $hondaId,
                'name' => 'CR-V',
                'slug' => 'honda-cr-v',
                'description' => 'Компактный кроссовер для семейного использования.',
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