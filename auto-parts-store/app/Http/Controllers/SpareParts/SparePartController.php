<?php

namespace App\Http\Controllers\SpareParts;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use Illuminate\Http\Request;

class SparePartController extends Controller
{
    /**
     * Получить актуальное количество товара
     */
    public function getQuantity($id)
    {
        try {
            $sparePart = SparePart::findOrFail($id);
            return response()->json([
                'success' => true,
                'quantity' => $sparePart->stock_quantity,
                'is_available' => $sparePart->stock_quantity > 0
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось получить информацию о товаре',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить информацию о товаре
     */
    public function getInfo($id)
    {
        try {
            $sparePart = SparePart::findOrFail($id);
            return response()->json([
                'success' => true,
                'id' => $sparePart->id,
                'name' => $sparePart->name,
                'stock_quantity' => $sparePart->stock_quantity,
                'is_available' => $sparePart->stock_quantity > 0,
                'price' => $sparePart->price,
                'manufacturer' => $sparePart->manufacturer,
                'part_number' => $sparePart->part_number
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось получить информацию о товаре',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 