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
    public function index()
    {
        $brands = CarBrand::all();
        
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