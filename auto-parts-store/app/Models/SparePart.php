<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'category_id',
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
        'category_id',
        'image_url',
        'is_available',
        'created_at',
        'updated_at',
        'original_price',
        'markup_price',
        'markup_percent'
    ];

    /**
     * Получить категорию запчасти.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(PartCategory::class, 'category_id');
    }

    /**
     * Получить модели автомобилей, совместимые с этой запчастью.
     */
    public function carModels(): BelongsToMany
    {
        return $this->belongsToMany(CarModel::class, 'spare_part_compatibilities')
            ->withPivot(['notes'])
            ->withTimestamps();
    }

    /**
     * Получить аналоги запчасти
     */
    public function analogs()
    {
        return $this->hasMany(SparePartAnalog::class);
    }

    /**
     * Получить запчасти, для которых данная запчасть является аналогом
     */
    public function analogFor()
    {
        return $this->hasMany(SparePartAnalog::class, 'analog_spare_part_id');
    }

    /**
     * Получить все совместимости с автомобилями
     */
    public function compatibilities()
    {
        return $this->hasMany(SparePartCompatibility::class);
    }

    /**
     * Получить бренд запчасти
     * 
     * Это отношение имитирует связь с брендом через поле manufacturer,
     * поскольку в модели нет прямой связи brand_id с таблицей car_brands
     */
    public function brand()
    {
        // Поскольку у нас нет отношения через foreign key,
        // мы используем специальный метод для поиска бренда по имени
        return $this->belongsTo(CarBrand::class, 'manufacturer', 'name');
    }

    /**
     * Получить все модели автомобилей, с которыми совместима запчасть
     */
    public function compatibleCarModels()
    {
        return $this->belongsToMany(CarModel::class, 'spare_part_compatibilities')
                    ->withPivot('notes')
                    ->withTimestamps();
    }

    /**
     * Получить все предложения пользователей по этой запчасти
     */
    public function suggestions()
    {
        return $this->hasMany(UserSuggestion::class);
    }

    /**
     * Получить элементы заказов, связанные с этой запчастью
     */
    public function orderItems()
    {
        return $this->hasMany(\App\Models\OrderItem::class, 'spare_part_id');
    }

    /**
     * Проверить, совместима ли запчасть с указанной моделью автомобиля и двигателем
     */
    public function isCompatibleWith($carModelId, $carEngineId = null)
    {
        $query = $this->compatibilities()
                      ->where('car_model_id', $carModelId);
        
        if ($carEngineId !== null) {
            // Если указан двигатель, ищем точное соответствие
            return $query->where('car_engine_id', $carEngineId)->exists();
        }
        
        // Если двигатель не указан, ищем любую совместимость с моделью
        return $query->exists();
    }

    /**
     * Добавить аналог для запчасти
     */
    public function addAnalog($analogSparePartId, $isDirect = true, $notes = null)
    {
        return $this->analogs()->create([
            'analog_spare_part_id' => $analogSparePartId,
            'is_direct' => $isDirect,
            'notes' => $notes,
        ]);
    }

    /**
     * Добавить совместимость с моделью автомобиля
     */
    public function addCompatibility($carModelId, $carEngineId = null, $notes = null)
    {
        return $this->compatibilities()->create([
            'car_model_id' => $carModelId,
            'car_engine_id' => $carEngineId,
            'notes' => $notes,
        ]);
    }
    
    /**
     * Обновить доступность товара на основе количества
     * 
     * @param int $quantityChange Изменение количества (положительное или отрицательное)
     * @return $this
     */
    public function updateAvailability($quantityChange)
    {
        // Получаем текущее количество
        $oldQuantity = $this->stock_quantity;
        
        // Вычисляем новое количество
        $newQuantity = max(0, $oldQuantity + $quantityChange);
        
        // Обновляем количество товара
        $this->stock_quantity = $newQuantity;
        
        // Обновляем доступность - товар всегда остается в базе, 
        // но может быть отмечен как недоступный
        $this->is_available = ($newQuantity > 0);
        
        // Сохраняем изменения
        $this->save();
        
        return $this;
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

    /**
     * Получить все модели автомобилей, совместимые с этой запчастью.
     * 
     * Этот метод используется для обратной совместимости.
     */
    public function compatibleCars(): BelongsToMany
    {
        return $this->carModels();
    }

    /**
     * Получить модель автомобиля для этой запчасти
     */
    public function model()
    {
        return $this->belongsTo(CarModel::class, 'model_id');
    }

    /**
     * Получить все двигатели, совместимые с этой запчастью.
     */
    public function carEngines(): BelongsToMany
    {
        return $this->belongsToMany(CarEngine::class, 'car_engine_spare_part')
            ->withPivot('notes')
            ->withTimestamps();
    }
} 