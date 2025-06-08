<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CarModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'brand_id',
        'year_start',
        'year_end',
        'generation',
        'body_type',
        'engine_type',
        'engine_volume',
        'transmission_type',
        'drive_type',
        'is_popular',
        'image_url',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'year_start' => 'integer',
        'year_end' => 'integer',
    ];

    /**
     * Get the brand that owns the car model.
     */
    public function carBrand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'brand_id');
    }

    /**
     * Alias for carBrand relationship.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'brand_id');
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
