<?php

namespace App\Console\Commands;

use App\Models\CarEngine;
use App\Models\SparePart;
use App\Models\PartCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AssignPartsToEngines extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'parts:assign-to-engines 
                            {--engine-id= : ID конкретного двигателя}
                            {--category-id= : ID категории запчастей}
                            {--keyword= : Ключевое слово для поиска в названии запчасти}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Привязка запчастей к двигателям на основе категории и ключевых слов';

    /**
     * Выполнение консольной команды.
     */
    public function handle()
    {
        $engineId = $this->option('engine-id');
        $categoryId = $this->option('category-id');
        $keyword = $this->option('keyword');

        // Получаем запрос для двигателей
        $enginesQuery = CarEngine::query();

        // Фильтруем по ID двигателя, если указан
        if ($engineId) {
            $enginesQuery->where('id', $engineId);
        }

        $engines = $enginesQuery->get();

        if ($engines->isEmpty()) {
            $this->error('Двигатели не найдены.');
            return 1;
        }

        // Получаем запрос для запчастей
        $partsQuery = SparePart::query();

        // Фильтруем по категории, если указана
        if ($categoryId) {
            $category = PartCategory::find($categoryId);
            if (!$category) {
                $this->error('Категория не найдена.');
                return 1;
            }

            $this->info("Выбрана категория: {$category->name}");
            $partsQuery->where('category_id', $categoryId);
        }

        // Фильтруем по ключевому слову, если указано
        if ($keyword) {
            $this->info("Поиск запчастей с ключевым словом: {$keyword}");
            $partsQuery->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('part_number', 'like', "%{$keyword}%");
            });
        }

        $parts = $partsQuery->get();

        if ($parts->isEmpty()) {
            $this->error('Запчасти не найдены.');
            return 1;
        }

        $this->info("Найдено двигателей: {$engines->count()}");
        $this->info("Найдено запчастей: {$parts->count()}");

        $bar = $this->output->createProgressBar($engines->count());
        $bar->start();

        $totalAttached = 0;

        // Привязываем запчасти к двигателям
        foreach ($engines as $engine) {
            $attachedCount = 0;

            foreach ($parts as $part) {
                // Проверяем совместимость на основе модели автомобиля
                $carModel = $engine->carModel;
                
                if (!$carModel) {
                    $this->warn("Для двигателя ID {$engine->id} не найдена модель автомобиля");
                    continue;
                }

                // Проверяем, подходит ли запчасть для модели автомобиля
                $compatibleWithModel = DB::table('car_model_spare_part')
                    ->where('car_model_id', $carModel->id)
                    ->where('spare_part_id', $part->id)
                    ->exists();

                // Если запчасть подходит для модели, связываем её с двигателем
                if ($compatibleWithModel) {
                    // Проверяем, что связь ещё не существует
                    $existingRelation = DB::table('car_engine_spare_part')
                        ->where('car_engine_id', $engine->id)
                        ->where('spare_part_id', $part->id)
                        ->exists();

                    if (!$existingRelation) {
                        $engine->spareParts()->attach($part->id, [
                            'notes' => "Автоматически привязано на основе совместимости с моделью {$carModel->name}"
                        ]);
                        $attachedCount++;
                        $totalAttached++;
                    }
                }
            }

            $this->info(" - Для двигателя {$engine->name} привязано {$attachedCount} запчастей");
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Всего привязано {$totalAttached} запчастей к двигателям.");

        return 0;
    }
} 