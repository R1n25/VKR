<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SparePart extends Model
{
    use HasFactory;
    
    /**
     * Таблица, соответствующая модели.
     *
     * @var string
     */
    protected $table = 'spare_parts';

    /**
     * Аттрибуты, которые можно массово назначать.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'part_number',
        'price',
        'stock_quantity',
        'manufacturer',
        'category',
        'image_url',
        'is_available',
    ];

    /**
     * Аттрибуты, которые должны быть приведены к типам.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Получить модели автомобилей, совместимые с этой запчастью.
     */
    public function carModels(): BelongsToMany
    {
        return $this->belongsToMany(CarModel::class, 'car_model_spare_part')
            ->withTimestamps();
    }
} 