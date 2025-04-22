<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilterValue extends Model
{
    protected $fillable = [
        'part_id',
        'filter_attribute_id',
        'value',
    ];

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(FilterAttribute::class, 'filter_attribute_id');
    }
} 