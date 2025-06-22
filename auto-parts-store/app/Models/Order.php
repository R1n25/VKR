<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'total_price',
        'status',
        'address',
        'phone',
        'email',
        'notes',
        'notes_json',
        'status_history',
        'status_updated_at',
        'status_updated_by',
        'customer_name',
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
     * Алиас для получения элементов заказа с именем order_items для совместимости с фронтендом
     */
    public function getOrderItemsAttribute()
    {
        return $this->orderItems()->get();
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
     * Получить историю статусов заказа
     */
    public function getStatusHistory()
    {
        return $this->status_history ?? [];
    }

    /**
     * Получить заметки к заказу
     */
    public function notes()
    {
        return $this->hasMany(OrderNote::class);
    }

    /**
     * Получить пользователя, сделавшего заказ
     */
    public function orderUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
