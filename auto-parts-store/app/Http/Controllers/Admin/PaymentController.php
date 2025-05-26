<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Отображение списка всех платежей для администратора
     */
    public function index(Request $request)
    {
        $query = Payment::with(['order', 'paymentMethod', 'user']);
        
        // Фильтрация по статусу
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Фильтрация по методу оплаты
        if ($request->has('payment_method_id') && $request->payment_method_id) {
            $query->where('payment_method_id', $request->payment_method_id);
        }
        
        // Фильтрация по дате
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->date_from));
        }
        
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->date_to));
        }
        
        // Сортировка
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $payments = $query->paginate(15)
            ->appends($request->query());
            
        $stats = $this->paymentService->getOverallPaymentStats();
        $paymentMethods = PaymentMethod::all();
        
        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'paymentMethods' => $paymentMethods,
            'filters' => [
                'status' => $request->status,
                'payment_method_id' => $request->payment_method_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }
    
    /**
     * Отображение детальной информации о платеже
     */
    public function show($id)
    {
        $payment = Payment::with(['order.orderItems.sparePart', 'paymentMethod', 'user'])
            ->findOrFail($id);
            
        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }
    
    /**
     * Обновление платежа
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'amount' => 'required|numeric|min:0.01',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'refund_date' => 'nullable|date',
        ]);
        
        try {
            $payment->payment_method_id = $validated['payment_method_id'];
            $payment->amount = $validated['amount'];
            $payment->transaction_id = $validated['transaction_id'];
            $payment->notes = $validated['notes'];
            
            if ($validated['payment_date']) {
                $payment->payment_date = Carbon::parse($validated['payment_date']);
            }
            
            if ($validated['refund_date']) {
                $payment->refund_date = Carbon::parse($validated['refund_date']);
            }
            
            $payment->save();
            
            // Обновляем статус отдельно, чтобы сработали все связанные обновления
            $this->paymentService->updatePaymentStatus($payment, $validated['status']);
            
            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Платеж успешно обновлен.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при обновлении платежа: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Создание нового платежа для заказа
     */
    public function createForOrder($orderId)
    {
        $order = Order::with(['orderItems.sparePart', 'user'])
            ->findOrFail($orderId);
            
        $paymentMethods = PaymentMethod::all();
        
        return Inertia::render('Admin/Payments/Create', [
            'order' => $order,
            'paymentMethods' => $paymentMethods,
            'remainingAmount' => $order->getRemainingAmount(),
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
            'status' => 'required|in:pending,completed,failed',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_date' => 'nullable|date',
        ]);
        
        $order = Order::findOrFail($validated['order_id']);
        
        try {
            $paymentData = [
                'payment_method_id' => $validated['payment_method_id'],
                'amount' => $validated['amount'],
                'status' => $validated['status'],
                'transaction_id' => $validated['transaction_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ];
            
            if (isset($validated['payment_date']) && $validated['payment_date']) {
                $paymentData['payment_date'] = Carbon::parse($validated['payment_date']);
            }
            
            $payment = $this->paymentService->createPayment($order, $paymentData);
            
            return redirect()->route('admin.payments.show', $payment->id)
                ->with('success', 'Платеж успешно создан.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при создании платежа: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Экспорт платежей в CSV
     */
    public function export(Request $request)
    {
        $query = Payment::with(['order', 'paymentMethod', 'user']);
        
        // Применяем фильтры, как в методе index
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('payment_method_id') && $request->payment_method_id) {
            $query->where('payment_method_id', $request->payment_method_id);
        }
        
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->date_from));
        }
        
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->date_to));
        }
        
        $payments = $query->get();
        
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename=payments-' . Carbon::now()->format('Y-m-d') . '.csv',
        ];
        
        $columns = [
            'ID', 'Номер заказа', 'Клиент', 'Метод оплаты', 'Сумма', 'Статус', 
            'Транзакция', 'Дата создания', 'Дата оплаты', 'Дата возврата', 'Примечания'
        ];
        
        $callback = function() use ($payments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->id,
                    $payment->order ? $payment->order->order_number : 'Н/Д',
                    $payment->user ? $payment->user->name : 'Н/Д',
                    $payment->paymentMethod ? $payment->paymentMethod->name : 'Н/Д',
                    $payment->amount,
                    $payment->getStatusName(),
                    $payment->transaction_id,
                    $payment->created_at->format('d.m.Y H:i'),
                    $payment->payment_date ? Carbon::parse($payment->payment_date)->format('d.m.Y H:i') : 'Н/Д',
                    $payment->refund_date ? Carbon::parse($payment->refund_date)->format('d.m.Y H:i') : 'Н/Д',
                    $payment->notes,
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Управление методами оплаты
     */
    public function paymentMethods()
    {
        $paymentMethods = PaymentMethod::orderBy('name')->get();
        
        return Inertia::render('Admin/Payments/Methods', [
            'paymentMethods' => $paymentMethods,
        ]);
    }
    
    /**
     * Сохранение нового метода оплаты
     */
    public function storePaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:payment_methods,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'icon' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);
        
        PaymentMethod::create($validated);
        
        return redirect()->route('admin.payment-methods')
            ->with('success', 'Метод оплаты успешно создан.');
    }
    
    /**
     * Обновление метода оплаты
     */
    public function updatePaymentMethod(Request $request, $id)
    {
        $paymentMethod = PaymentMethod::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:payment_methods,code,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'icon' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);
        
        $paymentMethod->update($validated);
        
        return redirect()->route('admin.payment-methods')
            ->with('success', 'Метод оплаты успешно обновлен.');
    }
} 