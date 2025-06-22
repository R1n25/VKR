<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CarEngine extends Model
{
    use HasFactory;

    /**
     * Аттрибуты, которые можно массово назначать.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'model_id',
        'name',
        'slug',
        'type',
        'volume',
        'power',
        'year_start',
        'year_end',
        'description',
    ];

    /**
     * Аттрибуты, которые должны быть приведены к типам.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'power' => 'integer',
        'year_start' => 'integer',
        'year_end' => 'integer',
    ];

    /**
     * Получить модель автомобиля, к которой принадлежит двигатель.
     */
    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class, 'model_id');
    }

    /**
     * Получить запчасти, совместимые с этим двигателем.
     */
    public function spareParts(): BelongsToMany
    {
        return $this->belongsToMany(SparePart::class, 'car_engine_spare_part')
            ->withPivot('notes')
            ->withTimestamps();
    }

    /**
     * Получить полное название двигателя с объемом и мощностью.
     */
    public function getFullNameAttribute(): string
    {
        $parts = [$this->name];

        if ($this->volume) {
            $parts[] = $this->volume . 'л';
        }

        if ($this->power) {
            $parts[] = $this->power . 'л.с.';
        }

        return implode(' ', $parts);
    }
} 