<?php

namespace App\Services;

use App\Models\SparePart;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Сервис для поиска запчастей
 */
class SparePartSearchService
{
    /**
     * @var SparePartService
     */
    protected $sparePartService;

    /**
     * @var AnalogService
     */
    protected $analogService;

    /**
     * Конструктор с внедрением зависимостей
     * 
     * @param SparePartService $sparePartService
     * @param AnalogService $analogService
     */
    public function __construct(SparePartService $sparePartService, AnalogService $analogService)
    {
        $this->sparePartService = $sparePartService;
        $this->analogService = $analogService;
    }

    /**
     * Поиск запчастей по названию или артикулу
     * 
     * @param string|null $query Поисковый запрос
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchSpareParts(?string $query, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        // Проверяем, что запрос не пустой
        $query = trim($query ?? '');
        
        if (empty($query)) {
            return collect([]);
        }
        
        // Логируем начало поиска
        Log::info("Начало поиска по запросу: '{$query}'");
        
        // Проверяем, не выглядит ли запрос как артикул
        $isArticleSearch = preg_match('/^[A-Za-z0-9-]+$/', $query);
        Log::info("Тип поиска: " . ($isArticleSearch ? "по артикулу" : "по тексту"));
        
        // Выполняем поиск в зависимости от типа запроса
        if ($isArticleSearch) {
            return $this->searchByArticle($query, $isAdmin, $markupPercent);
        } else {
            return $this->searchByText($query, $isAdmin, $markupPercent);
        }
    }

    /**
     * Поиск запчастей по артикулу
     * 
     * @param string $article Артикул
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchByArticle(string $article, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        // Очищаем артикул от лишних символов
        $article = $this->cleanArticle($article);
        Log::info("Поиск по артикулу: {$article}");
        
        // Сначала ищем точные совпадения (используем LOWER для регистронезависимого поиска)
        $exactMatches = SparePart::whereRaw('LOWER(part_number) = ?', [strtolower($article)])
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0)
            ->get();
            
        Log::info("Найдено точных совпадений: " . $exactMatches->count());
        
        // Помечаем точные совпадения
        $exactMatches = $exactMatches->map(function ($part) {
            $part->is_exact_match = true;
            $part->is_analog = false;
            return $part;
        });
        
        // Получаем аналоги напрямую из таблицы spare_part_analogs
        $analogParts = collect([]);
        $processedIds = []; // Массив для отслеживания обработанных ID аналогов
        
        // Если есть точные совпадения, ищем аналоги для них
        if ($exactMatches->isNotEmpty()) {
            $exactIds = $exactMatches->pluck('id')->toArray();
            Log::info("Поиск аналогов для точных совпадений: " . implode(', ', $exactIds));
            
            // Для каждого точного совпадения ищем аналоги напрямую из базы данных
            foreach ($exactIds as $partId) {
                // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                $analogIds = DB::table('spare_part_analogs')
                    ->where('spare_part_id', $partId)
                    ->pluck('analog_spare_part_id')
                    ->toArray();
                    
                $reverseAnalogIds = DB::table('spare_part_analogs')
                    ->where('analog_spare_part_id', $partId)
                    ->pluck('spare_part_id')
                    ->toArray();
                    
                $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                $allAnalogIds = array_unique($allAnalogIds);
                
                // Фильтруем ID, которые уже обработаны
                $newAnalogIds = array_diff($allAnalogIds, $processedIds);
                $processedIds = array_merge($processedIds, $newAnalogIds);
                
                Log::info("Найдено ID аналогов для запчасти {$partId}: " . implode(', ', $allAnalogIds));
                Log::info("Новые ID аналогов: " . implode(', ', $newAnalogIds));
                
                // Получаем данные аналогов
                if (!empty($newAnalogIds)) {
                    $analogs = SparePart::whereIn('id', $newAnalogIds)
                        ->where('is_available', true)
                        ->where('stock_quantity', '>', 0)
                        ->get();
                        
                    Log::info("Получено аналогов из базы: " . $analogs->count());
                    
                    // Помечаем аналоги
                    $analogs = $analogs->map(function ($part) {
                        $part->is_exact_match = false;
                        $part->is_analog = true;
                        return $part;
                    });
                    
                    $analogParts = $analogParts->concat($analogs);
                }
            }
            
            // Удаляем дубликаты
            $analogParts = $analogParts->unique('id');
            Log::info("Найдено всего уникальных аналогов: " . $analogParts->count());
        } else {
            // Если точных совпадений нет, ищем похожие артикулы (используем LOWER для регистронезависимого поиска)
            Log::info("Точных совпадений не найдено, ищем похожие артикулы");
            $similarMatches = SparePart::whereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($article) . '%'])
                ->where('is_available', true)
                ->where('stock_quantity', '>', 0)
                ->limit(10)
                ->get();
                
            Log::info("Найдено похожих артикулов: " . $similarMatches->count());
            
            // Если есть похожие артикулы, ищем аналоги для них
            if ($similarMatches->isNotEmpty()) {
                $similarIds = $similarMatches->pluck('id')->toArray();
                
                // Для каждого похожего артикула ищем аналоги напрямую из базы данных
                foreach ($similarIds as $partId) {
                    // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                    $analogIds = DB::table('spare_part_analogs')
                        ->where('spare_part_id', $partId)
                        ->pluck('analog_spare_part_id')
                        ->toArray();
                        
                    $reverseAnalogIds = DB::table('spare_part_analogs')
                        ->where('analog_spare_part_id', $partId)
                        ->pluck('spare_part_id')
                        ->toArray();
                        
                    $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                    $allAnalogIds = array_unique($allAnalogIds);
                    
                    // Фильтруем ID, которые уже обработаны
                    $newAnalogIds = array_diff($allAnalogIds, $processedIds);
                    $processedIds = array_merge($processedIds, $newAnalogIds);
                    
                    Log::info("Найдено ID аналогов для похожей запчасти {$partId}: " . implode(', ', $allAnalogIds));
                    Log::info("Новые ID аналогов: " . implode(', ', $newAnalogIds));
                    
                    // Получаем данные аналогов
                    if (!empty($newAnalogIds)) {
                        $analogs = SparePart::whereIn('id', $newAnalogIds)
                            ->where('is_available', true)
                            ->where('stock_quantity', '>', 0)
                            ->get();
                            
                        Log::info("Получено аналогов из базы для похожей запчасти: " . $analogs->count());
                        
                        // Помечаем аналоги
                        $analogs = $analogs->map(function ($part) {
                            $part->is_exact_match = false;
                            $part->is_analog = true;
                            return $part;
                        });
                        
                        $analogParts = $analogParts->concat($analogs);
                    }
                }
                
                // Удаляем дубликаты
                $analogParts = $analogParts->unique('id');
                Log::info("Найдено всего уникальных аналогов для похожих артикулов: " . $analogParts->count());
                
                // Помечаем похожие артикулы как не точные совпадения
                $similarMatches = $similarMatches->map(function ($part) {
                    $part->is_exact_match = false;
                    $part->is_analog = false;
                    return $part;
                });
                
                // Объединяем похожие артикулы с точными совпадениями
                $exactMatches = $exactMatches->concat($similarMatches);
            }
            
            // Если все еще нет результатов, ищем любую запчасть с похожим артикулом для поиска аналогов
            if ($exactMatches->isEmpty() && $analogParts->isEmpty()) {
                Log::info("Не найдено ни точных совпадений, ни похожих артикулов. Ищем любую запчасть с похожим артикулом");
                $anyPart = SparePart::whereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($article) . '%'])->first();
                
                if ($anyPart) {
                    Log::info("Найдена запчасть с ID {$anyPart->id} и артикулом {$anyPart->part_number}");
                    
                    // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                    $analogIds = DB::table('spare_part_analogs')
                        ->where('spare_part_id', $anyPart->id)
                        ->pluck('analog_spare_part_id')
                        ->toArray();
                        
                    $reverseAnalogIds = DB::table('spare_part_analogs')
                        ->where('analog_spare_part_id', $anyPart->id)
                        ->pluck('spare_part_id')
                        ->toArray();
                        
                    $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                    $allAnalogIds = array_unique($allAnalogIds);
                    
                    // Фильтруем ID, которые уже обработаны
                    $newAnalogIds = array_diff($allAnalogIds, $processedIds);
                    $processedIds = array_merge($processedIds, $newAnalogIds);
                    
                    Log::info("Найдено ID аналогов для запчасти {$anyPart->id}: " . implode(', ', $allAnalogIds));
                    Log::info("Новые ID аналогов: " . implode(', ', $newAnalogIds));
                    
                    // Получаем данные аналогов
                    if (!empty($newAnalogIds)) {
                        $analogs = SparePart::whereIn('id', $newAnalogIds)
                            ->where('is_available', true)
                            ->where('stock_quantity', '>', 0)
                            ->get();
                            
                        Log::info("Получено аналогов из базы: " . $analogs->count());
                        
                        // Помечаем аналоги
                        $analogs = $analogs->map(function ($part) {
                            $part->is_exact_match = false;
                            $part->is_analog = true;
                            return $part;
                        });
                        
                        $analogParts = $analogParts->concat($analogs);
                    }
                }
            }
        }
        
        // Исключаем из аналогов ID точных совпадений
        $exactIds = $exactMatches->pluck('id')->toArray();
        $analogParts = $analogParts->filter(function ($part) use ($exactIds) {
            return !in_array($part->id, $exactIds);
        });
        
        // Объединяем все результаты
        $allResults = $exactMatches->concat($analogParts)->unique('id');
        Log::info("Всего результатов после объединения: " . $allResults->count());
        
        // Форматируем цены в зависимости от роли пользователя
        return $this->sparePartService->formatSparePartsWithPrices($allResults, $isAdmin, $markupPercent);
    }

    /**
     * Поиск запчастей по текстовому запросу
     * 
     * @param string $query Текстовый запрос
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection
     */
    public function searchByText(string $query, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        // Проверяем, похож ли запрос на артикул
        $isArticleLike = preg_match('/^[A-Za-z0-9-]+$/', $query);
        if ($isArticleLike) {
            Log::info("Запрос похож на артикул: {$query}, используем поиск по артикулу");
            return $this->searchByArticle($query, $isAdmin, $markupPercent);
        }
        
        // Разбиваем запрос на слова для более точного поиска
        $words = explode(' ', $query);
        $words = array_filter($words, function ($word) {
            return strlen($word) > 2; // Игнорируем слишком короткие слова
        });
        
        // Если после фильтрации не осталось слов, используем оригинальный запрос
        if (empty($words)) {
            $words = [$query];
        }
        
        // Сохраняем оригинальный запрос для дальнейшего использования
        $originalQuery = $query;
        
        $queryBuilder = SparePart::query()
            ->where('is_available', true)
            ->where('stock_quantity', '>', 0);
            
        // Добавляем условия поиска для каждого слова
        $queryBuilder->where(function (Builder $builder) use ($words, $originalQuery) {
            foreach ($words as $word) {
                $builder->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($word) . '%'])
                    ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($word) . '%'])
                    ->orWhereRaw('LOWER(manufacturer) LIKE ?', ['%' . strtolower($word) . '%']);
            }
            
            // Также ищем по полному запросу
            $builder->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($originalQuery) . '%'])
                ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($originalQuery) . '%'])
                ->orWhereRaw('LOWER(manufacturer) LIKE ?', ['%' . strtolower($originalQuery) . '%']);
                
            // Проверяем, похож ли запрос на артикул
            if (preg_match('/^[A-Za-z0-9-]+$/', $originalQuery)) {
                $builder->orWhereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($originalQuery) . '%']);
            }
        });
        
        // Ограничиваем количество результатов
        $queryBuilder->limit(30);
        
        // Получаем результаты
        $results = $queryBuilder->get();
        Log::info("Найдено запчастей по текстовому запросу: " . $results->count());
        
        // Если найдены результаты, ищем аналоги для них
        $resultIds = $results->pluck('id')->toArray();
        $analogParts = collect([]);
        $processedIds = []; // Массив для отслеживания обработанных ID аналогов
        
        if (!empty($resultIds)) {
            Log::info("Поиск аналогов для найденных запчастей: " . implode(', ', $resultIds));
            
            // Для каждого результата ищем аналоги напрямую из базы данных
            foreach ($resultIds as $partId) {
                // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                $analogIds = DB::table('spare_part_analogs')
                    ->where('spare_part_id', $partId)
                    ->pluck('analog_spare_part_id')
                    ->toArray();
                    
                $reverseAnalogIds = DB::table('spare_part_analogs')
                    ->where('analog_spare_part_id', $partId)
                    ->pluck('spare_part_id')
                    ->toArray();
                    
                $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                $allAnalogIds = array_unique($allAnalogIds);
                
                // Фильтруем ID, которые уже обработаны
                $newAnalogIds = array_diff($allAnalogIds, $processedIds, $resultIds);
                $processedIds = array_merge($processedIds, $newAnalogIds);
                
                Log::info("Найдено ID аналогов для запчасти {$partId}: " . implode(', ', $allAnalogIds));
                Log::info("Новые ID аналогов: " . implode(', ', $newAnalogIds));
                
                // Получаем данные аналогов
                if (!empty($newAnalogIds)) {
                    $analogs = SparePart::whereIn('id', $newAnalogIds)
                        ->where('is_available', true)
                        ->where('stock_quantity', '>', 0)
                        ->get();
                        
                    Log::info("Получено аналогов из базы: " . $analogs->count());
                    
                    // Помечаем аналоги
                    $analogs = $analogs->map(function ($part) {
                        $part->is_exact_match = false;
                        $part->is_analog = true;
                        return $part;
                    });
                    
                    $analogParts = $analogParts->concat($analogs);
                }
            }
            
            // Удаляем дубликаты
            $analogParts = $analogParts->unique('id');
            Log::info("Найдено всего уникальных аналогов: " . $analogParts->count());
        }
        
        // Помечаем основные результаты как точные совпадения
        $results = $results->map(function ($part) {
            $part->is_exact_match = true;
            $part->is_analog = false;
            return $part;
        });
        
        // Исключаем из аналогов ID основных результатов
        $resultIds = $results->pluck('id')->toArray();
        $analogParts = $analogParts->filter(function ($part) use ($resultIds) {
            return !in_array($part->id, $resultIds);
        });
        
        // Объединяем основные результаты и аналоги
        $allResults = $results->concat($analogParts)->unique('id');
        Log::info("Всего результатов после объединения: " . $allResults->count());
        
        // Форматируем цены в зависимости от роли пользователя
        return $this->sparePartService->formatSparePartsWithPrices($allResults, $isAdmin, $markupPercent);
    }

    /**
     * Найти аналоги для списка запчастей
     * 
     * @param array $partIds Массив ID запчастей
     * @param bool $isAdmin Является ли пользователь администратором
     * @param float|null $markupPercent Процент наценки для пользователя
     * @return Collection Коллекция аналогов
     */
    protected function findAnalogs(array $partIds, bool $isAdmin = false, ?float $markupPercent = null): Collection
    {
        if (empty($partIds)) {
            return collect([]);
        }
        
        try {
            Log::info("Поиск аналогов для запчастей: " . implode(', ', $partIds));
            
            // Используем AnalogService для получения аналогов
            $analogService = app(\App\Services\AnalogService::class);
            $allAnalogs = collect([]);
            
            // Для каждой запчасти находим аналоги и объединяем их
            foreach ($partIds as $partId) {
                $analogs = $analogService->getAnalogs($partId, $isAdmin, $markupPercent);
                Log::info("Найдено {$analogs->count()} аналогов для запчасти ID {$partId}");
                
                if ($analogs->isNotEmpty()) {
                    // Объединяем с уже найденными аналогами
                    $allAnalogs = $allAnalogs->concat($analogs);
                }
            }
            
            // Удаляем дубликаты по ID
            $allAnalogs = $allAnalogs->unique('id');
            
            // Исключаем исходные запчасти из списка аналогов
            $allAnalogs = $allAnalogs->filter(function ($part) use ($partIds) {
                return !in_array($part->id, $partIds);
            });
            
            Log::info("Всего найдено уникальных аналогов: " . $allAnalogs->count());
            
            return $allAnalogs;
        } catch (\Exception $e) {
            Log::error('Ошибка при поиске аналогов: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Получение подсказок для поиска запчастей
     * 
     * @param string $query Текстовый запрос
     * @param int $limit Максимальное количество подсказок
     * @return array
     */
    public function getSearchSuggestions(string $query, int $limit = 10): array
    {
        // Проверяем, что запрос не пустой
        $query = trim($query);
        
        if (empty($query) || strlen($query) < 2) {
            return [];
        }
        
        // Ищем подсказки по названию, описанию и производителю
        $suggestions = \App\Models\SparePart::query()
            ->where('is_available', true)
            ->where(function ($builder) use ($query) {
                $builder->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(manufacturer) LIKE ?', ['%' . strtolower($query) . '%']);
            })
            ->limit($limit * 3) // Получаем больше результатов для последующей фильтрации
            ->get(['name', 'description', 'manufacturer']);
            
        // Собираем уникальные подсказки
        $result = [];
        
        // Добавляем подсказки из названий
        foreach ($suggestions as $item) {
            // Добавляем название целиком, если оно содержит запрос
            if (stripos($item->name, $query) !== false) {
                $result[] = $item->name;
            }
            
            // Добавляем производителя, если он содержит запрос
            if (!empty($item->manufacturer) && stripos($item->manufacturer, $query) !== false) {
                $result[] = $item->manufacturer;
            }
            
            // Добавляем ключевые фразы из описания, если они содержат запрос
            if (!empty($item->description)) {
                $words = explode(' ', $item->description);
                foreach ($words as $word) {
                    if (strlen($word) > 3 && stripos($word, $query) !== false) {
                        $result[] = $word;
                    }
                }
            }
        }
        
        // Удаляем дубликаты и ограничиваем количество результатов
        $result = array_unique($result);
        $result = array_slice($result, 0, $limit);
        
        return $result;
    }
    
    /**
     * Получение подсказок для поиска запчастей по артикулу
     * 
     * @param string $query Запрос артикула
     * @param int $limit Максимальное количество подсказок
     * @return array
     */
    public function getArticleSuggestions(string $query, int $limit = 10): array
    {
        // Проверяем, что запрос не пустой
        $query = trim($query);
        
        if (empty($query) || strlen($query) < 2) {
            return [];
        }
        
        // Логируем запрос для отладки
        Log::info("Поиск подсказок по артикулу: {$query}");
        
        // Ищем подсказки по артикулу (используем LOWER для регистронезависимого поиска)
        $suggestions = \App\Models\SparePart::query()
            ->where('is_available', true)
            ->where(function ($builder) use ($query) {
                $builder->whereRaw('LOWER(part_number) LIKE ?', [strtolower($query) . '%'])
                    ->orWhereRaw('LOWER(part_number) LIKE ?', ['%' . strtolower($query) . '%']);
            })
            ->orderByRaw('CASE WHEN LOWER(part_number) LIKE ? THEN 1 ELSE 2 END', [strtolower($query) . '%'])
            ->limit($limit)
            ->pluck('part_number')
            ->toArray();
            
        // Логируем результаты для отладки
        Log::info("Найдено подсказок по артикулу: " . count($suggestions), [
            'suggestions' => $suggestions
        ]);
            
        // Удаляем дубликаты и ограничиваем количество результатов
        $suggestions = array_unique($suggestions);
        $suggestions = array_slice($suggestions, 0, $limit);
        
        return $suggestions;
    }

    /**
     * Очищаем артикул от лишних символов
     * 
     * @param string $article Артикул
     * @return string
     */
    protected function cleanArticle(string $article): string
    {
        // Регулярное выражение для удаления лишних символов
        $pattern = '/[^A-Za-z0-9-]/';
        return preg_replace($pattern, '', $article);
    }
} 