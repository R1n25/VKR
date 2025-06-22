<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Services\SparePartService;

class HomeController extends Controller
{
    protected $brandService;
    protected $categoryService;
    protected $sparePartService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        BrandService $brandService, 
        CategoryService $categoryService,
        SparePartService $sparePartService
    ) {
        $this->brandService = $brandService;
        $this->categoryService = $categoryService;
        $this->sparePartService = $sparePartService;
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
        $popularParts = $this->sparePartService->getPopularParts(8);
        
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
