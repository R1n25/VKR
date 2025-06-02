<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Payment;
use App\Models\BalanceTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class UserBalanceService
{
    /**
     * Пополнить баланс пользователя
     *
     * @param User $user Пользователь
     * @param float $amount Сумма пополнения
     * @param string $description Описание операции
     * @param array $metadata Дополнительные данные
     * @return User
     */
    public function addToBalance(User $user, float $amount, string $description = null, array $metadata = []): User
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Сумма пополнения должна быть положительной');
        }

        DB::beginTransaction();
        try {
            // Обновляем баланс пользователя
            $oldBalance = $user->balance;
            $user->balance = $oldBalance + $amount;
            $user->save();

            // Создаем запись о транзакции
            BalanceTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'balance_after' => $user->balance,
                'operation_type' => 'deposit',
                'description' => $description ?? 'Пополнение баланса',
                'payment_id' => $metadata['payment_id'] ?? null,
                'order_id' => $metadata['order_id'] ?? null,
                'admin_id' => Auth::id(),
            ]);

            // Логируем операцию
            Log::info("Баланс пользователя #{$user->id} пополнен на {$amount}", [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $user->balance,
                'amount' => $amount,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            DB::commit();
            return $user;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Ошибка при пополнении баланса пользователя #{$user->id}: " . $e->getMessage(), [
                'user_id' => $user->id,
                'amount' => $amount,
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    /**
     * Списать с баланса пользователя
     *
     * @param User $user Пользователь
     * @param float $amount Сумма списания
     * @param string $description Описание операции
     * @param array $metadata Дополнительные данные
     * @return User
     */
    public function subtractFromBalance(User $user, float $amount, string $description = null, array $metadata = []): User
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Сумма списания должна быть положительной');
        }

        DB::beginTransaction();
        try {
            // Проверяем достаточность средств
            if ($user->balance < $amount) {
                throw new \Exception('Недостаточно средств на балансе');
            }

            // Обновляем баланс пользователя
            $oldBalance = $user->balance;
            $user->balance = $oldBalance - $amount;
            $user->save();

            // Создаем запись о транзакции
            BalanceTransaction::create([
                'user_id' => $user->id,
                'amount' => -$amount, // Отрицательная сумма для списания
                'balance_after' => $user->balance,
                'operation_type' => 'withdraw',
                'description' => $description ?? 'Списание с баланса',
                'payment_id' => $metadata['payment_id'] ?? null,
                'order_id' => $metadata['order_id'] ?? null,
                'admin_id' => Auth::id(),
            ]);

            // Логируем операцию
            Log::info("С баланса пользователя #{$user->id} списано {$amount}", [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $user->balance,
                'amount' => $amount,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            DB::commit();
            return $user;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Ошибка при списании с баланса пользователя #{$user->id}: " . $e->getMessage(), [
                'user_id' => $user->id,
                'amount' => $amount,
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    /**
     * Проверить достаточность средств на балансе
     *
     * @param User $user Пользователь
     * @param float $amount Требуемая сумма
     * @return bool
     */
    public function hasEnoughBalance(User $user, float $amount): bool
    {
        return $user->balance >= $amount;
    }

    /**
     * Оплатить заказ с баланса пользователя
     *
     * @param Order $order Заказ
     * @param float|null $amount Сумма оплаты (если null, то полная сумма заказа)
     * @return Payment
     */
    public function payOrderFromBalance(Order $order, float $amount = null): Payment
    {
        $user = $order->user;
        $paymentAmount = $amount ?? $order->getRemainingAmount();

        if ($paymentAmount <= 0) {
            throw new \InvalidArgumentException('Сумма оплаты должна быть положительной');
        }

        if (!$this->hasEnoughBalance($user, $paymentAmount)) {
            throw new \Exception('Недостаточно средств на балансе для оплаты заказа');
        }

        DB::beginTransaction();
        try {
            // Получаем ID метода оплаты "Баланс пользователя"
            $paymentMethodId = \App\Models\PaymentMethod::where('code', 'user_balance')->value('id');
            
            if (!$paymentMethodId) {
                throw new \Exception('Метод оплаты "Баланс пользователя" не найден');
            }

            // Создаем платеж
            $paymentService = app(PaymentService::class);
            $payment = $paymentService->createPayment($order, [
                'payment_method_id' => $paymentMethodId,
                'amount' => $paymentAmount,
                'status' => 'completed',
                'notes' => "Оплата с баланса пользователя",
                'payment_data' => [
                    'from_balance' => true,
                    'user_id' => $user->id,
                    'balance_before' => $user->balance,
                    'balance_after' => $user->balance - $paymentAmount,
                ],
            ]);

            // Списываем средства с баланса
            $this->subtractFromBalance($user, $paymentAmount, "Оплата заказа #{$order->order_number}", [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_id' => $payment->id,
            ]);

            DB::commit();
            return $payment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Ошибка при оплате заказа #{$order->order_number} с баланса: " . $e->getMessage(), [
                'user_id' => $user->id,
                'order_id' => $order->id,
                'amount' => $paymentAmount,
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    /**
     * Получить историю операций по балансу пользователя
     *
     * @param User $user Пользователь
     * @param int $perPage Количество записей на страницу
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getBalanceHistory(User $user, int $perPage = 10)
    {
        return BalanceTransaction::where('user_id', $user->id)
            ->with(['payment', 'order', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
} 