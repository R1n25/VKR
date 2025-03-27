<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Brand;
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
        $brands = DB::table('car_brands')->get();
        
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
        $brand = DB::table('car_brands')->find($id);
        
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
        $brand = DB::table('car_brands')->find($id);
        
        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Бренд не найден'
            ], 404);
        }
        
        $models = DB::table('car_models')->where('brand_id', $id)->get();
        
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
        $brand = DB::table('car_brands')->find($id);
        
        if (!$brand) {
            return response()->json([
                'status' => 'error',
                'message' => 'Бренд не найден'
            ], 404);
        }
        
        $parts = DB::table('parts')
            ->where('brand_id', $id)
            ->select('id', 'name', 'sku', 'price', 'stock', 'image_url')
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