<?php

namespace App\Services;

use App\Models\SparePart;
use App\Models\SparePartCompatibility;
use App\Models\CarModel;
use App\Models\CarEngine;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Сервис для работы с совместимостью запчастей
 */
class SparePartCompatibilityService
{
    /**
     * Получить данные о совместимости с двигателями из таблицы car_engine_spare_part
     * 
     * @param int $sparePartId ID запчасти
     * @return Collection
     */
    public function getCarEngineSparePartData(int $sparePartId): Collection
    {
        try {
            $data = DB::table('car_engine_spare_part')
                ->where('spare_part_id', $sparePartId)
                ->join('car_engines', 'car_engine_spare_part.car_engine_id', '=', 'car_engines.id')
                ->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
                ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
                ->select(
                    'car_engine_spare_part.id',
                    'car_engine_spare_part.car_engine_id',
                    'car_engine_spare_part.notes',
                    'car_engines.name as engine_name',
                    'car_engines.type as engine_type',
                    'car_engines.volume as engine_volume',
                    'car_engines.power as engine_power',
                    'car_models.id as model_id',
                    'car_models.name as model_name',
                    'car_brands.id as brand_id',
                    'car_brands.name as brand_name'
                )
                ->get();
                
            // Преобразуем данные в формат, понятный для React-компонента
            $formattedData = $data->map(function ($item) {
                return [
                    'id' => $item->id,
                    'engine' => [
                        'id' => $item->car_engine_id,
                        'name' => $item->engine_name,
                        'volume' => $item->engine_volume,
                        'power' => $item->engine_power,
                        'fuel_type' => $item->engine_type
                    ],
                    'model' => [
                        'id' => $item->model_id,
                        'name' => $item->model_name
                    ],
                    'brand' => [
                        'id' => $item->brand_id,
                        'name' => $item->brand_name
                    ],
                    'notes' => $item->notes
                ];
            });
            
            Log::info("Найдено записей car_engine_spare_part: " . $formattedData->count(), [
                'spare_part_id' => $sparePartId
            ]);
            
            return $formattedData;
        } catch (\Exception $e) {
            Log::error("Ошибка при получении данных car_engine_spare_part для запчасти ID {$sparePartId}: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            return collect([]);
        }
    }

    /**
     * Получить список совместимостей для запчасти из таблицы car_engine_spare_part
     * 
     * @param int $sparePartId ID запчасти
     * @return Collection
     */
    public function getEngineCompatibilities(int $sparePartId): Collection
    {
        try {
            $engineCompatibilities = DB::table('car_engine_spare_part')
                ->where('spare_part_id', $sparePartId)
                ->join('car_engines', 'car_engine_spare_part.car_engine_id', '=', 'car_engines.id')
                ->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
                ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
                ->select(
                    'car_engine_spare_part.id',
                    'car_engine_spare_part.notes',
                    'car_engines.id as engine_id',
                    'car_engines.name as engine_name',
                    'car_engines.volume as engine_volume',
                    'car_engines.power as engine_power',
                    'car_engines.type as engine_fuel_type',
                    'car_models.id as model_id',
                    'car_models.name as model_name',
                    'car_models.generation as model_generation',
                    'car_models.year_start as model_year_start',
                    'car_models.year_end as model_year_end',
                    'car_brands.id as brand_id',
                    'car_brands.name as brand_name'
                )
                ->get();
                
            // Добавляем логирование для отладки
            Log::info("Engine compatibility records found: " . $engineCompatibilities->count(), [
                'spare_part_id' => $sparePartId
            ]);
                
            // Форматируем данные из car_engine_spare_part
            $formattedEngineCompatibilities = $engineCompatibilities->map(function ($item) {
                return [
                    'id' => $item->id,
                    'notes' => $item->notes,
                    'model' => [
                        'id' => $item->model_id,
                        'name' => $item->model_name,
                        'generation' => $item->model_generation ?? '',
                        'years' => $item->model_year_start . '-' . ($item->model_year_end ? $item->model_year_end : 'настоящее время'),
                    ],
                    'brand' => [
                        'id' => $item->brand_id,
                        'name' => $item->brand_name,
                    ],
                    'engine' => [
                        'id' => $item->engine_id,
                        'name' => $item->engine_name,
                        'volume' => $item->engine_volume,
                        'power' => $item->engine_power,
                        'fuel_type' => $item->engine_fuel_type,
                    ]
                ];
            });
            
            return $formattedEngineCompatibilities;
            
        } catch (\Exception $e) {
            Log::error("Ошибка при получении совместимостей двигателей для запчасти ID {$sparePartId}: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            return collect([]);
        }
    }

    /**
     * Получить список совместимостей для запчасти
     * 
     * @param int $sparePartId ID запчасти
     * @return Collection
     */
    public function getCompatibilities(int $sparePartId): Collection
    {
        try {
            // Получаем все совместимости для запчасти с загрузкой связанных данных
            $compatibilities = SparePartCompatibility::with([
                'carModel.brand', 
                'carEngine'
            ])
            ->where('spare_part_id', $sparePartId)
            ->get();
            
            // Добавляем логирование для отладки
            Log::info("SparePartCompatibility records found: " . $compatibilities->count(), [
                'spare_part_id' => $sparePartId
            ]);
            
            // Форматируем данные для удобного использования
            $formattedCompatibilities = $compatibilities->map(function ($compatibility) {
                $result = [
                    'id' => $compatibility->id,
                    'notes' => $compatibility->notes,
                ];
                
                // Добавляем информацию о модели автомобиля
                if ($compatibility->carModel) {
                    $result['model'] = [
                        'id' => $compatibility->carModel->id,
                        'name' => $compatibility->carModel->name,
                        'generation' => $compatibility->carModel->generation,
                        'years' => $compatibility->carModel->production_years,
                    ];
                    
                    // Добавляем информацию о бренде
                    if ($compatibility->carModel->brand) {
                        $result['brand'] = [
                            'id' => $compatibility->carModel->brand->id,
                            'name' => $compatibility->carModel->brand->name,
                        ];
                    }
                }
                
                // Добавляем информацию о двигателе
                if ($compatibility->carEngine) {
                    $result['engine'] = [
                        'id' => $compatibility->carEngine->id,
                        'name' => $compatibility->carEngine->name,
                        'volume' => $compatibility->carEngine->volume,
                        'power' => $compatibility->carEngine->power,
                        'fuel_type' => $compatibility->carEngine->fuel_type,
                    ];
                }
                
                return $result;
            });
            
            // Дополнительно получаем совместимости из таблицы car_engine_spare_part
            try {
                $engineCompatibilities = DB::table('car_engine_spare_part')
                    ->where('spare_part_id', $sparePartId)
                    ->join('car_engines', 'car_engine_spare_part.car_engine_id', '=', 'car_engines.id')
                    ->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
                    ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
                    ->select(
                        'car_engine_spare_part.id',
                        'car_engine_spare_part.notes',
                        'car_engines.id as engine_id',
                        'car_engines.name as engine_name',
                        'car_engines.volume as engine_volume',
                        'car_engines.power as engine_power',
                        'car_engines.type as engine_fuel_type',
                        'car_models.id as model_id',
                        'car_models.name as model_name',
                        'car_models.generation as model_generation',
                        'car_models.year_start as model_year_start',
                        'car_models.year_end as model_year_end',
                        'car_brands.id as brand_id',
                        'car_brands.name as brand_name'
                    )
                    ->get();
                
                // Добавляем логирование для отладки
                Log::info("Engine compatibility records found: " . $engineCompatibilities->count(), [
                    'spare_part_id' => $sparePartId
                ]);
                    
                // Форматируем данные из car_engine_spare_part
                $formattedEngineCompatibilities = $engineCompatibilities->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'notes' => $item->notes,
                        'model' => [
                            'id' => $item->model_id,
                            'name' => $item->model_name,
                            'generation' => $item->model_generation ?? '',
                            'years' => $item->model_year_start . '-' . ($item->model_year_end ? $item->model_year_end : 'настоящее время'),
                        ],
                        'brand' => [
                            'id' => $item->brand_id,
                            'name' => $item->brand_name,
                        ],
                        'engine' => [
                            'id' => $item->engine_id,
                            'name' => $item->engine_name,
                            'volume' => $item->engine_volume,
                            'power' => $item->engine_power,
                            'fuel_type' => $item->engine_fuel_type,
                        ]
                    ];
                });
                
                // Проверяем данные перед объединением
                Log::info("Before concat - formattedCompatibilities: " . $formattedCompatibilities->count());
                Log::info("Before concat - formattedEngineCompatibilities: " . $formattedEngineCompatibilities->count());
                
                // Объединяем результаты из обеих таблиц
                $result = $formattedCompatibilities->concat($formattedEngineCompatibilities);
                
                // Проверяем результат после объединения
                Log::info("After concat - total: " . $result->count());
                
                return $result;
            } catch (\Exception $e) {
                Log::error("Ошибка при получении совместимостей для запчасти ID {$sparePartId}: " . $e->getMessage());
                Log::error($e->getTraceAsString());
                return $formattedCompatibilities; // Возвращаем хотя бы те совместимости, которые удалось получить
            }
            
        } catch (\Exception $e) {
            Log::error("Ошибка при получении совместимостей для запчасти ID {$sparePartId}: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            return collect([]);
        }
    }

