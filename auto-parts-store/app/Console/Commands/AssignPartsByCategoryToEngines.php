<?php

namespace App\Console\Commands;

use App\Models\CarEngine;
use App\Models\SparePart;
use App\Models\PartCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AssignPartsByCategoryToEngines extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'parts:assign-by-category 
                            {--engine-type= : Тип двигателя (бензиновый, дизельный, гибрид, электро)}
                            {--category-slug= : Slug категории запчастей}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Привязка запчастей к двигателям на основе категории и типа двигателя';

    /**
     * Карта соответствия категорий типам двигателей
     *
     * @var array
     */
    protected $categoryToEngineType = [
        // Категории для бензиновых двигателей
        'filters' => ['бензиновый', 'дизельный', 'гибрид'],
        'engine-parts' => ['бензиновый', 'дизельный', 'гибрид'],
        'ignition-system' => ['бензиновый', 'гибрид'],
        'fuel-system' => ['бензиновый', 'дизельный', 'гибрид'],
        'timing' => ['бензиновый', 'дизельный', 'гибрид'],
        'oil-system' => ['бензиновый', 'дизельный', 'гибрид'],
        'cooling-system' => ['бензиновый', 'дизельный', 'гибрид', 'электро'],
        
        // Категории для дизельных двигателей
        'turbocharger' => ['дизельный', 'бензиновый'],
        'fuel-injection' => ['дизельный', 'бензиновый'],
        
        // Категории для электрических двигателей
        'electric-motors' => ['электро', 'гибрид'],
        'charging-system' => ['электро', 'гибрид'],
        'batteries' => ['электро', 'гибрид'],
        
        // Общие категории
        'sensors' => ['бензиновый', 'дизельный', 'гибрид', 'электро'],
        'belts-and-chains' => ['бензиновый', 'дизельный', 'гибрид'],
        'gaskets' => ['бензиновый', 'дизельный', 'гибрид'],
    ];

    /**
     * Выполнение консольной команды.
     */
    public function handle()
    {
        $engineType = $this->option('engine-type');
        $categorySlug = $this->option('category-slug');

        // Если тип двигателя не указан, запрашиваем его интерактивно
        if (!$engineType) {
            $engineType = $this->choice(
                'Выберите тип двигателя:',
                ['бензиновый', 'дизельный', 'гибрид', 'электро'],
                0
            );
        }

        // Получаем список двигателей по типу
        $engines = CarEngine::where('type', $engineType)->get();

        if ($engines->isEmpty()) {
            $this->error("Двигатели типа \"{$engineType}\" не найдены.");
            return 1;
        }

        $this->info("Найдено {$engines->count()} двигателей типа \"{$engineType}\".");

        // Если категория не указана, выводим список доступных категорий для этого типа двигателя
        $compatibleCategories = [];
        foreach ($this->categoryToEngineType as $catSlug => $engineTypes) {
            if (in_array($engineType, $engineTypes)) {
                $compatibleCategories[] = $catSlug;
            }
        }

        if (!$categorySlug) {
            // Получаем все категории из базы данных
            $allCategories = PartCategory::all()->pluck('name', 'slug')->toArray();
            
            // Фильтруем по совместимым категориям
            $availableCategories = [];
            foreach ($compatibleCategories as $catSlug) {
                if (isset($allCategories[$catSlug])) {
                    $availableCategories[$catSlug] = $allCategories[$catSlug];
                }
            }
            
            if (empty($availableCategories)) {
                $this->error("Не найдено категорий, совместимых с типом двигателя \"{$engineType}\".");
                return 1;
            }
            
            $categorySlug = $this->choice(
                'Выберите категорию запчастей:',
                array_keys($availableCategories),
                0
            );
        } elseif (!in_array($categorySlug, $compatibleCategories)) {
            $this->error("Категория \"{$categorySlug}\" не совместима с типом двигателя \"{$engineType}\".");
            return 1;
        }

        // Получаем категорию и связанные запчасти
        $category = PartCategory::where('slug', $categorySlug)->first();
        
        if (!$category) {
            $this->error("Категория с slug \"{$categorySlug}\" не найдена.");
            return 1;
        }

        $parts = SparePart::where('category_id', $category->id)->get();

        if ($parts->isEmpty()) {
            $this->error("Запчасти в категории \"{$category->name}\" не найдены.");
            return 1;
        }

        $this->info("Найдено {$parts->count()} запчастей в категории \"{$category->name}\".");

        $bar = $this->output->createProgressBar($engines->count());
        $bar->start();

        $totalAttached = 0;

        // Привязываем запчасти к двигателям
        foreach ($engines as $engine) {
            $attachedCount = 0;

            foreach ($parts as $part) {
                // Проверяем, что связь ещё не существует
                $existingRelation = DB::table('car_engine_spare_part')
                    ->where('car_engine_id', $engine->id)
                    ->where('spare_part_id', $part->id)
                    ->exists();

                if (!$existingRelation) {
                    $engine->spareParts()->attach($part->id, [
                        'notes' => "Автоматически привязано по категории {$category->name}"
                    ]);
                    $attachedCount++;
                    $totalAttached++;
                }
            }

            $this->info(" - Для двигателя {$engine->name} привязано {$attachedCount} запчастей");
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Всего привязано {$totalAttached} запчастей к двигателям типа \"{$engineType}\" из категории \"{$category->name}\".");

        return 0;
    }
} 