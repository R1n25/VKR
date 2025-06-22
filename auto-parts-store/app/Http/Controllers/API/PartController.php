<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @deprecated Этот контроллер устарел. Используйте SparePartController вместо него.
 * Функциональность перенесена в SparePartController::indexWithQueryBuilder()
 */
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
        // Логируем использование устаревшего контроллера
        Log::warning('Использован устаревший контроллер PartController::index. Используйте SparePartController вместо него.');
        
        $query = DB::table('spare_parts')
            ->join('car_brands', 'spare_parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'spare_parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'spare_parts.category_id', '=', 'part_categories.id')
            ->select(
                'spare_parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            );
        
        // Поиск по запросу
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('spare_parts.name', 'like', "%{$searchTerm}%")
                  ->orWhere('spare_parts.sku', 'like', "%{$searchTerm}%")
                  ->orWhere('spare_parts.description', 'like', "%{$searchTerm}%")
                  ->orWhere('car_brands.name', 'like', "%{$searchTerm}%")
                  ->orWhere('car_models.name', 'like', "%{$searchTerm}%");
            });
        }
        
        // Фильтрация по бренду
        if ($request->has('brand_id')) {
            $query->where('spare_parts.brand_id', $request->brand_id);
        }
        
        // Фильтрация по модели
        if ($request->has('model_id')) {
            $query->where('spare_parts.model_id', $request->model_id);
        }
        
        // Фильтрация по двигателю
        if ($request->has('engine_id')) {
            // Присоединяем таблицу с двигателями для фильтрации
            $query->join('car_engines', function ($join) use ($request) {
                $join->on('car_engines.model_id', '=', 'spare_parts.model_id')
                    ->where('car_engines.id', '=', $request->engine_id);
            });
        }
        
        // Фильтрация по типу двигателя
        if ($request->has('engine_type')) {
            if (!$request->has('engine_id')) {
                // Если не присоединили таблицу двигателей выше
                $query->join('car_engines', 'car_engines.model_id', '=', 'spare_parts.model_id');
            }
            $query->where('car_engines.type', $request->engine_type);
        }
        
        // Фильтрация по объему двигателя
        if ($request->has('engine_volume')) {
            if (!$request->has('engine_id') && !$request->has('engine_type')) {
                // Если не присоединили таблицу двигателей выше
                $query->join('car_engines', 'car_engines.model_id', '=', 'spare_parts.model_id');
            }
            $query->where('car_engines.volume', $request->engine_volume);
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
            
            $query->whereIn('spare_parts.category_id', $categoryIds);
        }
        
        // Сортировка
        if ($request->has('sort_by') && $request->has('sort_order')) {
            $sortField = $request->sort_by;
            $sortDirection = $request->sort_order;
            
            switch ($sortField) {
                case 'price':
                    $query->orderBy('spare_parts.price', $sortDirection);
                    break;
                case 'name':
                    $query->orderBy('spare_parts.name', $sortDirection);
                    break;
                default:
                    $query->orderBy('spare_parts.id', 'desc');
            }
        } else if ($request->has('sort')) {
            $sortDirection = $request->has('direction') && $request->direction === 'desc' ? 'desc' : 'asc';
            
            switch ($request->sort) {
                case 'price':
                    $query->orderBy('spare_parts.price', $sortDirection);
                    break;
                case 'name':
                    $query->orderBy('spare_parts.name', $sortDirection);
                    break;
                default:
                    $query->orderBy('spare_parts.id', 'desc');
            }
        } else {
            $query->orderBy('spare_parts.id', 'desc');
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
        // Логируем использование устаревшего контроллера
        Log::warning('Использован устаревший контроллер PartController::show. Используйте SparePartController вместо него.');
        
        $part = DB::table('spare_parts')
            ->join('car_brands', 'spare_parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'spare_parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'spare_parts.category_id', '=', 'part_categories.id')
            ->select(
                'spare_parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('spare_parts.id', $id)
            ->first();
        
        if (!$part) {
            return response()->json([
                'status' => 'error',
                'message' => 'Запчасть не найдена'
            ], 404);
        }
        
        // Получаем связанные запчасти той же категории и марки
        $relatedParts = DB::table('spare_parts')
            ->join('car_brands', 'spare_parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'spare_parts.model_id', '=', 'car_models.id')
            ->select(
                'spare_parts.id', 
                'spare_parts.name', 
                'spare_parts.sku',
                'spare_parts.price',
                'spare_parts.image_url',
                'car_brands.name as brand_name', 
                'car_models.name as model_name'
            )
            ->where('spare_parts.category_id', $part->category_id)
            ->where('spare_parts.id', '!=', $id)
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
