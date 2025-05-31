<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Получаем все категории из базы данных
        $categories = DB::table('part_categories')->get();
        
        // Маппинг для сопоставления текстовых категорий с ID из базы данных
        $categoryMapping = [
            'Двигатель' => $categories->where('name', 'Двигатель')->first()->id ?? null,
            'Трансмиссия' => $categories->where('name', 'Трансмиссия')->first()->id ?? null,
            'Тормозная система' => $categories->where('name', 'Тормозная система')->first()->id ?? null,
            'Подвеска' => $categories->where('name', 'Подвеска')->first()->id ?? null,
            'Рулевое управление' => $categories->where('name', 'Рулевое управление')->first()->id ?? null,
            'Электрооборудование' => $categories->where('name', 'Электрооборудование')->first()->id ?? null,
            'Система охлаждения' => $categories->where('name', 'Система охлаждения')->first()->id ?? null,
            'Топливная система' => $categories->where('name', 'Топливная система')->first()->id ?? null,
            'Система выпуска' => $categories->where('name', 'Система выпуска')->first()->id ?? null,
            'Кузовные детали' => $categories->where('name', 'Кузовные детали')->first()->id ?? null,
            'Оптика и зеркала' => $categories->where('name', 'Оптика и зеркала')->first()->id ?? null,
            'Салон' => $categories->where('name', 'Салон')->first()->id ?? null,
            'Фильтры' => $categories->where('name', 'Фильтры')->first()->id ?? null,
            'Прокладки и уплотнители' => $categories->where('name', 'Прокладки и уплотнители')->first()->id ?? null,
            'Аксессуары' => $categories->where('name', 'Аксессуары')->first()->id ?? null,
            // Дополнительные маппинги для распространенных вариантов наименования категорий
            'Двигатель и комплектующие' => $categories->where('name', 'Двигатель')->first()->id ?? null,
            'Тормоза' => $categories->where('name', 'Тормозная система')->first()->id ?? null,
            'Электрика' => $categories->where('name', 'Электрооборудование')->first()->id ?? null,
            'Кузов' => $categories->where('name', 'Кузовные детали')->first()->id ?? null,
            'Охлаждение' => $categories->where('name', 'Система охлаждения')->first()->id ?? null,
            'Подвеска и рулевое' => $categories->where('name', 'Подвеска')->first()->id ?? null,
            'Фильтра' => $categories->where('name', 'Фильтры')->first()->id ?? null,
        ];
        
        // Получаем все запчасти из базы данных
        $spareParts = DB::table('spare_parts')->select('id', 'category_id')->get();
        
        // Обновляем category_id для каждой запчасти на основе маппинга
        foreach ($spareParts as $part) {
            // Находим дефолтную категорию, если не удается сопоставить
            $defaultCategoryId = $categories->first()->id;
            
            // Устанавливаем ID категории для запчасти (либо из маппинга, либо дефолтное значение)
            DB::table('spare_parts')
                ->where('id', $part->id)
                ->update([
                    'category_id' => $defaultCategoryId,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Откат не требуется, так как мы не можем восстановить старые текстовые категории
    }
};
