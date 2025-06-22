<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'total_price',
        'is_active'
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * Получить пользователя, которому принадлежит корзина.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Получить все элементы корзины.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Подсчитать общую стоимость элементов в корзине.
     */
    public function calculateTotalPrice()
    {
        $total = $this->cartItems->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $this->update(['total_price' => $total]);
        
        return $total;
    }
} 