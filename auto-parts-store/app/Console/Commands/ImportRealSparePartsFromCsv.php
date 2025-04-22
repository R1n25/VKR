<?php

namespace App\Console\Commands;

use App\Models\CarModel;
use App\Models\SparePart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImportRealSparePartsFromCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:spare-parts-csv {--file=prise.csv : Путь к CSV-файлу} {--skip-confirmation : Пропустить подтверждение очистки}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Импорт реальных запчастей из CSV-файла';

    /**
     * Сопоставление категорий запчастей
     * 
     * @var array
     */
    protected $categoryMapping = [
        'фильтр' => 'Фильтры',
        'масляный фильтр' => 'Фильтры',
        'воздушный фильтр' => 'Фильтры',
        'топливный фильтр' => 'Фильтры',
        'салонный фильтр' => 'Фильтры',
        'свеча' => 'Система зажигания',
        'колодк' => 'Тормозная система',
        'тормоз' => 'Тормозная система',
        'диск' => 'Тормозная система',
        'амортизатор' => 'Подвеска',
        'опора' => 'Подвеска',
        'сайлентблок' => 'Подвеска',
        'рычаг' => 'Подвеска',
        'стойка' => 'Подвеска',
        'пружин' => 'Подвеска',
        'подшипник' => 'Подвеска',
        'ремень' => 'Двигатель',
        'ролик' => 'Двигатель',
        'натяжитель' => 'Двигатель',
        'прокладк' => 'Двигатель',
        'поршень' => 'Двигатель',
        'вкладыш' => 'Двигатель',
        'сцеплени' => 'Трансмиссия',
        'корзин' => 'Трансмиссия',
        'кпп' => 'Трансмиссия',
        'насос' => 'Охлаждение',
        'радиатор' => 'Охлаждение',
        'термостат' => 'Охлаждение',
        'лампа' => 'Электрика',
        'генератор' => 'Электрика',
        'стартер' => 'Электрика',
        'аккумулятор' => 'Электрика',
        'датчик' => 'Электрика',
        'бампер' => 'Кузов',
        'дверь' => 'Кузов',
        'крыло' => 'Кузов',
        'капот' => 'Кузов',
        'стекло' => 'Кузов',
        'фара' => 'Освещение',
        'фонарь' => 'Освещение',
        'топлив' => 'Топливная система',
        'бензонасос' => 'Топливная система',
        'форсунк' => 'Топливная система',
        'рулев' => 'Рулевое управление',
        'рейка' => 'Рулевое управление',
        'тяга' => 'Рулевое управление',
        'наконечник' => 'Рулевое управление',
        'глушитель' => 'Выхлопная система',
        'выхлоп' => 'Выхлопная система',
        'катализатор' => 'Выхлопная система',
        'шрус' => 'Трансмиссия',
        'привод' => 'Трансмиссия',
        'масло' => 'Система смазки',
        'маслян' => 'Система смазки',
        'помпа' => 'Охлаждение',
        'кондиционер' => 'Система охлаждения',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем импорт запчастей из CSV-файла...');
        
        $filePath = base_path($this->option('file'));
        
        if (!file_exists($filePath)) {
            $this->error("Файл не найден: {$filePath}");
            return 1;
        }
        
        $this->info("Используем файл: {$filePath}");
        
        // Получаем все модели автомобилей из базы данных
        $carModels = CarModel::all();
        if ($carModels->isEmpty()) {
            $this->error('Нет моделей автомобилей в базе. Пожалуйста, сначала запустите сидер для моделей автомобилей.');
            return 1;
        }
        
        // Очищаем таблицы перед заполнением
        $shouldClear = $this->option('skip-confirmation') ? true : $this->confirm('Очистить существующие данные о запчастях перед импортом?', true);
        if ($shouldClear) {
            $this->info('Очищаем таблицы...');
            DB::table('car_model_spare_part')->truncate();
            DB::table('spare_parts')->truncate();
        }
        
        // Читаем данные из CSV-файла
        $csvData = $this->readCsvFile($filePath);
        
        $totalParts = count($csvData);
        $this->info("Найдено {$totalParts} записей в CSV-файле");
        
        $bar = $this->output->createProgressBar($totalParts);
        $bar->start();
        
        $importedCount = 0;
        $skippedCount = 0;
        $uniquePartNumbers = [];
        
        foreach ($csvData as $row) {
            try {
                // Если в строке меньше 4 столбцов, пропускаем
                if (count($row) < 4) {
                    $skippedCount++;
                    $bar->advance();
                    continue;
                }
                
                $manufacturer = trim($row[0]);
                $partNumber = trim($row[1]);
                $name = trim($row[2]);
                $quantity = (int)trim($row[3]);
                $price = isset($row[4]) ? (float)str_replace(',', '.', trim($row[4])) : 0;
                
                // Пропускаем записи с пустыми важными полями
                if (empty($manufacturer) || empty($partNumber) || empty($name)) {
                    $skippedCount++;
                    $bar->advance();
                    continue;
                }
                
                // Проверяем уникальность номера детали
                if (in_array($partNumber, $uniquePartNumbers)) {
                    $skippedCount++;
                    $bar->advance();
                    continue;
                }
                
                $uniquePartNumbers[] = $partNumber;
                
                // Определяем категорию запчасти на основе названия
                $category = $this->determineCategory($name);
                
                // Генерируем slug из названия с добавлением части номера детали для уникальности
                $baseSlug = Str::slug($name);
                $uniqueSlugPart = Str::substr(preg_replace('/[^a-zA-Z0-9]/', '', $partNumber), 0, 8);
                $slug = $baseSlug . '-' . $uniqueSlugPart;
                
                // Создаем запчасть
                $sparePart = SparePart::create([
                    'name' => $name,
                    'slug' => $slug,
                    'description' => "Запчасть {$name} производителя {$manufacturer}",
                    'part_number' => $partNumber,
                    'price' => $price,
                    'stock_quantity' => $quantity > 0 ? $quantity : rand(1, 10),
                    'manufacturer' => $manufacturer,
                    'category' => $category,
                    'image_url' => null,
                    'is_available' => true,
                ]);
                
                // Получаем случайные модели автомобилей для совместимости
                $randomModelCount = rand(1, min(5, $carModels->count()));
                $randomModels = $carModels->random($randomModelCount);
                
                // Добавляем связи с моделями автомобилей
                foreach ($randomModels as $carModel) {
                    $sparePart->carModels()->attach($carModel->id);
                }
                
                $importedCount++;
                
                if ($importedCount % 100 == 0) {
                    $this->info(" Добавлено {$importedCount} запчастей...");
                }
                
            } catch (\Exception $e) {
                $this->error("Ошибка при добавлении запчасти: " . $e->getMessage());
                Log::error("Ошибка импорта запчастей: " . $e->getMessage());
                $skippedCount++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("Импорт завершен. Добавлено {$importedCount} запчастей, пропущено {$skippedCount}.");
        
        return 0;
    }
    
    /**
     * Чтение данных из CSV-файла.
     *
     * @param string $filePath
     * @return array
     */
    protected function readCsvFile(string $filePath): array
    {
        $data = [];
        
        // Определяем кодировку файла и конвертируем при необходимости
        $content = file_get_contents($filePath);
        $encoding = mb_detect_encoding($content, ['UTF-8', 'Windows-1251', 'ISO-8859-1']);
        
        if ($encoding !== 'UTF-8') {
            $content = mb_convert_encoding($content, 'UTF-8', $encoding);
            $tempFile = tempnam(sys_get_temp_dir(), 'csv_');
            file_put_contents($tempFile, $content);
            $filePath = $tempFile;
        }
        
        // Открываем файл и читаем данные
        if (($handle = fopen($filePath, "r")) !== false) {
            // Пропускаем заголовок
            $header = fgetcsv($handle, 1000, ";");
            
            // Читаем данные построчно
            while (($row = fgetcsv($handle, 1000, ";")) !== false) {
                $data[] = $row;
            }
            
            fclose($handle);
            
            // Удаляем временный файл, если он был создан
            if (isset($tempFile) && file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
        
        return $data;
    }
    
    /**
     * Определение категории запчасти на основе названия.
     *
     * @param string $name
     * @return string
     */
    protected function determineCategory(string $name): string
    {
        $name = mb_strtolower($name);
        
        foreach ($this->categoryMapping as $keyword => $category) {
            if (mb_strpos($name, $keyword) !== false) {
                return $category;
            }
        }
        
        return 'Разное';
    }
} 