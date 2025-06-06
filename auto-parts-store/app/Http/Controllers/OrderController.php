<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\UserBalanceService;
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
        
        // Если пользователь - администратор, перенаправляем в админ-панель
        if ($user->is_admin) {
            return redirect()->route('admin.orders.index');
        }
        
        // Показываем только заказы текущего пользователя
        $orders = Order::with([
                'orderItems.sparePart', 
                'orderItems.sparePart.category',
                'orderItems.sparePart.brand',
                'payments', 
                'user'
            ])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Добавляем информацию о статусе оплаты и суммах платежей
        foreach ($orders as $order) {
            $order->payment_status = $order->getPaymentStatus();
            $order->total_paid = $order->getTotalPaidAmount();
            $order->remaining_amount = $order->getRemainingAmount();
            
            // Форматируем числовые значения для корректного отображения
            foreach ($order->orderItems as $item) {
                $item->price = floatval($item->price);
                if ($item->sparePart) {
                    $item->sparePart->price = floatval($item->sparePart->price);
                }
            }
        }
        
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
                'payments.paymentMethod',
                'user'
            ])
            ->where('user_id', $user->id)
            ->findOrFail($id);
        
        // Добавляем информацию о статусе оплаты и суммах платежей
        $order->payment_status = $order->getPaymentStatus();
        $order->total_paid = $order->getTotalPaidAmount();
        $order->remaining_amount = $order->getRemainingAmount();
        
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
        
        // Если есть платежи, форматируем суммы
        if ($order->payments) {
            foreach ($order->payments as $payment) {
                $payment->amount = floatval($payment->amount);
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

    /**
     * Оплата заказа с баланса пользователя
     */
    public function payFromBalance(Request $request, $id)
    {
        $user = Auth::user();
        
        // Находим заказ и проверяем права доступа
        $order = Order::where('user_id', $user->id)->findOrFail($id);
        
        // Получаем сумму к оплате
        $amount = $request->input('amount');
        if (!$amount) {
            $amount = $order->getRemainingAmount();
        }
        
        try {
            $userBalanceService = app(UserBalanceService::class);
            $payment = $userBalanceService->payOrderFromBalance($order, $amount);
            
            return redirect()->route('orders.show', $order->id)
                ->with('success', "Заказ успешно оплачен с баланса на сумму {$amount} руб.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при оплате заказа: ' . $e->getMessage());
        }
    }
} 