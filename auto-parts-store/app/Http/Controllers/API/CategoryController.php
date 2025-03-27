<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    /**
     * Получить список всех категорий запчастей.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = DB::table('part_categories');
        
        // Если нужны только корневые категории
        if ($request->has('root_only') && $request->root_only === 'true') {
            $query->whereNull('parent_id');
        }
        
        $categories = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    /**
     * Получить информацию о конкретной категории запчастей.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $category = DB::table('part_categories')->find($id);
        
        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Категория не найдена'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $category
        ]);
    }

    /**
     * Получить подкатегории для указанной категории.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubcategories($id)
    {
        $category = DB::table('part_categories')->find($id);
        
        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Категория не найдена'
            ], 404);
        }
        
        $subcategories = DB::table('part_categories')
            ->where('parent_id', $id)
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'category' => $category,
                'subcategories' => $subcategories
            ]
        ]);
    }

    /**
     * Получить запчасти для указанной категории.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getParts($id)
    {
        $category = DB::table('part_categories')->find($id);
        
        if (!$category) {
            return response()->json([
                'status' => 'error',
                'message' => 'Категория не найдена'
            ], 404);
        }
        
        // Получаем ID всех подкатегорий
        $subcategoryIds = DB::table('part_categories')
            ->where('parent_id', $id)
            ->pluck('id')
            ->toArray();
        
        // Добавляем ID текущей категории
        $categoryIds = array_merge([$id], $subcategoryIds);
        
        // Получаем запчасти из текущей категории и всех подкатегорий
        $parts = DB::table('parts')
            ->whereIn('category_id', $categoryIds)
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->select('parts.*', 'car_brands.name as brand_name', 'car_models.name as model_name')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'category' => $category,
                'parts' => $parts
            ]
        ]);
    }
} 