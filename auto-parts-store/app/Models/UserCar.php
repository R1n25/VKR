<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCar extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_brand_id',
        'car_model_id',
        'year',
        'vin',
        'engine_type',
        'engine_volume',
        'transmission',
        'color',
    ];

    /**
     * Get the user that owns the car.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the brand of the car.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'car_brand_id');
    }

    /**
     * Get the model of the car.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(CarModel::class, 'car_model_id');
    }
} 