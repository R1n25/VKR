<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'suggestion_type',
        'spare_part_id',
        'analog_spare_part_id',
        'car_model_id',
        'comment',
        'status',
        'admin_comment',
        'approved_by',
        'approved_at',
        'data',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'data' => 'array',
    ];

    /**
     * Получить пользователя, который создал предложение
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Получить администратора, который одобрил предложение
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

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

    /**
     * Получить модель автомобиля
     */
    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    /**
     * Является ли предложение предложением аналога
     */
    public function isAnalogSuggestion()
    {
        return $this->suggestion_type === 'analog';
    }

    /**
     * Является ли предложение предложением совместимости
     */
    public function isCompatibilitySuggestion()
    {
        return $this->suggestion_type === 'compatibility';
    }

    /**
     * Ожидает ли предложение модерации
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Одобрено ли предложение
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Отклонено ли предложение
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }
} 