    /**
     * Добавить совместимость запчасти с моделью автомобиля
     * 
     * @param int $sparePartId ID запчасти
     * @param int $carModelId ID модели автомобиля
     * @param int|null $carEngineId ID двигателя (опционально)
     * @param string|null $notes Примечания к совместимости
     * @return bool
     */
    public function addCompatibility(int $sparePartId, int $carModelId, ?int $carEngineId = null, ?string $notes = null): bool
    {
        try {
            // Проверяем существование запчасти и модели
            $sparePart = SparePart::find($sparePartId);
            $carModel = CarModel::find($carModelId);
            
            if (!$sparePart || !$carModel) {
                Log::warning("Не удалось добавить совместимость: запчасть или модель не найдены", [
                    'spare_part_id' => $sparePartId,
                    'car_model_id' => $carModelId,
                ]);
                return false;
            }
            
            // Проверяем существование двигателя, если указан
            if ($carEngineId) {
                $carEngine = CarEngine::find($carEngineId);
                if (!$carEngine) {
                    Log::warning("Не удалось добавить совместимость: двигатель не найден", [
                        'car_engine_id' => $carEngineId,
                    ]);
                    return false;
                }
            }
            
            // Проверяем, не существует ли уже такая совместимость
            $existingCompatibility = SparePartCompatibility::where('spare_part_id', $sparePartId)
                ->where('car_model_id', $carModelId)
                ->where('car_engine_id', $carEngineId)
                ->first();
                
            if ($existingCompatibility) {
                // Если совместимость уже существует, обновляем примечания
                $existingCompatibility->notes = $notes;
                $existingCompatibility->save();
                
                Log::info("Обновлена существующая совместимость", [
                    'compatibility_id' => $existingCompatibility->id,
                ]);
                
                return true;
            }
            
            // Создаем новую совместимость
            $compatibility = new SparePartCompatibility([
                'spare_part_id' => $sparePartId,
                'car_model_id' => $carModelId,
                'car_engine_id' => $carEngineId,
                'notes' => $notes,
            ]);
            
            $compatibility->save();
            
            Log::info("Добавлена новая совместимость", [
                'compatibility_id' => $compatibility->id,
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Ошибка при добавлении совместимости: " . $e->getMessage(), [
                'spare_part_id' => $sparePartId,
                'car_model_id' => $carModelId,
                'car_engine_id' => $carEngineId,
            ]);
            return false;
        }
    }

