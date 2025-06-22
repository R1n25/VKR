<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\BrandService;

class BrandsController extends Controller
{
    protected $brandService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(BrandService $brandService)
    {
        $this->brandService = $brandService;
    }

    /**
     * Отображение списка всех брендов
     */
    public function index()
    {
        $brands = $this->brandService->getAllBrands();
        
        return Inertia::render('Brands/Index', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'brands' => $brands,
        ]);
    }

    /**
     * Отображение информации о бренде и его моделях
     */
    public function show($id)
    {
        $brand = $this->brandService->getBrandById($id);
        
        if (!$brand) {
            abort(404);
        }
        
        $models = $this->brandService->getModelsByBrandId($id);
        
        return Inertia::render('Brands/Show', [
            'brandId' => $id,
            'auth' => [
                'user' => auth()->user(),
            ],
            'brand' => $brand,
            'models' => $models,
        ]);
    }
} 