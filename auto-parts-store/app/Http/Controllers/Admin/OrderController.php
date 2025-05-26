<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

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
            $query->where('id', $request->order_number);
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
        $order = Order::with(['user', 'orderItems.sparePart'])
            ->findOrFail($id);
        
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Обновление статуса заказа
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
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
        
        return redirect()->back()->with('message', 'Статус заказа обновлен');
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
            $query->where('id', $request->order_number);
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
            'cancelled' => 'Отменен',
        ];
        
        return $statuses[$status] ?? $status;
    }
}
