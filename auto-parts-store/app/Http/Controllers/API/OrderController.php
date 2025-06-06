<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SparePart;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    protected $orderService;
    
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Добавляем отладочную информацию
        \Log::info('Запрос на получение заказов', [
            'auth_check' => auth()->check(),
            'auth_id' => auth()->id(),
            'request_user_id' => $request->user_id,
            'request_params' => $request->all()
        ]);
        
        // Загружаем заказы с детальной информацией о товарах и запчастях
        $query = Order::with([
            'orderItems.sparePart', 
            'orderItems.sparePart.category',
            'orderItems.sparePart.brand',
            'user'
        ]);
        
        // Фильтр по статусу
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Если указан лимит, применяем его
        if ($request->has('limit')) {
            $limit = (int)$request->limit;
        } else {
            $limit = 10;
        }
        
        // Получаем ID пользователя из разных источников
        $userId = null;
        
        if (auth()->check()) {
            $userId = auth()->id();
            \Log::info('Пользователь авторизован', ['user_id' => $userId]);
        } elseif ($request->has('user_id')) {
            $userId = $request->user_id;
            \Log::info('Использую user_id из запроса', ['user_id' => $userId]);
        }
        
        // Если имеем ID пользователя, фильтруем заказы
        if ($userId) {
            $query->where('user_id', $userId);
            \Log::info('Фильтрую заказы по user_id', [
                'user_id' => $userId,
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);
        } else {
            // Если пользователь не авторизован и не указан user_id, возвращаем пустой массив
            \Log::warning('Нет user_id для фильтрации, возвращаю пустой массив');
            return response()->json([
                'success' => true,
                'data' => [],
                'total' => 0,
                'per_page' => $limit,
                'current_page' => 1,
                'last_page' => 1,
                'from' => 0,
                'to' => 0
            ]);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate($limit);
        
        // Отладочная информация о полученных заказах
        \Log::info('Получены заказы', [
            'count' => $orders->count(),
            'total' => $orders->total(),
            'first_order_id' => $orders->count() > 0 ? $orders->first()->id : null,
            'sample' => $orders->count() > 0 ? $orders->first()->toArray() : 'Нет заказов'
        ]);
        
        // Подготовка данных заказов для ответа
        $ordersData = collect($orders->items())->map(function ($order) {
            // Преобразуем числовые значения для корректного отображения
            $order->total = floatval($order->total);
            
            // Если есть товары в заказе, форматируем их цены
            if ($order->orderItems) {
                foreach ($order->orderItems as $item) {
                    $item->price = floatval($item->price);
                    if ($item->sparePart) {
                        $item->sparePart->price = floatval($item->sparePart->price);
                    }
                }
            }
            
            return $order;
        });
        
        return response()->json([
            'success' => true,
            'data' => $ordersData,
            'total' => $orders->total(),
            'per_page' => $orders->perPage(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'from' => $orders->firstItem() ?: 0,
            'to' => $orders->lastItem() ?: 0
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Валидация входных данных
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'required|string|max:20',
                'delivery_address' => 'nullable|string|max:500',
                // 'delivery_method' => 'required|string|in:pickup,delivery', // Поле не существует в базе данных
                'payment_method' => 'required|string|in:cash,card,online',
                'items' => 'required|array|min:1',
                'items.*.id' => 'required|exists:spare_parts,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.name' => 'required|string',
                'comment' => 'nullable|string|max:1000',
            ]);

            // Начинаем транзакцию
            DB::beginTransaction();

            // Создаем новый заказ
            $order = new Order();
            $order->user_id = auth()->id(); // ID авторизованного пользователя или null
            $order->order_number = $this->generateOrderNumber();
            $order->customer_name = $validated['customer_name'];
            $order->email = $validated['email'] ?? null;
            $order->phone = $validated['phone'];
            $order->address = $validated['delivery_address'] ?? null;
            // $order->delivery_method = $validated['delivery_method']; // Поле не существует в базе данных
            $order->payment_method = $validated['payment_method'];
            $order->status = 'pending'; // Начальный статус - "Ожидает обработки"
            $order->notes = $validated['comment'] ?? null;
            
            // Рассчитываем общую сумму заказа
            $total = 0;
            foreach ($validated['items'] as $item) {
                $total += $item['price'] * $item['quantity'];
            }
            $order->total = $total;
            
            $order->save();

            // Добавляем товары в заказ
            foreach ($validated['items'] as $item) {
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->spare_part_id = $item['id'];
                $orderItem->quantity = $item['quantity'];
                $orderItem->price = $item['price'];
                $orderItem->name = $item['name'];
                $orderItem->total = $item['price'] * $item['quantity'];
                $orderItem->save();
                
                // Уменьшаем количество товара на складе
                $sparePart = SparePart::find($item['id']);
                if ($sparePart) {
                    // Логируем состояние до изменения
                    Log::info('Состояние товара до уменьшения количества', [
                        'order_id' => $order->id,
                        'part_id' => $item['id'],
                        'part_name' => $item['name'],
                        'current_quantity' => $sparePart->stock_quantity,
                        'is_available' => $sparePart->is_available,
                        'requested_quantity' => $item['quantity']
                    ]);
                    
                    // Проверяем, достаточно ли товара на складе
                    if ($sparePart->stock_quantity < $item['quantity']) {
                        // Если товара недостаточно, откатываем транзакцию
                        DB::rollBack();
                        Log::warning('Недостаточно товара на складе', [
                            'part_id' => $item['id'],
                            'part_name' => $item['name'],
                            'available' => $sparePart->stock_quantity,
                            'requested' => $item['quantity']
                        ]);
                        return response()->json([
                            'error' => 'Недостаточно товара на складе',
                            'part_id' => $item['id'],
                            'part_name' => $item['name'],
                            'available' => $sparePart->stock_quantity,
                            'requested' => $item['quantity']
                        ], 400);
                    }
                    
                    // Запоминаем старое значение для логирования
                    $oldQuantity = $sparePart->stock_quantity;
                    
                    // Используем новый метод для уменьшения количества товара
                    // Передаем отрицательное значение, чтобы уменьшить количество
                    $sparePart->updateAvailability(-$item['quantity']);
                    
                    // Логируем изменение количества
                    Log::info('Уменьшено количество товара после заказа', [
                        'order_id' => $order->id,
                        'part_id' => $item['id'],
                        'part_name' => $item['name'],
                        'quantity_before' => $oldQuantity,
                        'quantity_after' => $sparePart->stock_quantity,
                        'quantity_changed' => $item['quantity'],
                        'is_available' => $sparePart->is_available
                    ]);
                }
            }

            // Фиксируем транзакцию
            DB::commit();

            // Возвращаем успешный ответ с данными заказа
            return response()->json([
                'success' => true,
                'message' => 'Заказ успешно создан',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total' => $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at
                ]
            ], 201);
        } catch (ValidationException $e) {
            // Если произошла ошибка валидации
            return response()->json([
                'error' => 'Ошибка валидации',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Если произошла другая ошибка, откатываем транзакцию
            DB::rollBack();
            
            Log::error('Ошибка при создании заказа', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Не удалось создать заказ',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Загружаем заказ с детальной информацией
        $order = Order::with([
            'orderItems.sparePart', 
            'orderItems.sparePart.category',
            'orderItems.sparePart.brand',
            'payments.paymentMethod',
            'user'
        ])->findOrFail($id);
        
        // Преобразуем числовые значения для корректного отображения
        $order->total = floatval($order->total);
        
        // Добавляем статус оплаты и информацию о платежах
        $order->payment_status = $order->getPaymentStatus();
        $order->total_paid = $order->getTotalPaidAmount();
        $order->remaining_amount = $order->getRemainingAmount();
        
        // Если есть товары в заказе, форматируем их цены
        if ($order->orderItems) {
            foreach ($order->orderItems as $item) {
                $item->price = floatval($item->price);
                if ($item->sparePart) {
                    $item->sparePart->price = floatval($item->sparePart->price);
                }
            }
        }
        
        // Если есть платежи, форматируем суммы
        if ($order->payments) {
            foreach ($order->payments as $payment) {
                $payment->amount = floatval($payment->amount);
            }
        }
        
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
        try {
            $order = Order::findOrFail($id);
            
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,ready_for_pickup,ready_for_delivery,shipping,delivered,returned,shipped,completed,cancelled',
            ]);
            
            // Если заказ отменен или возвращен, возвращаем запчасти на склад
            if (($validated['status'] === 'returned' || $validated['status'] === 'cancelled') 
                && $order->status !== 'returned' && $order->status !== 'cancelled') {
                
                DB::transaction(function () use ($order) {
                    foreach ($order->orderItems as $item) {
                        $part = $item->sparePart;
                        if ($part) {
                            // Используем новый метод для обновления доступности
                            $part->updateAvailability($item->quantity);
                            
                            // Логируем возврат товара на склад
                            Log::info('Возврат товара на склад при отмене/возврате заказа', [
                                'order_id' => $order->id,
                                'part_id' => $item->spare_part_id,
                                'part_name' => $item->name,
                                'quantity_before' => $part->stock_quantity - $item->quantity,
                                'quantity_after' => $part->stock_quantity,
                                'quantity_returned' => $item->quantity,
                                'is_available' => $part->is_available
                            ]);
                        }
                    }
                });
            }
            
            // Обновляем статус заказа
            $order->status = $validated['status'];
            
            // Добавляем информацию о том, кто и когда обновил статус
            $order->status_updated_at = now();
            $order->status_updated_by = auth()->id();
            
            $order->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Статус заказа успешно обновлен',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при обновлении статуса заказа', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось обновить статус заказа',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Если заказ не отменен, возвращаем запчасти на склад
            if ($order->status !== 'cancelled' && $order->status !== 'returned') {
                DB::transaction(function () use ($order) {
                    foreach ($order->orderItems as $item) {
                        $part = $item->sparePart;
                        if ($part) {
                            // Запоминаем старое значение для логирования
                            $oldQuantity = $part->stock_quantity;
                            
                            // Используем новый метод для возврата товара на склад
                            $part->updateAvailability($item->quantity);
                            
                            // Логируем возврат товара на склад
                            Log::info('Возврат товара на склад при удалении заказа', [
                                'order_id' => $order->id,
                                'part_id' => $item->spare_part_id,
                                'part_name' => $item->name,
                                'quantity_before' => $oldQuantity,
                                'quantity_after' => $part->stock_quantity,
                                'quantity_returned' => $item->quantity,
                                'is_available' => $part->is_available
                            ]);
                        }
                    }
                });
            }
            
            $order->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Заказ успешно удален'
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при удалении заказа', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось удалить заказ',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Генерирует уникальный номер заказа
     *
     * @return string
     */
    private function generateOrderNumber()
    {
        // Получаем последний заказ
        $lastOrder = Order::orderBy('id', 'desc')->first();
        
        // Если заказов еще нет, начинаем с 1
        $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
        
        // Форматируем номер заказа с ведущими нулями
        // Например: 100000001, 100000002, и т.д.
        return '1' . str_pad($nextId, 8, '0', STR_PAD_LEFT);
    }
}
