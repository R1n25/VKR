<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\SparePartService;
use App\Services\BrandService;
use App\Services\CategoryService;

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
     * Поиск запчастей
     */
    public function search(Request $request)
    {
        // Получаем поисковый запрос из параметра q
        $query = $request->input('q');
        
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Поиск запчастей с учетом роли пользователя
        $parts = $this->sparePartService->searchParts($query, $isAdmin);
        
        // Поиск брендов
        $brands = $this->brandService->searchBrands($query);
        
        // Поиск категорий
        $categories = $this->categoryService->searchCategories($query);
        
        return Inertia::render('Search', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'searchQuery' => $query,
            'spareParts' => $parts,
            'brands' => $brands,
            'categories' => $categories,
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
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Ищем запчасти с указанным артикулом в нашей основной базе данных
        $parts = \App\Models\SparePart::where('article_number', 'like', '%' . $articleNumber . '%')
            ->where(function ($query) use ($isAdmin) {
                if (!$isAdmin) {
                    $query->where('is_active', true);
                }
            })
            ->get();
        
        // Ищем аналоги для найденных запчастей
        $analogs = [];
        
        foreach ($parts as $part) {
            // Получаем аналоги из таблицы аналогов
            $partAnalogs = \App\Models\SparePartAnalog::where('spare_part_id', $part->id)
                ->with(['analogSparePart' => function ($query) use ($isAdmin) {
                    if (!$isAdmin) {
                        $query->where('is_active', true);
                    }
                }])
                ->get()
                ->pluck('analogSparePart')
                ->filter()
                ->toArray();
            
            $analogs = array_merge($analogs, $partAnalogs);
        }
        
        // Удаляем дубликаты аналогов
        $uniqueAnalogs = collect($analogs)->unique('id')->values()->all();
        
        return Inertia::render('Parts/FindByArticle', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'articleNumber' => $articleNumber,
            'parts' => $parts,
            'analogs' => $uniqueAnalogs,
            'isAdmin' => $isAdmin
        ]);
    }
} 