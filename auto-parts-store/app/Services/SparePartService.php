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
        // Проверяем, что запрос не пустой
        $query = trim($query ?? '');
        
        if (empty($query)) {
            return collect([]);
        }
        
        // Логируем начало поиска
        \Log::info("Начало поиска по запросу: '{$query}'");
        
        // Проверяем, не выглядит ли запрос как артикул
        $isArticleSearch = preg_match('/^[A-Za-z0-9-]+$/', $query);
        \Log::info("Тип поиска: " . ($isArticleSearch ? "по артикулу" : "по тексту"));
        
        $sparePartsQuery = SparePart::query();
        
        if ($isArticleSearch) {
            // Если запрос похож на артикул, ищем точные совпадения и начинающиеся с этого артикула
            $partNumber = $query;
            
            // Сначала найдем точные совпадения по артикулу (без учета регистра)
            $exactMatchQuery = SparePart::query()
                ->where(function (Builder $builder) use ($partNumber) {
                    $builder->whereRaw('LOWER(part_number) = ?', [strtolower($partNumber)]);
                })
                ->where('is_available', true)
                ->where('stock_quantity', '>', 0);
                
            $exactMatchParts = $exactMatchQuery->get();
            \Log::info("Найдено точных совпадений по артикулу: " . $exactMatchParts->count());
            
            // Если точные совпадения не найдены, ищем частичные совпадения
            if ($exactMatchParts->isEmpty()) {
                \Log::info("Точные совпадения не найдены, ищем частичные");
                $sparePartsQuery->where(function (Builder $builder) use ($partNumber) {
                    $builder->where('part_number', 'like', "{$partNumber}%")
                        ->orWhereRaw('LOWER(part_number) LIKE ?', [strtolower("{$partNumber}%")]);
                })
                ->where('is_available', true)
                ->where('stock_quantity', '>', 0);
                
                $spareParts = $sparePartsQuery->with(['carModels', 'category'])->get();
                
                // Маркируем все как точные совпадения
                $spareParts->transform(function ($part) {
                    $part->is_exact_match = true;
                    $part->is_analog = false;
                    return $part;
                });
                
                \Log::info("Найдено частичных совпадений: " . $spareParts->count());
                
                // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
                if ($markupPercent === null) {
                    $markupPercent = $this->getUserMarkupPercent();
                }
                
                return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
            }
            
            // Если найдены точные совпадения, собираем их ID для поиска аналогов
            $exactMatchIds = $exactMatchParts->pluck('id')->toArray();
            
            // Находим ID всех аналогов для найденных запчастей
            $allAnalogIds = [];
            foreach ($exactMatchIds as $exactMatchId) {
                $analogIds = $this->findAllAnalogIds($exactMatchId);
                $allAnalogIds = array_merge($allAnalogIds, $analogIds);
            }
            
            // Удаляем дубликаты и исключаем ID точных совпадений
            $uniqueAnalogIds = array_diff(array_unique($allAnalogIds), $exactMatchIds);
            \Log::info("Найдено аналогов: " . count($uniqueAnalogIds));
            
            // Если найдены аналоги, получаем их данные
            $analogParts = collect([]);
            if (!empty($uniqueAnalogIds)) {
                $analogParts = SparePart::whereIn('id', $uniqueAnalogIds)
                    ->where('is_available', true)
                    ->where('stock_quantity', '>', 0)
                    ->with(['carModels', 'category'])
                    ->get();
                    
                // Маркируем аналоги
                $analogParts->transform(function ($part) {
                    $part->is_exact_match = false;
                    $part->is_analog = true;
                    return $part;
                });
                
                \Log::info("Получено аналогов из базы: " . $analogParts->count());
            }
            
            // Маркируем точные совпадения
            $exactMatchParts->transform(function ($part) {
                $part->is_exact_match = true;
                $part->is_analog = false;
                return $part;
            });
            
            // Объединяем точные совпадения и аналоги
            $spareParts = $exactMatchParts->concat($analogParts);
            \Log::info("Общее количество найденных запчастей: " . $spareParts->count());
        } else {
            // Если запрос не похож на артикул, выполняем обычный поиск по тексту
            $sparePartsQuery->where(function (Builder $builder) use ($query) {
                $builder->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(manufacturer) LIKE ?', ['%' . strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($query) . '%']);
            })
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0);
            
            $spareParts = $sparePartsQuery->with(['carModels', 'category'])->get();
            \Log::info("Найдено запчастей по текстовому поиску: " . $spareParts->count());
            
            // Маркируем все результаты как точные совпадения
            $spareParts->transform(function ($part) {
                $part->is_exact_match = true;
                $part->is_analog = false;
                return $part;
            });
        }

        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }

        \Log::info("Завершение поиска по запросу: '{$query}', найдено: " . $spareParts->count());
        
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
     * @param float|null $markupPercent
     * @return Collection
     */
    public function formatSparePartsWithPrices(Collection $spareParts, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }
        
        return $spareParts->map(function ($sparePart) use ($isAdmin, $markupPercent) {
            return $this->formatSparePartWithPrice($sparePart, $isAdmin, $markupPercent);
        });
    }
    
    /**
     * Форматировать запчасть с учетом цены и прав пользователя
     * 
     * @param SparePart $sparePart
     * @param bool $isAdmin
     * @param float|null $markupPercent
     * @return SparePart
     */
    protected function formatSparePartWithPrice(SparePart $sparePart, bool $isAdmin = false, ?float $markupPercent = null): SparePart
    {
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }
        
        // Исходная цена без наценки
        $originalPrice = $sparePart->price;
        
        // Рассчитываем наценку
        $markupPrice = $originalPrice * (1 + $markupPercent / 100);
        
        // Для всех пользователей сохраняем базовую цену
        $sparePart->base_price = $originalPrice;
        
        // Добавляем отладочную информацию
        \Log::info("Форматирование цены для запчасти ID: {$sparePart->id}", [
            'original_price' => $originalPrice,
            'markup_price' => $markupPrice,
            'markup_percent' => $markupPercent,
            'is_admin' => $isAdmin,
            'base_price' => $sparePart->base_price
        ]);
        
        // Обычным пользователям показываем цену с наценкой
        if (!$isAdmin) {
            $sparePart->price = $markupPrice;
        } else {
            // Администраторам показываем и исходную цену, и цену с наценкой
            // Для админа price = цена с наценкой, base_price = цена без наценки
            $sparePart->price = $markupPrice; // Цена с наценкой
            $sparePart->base_price = $originalPrice; // Оригинальная цена без наценки
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
        // Проверяем, что ID является числом или может быть преобразован в число
        if (!is_numeric($id)) {
            \Log::warning("Попытка получить запчасть с некорректным ID: {$id}");
            return null;
        }
        
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
     * Получить запчасти по массиву ID
     * 
     * @param array $ids Массив ID запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function getPartsByIds(array $ids, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        if (empty($ids)) {
            return collect([]);
        }
        
        $spareParts = SparePart::with('category')
            ->whereIn('id', $ids)
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->get();
            
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }
        
        return $this->formatSparePartsWithPrices($spareParts, $isAdmin, $markupPercent);
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

    /**
     * Получить запчасти с пагинацией
     * 
     * @param int $page Номер страницы
     * @param int $limit Количество элементов на странице
     * @param array $filters Фильтры для запроса
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return array
     */
    public function getPaginatedSpareParts(int $page = 1, int $limit = 10, array $filters = [], bool $isAdmin = false, ?float $markupPercent = null)
    {
        // Создаем запрос
        $query = SparePart::query();
        
        // Применяем фильтры
        if (!empty($filters)) {
            // Фильтр по категории
            if (!empty($filters['category_id'])) {
                $categoryId = $filters['category_id'];
                
                // Получаем ID всех подкатегорий
                $subcategoryIds = DB::table('part_categories')
                    ->where('parent_id', $categoryId)
                    ->pluck('id')
                    ->toArray();
                
                // Используем ID текущей категории и всех её подкатегорий
                $categoryIds = array_merge([$categoryId], $subcategoryIds);
                
                $query->whereIn('category_id', $categoryIds);
            }
            
            // Фильтр по бренду/производителю
            if (!empty($filters['manufacturer'])) {
                $query->where('manufacturer', $filters['manufacturer']);
            }
            
            // Фильтр по цене (минимальная)
            if (!empty($filters['price_min'])) {
                $query->where('price', '>=', $filters['price_min']);
            }
            
            // Фильтр по цене (максимальная)
            if (!empty($filters['price_max'])) {
                $query->where('price', '<=', $filters['price_max']);
            }
            
            // Фильтр по наличию на складе
            if (isset($filters['in_stock']) && $filters['in_stock']) {
                $query->where('stock_quantity', '>', 0);
            }
            
            // Фильтр по поисковому запросу
            if (!empty($filters['search'])) {
                $searchTerm = $filters['search'];
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('part_number', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
            
            // Фильтр по модели автомобиля
            if (!empty($filters['model_id'])) {
                $modelId = $filters['model_id'];
                $query->whereHas('compatibilities', function($q) use ($modelId) {
                    $q->where('car_model_id', $modelId);
                });
            }
            
            // Фильтр по двигателю
            if (!empty($filters['engine_id'])) {
                $engineId = $filters['engine_id'];
                $query->whereHas('compatibilities', function($q) use ($engineId) {
                    $q->where('car_engine_id', $engineId);
                });
            }
        }
        
        // Сортировка
        $sortField = $filters['sort_field'] ?? 'name';
        $sortDirection = $filters['sort_direction'] ?? 'asc';
        
        // Проверяем допустимые поля для сортировки
        $allowedSortFields = ['name', 'price', 'manufacturer', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }
        
        // Проверяем допустимые направления сортировки
        $allowedSortDirections = ['asc', 'desc'];
        if (!in_array($sortDirection, $allowedSortDirections)) {
            $sortDirection = 'asc';
        }
        
        $query->orderBy($sortField, $sortDirection);
        
        // Получаем только активные и доступные запчасти (для обычных пользователей)
        if (!$isAdmin) {
            $query->where('is_active', true)
                  ->where('is_available', true);
        }
        
        // Получаем данные с пагинацией
        $spareParts = $query->with(['category', 'carModels'])
                           ->paginate($limit, ['*'], 'page', $page);
        
        // Если наценка не указана, используем наценку текущего пользователя или значение по умолчанию
        if ($markupPercent === null) {
            $markupPercent = $this->getUserMarkupPercent();
        }
        
        // Форматируем цены запчастей
        $formattedSpareParts = $this->formatSparePartsWithPrices($spareParts->getCollection(), $isAdmin, $markupPercent);
        
        // Создаем новый экземпляр пагинатора с отформатированными данными
        $result = new \Illuminate\Pagination\LengthAwarePaginator(
            $formattedSpareParts,
            $spareParts->total(),
            $spareParts->perPage(),
            $spareParts->currentPage(),
            ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath()]
        );
        
        return [
            'data' => $result->getCollection(),
            'current_page' => $result->currentPage(),
            'last_page' => $result->lastPage(),
            'per_page' => $result->perPage(),
            'total' => $result->total(),
            'from' => $result->firstItem(),
            'to' => $result->lastItem(),
            'links' => $result->linkCollection()
        ];
    }
} 