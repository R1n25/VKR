<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilterValue extends Model
{
    protected $fillable = [
        'spare_part_id',
        'filter_attribute_id',
        'value',
    ];

    public function sparePart(): BelongsTo
    {
        return $this->belongsTo(SparePart::class);
    }
    
    /**
     * Альтернативный метод для обратной совместимости.
     * @deprecated Используйте sparePart() вместо этого метода.
     */
    public function part(): BelongsTo
    {
        return $this->belongsTo(SparePart::class, 'spare_part_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(FilterAttribute::class, 'filter_attribute_id');
    }
} 