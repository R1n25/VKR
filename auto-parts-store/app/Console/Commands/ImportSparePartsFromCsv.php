<?php

namespace App\Console\Commands;

use App\Models\CarModel;
use App\Models\SparePart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImportSparePartsFromCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:spare-parts --file={file=prise.csv : Путь к CSV файлу}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Импорт запчастей из CSV файла без удаления существующих';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');
        $this->info("Импортируем запчасти из файла: {$filePath}");
        
        if (!file_exists($filePath)) {
            $this->error("Файл не найден: {$filePath}");
            return 1;
        }
        
        // Получаем модели автомобилей для связей
        $carModels = CarModel::all();
        if ($carModels->isEmpty()) {
            $this->error('Нет моделей автомобилей в базе данных. Сначала добавьте модели автомобилей.');
            return 1;
        }
        
        // Читаем данные из CSV
        $data = $this->readCsvFile($filePath);
        
        $total = count($data);
        $this->info("Найдено {$total} записей в файле");
        
        $added = 0;
        $skipped = 0;
        
        $bar = $this->output->createProgressBar($total);
        $bar->start();
        
        foreach ($data as $row) {
            try {
                $brand = trim($row[0]);
                $partNumber = trim($row[1]);
                $name = trim($row[2]);
                $quantity = intval(trim($row[3]));
                $price = !empty($row[4]) ? floatval(str_replace([' ', ','], ['', '.'], trim($row[4]))) : 0;
                
                // Проверка на существование запчасти
                $exists = SparePart::where('part_number', $partNumber)->exists();
                if ($exists) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }
                
                // Создаем уникальный slug
                $slug = Str::slug($name) . '-' . Str::substr(Str::slug($partNumber), 0, 8);
                
                // Определяем категорию на основе названия
                $category = $this->determineCategory($name, $brand);
                
                // Создаем запчасть
                $sparePart = SparePart::create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => "Запчасть {$name} производителя {$brand}",
                    'part_number' => $partNumber,
                    'price' => $price,
                    'stock_quantity' => max(1, $quantity),
                    'manufacturer' => $brand,
                    'category' => $category,
                    'image_url' => null,
                    'is_available' => true,
                ]);
                
                // Добавляем связи с моделями
                $randomCount = min(3, $carModels->count());
                $randomModels = $carModels->random($randomCount);
                foreach ($randomModels as $model) {
                    $sparePart->carModels()->attach($model->id);
                }
                
                $added++;
            } catch (\Exception $e) {
                Log::error('Ошибка импорта запчасти: ' . $e->getMessage());
                $skipped++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Импорт завершен: добавлено {$added}, пропущено {$skipped} запчастей");
        return 0;
    }
    
    /**
     * Чтение данных из CSV файла
     */
    protected function readCsvFile(string $filePath): array
    {
        $data = [];
        
        if (($handle = fopen($filePath, 'r')) !== false) {
            // Пропускаем заголовок
            fgetcsv($handle, 0, ';');
            
            while (($row = fgetcsv($handle, 0, ';')) !== false) {
                if (count($row) >= 4) {
                    $data[] = $row;
                }
            }
            
            fclose($handle);
        }
        
        return $data;
    }
    
    /**
     * Определение категории запчасти по названию
     */
    protected function determineCategory(string $name, string $brand): string
    {
        $lowerName = mb_strtolower($name);
        
        $categories = [
            'Фильтры' => ['фильтр', 'воздушный', 'салонный', 'масляный', 'топливный'],
            'Тормозная система' => ['тормоз', 'колодк', 'диск'],
            'Подвеска' => ['амортизатор', 'пружин', 'стойк', 'рычаг', 'опора', 'сайлентблок', 'втулка'],
            'Двигатель' => ['двигател', 'поршень', 'кольц', 'вкладыш', 'клапан', 'гбц', 'прокладк'],
            'Трансмиссия' => ['сцеплен', 'кпп', 'коробк', 'привод', 'шрус'],
            'Система охлаждения' => ['радиатор', 'кондиционер', 'термостат', 'помпа', 'вентилятор'],
            'Система зажигания' => ['свеч', 'катушк', 'зажиган'],
            'Топливная система' => ['топлив', 'бензонасос', 'форсунк', 'инжектор'],
            'Электрика' => ['датчик', 'лампа', 'генератор', 'стартер', 'аккумулятор'],
            'Кузов' => ['бампер', 'крыло', 'капот', 'дверь', 'зеркало', 'стекло'],
            'Рулевое управление' => ['руле', 'рейка', 'гур', 'тяга', 'наконечник'],
        ];
        
        foreach ($categories as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (mb_strpos($lowerName, $keyword) !== false) {
                    return $category;
                }
            }
        }
        
        return 'Прочее';
    }
} 