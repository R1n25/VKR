<?php

namespace App\Services\Catalog;

use App\Models\SparePart;
use App\Models\CarModel;
use App\Models\CarBrand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportService
{
    /**
     * Импортировать запчасти из CSV файла
     *
     * @param string $filePath Путь к CSV файлу
     * @param bool $updateExisting Обновлять существующие записи
     * @return array Статистика импорта
     */
    public function importSpareParts(string $filePath, bool $updateExisting = true): array
    {
        $stats = [
            'processed' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => 0,
        ];

        if (!file_exists($filePath)) {
            Log::error("Файл не найден: {$filePath}");
            throw new \Exception("Файл не найден: {$filePath}");
        }

        DB::beginTransaction();
        try {
            // Сначала прочитаем файл целиком и преобразуем кодировку
            $content = file_get_contents($filePath);
            $content = mb_convert_encoding($content, 'UTF-8', 'Windows-1251');
            
            // Сохраним преобразованный файл временно
            $tempFile = tempnam(sys_get_temp_dir(), 'csv_import');
            file_put_contents($tempFile, $content);
            
            $handle = fopen($tempFile, 'r');
            
            // Читаем заголовки (используем точку с запятой как разделитель)
            $headers = fgetcsv($handle, 0, ';');
            
            // Добавим проверку заголовков
            if (!$headers || count($headers) < 5) {
                Log::error("Некорректные заголовки CSV: " . print_r($headers, true));
                throw new \Exception("Некорректные заголовки CSV файла.");
            }
            
            // Нормализуем заголовки
            $headers = array_map(function($header) {
                return mb_strtolower(trim($header));
            }, $headers);
            
            Log::info("Заголовки CSV файла: " . implode(", ", $headers));
            
            // Пробуем найти нужные колонки, поддерживаем разные варианты написания
            $brandIndex = $this->findColumnIndex($headers, ['бренд', 'brand', 'производитель', 'марка']);
            $partNumberIndex = $this->findColumnIndex($headers, ['артикул', 'partnumber', 'номер', 'номер детали', 'part_number']);
            $nameIndex = $this->findColumnIndex($headers, ['наименование', 'название', 'наименование номенклатуры', 'name', 'title']);
            $quantityIndex = $this->findColumnIndex($headers, ['количество', 'кол-во', 'кол', 'qty', 'quantity', 'остаток']);
            $priceIndex = $this->findColumnIndex($headers, ['цена', 'окончательная цена', 'стоимость', 'price']);
            
            Log::info("Найденные индексы: бренд({$brandIndex}), артикул({$partNumberIndex}), " .
                     "наименование({$nameIndex}), количество({$quantityIndex}), цена({$priceIndex})");
            
            if ($brandIndex === -1 || $partNumberIndex === -1 || $nameIndex === -1 || 
                $quantityIndex === -1 || $priceIndex === -1) {
                throw new \Exception("Формат файла не соответствует ожидаемому. Не найдены все необходимые колонки. " . 
                                   "Требуются: бренд, артикул, наименование, количество, цена.");
            }
            
            while (($row = fgetcsv($handle, 0, ';')) !== false) {
                $stats['processed']++;
                
                try {
                    // Проверяем, что достаточно данных
                    if (count($row) <= max($brandIndex, $partNumberIndex, $nameIndex, $quantityIndex, $priceIndex)) {
                        $stats['skipped']++;
                        continue;
                    }
                    
                    // Извлекаем данные из соответствующих колонок
                    $manufacturer = trim($row[$brandIndex]);
                    $partNumber = trim($row[$partNumberIndex]);
                    $name = trim($row[$nameIndex]);
                    $stockQuantity = (int)trim($row[$quantityIndex]);
                    // Очистка цены от пробелов и конвертация в число
                    $price = (float)str_replace([' ', ','], ['', '.'], trim($row[$priceIndex]));
                    
                    // Проверяем обязательные поля
                    if (empty($partNumber)) {
                        $stats['skipped']++;
                        continue;
                    }
                    
                    // Создаем slug для URL
                    $slug = Str::slug($name . '-' . $partNumber);
                    
                    // Ищем существующую запчасть по артикулу
                    $sparePart = SparePart::where('part_number', $partNumber)->first();
                    
                    // Подготавливаем данные для запчасти
                    $sparePartData = [
                        'name' => $name,
                        'slug' => $slug,
                        'description' => $name,
                        'part_number' => $partNumber,
                        'price' => $price,
                        'stock_quantity' => $stockQuantity,
                        'manufacturer' => $manufacturer,
                        'is_available' => $stockQuantity > 0,
                        'category' => 'Запчасти', // Категория по умолчанию
                    ];
                    
                    if ($sparePart) {
                        if ($updateExisting) {
                            $sparePart->update($sparePartData);
                            $stats['updated']++;
                        } else {
                            $stats['skipped']++;
                        }
                    } else {
                        SparePart::create($sparePartData);
                        $stats['created']++;
                    }
                } catch (\Exception $e) {
                    Log::error("Ошибка при импорте строки {$stats['processed']}: " . $e->getMessage());
                    $stats['errors']++;
                }
                
                // Периодически сохраняем изменения для экономии памяти
                if ($stats['processed'] % 100 === 0) {
                    DB::commit();
                    DB::beginTransaction();
                }
            }
            
            fclose($handle);
            // Удаляем временный файл
            @unlink($tempFile);
            DB::commit();
            
            Log::info('Импорт запчастей завершен', $stats);
            return $stats;
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Ошибка при импорте запчастей: ' . $e->getMessage());
            throw $e;
        }
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