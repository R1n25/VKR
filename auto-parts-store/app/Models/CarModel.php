<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CarModel extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'brand_id',
        'start_year',
        'end_year',
    ];

    protected $casts = [
        'start_year' => 'integer',
        'end_year' => 'integer',
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

    /**
     * Get the spare parts that are compatible with this car model.
     */
    public function spareParts(): BelongsToMany
    {
        return $this->belongsToMany(SparePart::class, 'car_model_spare_part')
            ->withTimestamps();
    }
}
