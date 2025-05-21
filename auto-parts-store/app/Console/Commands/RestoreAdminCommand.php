<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\PermanentUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class RestoreAdminCommand extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'admin:restore {email=admin@admin.com : Email администратора} {password=Admin12345 : Пароль администратора}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Восстанавливает или создает аккаунт администратора';

    /**
     * Выполнить консольную команду.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        // Создаем администратора в таблице постоянных пользователей
        PermanentUser::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Администратор',
                'password' => Hash::make($password),
                'is_admin' => true,
                'markup_percent' => 0,
            ]
        );
        
        // Создаем администратора в основной таблице пользователей
        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Администратор',
                'password' => Hash::make($password),
                'is_admin' => true,
                'markup_percent' => 0,
            ]
        );
        
        $this->info("Администратор с email {$email} успешно создан/восстановлен. Пароль: {$password}");
        
        return 0;
    }
} 