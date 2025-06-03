<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'payment_id',
        'total_price',
        'status',
        'payment_method',
        'payment_status',
        'shipping_method',
        'shipping_address',
        'shipping_city',
        'shipping_postal_code',
        'shipping_country',
        'shipping_phone',
        'shipping_email',
        'shipping_name',
        'shipping_tracking_number',
        'notes',
        'notes_json',
        'status_history',
        'status_updated_at',
        'status_updated_by',
        'completed_at',
        'canceled_at',
        'refunded_at',
        'customer_name',
        'email',
        'phone',
        'address',
        'order_number',
        'total',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_price' => 'decimal:2',
        'notes_json' => 'array',
        'status_history' => 'array',
        'status_updated_at' => 'datetime',
        'completed_at' => 'datetime',
        'canceled_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            // Генерируем уникальный номер заказа, только если он не задан
            if (!$order->order_number) {
                // Получаем последний номер заказа
                $lastOrder = Order::orderBy('id', 'desc')->first();
                
                if ($lastOrder && is_numeric($lastOrder->order_number)) {
                    // Если есть последний заказ и его номер - число, увеличиваем на 1
                    $nextOrderNumber = intval($lastOrder->order_number) + 1;
                } else {
                    // Если заказов еще нет или формат номера был другой, начинаем с 100000001
                    $nextOrderNumber = 100000001;
                }
                
                // Убеждаемся, что номер заказа уникален
                while (Order::where('order_number', (string)$nextOrderNumber)->exists()) {
                    $nextOrderNumber++;
                }
                
                $order->order_number = (string)$nextOrderNumber;
            }
        });
    }

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the spare parts associated with the order.
     */
    public function spareParts(): BelongsToMany
    {
        return $this->belongsToMany(SparePart::class, 'order_items', 'order_id', 'spare_part_id')
                    ->withPivot('quantity', 'price');
    }
    
    /**
     * Get the payments for this order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
    
    /**
     * Get the primary payment for this order.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
    
    /**
     * Получить заметки к заказу
     */
    public function getNotes()
    {
        return $this->notes_json ?? [];
    }
    
    /**
     * Добавить заметку к заказу
     */
    public function addNote($text, $userId = null)
    {
        $notes = $this->notes_json ?? [];
        $user = User::find($userId ?? auth()->id());
        
        $notes[] = [
            'text' => $text,
            'created_at' => now()->toDateTimeString(),
            'created_by' => $user ? $user->name : 'Система',
        ];
        
        $this->update(['notes_json' => $notes]);
        
        return $this;
    }
    
    /**
     * Обновить статус заказа
     * 
     * @param string $newStatus Новый статус заказа
     * @param int|null $userId ID пользователя, изменяющего статус
     * @return $this
     */
    public function updateStatus($newStatus, $userId = null)
    {
        $oldStatus = $this->status;
        
        // Если статус не изменился, ничего не делаем
        if ($oldStatus === $newStatus) {
            return $this;
        }
        
        // Проверяем валидность статуса
        $validStatuses = [
            // Новые статусы
            'pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'shipping', 'delivered', 'returned',
            // Старые статусы для совместимости
            'shipped', 'completed', 'cancelled'
        ];
        
        if (!in_array($newStatus, $validStatuses)) {
            throw new \InvalidArgumentException("Недопустимый статус заказа: {$newStatus}");
        }
        
        // Получаем данные пользователя
        $user = User::find($userId ?? auth()->id());
        $userName = $user ? $user->name : 'Система';
        
        // Начинаем транзакцию для обеспечения целостности данных
        DB::beginTransaction();
        
        try {
            // Добавляем запись в историю статусов
            $statusHistory = $this->status_history ?? [];
            $statusHistory[] = [
                'from' => $oldStatus,
                'to' => $newStatus,
                'changed_at' => now()->toDateTimeString(),
                'changed_by' => $userName,
                'user_id' => $userId ?? auth()->id(),
            ];
            
            // Обновляем соответствующие поля в зависимости от статуса
            $updates = [
                'status' => $newStatus,
                'status_history' => $statusHistory,
                'status_updated_at' => now(),
                'status_updated_by' => $userId ?? auth()->id(),
            ];
            
            // Устанавливаем дополнительные временные метки для особых статусов
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                $updates['completed_at'] = now();
            } elseif ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                $updates['canceled_at'] = now();
            }
            
            // Применяем обновления
            $this->update($updates);
            
            // Фиксируем транзакцию
            DB::commit();
            
            // Логируем изменение статуса
            Log::info("Статус заказа #{$this->order_number} изменен с {$oldStatus} на {$newStatus}", [
                'order_id' => $this->id,
                'order_number' => $this->order_number,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'user_id' => $userId ?? auth()->id(),
                'user_name' => $userName,
            ]);
            
            return $this;
            
        } catch (\Exception $e) {
            // Откатываем транзакцию в случае ошибки
            DB::rollBack();
            
            // Логируем ошибку
            Log::error("Ошибка при изменении статуса заказа #{$this->order_number}: " . $e->getMessage(), [
                'order_id' => $this->id,
                'exception' => $e,
            ]);
            
            // Пробрасываем исключение дальше
            throw $e;
        }
    }
    
    /**
     * Аксессор для получения заметок
     */
    public function getNotesAttribute($value)
    {
        // Если есть notes_json, возвращаем его, иначе возвращаем старые notes
        return $this->notes_json ?? ($value ? [$value] : []);
    }
    
    /**
     * Получить сумму платежей для заказа
     */
    public function getTotalPaidAmount()
    {
        return $this->payments()->where('status', 'completed')->sum('amount');
    }
    
    /**
     * Проверить, полностью ли оплачен заказ
     */
    public function isFullyPaid()
    {
        $total = $this->total ?? $this->total_price;
        $totalPaid = $this->getTotalPaidAmount();
        
        return $totalPaid >= $total;
    }
    
    /**
     * Получить остаток к оплате
     */
    public function getRemainingAmount()
    {
        $total = $this->total ?? $this->total_price;
        $totalPaid = $this->getTotalPaidAmount();
        
        return max(0, $total - $totalPaid);
    }
    
    /**
     * Получить статус оплаты
     */
    public function getPaymentStatus()
    {
        if ($this->isFullyPaid()) {
            return 'paid';
        } elseif ($this->getTotalPaidAmount() > 0) {
            return 'partially_paid';
        } else {
            return 'unpaid';
        }
    }
    
    /**
     * Получить название статуса оплаты
     */
    public function getPaymentStatusName()
    {
        $statuses = [
            'paid' => 'Оплачен',
            'partially_paid' => 'Частично оплачен',
            'unpaid' => 'Не оплачен',
        ];
        
        return $statuses[$this->getPaymentStatus()] ?? $this->getPaymentStatus();
    }
    
    /**
     * Получить класс стиля для статуса оплаты
     */
    public function getPaymentStatusClass()
    {
        $classes = [
            'paid' => 'bg-green-100 text-green-800',
            'partially_paid' => 'bg-blue-100 text-blue-800',
            'unpaid' => 'bg-red-100 text-red-800',
        ];
        
        return $classes[$this->getPaymentStatus()] ?? 'bg-gray-100 text-gray-800';
    }
    
    /**
     * Получить историю статусов заказа
     */
    public function getStatusHistory()
    {
        return $this->status_history ?? [];
    }
}
