<?php

namespace App\Http\Controllers;

use App\Models\CarBrand;
use App\Models\CarModel;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Показать главную страницу каталога
     */
    public function index()
    {
        // Получаем все бренды с популярными моделями для быстрого выбора
        $popularBrands = CarBrand::whereHas('carModels', function ($query) {
            $query->where('is_popular', true);
        })->with(['carModels' => function ($query) {
            $query->where('is_popular', true)
                  ->orderBy('name');
        }])->orderBy('name')
          ->get();

        // Получаем все бренды для выпадающего списка
        $allBrands = CarBrand::orderBy('name')->get();

        return Inertia::render('Catalog/Index', [
            'popularBrands' => $popularBrands,
            'allBrands' => $allBrands,
        ]);
    }

    /**
     * Показать модели для выбранного бренда
     */
    public function brand($slug)
    {
        $brand = CarBrand::where('slug', $slug)->firstOrFail();
        
        // Получаем все модели бренда, сгруппированные по первой букве
        $models = CarModel::where('brand_id', $brand->id)
                      ->orderBy('name')
                      ->get()
                      ->groupBy(function ($model) {
                          return mb_substr($model->name, 0, 1);
                      });

        // Получаем популярные модели отдельно
        $popularModels = CarModel::where('brand_id', $brand->id)
                           ->where('is_popular', true)
                           ->orderBy('name')
                           ->get();

        return Inertia::render('Catalog/Brand', [
            'brand' => $brand,
            'models' => $models,
            'popularModels' => $popularModels,
        ]);
    }

    /**
     * Показать поколения для выбранной модели
     */
    public function model($brandSlug, $modelSlug)
    {
        $brand = CarBrand::where('slug', $brandSlug)->firstOrFail();
        $model = CarModel::where('slug', $modelSlug)
                    ->where('brand_id', $brand->id)
                    ->firstOrFail();

        // Получаем все поколения модели
        $generations = CarModel::where('brand_id', $brand->id)
                         ->where('name', $model->name)
                         ->orderBy('year_start', 'desc')
                         ->get()
                         ->groupBy('generation');

        return Inertia::render('Catalog/Model', [
            'brand' => $brand,
            'model' => $model,
            'generations' => $generations,
        ]);
    }

    /**
     * Показать характеристики для выбранного поколения модели
     */
    public function generation($brandSlug, $modelSlug, $generation)
    {
        $brand = CarBrand::where('slug', $brandSlug)->firstOrFail();
        $model = CarModel::where('slug', $modelSlug)
                    ->where('brand_id', $brand->id)
                    ->where('generation', $generation)
                    ->firstOrFail();

        // Получаем все варианты объемов двигателя для данного поколения
        $engineVolumes = CarModel::where('brand_id', $brand->id)
                            ->where('name', $model->name)
                            ->where('generation', $generation)
                            ->select('engine_volume', 'engine_type')
                            ->distinct()
                            ->get();

        // Получаем все типы кузова для данного поколения
        $bodyTypes = CarModel::where('brand_id', $brand->id)
                        ->where('name', $model->name)
                        ->where('generation', $generation)
                        ->select('body_type')
                        ->distinct()
                        ->get()
                        ->pluck('body_type');

        return Inertia::render('Catalog/Generation', [
            'brand' => $brand,
            'model' => $model,
            'engineVolumes' => $engineVolumes,
            'bodyTypes' => $bodyTypes,
        ]);
    }

    /**
     * Показать запчасти для выбранного автомобиля
     */
    public function parts(Request $request, $brandSlug, $modelSlug, $generation)
    {
        $brand = CarBrand::where('slug', $brandSlug)->firstOrFail();
        
        // Находим конкретную модификацию автомобиля
        $query = CarModel::where('brand_id', $brand->id)
                    ->where('slug', $modelSlug)
                    ->where('generation', $generation);
                    
        // Фильтрация по типу двигателя и объему, если указаны
        if ($request->has('engine_type')) {
            $query->where('engine_type', $request->engine_type);
        }
        
        if ($request->has('engine_volume')) {
            $query->where('engine_volume', $request->engine_volume);
        }
        
        // Фильтрация по типу кузова, если указан
        if ($request->has('body_type')) {
            $query->where('body_type', $request->body_type);
        }
        
        $carModel = $query->firstOrFail();
        
        // Получаем совместимые запчасти для данного автомобиля
        $spareParts = $carModel->spareParts()
                          ->with('partCategory')
                          ->paginate(20);
        
        // Получаем категории запчастей для меню
        $categories = $spareParts->pluck('partCategory')
                           ->unique('id')
                           ->sortBy('name');
        
        return Inertia::render('Catalog/Parts', [
            'brand' => $brand,
            'model' => $carModel,
            'spareParts' => $spareParts,
            'categories' => $categories,
            'filters' => $request->only(['engine_type', 'engine_volume', 'body_type']),
        ]);
    }

    /**
     * Показать деталь запчасти
     */
    public function part($partSlug)
    {
        $sparePart = SparePart::where('slug', $partSlug)
                        ->with(['partCategory', 'compatibleModels.brand'])
                        ->firstOrFail();
        
        // Получаем похожие запчасти
        $similarParts = SparePart::where('part_category_id', $sparePart->part_category_id)
                           ->where('id', '!=', $sparePart->id)
                           ->limit(8)
                           ->get();
        
        // Получаем аналоги запчасти через сервис AnalogService
        $analogService = app(\App\Services\AnalogService::class);
        $analogParts = $analogService->getAnalogs($sparePart->id);
        
        return Inertia::render('Catalog/Part', [
            'sparePart' => $sparePart,
            'similarParts' => $similarParts,
            'analogParts' => $analogParts,
        ]);
    }
} 