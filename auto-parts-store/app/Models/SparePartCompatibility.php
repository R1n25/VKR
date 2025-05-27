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
        'start_year',
        'end_year',
        'notes',
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
     * Проверить, подходит ли запчасть для указанного года выпуска
     */
    public function isCompatibleWithYear($year)
    {
        if ($this->start_year && $this->end_year) {
            return $year >= $this->start_year && $year <= $this->end_year;
        }
        
        if ($this->start_year) {
            return $year >= $this->start_year;
        }
        
        if ($this->end_year) {
            return $year <= $this->end_year;
        }
        
        return true; // Если годы не указаны, считаем совместимой со всеми
    }
} 