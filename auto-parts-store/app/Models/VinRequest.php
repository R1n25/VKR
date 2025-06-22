<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VinRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'vin',
        'user_id',
        'name',
        'email',
        'phone',
        'parts_description',
        'status',
        'admin_notes',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /**
     * Получить пользователя, который сделал запрос.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
