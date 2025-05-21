<?php

namespace App\Console\Commands;

use App\Models\SparePart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportSparePartsCommand extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'import:spare-parts {file=prise.csv : Путь к CSV-файлу с запчастями}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Импорт запчастей из CSV-файла в базу данных';

    /**
     * Выполнить консольную команду.
     */
    public function handle()
    {
        $path = $this->argument('file');
        
        if (!file_exists($path)) {
            $this->error("Файл {$path} не найден!");
            return 1;
        }

        $this->info("Начинаем импорт из файла {$path}");
        
        // Получаем содержимое файла и конвертируем из Windows-1251 в UTF-8
        $content = file_get_contents($path);
        $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1251');
        
        // Разбиваем на строки
        $lines = explode("\n", $content);
        
        // Пропускаем заголовок
        $header = array_shift($lines);
        
        // Создаем счетчик для отображения прогресса
        $counter = 0;
        $total = count($lines);
        
        $this->output->progressStart($total);
        
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                $this->output->progressAdvance();
                continue;
            }
            
            // Разделяем строку по разделителю ";"
            $data = explode(';', $line);
            
            // Проверяем, что у нас достаточно данных
            if (count($data) < 5) {
                $this->output->progressAdvance();
                continue;
            }
            
            $manufacturer = trim($data[0]);
            $partNumber = trim($data[1]);
            $name = trim($data[2]);
            $quantity = (int)trim($data[3]);
            $price = (float)str_replace(' ', '', trim($data[4]));
            
            // Формируем slug
            $slug = Str::slug($name . '-' . $partNumber);
            
            // Проверяем, существует ли уже запчасть с таким part_number
            $sparePart = SparePart::where('part_number', $partNumber)->first();
            
            if ($sparePart) {
                // Обновляем существующую запчасть
                $sparePart->update([
                    'stock_quantity' => $quantity,
                    'price' => $price,
                    'is_available' => $quantity > 0,
                ]);
            } else {
                // Создаем новую запчасть
                SparePart::create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => $name,
                    'part_number' => $partNumber,
                    'price' => $price,
                    'stock_quantity' => $quantity,
                    'manufacturer' => $manufacturer,
                    'category' => 'Запчасти', // Категория по умолчанию
                    'is_available' => $quantity > 0,
                ]);
            }
            
            $counter++;
            $this->output->progressAdvance();
        }
        
        $this->output->progressFinish();
        $this->info("Импорт завершен! Обработано {$counter} запчастей.");
        
        return 0;
    }
} 