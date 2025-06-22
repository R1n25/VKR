<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Список заказов пользователя
     */
    public function index()
    {
        $user = Auth::user();
        
        // Логируем начало запроса
        \Illuminate\Support\Facades\Log::info('Запрос списка заказов пользователя', [
            'user_id' => $user->id ?? 'не авторизован',
            'is_admin' => $user->is_admin ?? false
        ]);
        
        // Если пользователь - администратор, перенаправляем в админ-панель
        if ($user->is_admin) {
            return redirect()->route('admin.orders.index');
        }
        
        // Показываем только заказы текущего пользователя
        $orders = Order::with([
                'orderItems.sparePart', 
                'orderItems.sparePart.category',
                'orderItems.sparePart.brand',
                'user'
            ])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Логируем количество найденных заказов
        \Illuminate\Support\Facades\Log::info('Найдены заказы пользователя', [
            'user_id' => $user->id,
            'count' => $orders->count(),
            'first_order_id' => $orders->first() ? $orders->first()->id : null
        ]);
        
        // Форматируем числовые значения для корректного отображения
        foreach ($orders as $order) {
            // Проверяем наличие полей перед форматированием
            if (isset($order->total_price)) {
                $order->total_price = floatval($order->total_price);
            }
            
            if (isset($order->total)) {
                $order->total = floatval($order->total);
            }
            
            // Переименовываем order_items в orderItems для соответствия фронтенду
            if (isset($order->order_items) && !isset($order->orderItems)) {
                $order->orderItems = $order->order_items;
            }
            
            // Форматируем элементы заказа
            if (isset($order->orderItems)) {
                foreach ($order->orderItems as $item) {
                    if (isset($item->price)) {
                        $item->price = floatval($item->price);
                    }
                    
                    if (isset($item->total)) {
                        $item->total = floatval($item->total);
                    }
                    
                    if ($item->sparePart && isset($item->sparePart->price)) {
                        $item->sparePart->price = floatval($item->sparePart->price);
                    }
                }
            }
        }
        
        // Логируем перед отправкой на фронтенд
        \Illuminate\Support\Facades\Log::info('Отправка заказов на фронтенд', [
            'user_id' => $user->id,
            'count' => $orders->count(),
            'sample_order' => $orders->first() ? [
                'id' => $orders->first()->id,
                'order_number' => $orders->first()->order_number,
                'total' => $orders->first()->total ?? $orders->first()->total_price ?? 0,
                'has_order_items' => isset($orders->first()->orderItems),
                'items_count' => isset($orders->first()->orderItems) ? count($orders->first()->orderItems) : 0
            ] : null
        ]);
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'isAdmin' => false
        ]);
    }

    /**
     * Детали заказа пользователя
     */
    public function show($id)
    {
        $user = Auth::user();
        
        // Если пользователь - администратор, перенаправляем в админ-панель
        if ($user->is_admin) {
            return redirect()->route('admin.orders.show', $id);
        }
        
        // Пользователь может просматривать только свои заказы
        $order = Order::with([
                'orderItems.sparePart.category', 
                'orderItems.sparePart.brand',
                'user'
            ])
            ->where('user_id', $user->id)
            ->findOrFail($id);
        
        // Получаем историю статусов заказа, если она есть
        $order->status_history = $order->getStatusHistory();
        
        // Получаем комментарии к заказу
        $order->notes_json = $order->getNotes();
        
        // Форматируем числовые значения для корректного отображения
        foreach ($order->orderItems as $item) {
            $item->price = floatval($item->price);
            if ($item->sparePart) {
                $item->sparePart->price = floatval($item->sparePart->price);
            }
        }
        

        
        return Inertia::render('Orders/Show', [
            'order' => $order,
            'isAdmin' => false
        ]);
    }
    
    /**
     * Обновление статуса заказа
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        
        // Проверяем, что пользователь имеет права администратора
        if (!$user->is_admin) {
            return redirect()->back()->with('error', 'У вас нет прав для выполнения этого действия.');
        }
        
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,ready_for_pickup,ready_for_delivery,shipping,delivered,returned,shipped,completed,cancelled',
            'note' => 'nullable|string',
        ]);
        
        // Используем сервис для обновления статуса, который обработает логику возврата товаров
        $orderService = app(\App\Services\OrderService::class);
        $result = $orderService->updateOrderStatus($order->id, $validated['status']);
        
        if (!$result) {
            return redirect()->back()->with('error', 'Не удалось обновить статус заказа.');
        }
        
        if (!empty($validated['note'])) {
            $order->addNote($validated['note']);
        }
        
        return redirect()->back()->with('success', 'Статус заказа успешно обновлен.');
    }

    public function success()
    {
        // Получаем последний заказ пользователя
        $user = Auth::user();
        $order = null;
        
        if ($user) {
            $order = Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();
        }
        
        // Если заказа нет, просто показываем страницу успеха
        return Inertia::render('Orders/Success', [
            'order' => $order ? [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at->format('d.m.Y H:i'),
            ] : null
        ]);
    }
} 