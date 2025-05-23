<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Список всех заказов
     */
    public function index()
    {
        $orders = Order::with(['user', 'orderItems.part'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        // Отладочная информация
        $ordersCount = $orders->total();
        
        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'ordersCount' => $ordersCount,
            'filters' => request()->all('order_number', 'status', 'date_from', 'date_to'),
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
        $order->update([
            'status' => $validated['status'],
        ]);
        
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
        $notes = $order->notes ? $order->notes . "\n\n" . date('Y-m-d H:i') . " - " . $validated['note'] : date('Y-m-d H:i') . " - " . $validated['note'];
        
        $order->update([
            'notes' => $notes,
        ]);
        
        return redirect()->back()->with('message', 'Комментарий добавлен');
    }
}
