<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePartCompatibility extends Model
{
    use HasFactory;

    protected $fillable = [
        'spare_part_id',
        'car_model_id',
        'car_engine_id',
        'start_year',
        'end_year',
        'notes',
        'is_verified',
    ];

    /**
     * Получить запчасть
     */
    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    /**
     * Получить модель автомобиля
     */
    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    /**
     * Получить двигатель автомобиля
     */
    public function carEngine()
    {
        return $this->belongsTo(CarEngine::class);
    }


} 