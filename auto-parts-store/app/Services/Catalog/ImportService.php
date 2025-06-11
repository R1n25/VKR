<?php

namespace App\Services\Catalog;

use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\CarBrand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Exception;
use Illuminate\Support\Facades\File;

class ImportService
{
    private $exportService;

    public function __construct(ExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Импортировать запчасти из CSV файла
     *
     * @param UploadedFile|string $file Загруженный файл или путь к файлу
     * @param bool $updateExisting Обновлять существующие записи
     * @param bool $createBackup Создать резервную копию перед импортом
     * @return array Статистика импорта
     */
    public function importSpareParts($file, bool $updateExisting = false, bool $createBackup = true): array
    {
        if ($createBackup) {
            $this->exportService->exportSpareParts();
        }

        // Получаем путь к файлу в зависимости от типа параметра
        $path = $file;
        if ($file instanceof UploadedFile) {
            $path = $file->getRealPath();
        }

        $fileHandle = fopen($path, 'r');
        if ($fileHandle === false) {
            throw new Exception("Не удалось открыть файл: {$path}");
        }

        // Чтение заголовков
        $headers = fgetcsv($fileHandle, 0, ';');
        
        // Проверка структуры файла (ожидаемые заголовки)
        $expectedHeaders = [
            'бренд', 'артикул', 'наименование', 'количество', 'цена'
        ];
        
        // Добавим поддержку файла prise.csv с другими заголовками
        $alternativeHeaders = [
            'Бренд', 'Артикул', 'Наименование номенклатуры', 'Количество', 'Окончательная цена'
        ];
        
        // Проверяем, соответствуют ли заголовки ожидаемым или альтернативным
        $headersValid = (count(array_intersect($headers, $expectedHeaders)) === count($expectedHeaders)) || 
                        (count(array_intersect($headers, $alternativeHeaders)) === count($alternativeHeaders));
        
        if (!$headersValid) {
            fclose($fileHandle);
            throw new Exception('Формат файла не соответствует ожидаемому. Не найдены все необходимые колонки. Требуются: бренд, артикул, наименование, количество, цена.');
        }
        
        // Определяем отображение заголовков на поля базы данных
        $headerMap = [];
        if (count(array_intersect($headers, $expectedHeaders)) === count($expectedHeaders)) {
            $headerMap = [
                'бренд' => 'manufacturer',
                'артикул' => 'part_number',
                'наименование' => 'name',
                'количество' => 'stock_quantity',
                'цена' => 'price'
            ];
        } else {
            $headerMap = [
                'Бренд' => 'manufacturer',
                'Артикул' => 'part_number',
                'Наименование номенклатуры' => 'name',
                'Количество' => 'stock_quantity',
                'Окончательная цена' => 'price'
            ];
        }
        
        // Получаем индексы колонок
        $columnIndexes = [];
        foreach ($headerMap as $fileHeader => $dbField) {
            $index = array_search($fileHeader, $headers);
            if ($index !== false) {
                $columnIndexes[$dbField] = $index;
            }
        }
        
        // Статистика импорта
        $stats = [
            'processed' => 0,  // Всего обработано строк
            'created' => 0,    // Создано новых записей
            'updated' => 0,    // Обновлено существующих записей
            'skipped' => 0,    // Пропущено записей
            'errors' => 0      // Количество ошибок
        ];
        
        // Чтение данных и импорт
        while (($data = fgetcsv($fileHandle, 0, ';')) !== false) {
            $stats['processed']++;
            
            try {
                if (count($data) >= count($columnIndexes)) {
                    $manufacturer = trim($data[$columnIndexes['manufacturer']]);
                    $partNumber = trim($data[$columnIndexes['part_number']]);
                    $name = trim($data[$columnIndexes['name']]);
                    $quantity = (int)trim($data[$columnIndexes['stock_quantity']]);
                    $price = (float)str_replace([' ', ','], ['', '.'], trim($data[$columnIndexes['price']]));
                    
                    // Пропускаем строки с пустыми ключевыми значениями
                    if (empty($manufacturer) || empty($partNumber) || empty($name)) {
                        $stats['skipped']++;
                        continue;
                    }
                    
                    // Обрабатываем запись
                    $sparePart = SparePart::where('manufacturer', $manufacturer)
                        ->where('part_number', $partNumber)
                        ->first();
                    
                    if ($sparePart && $updateExisting) {
                        $sparePart->update([
                            'name' => $name,
                            'stock_quantity' => $quantity,
                            'price' => $price
                        ]);
                        $stats['updated']++;
                    } elseif (!$sparePart) {
                        SparePart::create([
                            'manufacturer' => $manufacturer,
                            'part_number' => $partNumber,
                            'name' => $name,
                            'slug' => Str::slug($manufacturer . '-' . $partNumber . '-' . $name),
                            'stock_quantity' => $quantity,
                            'price' => $price,
                            'is_available' => $quantity > 0,
                            'is_active' => true
                        ]);
                        $stats['created']++;
                    } else {
                        // Существующая запись, но обновление отключено
                        $stats['skipped']++;
                    }
                } else {
                    // Недостаточно данных в строке
                    $stats['skipped']++;
                }
            } catch (\Exception $e) {
                $stats['errors']++;
            }
        }
        
        fclose($fileHandle);
        return $stats;
    }
    
    /**
     * Находит индекс колонки в заголовках по возможным вариантам названия
     * 
     * @param array $headers Заголовки CSV
     * @param array $possibleNames Возможные варианты названия колонки
     * @return int Индекс колонки или -1, если не найдено
     */
    protected function findColumnIndex(array $headers, array $possibleNames): int
    {
        foreach ($possibleNames as $name) {
            $index = array_search($name, $headers);
            if ($index !== false) {
                return $index;
            }
            
            // Поиск частичного совпадения
            foreach ($headers as $idx => $header) {
                if (stripos($header, $name) !== false) {
                    return $idx;
                }
            }
        }
        
        return -1;
    }
    
    /**
     * Импортировать модели автомобилей из CSV файла
     *
     * @param string $filePath Путь к CSV файлу
     * @param bool $updateExisting Обновлять существующие записи
     * @return array Статистика импорта
     */
    public function importCarModels(string $filePath, bool $updateExisting = true): array
    {
        $stats = [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'brands_created' => 0,
            'errors' => 0,
        ];

        if (!file_exists($filePath)) {
            Log::error("Файл не найден: {$filePath}");
            throw new \Exception("Файл не найден: {$filePath}");
        }

        DB::beginTransaction();
        try {
            // Прямое чтение файла без преобразования кодировки
            $handle = fopen($filePath, 'r');
            
            // Читаем заголовки
            $headers = fgetcsv($handle, 0, ',');
            Log::info('Заголовки CSV файла: ' . implode(', ', $headers));
            
            $processedBrands = [];
            
            // Обрабатываем каждую строку
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                $stats['processed']++;
                
                try {
                    // Проверяем, что в строке достаточно данных
                    if (count($row) < 4) {
                        Log::warning("Строка {$stats['processed']} содержит недостаточно данных");
                        $stats['skipped']++;
                        continue;
                    }
                    
                    // Извлекаем данные напрямую по индексам, зная структуру файла
                    // brand,model,year_from,year_to,country,is_popular
                    $brandName = trim($row[0]);
                    $modelName = trim($row[1]);
                    $yearFrom = !empty($row[2]) ? (int)$row[2] : null;
                    $yearTo = !empty($row[3]) ? (int)$row[3] : null;
                    $country = isset($row[4]) ? trim($row[4]) : null;
                    $isPopular = isset($row[5]) ? (bool)$row[5] : false;
                    
                    if (empty($brandName) || empty($modelName)) {
                        Log::warning("Строка {$stats['processed']} не содержит бренд или модель");
                        $stats['skipped']++;
                        continue;
                    }
                    
                    // Обрабатываем бренд
                    if (!isset($processedBrands[$brandName])) {
                        $brand = CarBrand::firstOrCreate(
                            ['name' => $brandName],
                            [
                                'slug' => \Illuminate\Support\Str::slug($brandName),
                                'country' => $country,
                                'is_popular' => $isPopular,
                            ]
                        );
                        
                        if ($brand->wasRecentlyCreated) {
                            $stats['brands_created']++;
                            Log::info("Создан новый бренд: {$brandName} с ID {$brand->id}");
                        } else {
                            Log::info("Найден существующий бренд: {$brandName} с ID {$brand->id}");
                        }
                        
                        $processedBrands[$brandName] = $brand->id;
                    }
                    
                    $brandId = $processedBrands[$brandName];
                    
                    // Обрабатываем модель
                    $carModel = CarModel::where('name', $modelName)
                        ->where('brand_id', $brandId)
                        ->first();
                    
                    // Подготавливаем данные для модели
                    $modelData = [
                        'name' => $modelName,
                        'slug' => \Illuminate\Support\Str::slug($brandName . '-' . $modelName),
                        'brand_id' => $brandId,
                        'year_start' => $yearFrom,
                        'year_end' => $yearTo,
                        'is_popular' => $isPopular,
                    ];
                    
                    Log::info("Подготовлены данные модели: ", [
                        'name' => $modelName,
                        'brand_id' => $brandId,
                        'brand_name' => $brandName,
                        'year_start' => $yearFrom,
                        'year_end' => $yearTo
                    ]);
                    
                    if ($carModel) {
                        if ($updateExisting) {
                            $carModel->update($modelData);
                            $stats['updated']++;
                            Log::info("Обновлена модель: {$modelName} с ID {$carModel->id}");
                        } else {
                            $stats['skipped']++;
                            Log::info("Пропущена существующая модель: {$modelName}");
                        }
                    } else {
                        try {
                            // Логируем данные перед созданием
                            Log::info("Создаём новую модель: {$modelName} для бренда {$brandName} (ID: {$brandId})");
                            
                            $newModel = CarModel::create($modelData);
                            $stats['created']++;
                            Log::info("Создана новая модель: {$modelName} с ID {$newModel->id}");
                        } catch (\Exception $e) {
                            // Подробное логирование ошибки
                            Log::error("Ошибка при создании модели {$modelName}: " . $e->getMessage(), [
                                'modelData' => $modelData,
                                'trace' => $e->getTraceAsString()
                            ]);
                            $stats['errors']++;
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Ошибка при импорте строки {$stats['processed']}: " . $e->getMessage(), [
                        'trace' => $e->getTraceAsString()
                    ]);
                    $stats['errors']++;
                }
                
                // Периодически сохраняем изменения для экономии памяти
                if ($stats['processed'] % 100 === 0) {
                    DB::commit();
                    DB::beginTransaction();
                }
            }
            
            fclose($handle);
            DB::commit();
            
            Log::info('Импорт моделей автомобилей завершен', $stats);
            return $stats;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Ошибка при импорте моделей автомобилей: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Подготовить данные запчасти для сохранения
     *
     * @param array $data Данные из CSV
     * @return array Подготовленные данные
     */
    protected function prepareSparePartData(array $data): array
    {
        $prepared = [
            'part_number' => $data['part_number'],
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'price' => $data['price'] ?? 0,
            'quantity' => $data['quantity'] ?? 0,
            'manufacturer' => $data['manufacturer'] ?? null,
            'weight' => $data['weight'] ?? null,
            'dimensions' => $data['dimensions'] ?? null,
        ];
        
        // Дополнительные поля, если они есть в CSV
        if (isset($data['category_id'])) {
            $prepared['category_id'] = $data['category_id'];
        }
        
        if (isset($data['image'])) {
            $prepared['image'] = $data['image'];
        }
        
        return $prepared;
    }
    
    /**
     * Подготовить данные модели автомобиля для сохранения
     *
     * @param array $data Данные из CSV
     * @param int $brandId ID бренда
     * @return array Подготовленные данные
     */
    protected function prepareCarModelData(array $data, int $brandId): array
    {
        $prepared = [
            'name' => $data['model'],
            'brand_id' => $brandId,
            'is_popular' => $data['is_popular'] ?? false,
        ];
        
        // Дополнительные поля, если они есть в CSV
        if (isset($data['year_from'])) {
            $prepared['year_start'] = $data['year_from'];
        }
        
        if (isset($data['year_to'])) {
            $prepared['year_end'] = $data['year_to'];
        }
        
        if (isset($data['description'])) {
            $prepared['description'] = $data['description'];
        }
        
        return $prepared;
    }
} 