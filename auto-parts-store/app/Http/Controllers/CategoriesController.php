<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CategoryService;
use App\Services\BrandService;

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
        // Получаем категорию с запчастями, применяя фильтры
        $filters = $request->only(['brands', 'price_min', 'price_max', 'in_stock', 'sort']);
        $categoryData = $this->categoryService->getCategoryWithParts($id, $filters);
        
        if (!$categoryData['category']) {
            abort(404);
        }
        
        // Получаем бренды для фильтра
        $brands = $this->brandService->getAllBrands();
        
        return Inertia::render('Categories/Show', [
            'categoryId' => $id,
            'auth' => [
                'user' => auth()->user(),
            ],
            'category' => $categoryData['category'],
            'parts' => $categoryData['parts'],
            'filters' => $filters,
            'brands' => $brands
        ]);
    }
} 