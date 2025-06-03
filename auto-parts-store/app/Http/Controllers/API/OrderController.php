<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SparePart;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        // Убедимся, что customer_name не пустой
        if (empty($request->customer_name)) {
            $request->merge(['customer_name' => 'Гость']);
        }
        
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
            'items.*.spare_part_id' => 'required|exists:spare_parts,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Начинаем транзакцию для создания заказа и элементов заказа
        return DB::transaction(function () use ($validated, $request) {
            $total = 0;
            
            // Рассчитываем общую сумму заказа и проверяем наличие запчастей
            foreach ($validated['items'] as $item) {
                $part = SparePart::findOrFail($item['spare_part_id']);
                
                if ($part->stock_quantity < $item['quantity']) {
                    throw new \Exception("Недостаточное количество запчасти '{$part->name}' на складе");
                }
                
                $total += $part->price * $item['quantity'];
            }
            
            // Генерируем номер заказа
            $orderData = [
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
            if ($request->has('shipping_name') && !empty($request->shipping_name)) {
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
            
            // Для отладки: выводим информацию о созданном заказе
            \Log::info('Создан заказ через API', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'total' => $order->total
            ]);
            
            // Создаем элементы заказа и уменьшаем количество запчастей на складе
            foreach ($validated['items'] as $item) {
                $part = SparePart::findOrFail($item['spare_part_id']);
                
                // Уменьшаем количество запчастей на складе
                $part->stock_quantity -= $item['quantity'];
                $part->save();
                
                // Создаем элемент заказа
                OrderItem::create([
                    'order_id' => $order->id,
                    'spare_part_id' => $part->id,
                    'quantity' => $item['quantity'],
                    'price' => $part->price,
                ]);
            }
            
            // Загружаем заказ с элементами
            $order->load('orderItems.sparePart');
            
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
                    $part->stock_quantity += $item->quantity;
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
                    $part = $item->sparePart;
                    $part->stock_quantity += $item->quantity;
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
