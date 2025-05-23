<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Part;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with('orderItems.part');
        
        // Фильтр по статусу
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Фильтр по пользователю
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_phone' => 'nullable|string|max:20',
            'shipping_address' => 'nullable|string',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',
            'payment_method' => 'nullable|string|in:cash,card,online',
            'notes' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.part_id' => 'required|exists:parts,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Начинаем транзакцию для создания заказа и элементов заказа
        return DB::transaction(function () use ($validated, $request) {
            $total = 0;
            
            // Рассчитываем общую сумму заказа и проверяем наличие запчастей
            foreach ($validated['items'] as $item) {
                $part = Part::findOrFail($item['part_id']);
                
                if ($part->stock < $item['quantity']) {
                    throw new \Exception("Недостаточное количество запчасти '{$part->name}' на складе");
                }
                
                $total += $part->price * $item['quantity'];
            }
            
            // Генерируем номер заказа
            $orderNumber = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);
            
            // Создаем данные заказа
            $orderData = [
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'user_id' => $validated['user_id'] ?? null,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method ?? 'cash',
            ];
            
            // Добавляем данные о доставке, если они есть
            if ($request->has('shipping_name')) {
                $orderData['shipping_name'] = $request->shipping_name;
            } else {
                $orderData['shipping_name'] = $validated['customer_name'];
            }
            
            if ($request->has('shipping_phone')) {
                $orderData['shipping_phone'] = $request->shipping_phone;
            } else {
                $orderData['shipping_phone'] = $validated['phone'];
            }
            
            if ($request->has('shipping_address')) {
                $orderData['shipping_address'] = $request->shipping_address;
            } else {
                $orderData['shipping_address'] = $validated['address'];
            }
            
            if ($request->has('shipping_city')) {
                $orderData['shipping_city'] = $request->shipping_city;
            }
            
            if ($request->has('shipping_zip')) {
                $orderData['shipping_zip'] = $request->shipping_zip;
            }
            
            if ($request->has('notes')) {
                $orderData['notes'] = $request->notes;
            }
            
            // Создаем заказ
            $order = Order::create($orderData);
            
            // Создаем элементы заказа и уменьшаем количество запчастей на складе
            foreach ($validated['items'] as $item) {
                $part = Part::findOrFail($item['part_id']);
                
                // Уменьшаем количество запчастей на складе
                $part->stock -= $item['quantity'];
                $part->save();
                
                // Создаем элемент заказа
                OrderItem::create([
                    'order_id' => $order->id,
                    'part_id' => $part->id,
                    'quantity' => $item['quantity'],
                    'price' => $part->price,
                ]);
            }
            
            // Загружаем заказ с элементами
            $order->load('orderItems.part');
            
            return response()->json([
                'success' => true,
                'message' => 'Заказ успешно создан',
                'data' => $order
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = Order::with('orderItems.part')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,completed,cancelled',
        ]);
        
        // Если заказ отменен, возвращаем запчасти на склад
        if ($validated['status'] === 'cancelled' && $order->status !== 'cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->orderItems as $item) {
                    $part = $item->part;
                    $part->stock += $item->quantity;
                    $part->save();
                }
            });
        }
        
        $order->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Статус заказа успешно обновлен',
            'data' => $order
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $order = Order::findOrFail($id);
        
        // Если заказ не отменен, возвращаем запчасти на склад
        if ($order->status !== 'cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->orderItems as $item) {
                    $part = $item->part;
                    $part->stock += $item->quantity;
                    $part->save();
                }
            });
        }
        
        $order->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно удален'
        ]);
    }
}
