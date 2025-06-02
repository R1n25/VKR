<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Services\SparePartService;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'markup_percent',
        'balance',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'markup_percent' => 'float',
            'balance' => 'decimal:2',
        ];
    }

    /**
     * The attributes that should have default values.
     *
     * @var array
     */
    protected $attributes = [
        'role' => 'user',
        'markup_percent' => SparePartService::DEFAULT_MARKUP_PERCENT,
    ];

    /**
     * Проверяет, является ли пользователь администратором
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    
    /**
     * Аксессор для совместимости с AuthenticatedLayout
     */
    public function getIsAdminAttribute()
    {
        return $this->role === 'admin';
    }
    
    /**
     * Дополнительные атрибуты для добавления к массиву модели
     *
     * @var array
     */
    protected $appends = [
        'is_admin',
    ];
}
