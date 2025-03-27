<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarModel extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'brand_id',
    ];

    /**
     * Get the brand that owns the car model.
     */
    public function carBrand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'brand_id');
    }

    /**
     * Get the parts for the car model.
     */
    public function parts(): HasMany
    {
        return $this->hasMany(Part::class);
    }
}
