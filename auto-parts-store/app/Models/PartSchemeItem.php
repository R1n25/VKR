<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartSchemeItem extends Model
{
    protected $fillable = [
        'part_scheme_id',
        'part_id',
        'position_x',
        'position_y',
        'number'
    ];

    public function scheme(): BelongsTo
    {
        return $this->belongsTo(PartScheme::class, 'part_scheme_id');
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }
} 