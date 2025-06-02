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
            'balance' => $user ? $user->balance : 0,
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
                $price = $sparePart->price;
                
                // Если пользователь авторизован, применяем его наценку
                if ($user) {
                    $markupPercent = $user->markup_percent;
                    $price = $price * (1 + $markupPercent / 100);
                }
                
                $orderItem = new OrderItem([
                    'order_id' => $order->id,
                    'spare_part_id' => $sparePart->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ]);
                
                $orderItem->save();
                
                $totalAmount += $price * $item['quantity'];
            }
            
            // Обновляем общую сумму заказа
            $order->total = $totalAmount;
            $order->save();
            
            // Если пользователь авторизован, списываем с его баланса
            if ($user) {
                // Обновляем баланс пользователя
                $oldBalance = $user->balance;
                $user->balance = $oldBalance - $totalAmount;
                $user->save();
                
                // Добавляем запись в журнал
                Log::info("Списание с баланса пользователя за заказ #{$order->order_number}", [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'amount' => $totalAmount,
                    'old_balance' => $oldBalance,
                    'new_balance' => $user->balance,
                ]);
                
                // Добавляем заметку к заказу
                $order->addNote("Автоматическое списание {$totalAmount} руб. с баланса пользователя");
                
                // Если баланс был достаточным, меняем статус заказа
                if ($oldBalance >= $totalAmount) {
                    $order->updateStatus('processing');
                }
            }
            
            DB::commit();
            
            // Возвращаем успех
            return response()->json([
                'success' => true,
                'message' => 'Заказ успешно создан',
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
                'new_balance' => $user ? $user->balance : 0,
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