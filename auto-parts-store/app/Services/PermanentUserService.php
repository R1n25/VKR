<?php

namespace App\Services;

use App\Models\User;
use App\Models\PermanentUser;
use Illuminate\Support\Facades\Hash;

class PermanentUserService
{
    /**
     * Синхронизировать постоянных пользователей с основной таблицей пользователей
     * 
     * @return array Результат синхронизации: ['success' => bool, 'message' => string, 'count' => int]
     */
    public function syncUsers(): array
    {
        // Создаем счетчик
        $count = 0;
        
        // Сначала добавляем администратора и тестового пользователя (если их нет)
        $this->ensureDefaultUsers();
        
        // Получаем всех постоянных пользователей
        $permanentUsers = PermanentUser::all();
        
        // Синхронизируем их с таблицей пользователей
        foreach ($permanentUsers as $permanentUser) {
            $user = User::firstOrCreate(
                ['email' => $permanentUser->email],
                [
                    'name' => $permanentUser->name,
                    'password' => $permanentUser->password,
                    'is_admin' => $permanentUser->is_admin,
                    'markup_percent' => $permanentUser->markup_percent ?? 0,
                    'email_verified_at' => $permanentUser->email_verified_at,
                    'remember_token' => $permanentUser->remember_token,
                ]
            );
            
            if ($user->wasRecentlyCreated) {
                $count++;
            }
        }
        
        return [
            'success' => true,
            'message' => "Синхронизировано {$count} пользователей",
            'count' => $count
        ];
    }
    
    /**
     * Сохранить пользователя как постоянного
     * 
     * @param User $user Пользователь для сохранения
     * @return PermanentUser Постоянный пользователь
     */
    public function savePermanentUser(User $user): PermanentUser
    {
        return PermanentUser::updateOrCreate(
            ['email' => $user->email],
            [
                'name' => $user->name,
                'password' => $user->password,
                'is_admin' => $user->is_admin,
                'markup_percent' => $user->markup_percent ?? 0,
                'email_verified_at' => $user->email_verified_at,
                'remember_token' => $user->remember_token,
            ]
        );
    }
    
    /**
     * Убедиться, что стандартные пользователи (админ и тестовый) существуют
     */
    private function ensureDefaultUsers(): void
    {
        // Создаем администратора в таблице постоянных пользователей
        PermanentUser::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Администратор',
                'password' => Hash::make('admin12345'),
                'is_admin' => true,
                'markup_percent' => 0
            ]
        );
        
        // Создаем демо-пользователя в таблице постоянных пользователей
        PermanentUser::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Демо пользователь',
                'password' => Hash::make('user12345'),
                'is_admin' => false,
                'markup_percent' => 10
            ]
        );
    }
} 