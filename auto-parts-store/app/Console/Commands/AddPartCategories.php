<?php

namespace App\Console\Commands;

use App\Models\PartCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AddPartCategories extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'app:add-part-categories {--force : Очистить существующие категории перед добавлением}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Добавление категорий запчастей в базу данных';

    /**
     * Выполнение консольной команды.
     */
    public function handle()
    {
        $this->info('Добавление категорий запчастей...');

        // Очистка таблицы категорий, если указана опция --force
        if ($this->option('force')) {
            if ($this->confirm('Вы уверены, что хотите удалить все существующие категории?', false)) {
                PartCategory::truncate();
                $this->info('Таблица категорий очищена.');
            } else {
                $this->info('Операция отменена.');
                return;
            }
        }

        // Основные категории запчастей
        $mainCategories = [
            [
                'name' => 'Двигатель',
                'description' => 'Запчасти для двигателя автомобиля',
                'children' => [
                    ['name' => 'Блок цилиндров', 'description' => 'Блоки цилиндров и комплектующие'],
                    ['name' => 'Головка блока цилиндров', 'description' => 'ГБЦ и комплектующие'],
                    ['name' => 'Поршневая группа', 'description' => 'Поршни, кольца, пальцы'],
                    ['name' => 'Система смазки', 'description' => 'Масляные насосы, фильтры, радиаторы'],
                    ['name' => 'Система охлаждения', 'description' => 'Радиаторы, термостаты, помпы'],
                ]
            ],
            [
                'name' => 'Трансмиссия',
                'description' => 'Запчасти для трансмиссии автомобиля',
                'children' => [
                    ['name' => 'Сцепление', 'description' => 'Корзины, диски, выжимные подшипники'],
                    ['name' => 'Коробка передач', 'description' => 'Запчасти для МКПП и АКПП'],
                    ['name' => 'Карданная передача', 'description' => 'Карданные валы и крестовины'],
                ]
            ],
            [
                'name' => 'Подвеска',
                'description' => 'Запчасти для подвески автомобиля',
                'children' => [
                    ['name' => 'Передняя подвеска', 'description' => 'Амортизаторы, пружины, рычаги'],
                    ['name' => 'Задняя подвеска', 'description' => 'Амортизаторы, пружины, рычаги'],
                    ['name' => 'Ступицы и подшипники', 'description' => 'Ступичные узлы и подшипники'],
                ]
            ],
            [
                'name' => 'Рулевое управление',
                'description' => 'Запчасти для рулевого управления',
                'children' => [
                    ['name' => 'Рулевые механизмы', 'description' => 'Рулевые рейки, редукторы'],
                    ['name' => 'Рулевые тяги', 'description' => 'Рулевые тяги и наконечники'],
                ]
            ],
            [
                'name' => 'Тормозная система',
                'description' => 'Запчасти для тормозной системы',
                'children' => [
                    ['name' => 'Тормозные диски', 'description' => 'Передние и задние тормозные диски'],
                    ['name' => 'Тормозные колодки', 'description' => 'Передние и задние тормозные колодки'],
                ]
            ],
            [
                'name' => 'Электрооборудование',
                'description' => 'Электрические компоненты автомобиля',
                'children' => [
                    ['name' => 'Система зажигания', 'description' => 'Свечи, катушки, провода зажигания'],
                    ['name' => 'Генераторы и стартеры', 'description' => 'Генераторы, стартеры и комплектующие'],
                ]
            ],
            [
                'name' => 'Кузовные детали',
                'description' => 'Запчасти для кузова автомобиля',
                'children' => [
                    ['name' => 'Капот и крылья', 'description' => 'Капоты, крылья, бамперы'],
                    ['name' => 'Двери', 'description' => 'Двери и комплектующие'],
                ]
            ],
            [
                'name' => 'Салон',
                'description' => 'Запчасти для салона автомобиля',
                'children' => [
                    ['name' => 'Сиденья', 'description' => 'Сиденья и комплектующие'],
                    ['name' => 'Панель приборов', 'description' => 'Панели приборов и накладки'],
                ]
            ],
            [
                'name' => 'Расходные материалы',
                'description' => 'Расходные материалы для обслуживания',
                'children' => [
                    ['name' => 'Масла и жидкости', 'description' => 'Моторные масла, трансмиссионные масла, тормозные жидкости'],
                    ['name' => 'Фильтры', 'description' => 'Масляные, воздушные, топливные, салонные фильтры'],
                ]
            ],
            [
                'name' => 'Аксессуары',
                'description' => 'Автомобильные аксессуары',
                'children' => [
                    ['name' => 'Коврики', 'description' => 'Салонные и багажные коврики'],
                    ['name' => 'Чехлы', 'description' => 'Чехлы для сидений'],
                ]
            ],
        ];

        // Создаем категории с прогресс-баром
        $progressBar = $this->output->createProgressBar(count($mainCategories));
        $progressBar->start();

        $totalCategories = 0;
        foreach ($mainCategories as $mainCategory) {
            $children = $mainCategory['children'] ?? [];
            unset($mainCategory['children']);
            
            // Создаем основную категорию
            $mainCategory['slug'] = Str::slug($mainCategory['name']);
            $parent = PartCategory::create($mainCategory);
            $totalCategories++;
            
            // Создаем подкатегории
            foreach ($children as $child) {
                $child['slug'] = Str::slug($child['name']);
                $child['parent_id'] = $parent->id;
                PartCategory::create($child);
                $totalCategories++;
            }
            
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("Всего создано категорий: {$totalCategories}");
        $this->info('Готово!');
    }
} 