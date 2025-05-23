<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Services\PartsService;

class HomeController extends Controller
{
    protected $brandService;
    protected $categoryService;
    protected $partsService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        BrandService $brandService, 
        CategoryService $categoryService,
        PartsService $partsService
    ) {
        $this->brandService = $brandService;
        $this->categoryService = $categoryService;
        $this->partsService = $partsService;
    }

    /**
     * Главная страница
     */
    public function index()
    {
        // Получаем популярные бренды
        $brands = $this->brandService->getAllBrands(true);
        
        // Получаем корневые категории
        $categories = $this->categoryService->getRootCategories();
        
        // Получаем популярные запчасти
        $popularParts = $this->partsService->getPopularParts(8);
        
        return Inertia::render('Home', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'brands' => $brands,
            'categories' => $categories,
            'popularParts' => $popularParts
        ]);
    }
}
