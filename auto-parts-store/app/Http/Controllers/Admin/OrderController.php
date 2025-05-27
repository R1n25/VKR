<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
        // Логирование для диагностики
        \Log::info('Запрос на просмотр заказа', [
            'order_id' => $id,
            'route' => request()->route()->getName(),
            'is_ajax' => request()->ajax(),
            'is_json' => request()->expectsJson(),
            'headers' => request()->headers->all()
        ]);

        try {
            // Простой подход без дополнительных проверок
            $order = Order::with([
                'user', 
                'orderItems.sparePart',
                'orderItems.sparePart.brand'
            ])->findOrFail($id);
            
            // Дополнительно загружаем элементы заказа напрямую через SQL-запрос
            try {
                $query = "
                    SELECT order_items.*, spare_parts.name as part_name, spare_parts.part_number
                    FROM order_items 
                    LEFT JOIN spare_parts ON (
                        CASE 
                            WHEN order_items.spare_part_id IS NOT NULL THEN order_items.spare_part_id = spare_parts.id
                            ELSE order_items.part_id = spare_parts.id
                        END
                    )
                    WHERE order_items.order_id = ?
                ";
                \Log::info('SQL запрос', ['query' => $query, 'id' => $id]);
                $orderItems = DB::select($query, [$id]);
                \Log::info('Результат запроса', ['count' => count($orderItems)]);
            } catch (\Exception $e) {
                \Log::error('Ошибка при выполнении SQL запроса: ' . $e->getMessage(), ['exception' => $e]);
                
                // Альтернативный способ получения данных без join
                $orderItems = DB::table('order_items')
                    ->where('order_id', $id)
                    ->get();
                \Log::info('Альтернативный запрос без join', ['count' => count($orderItems)]);
            }
                
            // Добавляем результаты запроса к заказу
            if ($orderItems && (!$order->orderItems || count($order->orderItems) === 0)) {
                $order->direct_items = $orderItems;
            }
            
            return Inertia::render('Admin/Orders/Show', [
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при загрузке заказа: ' . $e->getMessage(), ['exception' => $e, 'trace' => $e->getTraceAsString()]);
            
            if (request()->expectsJson()) {
                return response()->json(['error' => 'Не удалось загрузить заказ: ' . $e->getMessage()], 500);
            }
            
            return redirect()->route('admin.orders.index')->with('error', 'Не удалось загрузить заказ: ' . $e->getMessage());
        }
    }

    /**
     * Обновление статуса заказа
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,completed,cancelled',
            'note' => 'nullable|string',
        ]);
        
        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        
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
        
        // Логируем информацию об изменении статуса
        \Log::info('Статус заказа изменён', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'old_status' => $oldStatus,
            'new_status' => $validated['status'],
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name,
        ]);
        
        return redirect()->back()->with('message', 'Статус заказа успешно обновлен');
    }

    /**
     * Добавление комментария к заказу
     */
    public function addNote(Request $request, $id)
    {
        $validated = $request->validate([
            'note' => 'required|string',
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
        
        return redirect()->back()->with('message', 'Комментарий добавлен');
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
        $statuses = [
            'pending' => 'Ожидает обработки',
            'processing' => 'В обработке',
            'shipped' => 'Отправлен',
            'delivered' => 'Доставлен',
            'completed' => 'Выполнен',
            'cancelled' => 'Отменен',
        ];
        
        return $statuses[$status] ?? $status;
    }
}
