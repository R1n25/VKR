<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SparePart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /**
     * Показать страницу оформления заказа
     */
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Checkout', [
            'user' => $user,
        ]);
    }
    
    /**
     * Обработать оформление заказа
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Валидация данных
        $validated = $request->validate([
            'cart_items' => 'required|array',
            'cart_items.*.id' => 'required|exists:spare_parts,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);
        
        // Начинаем транзакцию
        DB::beginTransaction();
        
        try {
            // Создаем заказ
            $order = new Order([
                'user_id' => $user ? $user->id : null,
                'status' => 'pending',
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'total' => 0, // Будет рассчитано позже
            ]);
            
            $order->save();
            
            // Добавляем товары в заказ
            $totalAmount = 0;
            
            foreach ($validated['cart_items'] as $item) {
                $sparePart = SparePart::findOrFail($item['id']);
                
                // Проверяем, достаточно ли товара на складе
                if ($sparePart->stock_quantity < $item['quantity']) {
                    throw new \Exception("Недостаточно товара на складе: {$sparePart->name}. Доступно: {$sparePart->stock_quantity}, запрошено: {$item['quantity']}");
                }
                
                $price = $sparePart->price;
                
                // Если пользователь авторизован, применяем его наценку
                if ($user) {
                    $markupPercent = $user->markup_percent;
                    $price = $price * (1 + $markupPercent / 100);
                }
                
                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'spare_part_id' => $sparePart->id,
                    'name' => $sparePart->name,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $price * $item['quantity'],
                ]);
                
                $orderItem->save();
                
                // Уменьшаем количество товара на складе
                $oldQuantity = $sparePart->stock_quantity;
                
                // Используем новый метод для уменьшения количества товара
                // Передаем отрицательное значение, чтобы уменьшить количество
                $sparePart->updateAvailability(-$item['quantity']);
                
                // Логируем изменение количества
                Log::info('Уменьшено количество товара после заказа', [
                    'order_id' => $order->id,
                    'part_id' => $sparePart->id,
                    'part_name' => $sparePart->name,
                    'quantity_before' => $oldQuantity,
                    'quantity_after' => $sparePart->stock_quantity,
                    'quantity_changed' => $item['quantity'],
                    'is_available' => $sparePart->is_available
                ]);
                
                $totalAmount += $price * $item['quantity'];
            }
            
            // Обновляем общую сумму заказа
            $order->total = $totalAmount;
            $order->save();
            
            // Если пользователь авторизован, меняем статус заказа
            if ($user) {
                // Изменяем статус заказа
                $order->updateStatus('processing');
            }
            
            DB::commit();
            
            // Возвращаем успех
            return response()->json([
                'success' => true,
                'message' => 'Заказ успешно создан',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Ошибка при оформлении заказа: " . $e->getMessage(), [
                'user_id' => $user ? $user->id : null,
                'exception' => $e,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при оформлении заказа: ' . $e->getMessage(),
            ], 500);
        }
    }
} 