<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Services\UserBalanceService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinanceController extends Controller
{
    protected $userBalanceService;
    protected $paymentService;

    public function __construct(UserBalanceService $userBalanceService, PaymentService $paymentService)
    {
        $this->userBalanceService = $userBalanceService;
        $this->paymentService = $paymentService;
    }

    /**
     * Отображение списка пользователей с их балансами
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'balance')
            ->orderBy('name')
            ->paginate(20);

        $totalBalance = User::sum('balance');
        $positiveBalance = User::where('balance', '>', 0)->sum('balance');
        $negativeBalance = User::where('balance', '<', 0)->sum('balance');
        $zeroBalance = User::where('balance', '=', 0)->count();
        $totalUsers = User::count();

        return Inertia::render('Admin/Finances/Index', [
            'users' => $users,
            'stats' => [
                'total_balance' => $totalBalance,
                'positive_balance' => $positiveBalance,
                'negative_balance' => $negativeBalance,
                'zero_balance' => $zeroBalance,
                'total_users' => $totalUsers,
            ]
        ]);
    }

    /**
     * Отображение финансов конкретного пользователя
     */
    public function show($userId)
    {
        $user = User::findOrFail($userId);
        
        $payments = Payment::with(['order', 'paymentMethod'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $balanceTransactions = \App\Models\BalanceTransaction::where('user_id', $userId)
            ->with(['payment', 'order', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $stats = $this->paymentService->getUserPaymentStats($userId);
        
        return Inertia::render('Admin/Finances/Show', [
            'user' => $user,
            'payments' => $payments,
            'balanceTransactions' => $balanceTransactions,
            'stats' => $stats,
            'paymentMethods' => PaymentMethod::active()->get()
        ]);
    }

    /**
     * Форма для добавления средств на баланс пользователя
     */
    public function create($userId)
    {
        $user = User::findOrFail($userId);
        $paymentMethods = PaymentMethod::active()->get();
        
        return Inertia::render('Admin/Finances/Create', [
            'user' => $user,
            'paymentMethods' => $paymentMethods
        ]);
    }

    /**
     * Добавление средств на баланс пользователя
     */
    public function store(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'description' => 'nullable|string|max:255',
            'operation_type' => 'required|in:add,subtract',
        ]);
        
        try {
            $amount = abs($validated['amount']);
            
            // Если операция вычитания, меняем знак суммы
            if ($validated['operation_type'] === 'subtract') {
                $amount = -$amount;
            }
            
            if ($amount > 0) {
                $this->userBalanceService->addToBalance(
                    $user, 
                    $amount, 
                    $validated['description'] ?? 'Пополнение баланса администратором'
                );
            } else {
                $this->userBalanceService->subtractFromBalance(
                    $user, 
                    abs($amount), 
                    $validated['description'] ?? 'Списание с баланса администратором'
                );
            }
            
            return redirect()->route('admin.finances.show', $userId)
                ->with('success', 'Баланс пользователя успешно изменен');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при изменении баланса: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Обновление баланса пользователя
     */
    public function updateBalance(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        $validated = $request->validate([
            'balance' => 'required|numeric',
            'description' => 'nullable|string|max:255',
        ]);
        
        $oldBalance = $user->balance;
        $newBalance = $validated['balance'];
        $description = $validated['description'] ?? 'Ручное изменение баланса администратором';
        
        try {
            $user->balance = $newBalance;
            $user->save();
            
            // Логируем операцию
            \Log::info("Баланс пользователя #{$user->id} изменен администратором", [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $newBalance,
                'description' => $description,
                'admin_id' => Auth::id(),
            ]);
            
            return redirect()->back()
                ->with('success', 'Баланс пользователя успешно обновлен');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Ошибка при обновлении баланса: ' . $e->getMessage())
                ->withInput();
        }
    }
} 