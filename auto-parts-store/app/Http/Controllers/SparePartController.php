<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\SparePartService;
use App\Services\SparePartSearchService;
use App\Services\SparePartCompatibilityService;
use App\Services\AnalogService;
use App\Models\SparePart;
use App\Models\PartCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SparePartController extends Controller
{
    /**
     * @var SparePartService
     */
    protected $sparePartService;
    
    /**
     * @var SparePartSearchService
     */
    protected $sparePartSearchService;
    
    /**
     * @var SparePartCompatibilityService
     */
    protected $compatibilityService;
    
    /**
     * @var AnalogService
     */
    protected $analogService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        SparePartService $sparePartService, 
        SparePartSearchService $sparePartSearchService,
        SparePartCompatibilityService $compatibilityService,
        AnalogService $analogService
    ) {
        $this->sparePartService = $sparePartService;
        $this->sparePartSearchService = $sparePartSearchService;
        $this->compatibilityService = $compatibilityService;
        $this->analogService = $analogService;
    }

    /**
     * Поиск запчастей по названию, артикулу или производителю
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function search(Request $request)
    {
        try {
            // Проверяем оба параметра - q (с фронтенда) и query (для обратной совместимости)
            $searchQueryParam = null;
            if ($request->filled('q')) {
                $searchQueryParam = $request->input('q');
            } elseif ($request->filled('query')) {
                $searchQueryParam = $request->input('query');
            }
            
            // Получаем тип поиска (text или article)
            $searchType = $request->input('type', 'text');
            
            // Проверяем, похож ли запрос на артикул
            $isArticleLike = !empty($searchQueryParam) && preg_match('/^[A-Za-z0-9-]+$/', $searchQueryParam);
            
            // Если запрос похож на артикул, но тип поиска текстовый, изменяем тип на поиск по артикулу
            if ($isArticleLike && $searchType === 'text') {
                Log::info('Запрос похож на артикул, изменяем тип поиска на article');
                $searchType = 'article';
            }
            
            // ОТЛАДКА - Добавляем отладочную информацию в начале метода
            $debug = [
                'request_time' => now()->format('Y-m-d H:i:s'),
                'search_query' => $searchQueryParam,
                'search_type' => $searchType,
                'is_article_like' => $isArticleLike,
                'search_query_empty' => empty($searchQueryParam),
                'user_id' => auth()->id(),
                'is_admin' => auth()->check() && auth()->user()->is_admin,
            ];
            
            Log::info('START SEARCH: ' . json_encode($debug));
            
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            // Если запрос пустой, возвращаем пустой результат
            if (empty($searchQueryParam)) {
                return Inertia::render('Search', [
                    'auth' => [
                        'user' => auth()->user(),
                    ],
                    'spareParts' => [],
                    'searchQuery' => '',
                    'searchType' => $searchType,
                    'debug_info' => $debug
                ]);
            }
            
            // Получаем результаты поиска через сервис в зависимости от типа поиска
            if ($searchType === 'article') {
                // Для поиска по артикулу используем специальный метод
                $results = $this->sparePartSearchService->searchByArticle($searchQueryParam, $isAdmin);
                
                // Проверяем, были ли найдены результаты
                if ($results->isEmpty()) {
                    Log::info('Не найдено результатов при поиске по артикулу, пробуем искать аналоги');
                    
                    // Если по артикулу ничего не найдено, попробуем найти аналоги по этому артикулу
                    // Это дополнительный поиск, если метод searchByArticle не нашел аналоги
                    $sparePart = \App\Models\SparePart::where('part_number', 'like', "%{$searchQueryParam}%")->first();
                    if ($sparePart) {
                        Log::info('Найдена запчасть с похожим артикулом: ' . $sparePart->id);
                        
                        // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                        $analogIds = \DB::table('spare_part_analogs')
                            ->where('spare_part_id', $sparePart->id)
                            ->pluck('analog_spare_part_id')
                            ->toArray();
                            
                        $reverseAnalogIds = \DB::table('spare_part_analogs')
                            ->where('analog_spare_part_id', $sparePart->id)
                            ->pluck('spare_part_id')
                            ->toArray();
                            
                        $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                        $allAnalogIds = array_unique($allAnalogIds);
                        
                        Log::info("Найдено ID аналогов для запчасти {$sparePart->id}: " . implode(', ', $allAnalogIds));
                        
                        // Получаем данные аналогов
                        if (!empty($allAnalogIds)) {
                            $analogs = \App\Models\SparePart::whereIn('id', $allAnalogIds)
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
                            
                            if ($analogs->isNotEmpty()) {
                                Log::info('Найдены аналоги: ' . $analogs->count());
                                $results = $analogs;
                            }
                        }
                    }
                }
            } else {
                // Для текстового поиска используем стандартный метод
                $results = $this->sparePartSearchService->searchByText($searchQueryParam, $isAdmin);
                
                // Проверяем, есть ли в результатах аналоги
                $hasAnalogs = $results->contains('is_analog', true);
                Log::info('Результаты текстового поиска содержат аналоги: ' . ($hasAnalogs ? 'да' : 'нет'));
                
                // Если результаты не содержат аналогов, но есть точные совпадения, попробуем найти аналоги
                if (!$hasAnalogs && $results->isNotEmpty()) {
                    // Проверяем, похож ли запрос на артикул
                    $isArticleSearch = preg_match('/^[A-Za-z0-9-]+$/', $searchQueryParam);
                    if ($isArticleSearch) {
                        Log::info('Запрос похож на артикул, ищем запчасть с точным артикулом');
                        $exactPart = \App\Models\SparePart::where('part_number', $searchQueryParam)->first();
                        if ($exactPart) {
                            Log::info('Найдена запчасть с точным артикулом: ' . $exactPart->id);
                            
                            // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                            $analogIds = \DB::table('spare_part_analogs')
                                ->where('spare_part_id', $exactPart->id)
                                ->pluck('analog_spare_part_id')
                                ->toArray();
                                
                            $reverseAnalogIds = \DB::table('spare_part_analogs')
                                ->where('analog_spare_part_id', $exactPart->id)
                                ->pluck('spare_part_id')
                                ->toArray();
                                
                            $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                            $allAnalogIds = array_unique($allAnalogIds);
                            
                            Log::info("Найдено ID аналогов для запчасти {$exactPart->id}: " . implode(', ', $allAnalogIds));
                            
                            // Получаем данные аналогов
                            if (!empty($allAnalogIds)) {
                                $analogs = \App\Models\SparePart::whereIn('id', $allAnalogIds)
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
                                
                                if ($analogs->isNotEmpty()) {
                                    Log::info('Найдены аналоги для точного артикула: ' . $analogs->count());
                                    // Объединяем с основными результатами
                                    $results = $results->concat($analogs)->unique('id');
                                }
                            }
                        }
                    }
                }
            }
            
            // Обновляем отладочную информацию
            $debug['found_results'] = count($results);
            $debug['first_result'] = $results->first() ? json_encode($results->first()) : 'null';
            
            Log::info('SEARCH RESULTS: ' . json_encode($debug));
            
            // Преобразуем коллекцию в массив для передачи во фронтенд
            $sparePartsArray = $results->toArray();
            
            $debug['array_count'] = count($sparePartsArray);
            Log::info('AFTER CONVERSION: ' . json_encode($debug));
            
            // Разделяем результаты на точные совпадения и аналоги для удобства отображения
            $exactMatches = [];
            $analogs = [];
            $otherResults = [];
            
            // Проверяем, есть ли аналоги в результатах поиска
            $hasAnalogs = false;
            foreach ($sparePartsArray as $part) {
                if (isset($part['is_analog']) && $part['is_analog']) {
                    $hasAnalogs = true;
                    break;
                }
            }
            
            Log::info("Результаты содержат аналоги: " . ($hasAnalogs ? 'да' : 'нет'));
            
            // Если аналогов нет, но это поиск по артикулу, попробуем найти их напрямую
            if (!$hasAnalogs && $isArticleLike && !empty($sparePartsArray)) {
                Log::info("Аналоги не найдены, но это поиск по артикулу. Ищем аналоги напрямую из базы");
                
                // Находим запчасть с точным артикулом
                $exactPart = null;
                foreach ($sparePartsArray as $part) {
                    if (isset($part['part_number']) && strtoupper($part['part_number']) === strtoupper($searchQueryParam)) {
                        $exactPart = $part;
                        break;
                    }
                }
                
                if ($exactPart) {
                    Log::info("Найдена запчасть с точным артикулом: ID {$exactPart['id']}, артикул {$exactPart['part_number']}");
                    
                    // Получаем ID аналогов напрямую из таблицы spare_part_analogs
                    $analogIds = \DB::table('spare_part_analogs')
                        ->where('spare_part_id', $exactPart['id'])
                        ->pluck('analog_spare_part_id')
                        ->toArray();
                        
                    $reverseAnalogIds = \DB::table('spare_part_analogs')
                        ->where('analog_spare_part_id', $exactPart['id'])
                        ->pluck('spare_part_id')
                        ->toArray();
                        
                    $allAnalogIds = array_merge($analogIds, $reverseAnalogIds);
                    $allAnalogIds = array_unique($allAnalogIds);
                    
                    Log::info("Найдено ID аналогов для запчасти {$exactPart['id']}: " . implode(', ', $allAnalogIds));
                    
                    // Получаем данные аналогов
                    if (!empty($allAnalogIds)) {
                        $analogParts = \App\Models\SparePart::whereIn('id', $allAnalogIds)
                            ->where('is_available', true)
                            ->where('stock_quantity', '>', 0)
                            ->get();
                            
                        Log::info("Получено аналогов из базы: " . $analogParts->count());
                        
                        // Форматируем аналоги с ценами
                        $analogParts = $this->sparePartService->formatSparePartsWithPrices($analogParts, $isAdmin);
                        
                        // Добавляем аналоги в массив результатов
                        foreach ($analogParts as $part) {
                            $part->is_exact_match = false;
                            $part->is_analog = true;
                            
                            // Проверяем, нет ли уже такой запчасти в результатах
                            $isDuplicate = false;
                            foreach ($sparePartsArray as $existingPart) {
                                if (isset($existingPart['id']) && $existingPart['id'] == $part->id) {
                                    $isDuplicate = true;
                                    break;
                                }
                            }
                            
                            // Добавляем только если это не дубликат
                            if (!$isDuplicate) {
                                $sparePartsArray[] = $part->toArray();
                            }
                        }
                        
                        Log::info("Добавлено аналогов в результаты: " . $analogParts->count());
                    }
                }
            }
            
            foreach ($sparePartsArray as $part) {
                if (isset($part['is_exact_match']) && $part['is_exact_match']) {
                    $exactMatches[] = $part;
                } else if (isset($part['is_analog']) && $part['is_analog']) {
                    $analogs[] = $part;
                } else {
                    $otherResults[] = $part;
                }
            }
            
            // Если поиск по артикулу и нет помеченных результатов, но есть точное совпадение по артикулу
            if ($searchType === 'article' && empty($exactMatches) && empty($analogs) && !empty($otherResults)) {
                Log::info('Поиск по артикулу без помеченных результатов, ищем точное совпадение по артикулу');
                
                // Находим точное совпадение по артикулу
                $exactMatch = null;
                foreach ($otherResults as $key => $part) {
                    if (isset($part['part_number']) && strtoupper($part['part_number']) === strtoupper($searchQueryParam)) {
                        $exactMatch = $part;
                        $exactMatch['is_exact_match'] = true;
                        $exactMatch['is_analog'] = false;
                        $exactMatches[] = $exactMatch;
                        
                        // Удаляем из других результатов
                        unset($otherResults[$key]);
                        break;
                    }
                }
                
                // Если найдено точное совпадение, остальные считаем аналогами
                if ($exactMatch) {
                    Log::info('Найдено точное совпадение по артикулу, остальные считаем аналогами');
                    foreach ($otherResults as $part) {
                        $part['is_exact_match'] = false;
                        $part['is_analog'] = true;
                        $analogs[] = $part;
                    }
                    $otherResults = [];
                }
            }
            // Если текстовый поиск, но запрос похож на артикул и нет помеченных результатов
            else if ($searchType === 'text' && empty($exactMatches) && empty($analogs) && !empty($otherResults) && preg_match('/^[A-Za-z0-9-]+$/', $searchQueryParam)) {
                Log::info('Текстовый поиск с запросом, похожим на артикул, ищем точное совпадение по артикулу');
                
                // Находим точное совпадение по артикулу
                $exactMatch = null;
                foreach ($otherResults as $key => $part) {
                    if (isset($part['part_number']) && strtoupper($part['part_number']) === strtoupper($searchQueryParam)) {
                        $exactMatch = $part;
                        $exactMatch['is_exact_match'] = true;
                        $exactMatch['is_analog'] = false;
                        $exactMatches[] = $exactMatch;
                        
                        // Удаляем из других результатов
                        unset($otherResults[$key]);
                        break;
                    }
                }
                
                // Если найдено точное совпадение, остальные считаем аналогами
                if ($exactMatch) {
                    Log::info('Найдено точное совпадение по артикулу в текстовом поиске, остальные считаем аналогами');
                    foreach ($otherResults as $part) {
                        $part['is_exact_match'] = false;
                        $part['is_analog'] = true;
                        $analogs[] = $part;
                    }
                    $otherResults = [];
                }
            }
            
            // Добавляем отладочную информацию о разделении результатов
            $debug['exact_matches_count'] = count($exactMatches);
            $debug['analogs_count'] = count($analogs);
            $debug['other_results_count'] = count($otherResults);
            Log::info('SPLIT RESULTS: ' . json_encode($debug));
            
            // Объединяем результаты в нужном порядке: сначала точные совпадения, затем аналоги, затем остальные
            $allParts = array_merge($exactMatches, $analogs, $otherResults);
            
            return Inertia::render('Search', [
                'auth' => [
                    'user' => auth()->user(),
                ],
                'spareParts' => $allParts,
                'searchQuery' => $searchQueryParam,
                'searchType' => $searchType,
                'debug' => [
                    'count' => count($allParts),
                    'exact_matches' => count($exactMatches),
                    'analogs' => count($analogs),
                    'other_results' => count($otherResults),
                ],
                'debug_info' => $debug
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при поиске запчастей: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // В случае ошибки возвращаем пустой результат с информацией об ошибке
            return Inertia::render('Search', [
                'auth' => [
                    'user' => auth()->user(),
                ],
                'spareParts' => [],
                'searchQuery' => $searchQueryParam ?? '',
                'searchType' => $searchType ?? 'text',
                'error' => 'Произошла ошибка при поиске запчастей. Пожалуйста, попробуйте еще раз.',
                'debug' => [
                    'error_message' => $e->getMessage(),
                    'source' => 'error_handler',
                    'stack_trace' => $e->getTraceAsString()
                ]
            ]);
        }
    }
    
    /**
     * Отображение информации о запчасти
     * Перенаправляет на PartsController для обеспечения обратной совместимости
     */
    public function show($id)
    {
        // Перенаправляем на метод show контроллера PartsController
        return app(PartsController::class)->show($id);
    }
    
    /**
     * Отображение списка запчастей по категории
     *
     * @param  int  $categoryId
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function byCategory($categoryId, Request $request)
    {
        try {
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            // Получаем информацию о категории
            $category = PartCategory::findOrFail($categoryId);
            
            // Получаем запчасти из данной категории с пагинацией
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 12);
            $filters = $request->only(['sort_by', 'sort_order', 'manufacturer', 'min_price', 'max_price']);
            $filters['category_id'] = $categoryId;
            
            $spareParts = $this->sparePartService->getPaginatedSpareParts($page, $limit, $filters, $isAdmin);
            
            // Получаем хлебные крошки для категории
            $breadcrumbs = $this->getCategoryBreadcrumbs($category);
            
            return Inertia::render('SpareParts/Category', [
                'auth' => [
                    'user' => auth()->user(),
                ],
                'category' => $category,
                'spareParts' => $spareParts,
                'filters' => $filters,
                'breadcrumbs' => $breadcrumbs
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при отображении запчастей по категории: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return redirect()->route('home')->with('error', 'Произошла ошибка при загрузке запчастей');
        }
    }
    
    /**
     * Отображение списка запчастей для конкретной модели автомобиля
     *
     * @param  int  $modelId
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function byCarModel($modelId, Request $request)
    {
        try {
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            // Получаем запчасти для данной модели автомобиля с пагинацией
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 12);
            $filters = $request->only(['category_id', 'sort_by', 'sort_order', 'manufacturer', 'min_price', 'max_price']);
            
            $spareParts = $this->sparePartService->getSparePartsByCarModel($modelId, $filters, $isAdmin);
            
            // Получаем информацию о модели автомобиля
            $carModel = \App\Models\CarModel::with('brand')->findOrFail($modelId);
            
            return Inertia::render('SpareParts/ByCarModel', [
                'auth' => [
                    'user' => auth()->user(),
                ],
                'carModel' => $carModel,
                'spareParts' => $spareParts,
                'filters' => $filters
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при отображении запчастей по модели автомобиля: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return redirect()->route('home')->with('error', 'Произошла ошибка при загрузке запчастей');
        }
    }
    
    /**
     * Получение хлебных крошек для запчасти
     *
     * @param  SparePart  $sparePart
     * @return array
     */
    protected function getBreadcrumbs($sparePart)
    {
        $breadcrumbs = [
            [
                'title' => 'Главная',
                'url' => route('home')
            ]
        ];
        
        if ($sparePart->category) {
            $category = $sparePart->category;
            
            // Добавляем родительские категории, если есть
            if ($category->parent_id) {
                $parentCategory = PartCategory::find($category->parent_id);
                if ($parentCategory) {
                    $breadcrumbs[] = [
                        'title' => $parentCategory->name,
                        'url' => route('spare-parts.by-category', $parentCategory->id)
                    ];
                }
            }
            
            // Добавляем текущую категорию
            $breadcrumbs[] = [
                'title' => $category->name,
                'url' => route('spare-parts.by-category', $category->id)
            ];
        }
        
        // Добавляем название запчасти
        $breadcrumbs[] = [
            'title' => $sparePart->name,
            'url' => null
        ];
        
        return $breadcrumbs;
    }
    
    /**
     * Получение хлебных крошек для категории
     *
     * @param  PartCategory  $category
     * @return array
     */
    protected function getCategoryBreadcrumbs($category)
    {
        $breadcrumbs = [
            [
                'title' => 'Главная',
                'url' => route('home')
            ]
        ];
        
        // Добавляем родительские категории, если есть
        if ($category->parent_id) {
            $parentCategory = PartCategory::find($category->parent_id);
            if ($parentCategory) {
                $breadcrumbs[] = [
                    'title' => $parentCategory->name,
                    'url' => route('spare-parts.by-category', $parentCategory->id)
                ];
            }
        }
        
        // Добавляем текущую категорию
        $breadcrumbs[] = [
            'title' => $category->name,
            'url' => null
        ];
        
        return $breadcrumbs;
    }
    
    /**
     * Поиск запчастей по артикулу для API
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function findByArticle(Request $request)
    {
        try {
            $article = $request->input('article');
            
            if (empty($article)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Не указан артикул'
                ], 400);
            }
            
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            // Выполняем поиск по артикулу
            $results = $this->sparePartSearchService->searchByArticle($article, $isAdmin);
            
            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => $results->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при поиске по артикулу: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при поиске запчастей',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 