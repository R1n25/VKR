<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePartAnalog extends Model
{
    use HasFactory;

    protected $fillable = [
        'spare_part_id',
        'analog_spare_part_id',
        'is_direct',
        'notes',
    ];

    protected $casts = [
        'is_direct' => 'boolean',
    ];

    /**
     * Получить основную запчасть
     */
    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    /**
     * Получить запчасть-аналог
     */
    public function analogSparePart()
    {
        return $this->belongsTo(SparePart::class, 'analog_spare_part_id');
    }
} 