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
        
        // Если пользователь - администратор, показываем все заказы
        if ($user->is_admin) {
            $orders = Order::with(['orderItems.sparePart', 'user', 'payments'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Иначе показываем только заказы текущего пользователя
            $orders = Order::with(['orderItems.sparePart', 'payments'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        // Добавляем информацию о статусе оплаты и суммах платежей
        foreach ($orders as $order) {
            $order->payment_status = $order->getPaymentStatus();
            $order->total_paid = $order->getTotalPaidAmount();
            $order->remaining_amount = $order->getRemainingAmount();
        }
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'isAdmin' => $user->is_admin
        ]);
    }

    /**
     * Детали заказа пользователя
     */
    public function show($id)
    {
        $user = Auth::user();
        
        // Если пользователь - администратор, он может просматривать любой заказ
        if ($user->is_admin) {
            $order = Order::with(['orderItems.sparePart', 'user', 'payments.paymentMethod'])
                ->findOrFail($id);
        } else {
            // Иначе пользователь может просматривать только свои заказы
            $order = Order::with(['orderItems.sparePart', 'payments.paymentMethod'])
                ->where('user_id', $user->id)
                ->findOrFail($id);
        }
        
        // Добавляем информацию о статусе оплаты и суммах платежей
        $order->payment_status = $order->getPaymentStatus();
        $order->total_paid = $order->getTotalPaidAmount();
        $order->remaining_amount = $order->getRemainingAmount();
        
        return Inertia::render('Orders/Show', [
            'order' => $order,
            'isAdmin' => $user->is_admin
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
            'status' => 'required|in:pending,processing,completed,cancelled',
            'note' => 'nullable|string',
        ]);
        
        $order->updateStatus($validated['status']);
        
        if (!empty($validated['note'])) {
            $order->addNote($validated['note']);
        }
        
        return redirect()->back()->with('success', 'Статус заказа успешно обновлен.');
    }
} 