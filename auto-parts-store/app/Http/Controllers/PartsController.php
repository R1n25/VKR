<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\SparePartService;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Models\SparePart;

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
        
        // Получаем похожие запчасти
        $similarParts = $this->sparePartService->getSimilarParts($id, 4, $isAdmin);
        
        // Получаем рекомендуемые аналоги
        $recommendedAnalogs = $this->getRecommendedAnalogs($part);
        
        return Inertia::render('Parts/Show', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'part' => $part,
            'similarParts' => $similarParts,
            'recommendedAnalogs' => $recommendedAnalogs,
            'isAdmin' => $isAdmin
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