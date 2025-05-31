<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Основные категории запчастей для автомобилей
        $categories = [
            [
                'name' => 'Двигатель',
                'description' => 'Запчасти для двигателя, включая блоки цилиндров, коленвалы, распредвалы, поршни и др.',
                'parent_id' => null,
            ],
            [
                'name' => 'Трансмиссия',
                'description' => 'Коробки передач, сцепления, карданные валы и другие детали трансмиссии',
                'parent_id' => null,
            ],
            [
                'name' => 'Тормозная система',
                'description' => 'Тормозные диски, колодки, суппорты и другие компоненты тормозной системы',
                'parent_id' => null,
            ],
            [
                'name' => 'Подвеска',
                'description' => 'Амортизаторы, пружины, рычаги, стойки стабилизатора и другие элементы подвески',
                'parent_id' => null,
            ],
            [
                'name' => 'Рулевое управление',
                'description' => 'Рулевые рейки, насосы гидроусилителя, тяги и другие компоненты рулевого управления',
                'parent_id' => null,
            ],
            [
                'name' => 'Электрооборудование',
                'description' => 'Генераторы, стартеры, аккумуляторы, блоки управления, датчики',
                'parent_id' => null,
            ],
            [
                'name' => 'Система охлаждения',
                'description' => 'Радиаторы, термостаты, водяные насосы, расширительные бачки',
                'parent_id' => null,
            ],
            [
                'name' => 'Топливная система',
                'description' => 'Топливные насосы, форсунки, фильтры, топливные баки',
                'parent_id' => null,
            ],
            [
                'name' => 'Система выпуска',
                'description' => 'Глушители, катализаторы, выпускные коллекторы, резонаторы',
                'parent_id' => null,
            ],
            [
                'name' => 'Кузовные детали',
                'description' => 'Капоты, двери, крылья, бамперы и другие элементы кузова',
                'parent_id' => null,
            ],
            [
                'name' => 'Оптика и зеркала',
                'description' => 'Фары, фонари, зеркала заднего вида, стекла для фар',
                'parent_id' => null,
            ],
            [
                'name' => 'Салон',
                'description' => 'Сиденья, панели, приборные щитки, рули и другие элементы интерьера',
                'parent_id' => null,
            ],
            [
                'name' => 'Фильтры',
                'description' => 'Масляные, воздушные, топливные и салонные фильтры',
                'parent_id' => null,
            ],
            [
                'name' => 'Прокладки и уплотнители',
                'description' => 'Прокладки ГБЦ, масляного поддона, клапанной крышки и другие уплотнители',
                'parent_id' => null,
            ],
            [
                'name' => 'Аксессуары',
                'description' => 'Дополнительное оборудование и аксессуары для автомобилей',
                'parent_id' => null,
            ],
        ];

        // Добавляем slug для каждой категории и вставляем записи в БД
        foreach ($categories as $category) {
            DB::table('part_categories')->insert([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'parent_id' => $category['parent_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем все базовые категории
        DB::table('part_categories')->whereIn('name', [
            'Двигатель',
            'Трансмиссия',
            'Тормозная система',
            'Подвеска',
            'Рулевое управление',
            'Электрооборудование',
            'Система охлаждения',
            'Топливная система',
            'Система выпуска',
            'Кузовные детали',
            'Оптика и зеркала',
            'Салон',
            'Фильтры',
            'Прокладки и уплотнители',
            'Аксессуары',
        ])->delete();
    }
};
