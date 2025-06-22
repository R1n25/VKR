<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FilterAttribute extends Model
{
    protected $fillable = [
        'name',
        'type',
        'unit',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(PartCategory::class, 'filter_category')
            ->withPivot('position')
            ->withTimestamps();
    }

    public function values(): HasMany
    {
        return $this->hasMany(FilterValue::class);
    }
} 