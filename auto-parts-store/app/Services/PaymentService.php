<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Создать новый платеж для заказа
     *
     * @param Order $order Заказ для оплаты
     * @param array $data Данные платежа
     * @return Payment
     */
    public function createPayment(Order $order, array $data): Payment
    {
        DB::beginTransaction();
        
        try {
            // Если сумма не указана, используем остаток к оплате
            $amount = $data['amount'] ?? $order->getRemainingAmount();
            
            // Создаем запись о платеже
            $payment = new Payment([
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_method_id' => $data['payment_method_id'],
                'transaction_id' => $data['transaction_id'] ?? null,
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'RUB',
                'status' => $data['status'] ?? 'pending',
                'notes' => $data['notes'] ?? null,
                'payment_data' => $data['payment_data'] ?? null,
            ]);
            
            // Если платеж отмечен как завершенный, устанавливаем дату платежа
            if ($payment->status === 'completed') {
                $payment->payment_date = now();
            }
            
            $payment->save();
            
            // Если это первый платеж для заказа или основной платеж,
            // обновляем ссылку на платеж в заказе
            if (!$order->payment_id || isset($data['is_primary']) && $data['is_primary']) {
                $order->payment_id = $payment->id;
                $order->save();
            }
            
            // Если заказ полностью оплачен, обновляем его статус
            if ($order->isFullyPaid() && $order->status === 'pending') {
                $order->updateStatus('processing');
            }
            
            DB::commit();
            
            return $payment;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Обновить статус платежа
     *
     * @param Payment $payment Платеж для обновления
     * @param string $status Новый статус
     * @param array $data Дополнительные данные
     * @return Payment
     */
    public function updatePaymentStatus(Payment $payment, string $status, array $data = []): Payment
    {
        DB::beginTransaction();
        
        try {
            $oldStatus = $payment->status;
            $payment->status = $status;
            
            // Обновляем данные платежа, если они предоставлены
            if (!empty($data['payment_data'])) {
                $paymentData = $payment->payment_data ?? [];
                $payment->payment_data = array_merge($paymentData, $data['payment_data']);
            }
            
            // Устанавливаем дату платежа или возврата, в зависимости от статуса
            if ($status === 'completed' && !$payment->payment_date) {
                $payment->payment_date = $data['payment_date'] ?? now();
            } elseif ($status === 'refunded' && !$payment->refund_date) {
                $payment->refund_date = $data['refund_date'] ?? now();
            }
            
            // Добавляем примечание, если оно предоставлено
            if (!empty($data['note'])) {
                $payment->notes = ($payment->notes ? $payment->notes . "\n" : '') . $data['note'];
            }
            
            $payment->save();
            
            // Если платеж связан с заказом, обновляем его статус
            if ($payment->order) {
                $order = $payment->order;
                
                // Если платеж завершен, проверяем, полностью ли оплачен заказ
                if ($status === 'completed' && $oldStatus !== 'completed') {
                    if ($order->isFullyPaid() && $order->status === 'pending') {
                        $order->updateStatus('processing');
                    }
                }
                
                // Если платеж был возвращен, обновляем статус заказа
                if ($status === 'refunded' && $oldStatus === 'completed') {
                    if ($order->status !== 'cancelled') {
                        $order->updateStatus('cancelled');
                    }
                }
            }
            
            DB::commit();
            
            return $payment;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Возврат платежа
     *
     * @param Payment $payment Платеж для возврата
     * @param array $data Дополнительные данные
     * @return Payment
     */
    public function refundPayment(Payment $payment, array $data = []): Payment
    {
        return $this->updatePaymentStatus($payment, 'refunded', $data);
    }
    
    /**
     * Получить все активные методы оплаты
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActivePaymentMethods()
    {
        return PaymentMethod::active()->get();
    }
    
    /**
     * Получить итоговую статистику по платежам для пользователя
     *
     * @param int|null $userId ID пользователя или null для текущего пользователя
     * @return array
     */
    public function getUserPaymentStats(?int $userId = null): array
    {
        $userId = $userId ?? Auth::id();
        
        $totalPaid = Payment::where('user_id', $userId)
            ->where('status', 'completed')
            ->sum('amount');
            
        $totalRefunded = Payment::where('user_id', $userId)
            ->where('status', 'refunded')
            ->sum('amount');
            
        $pendingPayments = Payment::where('user_id', $userId)
            ->where('status', 'pending')
            ->sum('amount');
            
        return [
            'total_paid' => $totalPaid,
            'total_refunded' => $totalRefunded,
            'pending_payments' => $pendingPayments,
            'balance' => $totalPaid - $totalRefunded,
        ];
    }
    
    /**
     * Получить общую статистику платежей (для админа)
     *
     * @return array
     */
    public function getOverallPaymentStats(): array
    {
        $totalPaid = Payment::where('status', 'completed')->sum('amount');
        $totalRefunded = Payment::where('status', 'refunded')->sum('amount');
        $pendingPayments = Payment::where('status', 'pending')->sum('amount');
        
        $paymentsByMethod = DB::table('payments')
            ->join('payment_methods', 'payments.payment_method_id', '=', 'payment_methods.id')
            ->where('payments.status', 'completed')
            ->select('payment_methods.name', DB::raw('SUM(payments.amount) as total'))
            ->groupBy('payment_methods.name')
            ->get();
            
        return [
            'total_paid' => $totalPaid,
            'total_refunded' => $totalRefunded,
            'pending_payments' => $pendingPayments,
            'net_income' => $totalPaid - $totalRefunded,
            'payments_by_method' => $paymentsByMethod,
        ];
    }
} 