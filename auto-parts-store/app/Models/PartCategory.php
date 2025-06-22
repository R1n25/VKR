<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartCategory extends Model
{
    use HasFactory;
    
    /**
     * Таблица, соответствующая модели.
     *
     * @var string
     */
    protected $table = 'part_categories';

    /**
     * Атрибуты, которые можно массово назначать.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'parent_id',
        'image_url',
    ];

    /**
     * Получить все запчасти в этой категории.
     */
    public function spareParts(): HasMany
    {
        return $this->hasMany(SparePart::class, 'category_id');
    }

    /**
     * Получить родительскую категорию.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(PartCategory::class, 'parent_id');
    }

    /**
     * Получить дочерние категории.
     */
    public function children(): HasMany
    {
        return $this->hasMany(PartCategory::class, 'parent_id');
    }

    /**
     * Проверить, имеет ли категория дочерние элементы.
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Получить URL изображения категории или вернуть изображение по умолчанию.
     */
    public function getImageUrlAttribute($value)
    {
        if (!$value) {
            return asset('images/default-category.jpg');
        }
        
        return asset('storage/' . $value);
    }
}
