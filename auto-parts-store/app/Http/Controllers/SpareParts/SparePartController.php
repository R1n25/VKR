<?php

namespace App\Http\Controllers\SpareParts;

use App\Http\Controllers\Controller;
use App\Services\SparePartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Контроллер для работы с запчастями в пространстве имен SpareParts
 */
class SparePartController extends Controller
{
    /**
     * @var SparePartService
     */
    protected $sparePartService;

    /**
     * Конструктор с внедрением зависимостей
     * 
     * @param SparePartService $sparePartService
     */
    public function __construct(SparePartService $sparePartService)
    {
        $this->sparePartService = $sparePartService;
    }

    /**
     * Получить актуальное количество товара
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getQuantity($id)
    {
        try {
            $sparePart = $this->sparePartService->getPartById($id);
            
            if (!$sparePart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Не удалось получить информацию о товаре',
                    'error' => 'Запчасть не найдена'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'quantity' => $sparePart->stock_quantity,
                'is_available' => $sparePart->stock_quantity > 0
            ]);
        } catch (\Exception $e) {
            Log::error("Ошибка при получении количества товара ID {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось получить информацию о товаре',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить информацию о товаре
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInfo($id)
    {
        try {
            // Проверяем, является ли пользователь администратором
            $isAdmin = auth()->check() && auth()->user()->is_admin;
            
            $sparePart = $this->sparePartService->getPartById($id, $isAdmin);
            
            if (!$sparePart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Не удалось получить информацию о товаре',
                    'error' => 'Запчасть не найдена'
                ], 404);
            }
            
            // Добавляем имя категории в данные запчасти
            $category_name = $sparePart->category ? $sparePart->category->name : 'Без категории';
            
            return response()->json([
                'success' => true,
                'id' => $sparePart->id,
                'name' => $sparePart->name,
                'stock_quantity' => $sparePart->stock_quantity,
                'is_available' => $sparePart->stock_quantity > 0,
                'price' => $sparePart->price,
                'base_price' => $sparePart->base_price,
                'manufacturer' => $sparePart->manufacturer,
                'part_number' => $sparePart->part_number,
                'category_name' => $category_name
            ]);
        } catch (\Exception $e) {
            Log::error("Ошибка при получении информации о товаре ID {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось получить информацию о товаре',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 