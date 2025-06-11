<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'spare_part_id',
        'name',
        'quantity',
        'price',
        'total',
        'part_number',
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the spare part associated with the order item.
     */
    public function sparePart(): BelongsTo
    {
        return $this->belongsTo(SparePart::class, 'spare_part_id');
    }
    
    /**
     * Алиас для получения запчасти с именем spare_part для совместимости с фронтендом
     */
    public function getSparePartAttribute()
    {
        return $this->sparePart()->first();
    }
    
    /**
     * Альтернативный метод для обратной совместимости.
     * @deprecated Используйте sparePart() вместо этого метода.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(SparePart::class, 'spare_part_id');
    }
}
