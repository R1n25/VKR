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
        
        return Inertia::render('Parts/Show', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'part' => $part,
            'similarParts' => $similarParts,
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
} 