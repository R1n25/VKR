<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;
    
    /**
     * Атрибуты, которые можно массово назначать.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'spare_part_id',
        'rating',
        'comment',
        'is_verified',
        'purchase_verified'
    ];
    
    /**
     * Атрибуты, которые должны быть приведены к типам.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'purchase_verified' => 'boolean',
    ];
    
    /**
     * Получить пользователя, оставившего отзыв
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Получить запчасть, к которой относится отзыв
     */
    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
