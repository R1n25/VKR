<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'status',
        'total',
        'customer_name',
        'email',
        'phone',
        'address',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'shipping_zip',
        'payment_method',
        'payment_status',
        'notes',
        'user_id',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'total' => 'float',
    ];

    /**
     * Boot function from Laravel.
     */
    protected static function boot()
    {
        parent::boot();
        
        // Генерация номера заказа при создании
        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'ORD-' . date('Ymd') . '-' . rand(1000, 9999);
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
     * Get the parts associated with the order.
     */
    public function parts()
    {
        return $this->belongsToMany(Part::class, 'order_items')->withPivot('quantity', 'price');
    }
    
    /**
     * Get the spare parts associated with the order items.
     */
    public function spareParts()
    {
        return $this->belongsToMany(SparePart::class, 'order_items', 'order_id', 'part_id')
                    ->withPivot('quantity', 'price');
    }
}
