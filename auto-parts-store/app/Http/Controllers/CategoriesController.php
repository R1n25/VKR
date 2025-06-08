<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CategoryService;
use App\Services\BrandService;
use Illuminate\Support\Facades\DB;

class CategoriesController extends Controller
{
    protected $categoryService;
    protected $brandService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(CategoryService $categoryService, BrandService $brandService)
    {
        $this->categoryService = $categoryService;
        $this->brandService = $brandService;
    }

    /**
     * Отображение списка всех категорий
     */
    public function index()
    {
        $categories = $this->categoryService->getAllCategories();
        
        return Inertia::render('Categories/Index', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Отображение информации о категории и её запчастях
     */
    public function show(Request $request, $id)
    {
        // Получаем информацию о двигателе, если передан параметр engine_id
        $engine = null;
        if ($request->has('engine_id')) {
            $engine = DB::table('car_engines')
                ->join('car_models', 'car_engines.model_id', '=', 'car_models.id')
                ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
                ->select('car_engines.*', 'car_models.name as model_name', 'car_brands.name as brand_name')
                ->where('car_engines.id', $request->engine_id)
                ->first();
        }
        
        // Получаем категорию с запчастями, применяя фильтры
        $filters = $request->only(['brands', 'price_min', 'price_max', 'in_stock', 'sort']);
        
        // Если выбран двигатель, добавляем его в фильтры
        if ($engine) {
            $filters['engine_id'] = $request->engine_id;
            $filters['model_id'] = $engine->model_id;
            $filters['brand_id'] = $engine->brand_id;
        }
        
        $categoryData = $this->categoryService->getCategoryWithParts($id, $filters);
        
        if (!$categoryData['category']) {
            abort(404);
        }
        
        // Получаем бренды для фильтра
        $brands = $this->brandService->getAllBrands();
        
        $data = [
            'categoryId' => $id,
            'auth' => [
                'user' => auth()->user(),
            ],
            'category' => $categoryData['category'],
            'parts' => $categoryData['parts'],
            'filters' => $filters,
            'brands' => $brands
        ];
        
        // Добавляем информацию о двигателе в данные представления
        if ($engine) {
            $data['engine'] = $engine;
        }
        
        return Inertia::render('Categories/Show', $data);
    }
} 