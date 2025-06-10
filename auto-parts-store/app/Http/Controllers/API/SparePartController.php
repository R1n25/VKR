<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SparePartController extends Controller
{
    /**
     * Получить список всех запчастей с возможностью фильтрации
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Начинаем с базового запроса к запчастям
        $query = SparePart::query()
            ->leftJoin('part_categories', 'spare_parts.category_id', '=', 'part_categories.id')
            ->select(
                'spare_parts.*', 
                'part_categories.name as category_name'
            );
        
        // Поиск по запросу
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('spare_parts.name', 'like', "%{$searchTerm}%")
                  ->orWhere('spare_parts.part_number', 'like', "%{$searchTerm}%")
                  ->orWhere('spare_parts.description', 'like', "%{$searchTerm}%")
                  ->orWhere('spare_parts.manufacturer', 'like', "%{$searchTerm}%");
            });
        }
        
        // Фильтрация по бренду (производителю)
        if ($request->has('brand_id')) {
            // Получаем имя бренда
            $brandName = DB::table('car_brands')
                ->where('id', $request->brand_id)
                ->value('name');
            
            if ($brandName) {
                $query->where('spare_parts.manufacturer', $brandName);
            }
        }
        
        // Фильтрация по модели через связующую таблицу
        if ($request->has('model_id')) {
            $query->whereHas('carModels', function($q) use ($request) {
                $q->where('car_models.id', $request->model_id);
            });
        }
        
        // Фильтрация по двигателю
        if ($request->has('engine_id')) {
            // Вместо фильтрации по модели автомобиля, проверяем прямую связь между запчастью и двигателем
            $query->whereExists(function ($subquery) use ($request) {
                $subquery->select(DB::raw(1))
                    ->from('car_engine_spare_part')
                    ->whereColumn('car_engine_spare_part.spare_part_id', 'spare_parts.id')
                    ->where('car_engine_spare_part.car_engine_id', $request->engine_id);
            });
        }
        
        // Фильтрация по типу двигателя не поддерживается напрямую
        // с текущей структурой базы данных
        
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
        
        try {
            $parts = $query->paginate(12);
            
            // Загрузим дополнительные данные для каждой запчасти
            $parts->getCollection()->transform(function ($part) {
                // Получаем модель
                $models = $part->carModels()->first();
                if ($models) {
                    $part->model_name = $models->name;
                }
                
                return $part;
            });
            
            // Формируем ответ в формате, который ожидает фронтенд
            return response()->json([
                'status' => 'success',
                'data' => $parts->items(),
                'meta' => [
                    'current_page' => $parts->currentPage(),
                    'last_page' => $parts->lastPage(),
                    'per_page' => $parts->perPage(),
                    'total' => $parts->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении списка запчастей: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Получить информацию о конкретной запчасти
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $part = SparePart::with(['category', 'brand', 'model'])
            ->findOrFail($id);
        
        // Получаем связанные запчасти той же категории и марки
        $relatedParts = SparePart::where('category_id', $part->category_id)
            ->where('id', '!=', $id)
            ->with(['brand', 'model'])
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

    /**
     * Получить полную информацию о запчасти по ID
     */
    public function getFullInfo($id)
    {
        try {
            $sparePart = SparePart::with('category')->find($id);
            
            if (!$sparePart) {
                Log::warning("API: Запчасть с ID {$id} не найдена");
                return response()->json(['error' => 'Запчасть не найдена'], 404);
            }
            
            Log::info("API: Запрошена информация о запчасти с ID {$id}, Название: {$sparePart->name}");
            
            return response()->json([
                'id' => $sparePart->id,
                'name' => $sparePart->name,
                'part_number' => $sparePart->part_number,
                'price' => $sparePart->price,
                'discount_price' => $sparePart->discount_price,
                'description' => $sparePart->description,
                'manufacturer' => $sparePart->manufacturer,
                'country' => $sparePart->country,
                'warranty' => $sparePart->warranty,
                'stock_quantity' => $sparePart->stock_quantity,
                'weight' => $sparePart->weight,
                'dimensions' => $sparePart->dimensions,
                'image_url' => $sparePart->image_url,
                'category' => $sparePart->category ? [
                    'id' => $sparePart->category->id,
                    'name' => $sparePart->category->name
                ] : null,
                'specifications' => $sparePart->specifications,
                'is_featured' => $sparePart->is_featured,
                'is_new' => $sparePart->is_new,
                'is_bestseller' => $sparePart->is_bestseller
            ]);
        } catch (\Exception $e) {
            Log::error("API: Ошибка при получении информации о запчасти с ID {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Внутренняя ошибка сервера'], 500);
        }
    }
    
    /**
     * Альтернативный метод для получения списка запчастей через Query Builder
     * @deprecated Используйте метод index() вместо этого
     */
    public function indexWithQueryBuilder(Request $request)
    {
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
        
        // Фильтрация по категории
        if ($request->has('category_id')) {
            $query->where('spare_parts.category_id', $request->category_id);
        }
        
        // Фильтрация по наличию
        if ($request->has('in_stock') && $request->in_stock) {
            $query->where('spare_parts.stock_quantity', '>', 0);
        }
        
        // Сортировка
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);
        
        // Пагинация
        $perPage = $request->input('per_page', 20);
        $spareParts = $query->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'data' => $spareParts
        ]);
    }
} 