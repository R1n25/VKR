<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartSchemeItem extends Model
{
    protected $fillable = [
        'part_scheme_id',
        'spare_part_id',
        'position_x',
        'position_y',
        'number'
    ];

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(PartScheme::class, 'part_scheme_id');
    }

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
} 