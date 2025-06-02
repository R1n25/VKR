<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Support\Facades\DB;

class BrandController extends Controller
{
    /**
     * Получить список всех брендов.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = CarBrand::query();
        
        // Фильтрация по популярным брендам
        if ($request->has('popular') && $request->popular) {
            $query->where('is_popular', true);
        }
        
        // Поиск по названию или стране
        if ($request->has('q') && $request->q) {
            $searchTerm = $request->q;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('country', 'like', "%{$searchTerm}%");
            });
        }
        
        // Пагинация или получение всех записей
        if ($request->has('per_page')) {
            $brands = $query->paginate($request->per_page);
        } else {
            $brands = $query->get();
        }
        
        // Обработка данных - удаление кавычек из имен брендов
        $brands = $brands->map(function($brand) {
            $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
            return $brand;
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $brands
        ]);
    }

    /**
     * Получить информацию о конкретном бренде.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $brand = CarBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Бренд не найден'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $brand
        ]);
    }

    /**
     * Получить модели для указанного бренда.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getModels($id)
    {
        $brand = CarBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Бренд не найден'
            ], 404);
        }
        
        $models = CarModel::where('car_brand_id', $id)->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'brand' => $brand,
                'models' => $models
            ]
        ]);
    }

    /**
     * Получить запчасти для указанного бренда.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getParts($id)
    {
        $brand = CarBrand::find($id);
        
        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Бренд не найден'
            ], 404);
        }
        
        $parts = DB::table('spare_parts')
            ->where('manufacturer', $brand->name)
            ->select('id', 'name', 'part_number as sku', 'price', 'stock_quantity as stock', 'image_url')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'brand' => $brand,
                'parts' => $parts
            ]
        ]);
    }
} 