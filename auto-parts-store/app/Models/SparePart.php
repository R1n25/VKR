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
     * Аттрибуты, которые должны быть включены при сериализации.
     *
     * @var array<int, string>
     */
    protected $visible = [
        'id',
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
        'created_at',
        'updated_at',
        'original_price',
        'markup_price',
        'markup_percent'
    ];

    /**
     * Получить модели автомобилей, совместимые с этой запчастью.
     */
    public function carModels(): BelongsToMany
    {
        return $this->belongsToMany(CarModel::class, 'car_model_spare_part')
            ->withTimestamps();
    }

    /**
     * Преобразование модели в массив.
     *
     * @return array<string, mixed>
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Гарантируем, что поле price преобразуется в строку с двумя знаками после запятой
        if (isset($array['price'])) {
            $array['price'] = number_format((float)$array['price'], 2, '.', '');
        }
        
        // Форматируем значения для дополнительных полей цены
        if (isset($array['original_price'])) {
            $array['original_price'] = number_format((float)$array['original_price'], 2, '.', '');
        }
        
        if (isset($array['markup_price'])) {
            $array['markup_price'] = number_format((float)$array['markup_price'], 2, '.', '');
        }
        
        return $array;
    }
} 