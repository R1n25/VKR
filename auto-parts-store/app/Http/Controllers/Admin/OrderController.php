<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
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
            $query->where('shipping_name', 'like', '%' . $request->customer_name . '%');
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
            $order = Order::with('user')->findOrFail($id);
            
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
                    'oi.part_number',
                    'oi.part_name',
                    'sp.name as sp_name',
                    'sp.part_number as sp_part_number',
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
                    'part_number' => $item->sp_part_number ?: $item->part_number,
                    'description' => $item->description,
                    'brand_name' => $item->manufacturer
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
            $availableStatuses = array_keys($this->getAvailableStatuses());
            
            $validated = $request->validate([
                'status' => 'required|in:' . implode(',', $availableStatuses),
                'note' => 'nullable|string|max:1000',
            ]);
            
            $order = Order::findOrFail($id);
            $oldStatus = $order->status;
            
            // Проверяем, не является ли текущий статус таким же
            if ($oldStatus === $validated['status']) {
                return $request->expectsJson() 
                    ? response()->json(['message' => 'Статус не изменился, операция не выполнена'], 200)
                    : redirect()->back()->with('info', 'Статус не изменился, операция не выполнена');
            }
            
            DB::beginTransaction();
            try {
                $order->update([
                    'status' => $validated['status'],
                    'status_updated_at' => now(),
                    'status_updated_by' => Auth::id(),
                ]);
                
                // Добавляем запись об изменении статуса в историю
                $statusHistory = $order->status_history ?? [];
                $statusHistory[] = [
                    'from' => $oldStatus,
                    'to' => $validated['status'],
                    'changed_at' => now()->toDateTimeString(),
                    'changed_by' => Auth::user()->name,
                ];
                
                $order->update(['status_history' => $statusHistory]);
                
                // Если указана заметка, то добавляем её
                if (!empty($validated['note'])) {
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
                }
                
                DB::commit();
                
                // Логируем информацию об изменении статуса
                Log::info('Статус заказа изменён', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'old_status' => $oldStatus,
                    'new_status' => $validated['status'],
                    'user_id' => Auth::id(),
                    'user_name' => Auth::user()->name,
                ]);
                
                return $request->expectsJson()
                    ? response()->json([
                        'success' => true, 
                        'message' => 'Статус заказа успешно обновлен', 
                        'order' => $order
                    ])
                    : redirect()->back()->with('message', 'Статус заказа успешно обновлен');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Ошибка при обновлении статуса заказа', [
                    'order_id' => $id,
                    'exception' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                throw $e;
            }
        } catch (ValidationException $e) {
            // Обработка ошибки валидации
            return $request->expectsJson()
                ? response()->json(['errors' => $e->errors()], 422)
                : redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Обработка других ошибок
            Log::error('Ошибка при обновлении статуса заказа', [
                'order_id' => $id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $request->expectsJson()
                ? response()->json(['error' => 'Не удалось обновить статус заказа: ' . $e->getMessage()], 500)
                : redirect()->back()->with('error', 'Не удалось обновить статус заказа: ' . $e->getMessage());
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
                    $order->shipping_name,
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
     * Получение доступных статусов заказа
     */
    private function getAvailableStatuses()
    {
        return [
            'pending' => 'Ожидает обработки',
            'processing' => 'В обработке',
            'shipped' => 'Отправлен',
            'delivered' => 'Доставлен',
            'completed' => 'Выполнен',
            'cancelled' => 'Отменен',
        ];
    }
}