    /**
     * Удалить совместимость запчасти
     * 
     * @param int $compatibilityId ID совместимости
     * @return bool
     */
    public function removeCompatibility(int $compatibilityId): bool
    {
        try {
            $compatibility = SparePartCompatibility::find($compatibilityId);
            
            if (!$compatibility) {
                Log::warning("Не удалось удалить совместимость: запись не найдена", [
                    'compatibility_id' => $compatibilityId,
                ]);
                return false;
            }
            
            $compatibility->delete();
            
            Log::info("Удалена совместимость", [
                'compatibility_id' => $compatibilityId,
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error("Ошибка при удалении совместимости: " . $e->getMessage(), [
                'compatibility_id' => $compatibilityId,
            ]);
            return false;
        }
    }

    /**
     * Найти запчасти, совместимые с указанной моделью автомобиля
     * 
     * @param int $carModelId ID модели автомобиля
     * @param int|null $carEngineId ID двигателя (опционально)
     * @param array $filters Дополнительные фильтры
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function findCompatibleParts(int $carModelId, ?int $carEngineId = null, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        try {
            // Начинаем запрос с базовой таблицы совместимостей
            $query = SparePartCompatibility::query()
                ->where('car_model_id', $carModelId);
                
            // Добавляем фильтр по двигателю, если указан
            if ($carEngineId) {
                $query->where('car_engine_id', $carEngineId);
            }
            
            // Получаем ID запчастей, совместимых с указанной моделью
            $sparePartIds = $query->pluck('spare_part_id')->toArray();
            
            if (empty($sparePartIds)) {
                return collect([]);
            }
            
            // Получаем запчасти по ID с применением фильтров
            $spareParts = SparePart::query()
                ->whereIn('id', $sparePartIds)
                ->where('is_available', true)
                ->where('stock_quantity', '>', 0);
                
            // Применяем дополнительные фильтры
            if (!empty($filters['category_id'])) {
                $spareParts->where('category_id', $filters['category_id']);
            }
            
            if (!empty($filters['manufacturer'])) {
                $spareParts->where('manufacturer', 'like', "%{$filters['manufacturer']}%");
            }
            
            if (!empty($filters['min_price'])) {
                $spareParts->where('price', '>=', $filters['min_price']);
            }
            
            if (!empty($filters['max_price'])) {
                $spareParts->where('price', '<=', $filters['max_price']);
            }
            
            // Получаем результаты
            $results = $spareParts->get();
            
            // Форматируем цены в зависимости от роли пользователя
            $sparePartService = app(SparePartService::class);
            return $sparePartService->formatSparePartsWithPrices($results, $isAdmin, $markupPercent);
        } catch (\Exception $e) {
            Log::error("Ошибка при поиске совместимых запчастей: " . $e->getMessage(), [
                'car_model_id' => $carModelId,
                'car_engine_id' => $carEngineId,
            ]);
            return collect([]);
        }
    }
} 