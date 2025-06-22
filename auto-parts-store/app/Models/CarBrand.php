<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarBrand extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'country',
        'description',
        'logo_url',
        'vin_required',
        'is_popular'
    ];

    protected $casts = [
        'vin_required' => 'boolean',
        'is_popular' => 'boolean'
    ];

    /**
     * Get the car models for the brand.
     */
    public function carModels(): HasMany
    {
        return $this->hasMany(CarModel::class, 'brand_id');
    }
}
