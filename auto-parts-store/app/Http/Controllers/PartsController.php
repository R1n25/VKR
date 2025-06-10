<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\SparePartService;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Models\SparePart;
use Illuminate\Support\Facades\DB;

class PartsController extends Controller
{
    protected $sparePartService;
    protected $brandService;
    protected $categoryService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        SparePartService $sparePartService,
        BrandService $brandService,
        CategoryService $categoryService
    ) {
        $this->sparePartService = $sparePartService;
        $this->brandService = $brandService;
        $this->categoryService = $categoryService;
    }

    /**
     * Отображение информации о запчасти
     */
    public function show($id)
    {
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Получаем информацию о запчасти с учетом роли пользователя
        $part = $this->sparePartService->getPartById($id, $isAdmin);
        
        if (!$part) {
            abort(404);
        }
        
        // Загружаем категорию запчасти
        $part->load('category');
        
        // Добавляем имя категории в данные запчасти
        if ($part->category) {
            $part->category_name = $part->category->name;
        } else {
            $part->category_name = 'Без категории';
        }
        
        // Загружаем данные о совместимости
        // Сначала из таблицы SparePartCompatibility
        $compatibilities = \App\Models\SparePartCompatibility::where('spare_part_id', $id)
            ->where('is_verified', true)
            ->whereNull('car_engine_id') // Берем только записи без двигателя
            ->with(['carModel.brand', 'carEngine'])
            ->get()
            ->map(function ($compatibility) {
                return [
                    'id' => $compatibility->id,
                    'brand' => $compatibility->carModel->brand->name,
                    'model' => $compatibility->carModel->name,
                    'engine' => $compatibility->carEngine,
                    'notes' => $compatibility->notes
                ];
            });
        
        // Затем добавляем данные из таблицы car_engine_spare_part
        try {
            \Log::info('Выполняем запрос для получения совместимости двигателей для запчасти ID: ' . $id);
            
            // Получаем все записи из car_engine_spare_part для данной запчасти
            $engineSparePartRecords = DB::table('car_engine_spare_part')
                ->where('spare_part_id', $id)
                ->get();
                
            \Log::info('Найдено записей car_engine_spare_part: ' . $engineSparePartRecords->count());
            
            // Если записи найдены, получаем данные о двигателях
            $engineCompatibilities = collect();
            
            if ($engineSparePartRecords->count() > 0) {
                // Получаем ID двигателей
                $engineIds = $engineSparePartRecords->pluck('car_engine_id')->toArray();
                \Log::info('ID двигателей: ' . implode(', ', $engineIds));
                
                // Получаем данные о двигателях
                $engines = DB::table('car_engines')
                    ->whereIn('id', $engineIds)
                    ->get();
                    
                \Log::info('Найдено двигателей: ' . $engines->count());
                
                // Создаем словарь для быстрого поиска двигателей по ID
                $enginesById = [];
                foreach ($engines as $engine) {
                    $enginesById[$engine->id] = $engine;
                }
                
                // Создаем записи совместимости
                foreach ($engineSparePartRecords as $record) {
                    if (isset($enginesById[$record->car_engine_id])) {
                        $engine = $enginesById[$record->car_engine_id];
                        
                        // Получаем данные о модели автомобиля
                        $carModel = null;
                        try {
                            $carModel = DB::table('car_models')
                                ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
                                ->where('car_models.id', $engine->model_id)
                                ->select(
                                    'car_models.id',
                                    'car_models.name as model_name',
                                    'car_brands.name as brand_name'
                                )
                                ->first();
                        } catch (\Exception $e) {
                            \Log::warning('Не удалось получить данные о модели автомобиля: ' . $e->getMessage());
                        }
                        
                        $engineData = [
                            'name' => $engine->name ?? 'Неизвестный двигатель',
                            'volume' => $engine->volume,
                            'power' => $engine->power,
                            'fuel_type' => $engine->type
                        ];
                        
                        $years = null;
                        if ($engine->year_start || $engine->year_end) {
                            if ($engine->year_start && $engine->year_end) {
                                $years = $engine->year_start . '-' . $engine->year_end;
                            } elseif ($engine->year_start) {
                                $years = 'с ' . $engine->year_start;
                            } else {
                                $years = 'до ' . $engine->year_end;
                            }
                        }
                        
                        $compatibility = [
                            'id' => 'engine_' . $record->id,
                            'brand' => $carModel ? $carModel->brand_name : 'Универсальная совместимость',
                            'model' => $carModel ? $carModel->model_name : 'Для всех моделей с данным двигателем',
                            'years' => $years,
                            'engine' => $engineData,
                            'notes' => $record->notes,
                            'source' => 'engine_compatibility'
                        ];
                        
                        $engineCompatibilities->push($compatibility);
                    }
                }
            }
            
            \Log::info('Подготовлено записей совместимости: ' . $engineCompatibilities->count());
            \Log::info('Данные совместимости:', $engineCompatibilities->toArray());
            
            // Объединяем данные из обоих источников
            $allCompatibilities = $compatibilities->concat($engineCompatibilities);
            
            \Log::info('Всего записей совместимости: ' . $allCompatibilities->count());
            
        } catch (\Exception $e) {
            \Log::error('Ошибка при загрузке совместимостей двигателей: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            // В случае ошибки используем только основные совместимости
            $allCompatibilities = $compatibilities;
        }
            
        // Добавляем совместимости к объекту запчасти
        $part->compatibilities = $allCompatibilities;
        
        // Отладочный вывод
        \Log::info('Part data:', ['part' => $part->toArray()]);
        \Log::info('Compatibilities count: ' . $allCompatibilities->count());
        \Log::info('Compatibilities data:', $allCompatibilities->toArray());
        
        // Получаем похожие запчасти
        $similarParts = $this->sparePartService->getSimilarParts($id, 4, $isAdmin);
        
        // Получаем рекомендуемые аналоги
        $recommendedAnalogs = $this->getRecommendedAnalogs($part);
        
        // Загружаем неодобренные предложения совместимости для администраторов
        $pendingSuggestions = [];
        $pendingAnalogSuggestions = [];
        if ($isAdmin) {
            $pendingSuggestions = \App\Models\UserSuggestion::where('spare_part_id', $id)
                ->where('suggestion_type', 'compatibility')
                ->where('status', 'pending')
                ->with(['user', 'carModel.brand'])
                ->get();
                
            // Для каждого предложения загружаем информацию о двигателе, если она есть
            foreach ($pendingSuggestions as $suggestion) {
                if (!empty($suggestion->data['car_engine_id'])) {
                    $engine = \App\Models\CarEngine::find($suggestion->data['car_engine_id']);
                    if ($engine) {
                        $suggestion->engine = $engine;
                    }
                }
            }
            
            // Загружаем неодобренные предложения аналогов
            $pendingAnalogSuggestions = \App\Models\UserSuggestion::where('spare_part_id', $id)
                ->where('suggestion_type', 'analog')
                ->where('status', 'pending')
                ->with(['user', 'analogSparePart'])
                ->get();
        }
        
        // Преобразуем объект запчасти в массив для передачи в компонент
        $partData = $part->toArray();
        
        // Преобразуем коллекцию совместимостей в массив
        $partData['compatibilities'] = $allCompatibilities->toArray();
        
        return Inertia::render('Parts/Show', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'part' => $partData,
            'similarParts' => $similarParts,
            'recommendedAnalogs' => $recommendedAnalogs,
            'isAdmin' => $isAdmin,
            'pendingSuggestions' => $pendingSuggestions ?? [],
            'pendingAnalogSuggestions' => $pendingAnalogSuggestions ?? []
        ]);
    }

    /**
     * Поиск запчастей по категории, производителю или названию
     */
    public function search(Request $request)
    {
        // Проверяем оба параметра - q (с фронтенда) и query (для обратной совместимости)
        $searchQueryParam = null;
        if ($request->filled('q')) {
            $searchQueryParam = $request->input('q');
        } elseif ($request->filled('query')) {
            $searchQueryParam = $request->input('query');
        }
        
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Используем сервис для поиска запчастей
        $spareParts = $this->sparePartService->searchSpareParts($searchQueryParam, $isAdmin);
        
        // Логируем результаты поиска для отладки
        \Log::info("Поиск: '{$searchQueryParam}', Найдено: " . $spareParts->count());
        
        // Получение категорий для фильтрации
        $categories = \App\Models\PartCategory::orderBy('name')->get();
        
        // Получение производителей для фильтрации
        $manufacturers = SparePart::select('manufacturer')
            ->distinct()
            ->where('is_available', true)
            ->whereNotNull('manufacturer')
            ->orderBy('manufacturer')
            ->pluck('manufacturer');
        
        return Inertia::render('Search', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'spareParts' => $spareParts,
            'categories' => $categories,
            'manufacturers' => $manufacturers,
            'filters' => $request->only(['q', 'query', 'category_id', 'manufacturer', 'car_model_id', 'price_min', 'price_max', 'sort_by', 'sort_order']),
            'searchQuery' => $searchQueryParam,
            'isAdmin' => $isAdmin
        ]);
    }

    /**
     * Получить рекомендуемые аналоги для запчасти
     */
    private function getRecommendedAnalogs($part)
    {
        // Получаем существующие аналоги этой запчасти (ID)
        $existingAnalogIds = \App\Models\SparePartAnalog::where('spare_part_id', $part->id)
            ->pluck('analog_spare_part_id')
            ->toArray();
            
        // Добавляем ID самой запчасти, чтобы исключить её из поиска
        $existingAnalogIds[] = $part->id;
        
        // Ищем запчасти той же категории и с похожим названием
        $potentialAnalogs = \App\Models\SparePart::query()
            ->where('id', '!=', $part->id)
            ->where('category_id', $part->category_id)
            ->whereNotIn('id', $existingAnalogIds)
            ->where(function ($query) use ($part) {
                // Ищем запчасти того же назначения, но от других производителей
                $name = preg_replace('/\b' . preg_quote($part->manufacturer, '/') . '\b/i', '', $part->name);
                $name = trim($name);
                
                if (!empty($name)) {
                    $words = explode(' ', $name);
                    foreach ($words as $word) {
                        if (strlen($word) > 3) { // Игнорируем короткие слова
                            $query->orWhere('name', 'like', '%' . $word . '%');
                        }
                    }
                }
            })
            ->limit(5)
            ->get();
            
        return $potentialAnalogs;
    }
    
    /**
     * Поиск запчастей по артикулу
     */
    public function findByArticle(Request $request)
    {
        // Получаем артикул из запроса
        $articleNumber = $request->input('article');
        
        if (empty($articleNumber)) {
            return Inertia::render('Parts/FindByArticle', [
                'auth' => [
                    'user' => auth()->user(),
                ]
            ]);
        }
        
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->role === 'admin';
        
        // Используем сервис для поиска запчастей по артикулу
        $results = $this->sparePartService->searchSpareParts($articleNumber, $isAdmin);
        
        // Разделяем результаты на основные и аналоги
        $parts = $results->filter(function ($part) {
            return $part->is_exact_match && !$part->is_analog;
        })->values();
        
        $analogs = $results->filter(function ($part) {
            return $part->is_analog;
        })->values();
        
        return Inertia::render('Parts/FindByArticle', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'articleNumber' => $articleNumber,
            'parts' => $parts,
            'analogs' => $analogs,
            'isAdmin' => $isAdmin
        ]);
    }
} 