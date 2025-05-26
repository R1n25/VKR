<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id', 
        'spare_part_id', 
        'quantity', 
        'price'
    ];

    /**
     * Получить корзину, к которой принадлежит данный товар.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Получить запчасть, связанную с данным элементом корзины.
     */
    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
    
    /**
     * Альтернативный метод для получения запчасти (для совместимости с OrderItem).
     */
    public function part()
    {
        return $this->belongsTo(SparePart::class, 'spare_part_id');
    }
} 