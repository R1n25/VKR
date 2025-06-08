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
        
        // Добавляем информацию о наличии подкатегорий
        foreach ($categories as $category) {
            $hasChildren = DB::table('part_categories')
                ->where('parent_id', $category->id)
                ->exists();
            
            $category->has_children = $hasChildren;
        }
        
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
        
        // Добавляем информацию о наличии подкатегорий
        $category->has_children = DB::table('part_categories')
            ->where('parent_id', $id)
            ->exists();
        
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
        
        // Добавляем информацию о наличии подкатегорий для каждой подкатегории
        foreach ($subcategories as $subcategory) {
            $hasChildren = DB::table('part_categories')
                ->where('parent_id', $subcategory->id)
                ->exists();
            
            $subcategory->has_children = $hasChildren;
        }
        
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
        $parts = DB::table('spare_parts')
            ->whereIn('category_id', $categoryIds)
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