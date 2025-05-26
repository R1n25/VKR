<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Отображение страницы финансов пользователя
     */
    public function index()
    {
        $user = Auth::user();
        
        // Если пользователь не администратор, показываем только его платежи
        if (!$user->is_admin) {
            $payments = Payment::with(['order', 'paymentMethod'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);
                
            $stats = $this->paymentService->getUserPaymentStats();
        } else {
            // Для администратора показываем все платежи
            $payments = Payment::with(['order', 'paymentMethod', 'user'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);
                
            $stats = $this->paymentService->getOverallPaymentStats();
        }
        
        return Inertia::render('Finances/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'isAdmin' => $user->is_admin
        ]);
    }
    
    /**
     * Форма создания нового платежа
     */
    public function create(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = null;
        
        if ($orderId) {
            $order = Order::findOrFail($orderId);
            
            // Проверяем права доступа к заказу
            $this->authorize('view', $order);
        }
        
        $paymentMethods = $this->paymentService->getActivePaymentMethods();
        
        return Inertia::render('Finances/Create', [
            'order' => $order,
            'paymentMethods' => $paymentMethods,
        ]);
    }
    
    /**
     * Сохранение нового платежа
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);
        
        $order = Order::findOrFail($validated['order_id']);
        
        // Проверяем права доступа к заказу
        $this->authorize('update', $order);
        
        try {
            $payment = $this->paymentService->createPayment($order, [
                'payment_method_id' => $validated['payment_method_id'],
                'amount' => $validated['amount'],
                'notes' => $validated['notes'],
                'status' => Auth::user()->is_admin ? 'completed' : 'pending',
            ]);
            
            return redirect()->route('finances.show', $payment->id)
                ->with('success', 'Платеж успешно создан.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при создании платежа: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Отображение детальной информации о платеже
     */
    public function show($id)
    {
        $payment = Payment::with(['order.orderItems.sparePart', 'paymentMethod', 'user'])
            ->findOrFail($id);
            
        // Проверяем права доступа к платежу
        $this->authorize('view', $payment);
        
        return Inertia::render('Finances/Show', [
            'payment' => $payment,
            'isAdmin' => Auth::user()->is_admin,
        ]);
    }
    
    /**
     * Обновление статуса платежа (для администратора)
     */
    public function updateStatus(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        // Проверяем права доступа к платежу
        $this->authorize('update', $payment);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
            'note' => 'nullable|string',
        ]);
        
        try {
            $this->paymentService->updatePaymentStatus($payment, $validated['status'], [
                'note' => $validated['note'] ?? null,
            ]);
            
            return redirect()->back()
                ->with('success', 'Статус платежа успешно обновлен.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при обновлении статуса платежа: ' . $e->getMessage());
        }
    }
    
    /**
     * Форма добавления платежа к заказу
     */
    public function createForOrder($orderId)
    {
        $order = Order::findOrFail($orderId);
        
        // Проверяем права доступа к заказу
        $this->authorize('view', $order);
        
        $paymentMethods = $this->paymentService->getActivePaymentMethods();
        
        return Inertia::render('Finances/CreateForOrder', [
            'order' => $order,
            'paymentMethods' => $paymentMethods,
            'remainingAmount' => $order->getRemainingAmount(),
        ]);
    }
} 