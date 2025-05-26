<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PartScheme extends Model
{
    protected $fillable = [
        'name',
        'image',
        'car_model_id',
        'part_category_id',
        'hotspots',
        'description'
    ];

    protected $casts = [
        'hotspots' => 'array'
    ];

    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PartCategory::class, 'part_category_id');
    }

    public function schemeItems(): HasMany
    {
        return $this->hasMany(PartSchemeItem::class);
    }

    public function spareParts(): BelongsToMany
    {
        return $this->belongsToMany(SparePart::class, 'part_scheme_items')
            ->withPivot(['position_x', 'position_y', 'number'])
            ->withTimestamps();
    }
} 