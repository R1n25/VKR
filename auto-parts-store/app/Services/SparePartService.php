<?php

namespace App\Services;

use App\Models\SparePart;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SparePartService
{
    // Процент наценки по умолчанию для обычных пользователей и гостей
    const DEFAULT_MARKUP_PERCENT = 25.0;
    
    // Свойства для хранения ID точных совпадений и аналогов
    protected $exactMatchIds = [];
    protected $analogIds = [];

    /**
     * Получить популярные запчасти для отображения на главной странице
     * 
     * @param int $limit Количество запчастей для отображения
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getPopularSpareParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null)
    {
        $spareParts = SparePart::query()
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->with('carModels')
            ->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Получить информацию о конкретной запчасти по ID
     * 
     * @param int $id ID запчасти
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return SparePart|null
     */
    public function getSparePartById(int $id, bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Загружаем запчасть с отношениями
        $sparePart = SparePart::with([
            'carModels', 
            'category',
            'compatibilities.carModel.brand',  // Добавляем загрузку совместимостей
            'compatibilities.carEngine'        // и связанных двигателей
        ])->find($id);
        
        if ($sparePart) {
            // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
            if ($markupPercent === null) {
                $markupPercent = $this->getUserMarkupPercent();
            }
            
            // Форматируем данные о совместимости для удобного отображения
            if ($sparePart->relationLoaded('compatibilities') && $sparePart->compatibilities->count() > 0) {
                $formattedCompatibilities = [];
                
                foreach ($sparePart->compatibilities as $compatibility) {
                    if ($compatibility->carModel) {
                        $formattedCompatibility = [
                            'id' => $compatibility->id,
                            'model' => $compatibility->carModel->name,
                            'brand' => $compatibility->carModel->brand ? $compatibility->carModel->brand->name : 'Неизвестный бренд',
                            'notes' => $compatibility->notes,
                        ];
                        
                        // Примечание: колонки start_year и end_year были удалены из таблицы
                        
                        // Добавляем информацию о двигателе, если она есть
                        if ($compatibility->carEngine) {
                            $formattedCompatibility['engine'] = [
                                'id' => $compatibility->carEngine->id,
                                'name' => $compatibility->carEngine->name,
                                'volume' => $compatibility->carEngine->volume,
                                'power' => $compatibility->carEngine->power,
                                'fuel_type' => $compatibility->carEngine->fuel_type,
                            ];
                        }
                        
                        $formattedCompatibilities[] = $formattedCompatibility;
                    }
                }
                
                // Добавляем отформатированные данные о совместимости
                $sparePart->compatibilities = $formattedCompatibilities;
                
                // Добавляем отладочную информацию
                \Log::info("Загружены данные о совместимости для запчасти ID: {$id}", [
                    'count' => count($formattedCompatibilities)
                ]);
            } else {
                $sparePart->compatibilities = [];
                \Log::info("Нет данных о совместимости для запчасти ID: {$id}");
            }
            
            $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        }
        
        return $sparePart;
    }
    
    /**
     * Получить похожие запчасти для указанной запчасти
     * 
     * @param int $sparePartId ID запчасти
     * @param int $limit Количество похожих запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSimilarSpareParts(int $sparePartId, int $limit = 4, bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Получаем информацию о текущей запчасти
        $sparePart = $this->getSparePartById($sparePartId);
        
        if (!$sparePart) {
            return collect([]);
        }
        
        // Находим запчасти той же категории
        $similarParts = SparePart::query()
            ->where('id', '!=', $sparePartId)
            ->where('category_id', $sparePart->category_id)
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->inRandomOrder()
            ->limit($limit)
            ->get();
            
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($similarParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Поиск запчастей по названию или артикулу
     * 
     * @param string|null $query Поисковый запрос
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchSpareParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null)
    {
        $query = $query ?? '';
        
        // Проверяем, не выглядит ли запрос как артикул
        $isArticleSearch = preg_match('/^[A-Za-z0-9-]+$/', trim($query));
        
        $sparePartsQuery = SparePart::query();
        
        if ($isArticleSearch) {
            // Если запрос похож на артикул, ищем только по артикулу
            $partNumber = trim($query);
            $sparePartsQuery->where(function (Builder $builder) use ($partNumber) {
                $builder->where('part_number', $partNumber)
                    ->orWhere('part_number', 'like', "{$partNumber}%") // Начинается с
                    ->orWhere(DB::raw('LOWER(part_number)'), 'like', strtolower("{$partNumber}%")); // Без учета регистра
            });
            
            // Находим точные соответствия артикулу
            $exactMatchParts = SparePart::where('part_number', $partNumber)
                ->orWhere(DB::raw('LOWER(part_number)'), strtolower($partNumber))
                ->get();
            
            if ($exactMatchParts->isNotEmpty()) {
                // Если найдены точные совпадения, собираем их ID для поиска аналогов
                $exactMatchIds = $exactMatchParts->pluck('id')->toArray();
                
                // Находим ID всех аналогов для найденных запчастей, включая транзитивные связи
                $allAnalogIds = [];
                foreach ($exactMatchIds as $exactMatchId) {
                    $analogIds = $this->findAllAnalogIds($exactMatchId);
                    $allAnalogIds = array_merge($allAnalogIds, $analogIds);
                }
                
                // Удаляем дубликаты и исключаем ID точных совпадений
                $uniqueAnalogIds = array_diff(array_unique($allAnalogIds), $exactMatchIds);
                
                // Сбрасываем предыдущий запрос и используем ID для поиска
                $allIds = array_merge($exactMatchIds, $uniqueAnalogIds);
                $sparePartsQuery = SparePart::whereIn('id', $allIds);
                
                // Запоминаем списки ID для последующего определения аналогов
                $this->exactMatchIds = $exactMatchIds;
                $this->analogIds = $uniqueAnalogIds;
                
                // Добавляем отладочную информацию
                \Log::info("Поиск по артикулу: {$partNumber}");
                \Log::info("Найдено точных совпадений: " . count($exactMatchIds));
                \Log::info("Найдено аналогов (включая транзитивные): " . count($uniqueAnalogIds));
            }
            
            // Фильтруем только доступные товары и с положительным количеством
            $sparePartsQuery->where('is_available', true)
                ->where('stock_quantity', '>', 0);
        } else {
            // Если запрос не похож на артикул, выполняем обычный поиск
            $sparePartsQuery->where(function (Builder $builder) use ($query) {
                $builder->where('name', 'like', "%{$query}%")
                    ->orWhere('part_number', 'like', "%{$query}%")
                    ->orWhere('manufacturer', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0);
        }
        
        $spareParts = $sparePartsQuery->with(['carModels', 'analogs.analogSparePart'])->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        // Отладочная информация для проверки работы механизма аналогов
        \Log::info("Поиск по запросу: " . $query);
        \Log::info("Найдено запчастей: " . $spareParts->count());
        
        // Маркируем результаты поиска (основные запчасти и аналоги)
        if ($isArticleSearch) {
            if (!empty($this->exactMatchIds) && !empty($this->analogIds)) {
                // Маркируем запчасти на основе сохраненных ID
                $spareParts->transform(function ($part) {
                    $part->is_exact_match = in_array($part->id, $this->exactMatchIds);
                    $part->is_analog = in_array($part->id, $this->analogIds);
                    
                    // Добавляем отладочную информацию
                    \Log::info("Запчасть {$part->id} ({$part->part_number}): " . 
                        ($part->is_exact_match ? "точное совпадение" : "аналог"));
                    
                    return $part;
                });
            } else {
                // Явно отмечаем все аналоги, даже если они не были найдены через ID
                // Находим первую точную запчасть
                $mainPart = $spareParts->first(function ($part) use ($query) {
                    return strtolower($part->part_number) === strtolower(trim($query));
                });
                
                if ($mainPart) {
                    \Log::info("Основная запчасть: {$mainPart->part_number} (ID: {$mainPart->id})");
                    
                    // Остальные будут аналогами
                    $spareParts->transform(function ($part) use ($mainPart) {
                        if ($part->id !== $mainPart->id) {
                            $part->is_analog = true;
                            $part->is_exact_match = false;
                            \Log::info("Помечаем как аналог: {$part->part_number} (ID: {$part->id})");
                        } else {
                            $part->is_exact_match = true;
                            $part->is_analog = false;
                        }
                        return $part;
                    });
                }
            }
        } else {
            // Для обычного поиска не разделяем на аналоги
            $spareParts->transform(function ($part) {
                $part->is_exact_match = true;
                $part->is_analog = false;
                return $part;
            });
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }
    
    /**
     * Получить запчасти, совместимые с определенной моделью автомобиля
     *
     * @param int $carModelId ID модели автомобиля
     * @param array $filters Фильтры
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getSparePartsByCarModel(int $carModelId, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
    {
        $query = SparePart::whereHas('compatibilities', function (Builder $query) use ($carModelId) {
            $query->where('car_model_id', $carModelId);
        });
        
        // Применяем фильтры
        if (!empty($filters['category'])) {
            $query->where('category_id', $filters['category']);
        }
        
        if (!empty($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }
        
        if (!empty($filters['in_stock']) && $filters['in_stock']) {
            $query->where('stock_quantity', '>', 0);
        }
        
        // Сортировка
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                default:
                    $query->orderBy('name', 'asc');
            }
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $spareParts = $query->get();

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
    }

    /**
     * Получить процент наценки для текущего пользователя
     * 
     * @return float
     */
    protected function getUserMarkupPercent(): float
    {
        // Если пользователь авторизован
        if (Auth::check()) {
            $user = Auth::user();
            
            // Если у пользователя задан индивидуальный процент наценки
            if ($user->markup_percent !== null) {
                return (float)$user->markup_percent;
            }
        }
        
        // Возвращаем процент по умолчанию
        return self::DEFAULT_MARKUP_PERCENT;
    }
    
    /**
     * Форматировать коллекцию запчастей с учетом цен и прав пользователя
     * 
     * @param Collection $spareParts
     * @param bool $isAdmin
     * @param float $markupPercent
     * @return Collection
     */
    protected function formatSparePartsWithPrices(Collection $spareParts, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): Collection
    {
        return $spareParts->map(function ($sparePart) use ($isAdmin, $markupPercent) {
            return $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        });
    }
    
    /**
     * Форматировать запчасть с учетом цены и прав пользователя
     * 
     * @param SparePart $sparePart
     * @param bool $isAdmin
     * @param float $markupPercent
     * @return SparePart
     */
    protected function formatSparePartWithPrice(SparePart $sparePart, bool $isAdmin = false, float $markupPercent = self::DEFAULT_MARKUP_PERCENT): SparePart
    {
        // Исходная цена без наценки
        $originalPrice = $sparePart->price;
        
        // Рассчитываем наценку
        $markupPrice = $originalPrice * (1 + $markupPercent / 100);
        
        // Обычным пользователям показываем цену с наценкой
        if (!$isAdmin) {
            $sparePart->price = $markupPrice;
        } else {
            // Администраторам показываем как исходную цену, так и цену с наценкой
            $sparePart->original_price = $originalPrice;
            $sparePart->markup_price = $markupPrice;
            $sparePart->markup_percent = $markupPercent;
        }
        
        // Добавляем имя категории, если категория загружена
        if ($sparePart->relationLoaded('category') && $sparePart->category) {
            $sparePart->category_name = $sparePart->category->name;
        } else {
            $sparePart->category_name = 'Без категории';
        }
        
        return $sparePart;
    }

    // Добавляем алиасы для совместимости с PartsService
    
    /**
     * Алиас для getSparePartById
     */
    public function getPartById(mixed $id, bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Преобразуем $id в целое число
        $id = (int) $id;
        return $this->getSparePartById($id, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getPopularSpareParts
     */
    public function getPopularParts(int $limit = 8, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getPopularSpareParts($limit, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getSimilarSpareParts
     */
    public function getSimilarParts(int $partId, int $limit = 4, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getSimilarSpareParts($partId, $limit, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для searchSpareParts
     */
    public function searchParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->searchSpareParts($query, $isAdmin, $markupPercent);
    }
    
    /**
     * Алиас для getSparePartsByCarModel
     */
    public function getPartsByCarModel(int $carModelId, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
    {
        return $this->getSparePartsByCarModel($carModelId, $filters, $isAdmin, $markupPercent);
    }

    /**
     * Найти все аналоги запчасти, включая транзитивные связи
     * (аналоги аналогов)
     * 
     * @param int $sparePartId ID запчасти
     * @param array $visitedIds Массив уже обработанных ID (для предотвращения циклов)
     * @param int $depth Текущая глубина рекурсии
     * @param int $maxDepth Максимальная глубина рекурсии
     * @return array Массив ID аналогов
     */
    protected function findAllAnalogIds(int $sparePartId, array $visitedIds = [], int $depth = 0, int $maxDepth = 2): array
    {
        // Предотвращаем бесконечную рекурсию
        if ($depth >= $maxDepth || in_array($sparePartId, $visitedIds)) {
            return [];
        }
        
        // Добавляем текущую запчасть в список посещенных
        $visitedIds[] = $sparePartId;
        
        // Находим прямые аналоги
        $directAnalogIds = DB::table('spare_part_analogs')
            ->where('spare_part_id', $sparePartId)
            ->pluck('analog_spare_part_id')
            ->toArray();
            
        // Находим обратные аналоги (запчасти, для которых текущая является аналогом)
        $reverseAnalogIds = DB::table('spare_part_analogs')
            ->where('analog_spare_part_id', $sparePartId)
            ->pluck('spare_part_id')
            ->toArray();
            
        // Объединяем прямые и обратные аналоги
        $allDirectAnalogIds = array_merge($directAnalogIds, $reverseAnalogIds);
        $allAnalogIds = $allDirectAnalogIds;
        
        // Рекурсивно находим аналоги для каждого найденного аналога
        foreach ($allDirectAnalogIds as $analogId) {
            if (!in_array($analogId, $visitedIds)) {
                $transitiveAnalogIds = $this->findAllAnalogIds($analogId, $visitedIds, $depth + 1, $maxDepth);
                $allAnalogIds = array_merge($allAnalogIds, $transitiveAnalogIds);
            }
        }
        
        // Удаляем дубликаты и возвращаем уникальные ID
        return array_unique($allAnalogIds);
    }
} 