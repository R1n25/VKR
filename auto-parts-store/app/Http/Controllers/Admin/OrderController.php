<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Сервис для работы с заказами
     */
    protected $orderService;
    
    /**
     * Конструктор контроллера
     */
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Список всех заказов с фильтрацией
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'orderItems.sparePart']);
        
        // Применяем фильтры
        if ($request->filled('order_number')) {
            $query->where('order_number', $request->order_number);
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        if ($request->filled('customer_name')) {
            $query->where(function($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->customer_name . '%')
                  ->orWhereHas('user', function($query) use ($request) {
                      $query->where('name', 'like', '%' . $request->customer_name . '%');
                  });
            });
        }
        
        $orders = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        $ordersCount = $orders->total();
        
        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'ordersCount' => $ordersCount,
            'filters' => $request->only(['order_number', 'status', 'date_from', 'date_to', 'customer_name']),
        ]);
    }

    /**
     * Детали заказа
     */
    public function show($id)
    {
        try {
            // Загружаем заказ с пользователем
            $order = Order::with([
                'user',
                'orderItems.sparePart.brand',
                'orderItems.sparePart.category',
            ])->findOrFail($id);
            
            Log::info('Получен заказ', [
                'order_id' => $id,
                'order_number' => $order->order_number,
                'total' => $order->total
            ]);
            
            // Получаем элементы заказа из таблицы order_items
            $orderItems = DB::table('order_items as oi')
                ->select(
                    'oi.id',
                    'oi.order_id',
                    'oi.spare_part_id',
                    'oi.quantity',
                    'oi.price',
                    'oi.name as part_name',
                    'oi.total',
                    'sp.name as sp_name',
                    'sp.part_number',
                    'sp.description',
                    'sp.manufacturer'
                )
                ->leftJoin('spare_parts as sp', 'oi.spare_part_id', '=', 'sp.id')
                ->where('oi.order_id', $id)
                ->get();
                
            Log::info('Получены элементы заказа', [
                'order_id' => $id,
                'items_count' => $orderItems->count(),
                'first_item' => $orderItems->first()
            ]);
            
            // Преобразуем элементы заказа для отображения
            $displayItems = [];
            
            foreach ($orderItems as $item) {
                $displayItem = [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'spare_part_id' => $item->spare_part_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'part_name' => $item->sp_name ?: $item->part_name,
                    'part_number' => $item->part_number ?: '',
                    'brand_name' => $item->manufacturer ?: '',
                    'total' => $item->total ?: ($item->price * $item->quantity)
                ];
                
                $displayItems[] = $displayItem;
            }
            
            // Прикрепляем подготовленные элементы к заказу
            $order->direct_items = $displayItems;
            
            Log::info('Подготовлены данные для отображения', [
                'order_id' => $id,
                'display_items_count' => count($displayItems),
                'sample_item' => !empty($displayItems) ? $displayItems[0] : null
            ]);

            return Inertia::render('Admin/Orders/Show', [
                'order' => $order,
                'page_title' => 'Заказ №' . $order->order_number,
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при просмотре заказа', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->route('admin.orders.index')
                ->with('error', 'Ошибка при просмотре заказа: ' . $e->getMessage());
        }
    }

    /**
     * Обновление статуса заказа
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            // Валидация запроса
            $validated = $request->validate([
                'status' => 'required|string|in:pending,processing,ready_for_pickup,ready_for_delivery,in_delivery,delivered,returned',
                'comment' => 'nullable|string|max:500',
            ]);
            
            // Находим заказ
            $order = Order::findOrFail($id);
            
            // Получаем текущего пользователя
            $user = auth()->user();
            
            // Используем сервис для обновления статуса, который обработает логику возврата товаров
            $result = $this->orderService->updateOrderStatus($id, $validated['status']);
            
            if (!$result) {
                throw new \Exception('Не удалось обновить статус заказа');
            }
            
            // Обновляем данные о последнем изменении статуса
            $order->status_updated_at = now();
            $order->status_updated_by = $user->id;
            $order->save();
            
            // Добавляем комментарий к заказу, если он есть
            if (!empty($validated['comment'])) {
                $order->notes()->create([
                    'user_id' => $user->id,
                    'content' => $validated['comment'],
                    'type' => 'status_change',
                ]);
            }
            
            Log::info('Статус заказа обновлен', [
                'order_id' => $id,
                'new_status' => $validated['status'],
                'user_id' => $user->id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Статус заказа успешно обновлен',
                'order' => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'status_updated_at' => $order->status_updated_at,
                    'status_updated_by' => $order->status_updated_by
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при обновлении статуса заказа', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении статуса заказа: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Добавление комментария к заказу
     */
    public function addNote(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'note' => 'required|string|max:1000',
            ]);
            
            $order = Order::findOrFail($id);
            
            // Добавляем новую заметку к существующим заметкам
            $notes = $order->notes_json ?? [];
            $notes[] = [
                'text' => $validated['note'],
                'created_at' => now()->toDateTimeString(),
                'created_by' => Auth::user()->name,
            ];
            
            $order->update([
                'notes_json' => $notes,
            ]);
            
            return $request->expectsJson()
                ? response()->json(['success' => true, 'message' => 'Комментарий добавлен'])
                : redirect()->back()->with('message', 'Комментарий добавлен');
        } catch (ValidationException $e) {
            return $request->expectsJson()
                ? response()->json(['errors' => $e->errors()], 422)
                : redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении комментария', [
                'order_id' => $id,
                'exception' => $e->getMessage()
            ]);
            
            return $request->expectsJson()
                ? response()->json(['error' => 'Не удалось добавить комментарий: ' . $e->getMessage()], 500)
                : redirect()->back()->with('error', 'Не удалось добавить комментарий: ' . $e->getMessage());
        }
    }
    
    /**
     * Экспорт заказов в CSV
     */
    public function export(Request $request)
    {
        $query = Order::with(['user', 'orderItems.sparePart']);
        
        // Применяем те же фильтры, что и для списка
        if ($request->filled('order_number')) {
            $query->where('order_number', $request->order_number);
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->get();
        
        $filename = 'orders-' . Carbon::now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Заголовки CSV
            fputcsv($file, [
                'ID', 
                'Дата создания', 
                'Клиент', 
                'Email', 
                'Телефон', 
                'Адрес', 
                'Сумма', 
                'Статус'
            ]);
            
            // Данные
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->created_at->format('d.m.Y H:i'),
                    $order->customer_name,
                    $order->email,
                    $order->phone,
                    $order->address,
                    $order->total_amount,
                    $this->getStatusText($order->status),
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Получение текстового представления статуса
     */
    private function getStatusText($status)
    {
        return $this->getAvailableStatuses()[$status] ?? $status;
    }
    
    /**
     * Получить доступные статусы заказа
     */
    private function getAvailableStatuses()
    {
        return [
            'pending' => 'Ожидает обработки',
            'processing' => 'В работе',
            'ready_for_pickup' => 'Готов к выдаче',
            'ready_for_delivery' => 'Готов к доставке',
            'in_delivery' => 'В доставке',
            'delivered' => 'Выдано',
            'returned' => 'Возвращен'
        ];
    }
}
