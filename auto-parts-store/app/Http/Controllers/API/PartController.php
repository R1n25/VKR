<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartController extends Controller
{
    /**
     * Получить список всех запчастей с возможностью поиска.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            );
        
        // Поиск по запросу
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('parts.name', 'like', "%{$searchTerm}%")
                  ->orWhere('parts.sku', 'like', "%{$searchTerm}%")
                  ->orWhere('parts.description', 'like', "%{$searchTerm}%")
                  ->orWhere('car_brands.name', 'like', "%{$searchTerm}%")
                  ->orWhere('car_models.name', 'like', "%{$searchTerm}%");
            });
        }
        
        // Фильтрация по бренду
        if ($request->has('brand_id')) {
            $query->where('parts.brand_id', $request->brand_id);
        }
        
        // Фильтрация по модели
        if ($request->has('model_id')) {
            $query->where('parts.model_id', $request->model_id);
        }
        
        // Фильтрация по категории
        if ($request->has('category_id')) {
            $categoryId = $request->category_id;
            
            // Получаем ID всех подкатегорий
            $subcategoryIds = DB::table('part_categories')
                ->where('parent_id', $categoryId)
                ->pluck('id')
                ->toArray();
            
            // Добавляем ID текущей категории
            $categoryIds = array_merge([$categoryId], $subcategoryIds);
            
            $query->whereIn('parts.category_id', $categoryIds);
        }
        
        // Сортировка
        if ($request->has('sort')) {
            $sortDirection = $request->has('direction') && $request->direction === 'desc' ? 'desc' : 'asc';
            
            switch ($request->sort) {
                case 'price':
                    $query->orderBy('parts.price', $sortDirection);
                    break;
                case 'name':
                    $query->orderBy('parts.name', $sortDirection);
                    break;
                default:
                    $query->orderBy('parts.id', 'desc');
            }
        } else {
            $query->orderBy('parts.id', 'desc');
        }
        
        $parts = $query->paginate(12);
        
        return response()->json([
            'status' => 'success',
            'data' => $parts
        ]);
    }

    /**
     * Получить детальную информацию о запчасти.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $part = DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.id', $id)
            ->first();
        
        if (!$part) {
            return response()->json([
                'status' => 'error',
                'message' => 'Запчасть не найдена'
            ], 404);
        }
        
        // Получаем связанные запчасти той же категории и марки
        $relatedParts = DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->select(
                'parts.id', 
                'parts.name', 
                'parts.sku',
                'parts.price',
                'parts.image_url',
                'car_brands.name as brand_name', 
                'car_models.name as model_name'
            )
            ->where('parts.category_id', $part->category_id)
            ->where('parts.id', '!=', $id)
            ->limit(4)
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'part' => $part,
                'related_parts' => $relatedParts
            ]
        ]);
    }
}
