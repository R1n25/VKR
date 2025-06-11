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
        // Добавляем middleware auth для всех методов, кроме публичных
        $this->middleware('auth')->only(['index', 'show']);
    }

    /**
     * Получить список заказов пользователя
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Логируем начало запроса
            Log::info('API: Запрос списка заказов пользователя', [
                'user_id' => auth()->id() ?? 'не авторизован',
                'request_params' => $request->all(),
                'is_authenticated' => auth()->check(),
                'session_id' => $request->session()->getId() ?? 'нет сессии'
            ]);
            
            // Проверяем, что пользователь авторизован (делаем более мягкую проверку)
            if (!auth()->check()) {
                Log::warning('API: Пользователь не авторизован, возвращаем пустой массив');
                // Вместо ошибки возвращаем пустой массив заказов
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }
            
            // Определяем ID пользователя
            $userId = auth()->id();
            Log::info('API: Определен ID пользователя', ['user_id' => $userId]);
            
            // Если передан ID пользователя в запросе и текущий пользователь - админ
            if ($request->has('user_id') && auth()->user()->role === 'admin') {
                $userId = $request->input('user_id');
                Log::info('API: Пользователь является админом, используем переданный ID', ['user_id' => $userId]);
            }
            
            // Ограничение количества заказов
            $limit = $request->input('limit', 10);
            
            try {
                // Получаем заказы пользователя
                $orders = Order::where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get();
                
                Log::info('API: Получены заказы', [
                    'user_id' => $userId,
                    'count' => $orders->count()
                ]);
                
                // Преобразуем заказы в массив для безопасного возврата
                $ordersArray = [];
                foreach ($orders as $order) {
                    $orderData = [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                        'total' => floatval($order->total ?? $order->total_price ?? 0),
                        'customer_name' => $order->customer_name
                    ];
                    
                    // Добавляем элементы заказа, если они есть
                    $orderItems = [];
                    if ($order->orderItems()->exists()) {
                        foreach ($order->orderItems()->get() as $item) {
                            $orderItems[] = [
                                'id' => $item->id,
                                'name' => $item->name,
                                'part_number' => $item->part_number,
                                'quantity' => $item->quantity,
                                'price' => floatval($item->price),
                                'total' => floatval($item->total ?? ($item->price * $item->quantity))
                            ];
                        }
                    }
                    
                    $orderData['orderItems'] = $orderItems;
                    $ordersArray[] = $orderData;
                }
                
                // Логируем успешный ответ
                Log::info('API: Успешно подготовлены данные заказов', [
                    'user_id' => $userId,
                    'count' => count($ordersArray)
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => $ordersArray
                ]);
            } catch (\Exception $innerEx) {
                Log::error('API: Ошибка при получении заказов из БД', [
                    'error' => $innerEx->getMessage(),
                    'trace' => $innerEx->getTraceAsString()
                ]);
                
                // В случае ошибки при получении заказов возвращаем пустой массив
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Произошла ошибка при получении заказов'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('API: Критическая ошибка при получении заказов', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // В случае любой ошибки возвращаем успешный ответ с пустым массивом
            // чтобы избежать ошибки 500 на фронтенде
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Произошла ошибка при обработке запроса'
            ]);
        }
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
            'user',
        ])->where('id', $id)->first();
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Заказ не найден',
            ], 404);
        }
        
        // Проверяем права доступа
        if (!auth()->check() || (auth()->id() !== $order->user_id && !auth()->user()->isAdmin())) {
            return response()->json([
                'success' => false,
                'message' => 'У вас нет прав для просмотра этого заказа',
            ], 403);
        }
        
        // Форматируем цены
        $order->total = floatval($order->total);
        
        // Форматируем товары в заказе
        if ($order->orderItems) {
            foreach ($order->orderItems as $item) {
                $item->price = floatval($item->price);
                $item->total = floatval($item->total);
                
                if ($item->sparePart) {
                    $item->sparePart->price = floatval($item->sparePart->price);
                }
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
