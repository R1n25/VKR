<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\PermanentUser;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Синхронизация начинается с создания администратора
        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Администратор',
                'password' => Hash::make('Admin12345'),
                'is_admin' => true,
                'markup_percent' => 0,
            ]
        );
        
        // Сохраняем администратора и в таблице постоянных пользователей
        PermanentUser::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Администратор',
                'password' => Hash::make('Admin12345'),
                'is_admin' => true,
                'markup_percent' => 0,
            ]
        );
        
        // Синхронизируем других постоянных пользователей (если есть)
        $permanentUsers = PermanentUser::where('email', '!=', 'admin@admin.com')->get();
        
        $count = 0;
        foreach ($permanentUsers as $permanentUser) {
            User::updateOrCreate(
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
            $count++;
        }
        
        echo "Пользователь admin@admin.com (пароль: Admin12345) и еще {$count} пользователей были синхронизированы.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // В случае отката миграции ничего не делаем
        // Пользователи остаются в базе данных
    }
}; 