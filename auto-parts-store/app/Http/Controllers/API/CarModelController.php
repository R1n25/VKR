<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CarModelController extends Controller
{
    /**
     * Получить список всех моделей автомобилей.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = DB::table('car_models')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->select('car_models.*', 'car_brands.name as brand_name');
        
        // Фильтрация по бренду, если указан
        if ($request->has('brand_id')) {
            $query->where('car_models.brand_id', $request->brand_id);
        }
        
        $models = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $models
        ]);
    }

    /**
     * Получить информацию о конкретной модели автомобиля.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $model = DB::table('car_models')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->select('car_models.*', 'car_brands.name as brand_name')
            ->where('car_models.id', $id)
            ->first();
        
        if (!$model) {
            return response()->json([
                'status' => 'error',
                'message' => 'Модель не найдена'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $model
        ]);
    }

    /**
     * Получить запчасти для указанной модели автомобиля.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getParts($id)
    {
        $model = DB::table('car_models')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->select('car_models.*', 'car_brands.name as brand_name')
            ->where('car_models.id', $id)
            ->first();
        
        if (!$model) {
            return response()->json([
                'status' => 'error',
                'message' => 'Модель не найдена'
            ], 404);
        }
        
        $parts = DB::table('parts')
            ->where('model_id', $id)
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select('parts.*', 'part_categories.name as category_name')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'model' => $model,
                'parts' => $parts
            ]
        ]);
    }
}
