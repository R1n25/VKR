<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetAdminRole extends Command
{
    /**
     * Название и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'user:set-admin {email?}';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Устанавливает роль администратора для указанного пользователя или позволяет выбрать из списка';

    /**
     * Выполнение консольной команды.
     *
     * @return int
     */
    public function handle()
    {
        $email = $this->argument('email');

        if (!$email) {
            $users = User::all(['id', 'name', 'email', 'role']);
            
            $this->table(
                ['ID', 'Имя', 'Email', 'Роль'],
                $users->toArray()
            );
            
            $email = $this->ask('Введите email пользователя, которому нужно присвоить роль администратора');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Пользователь с email {$email} не найден");
            return 1;
        }

        $user->role = 'admin';
        $user->save();

        $this->info("Пользователю {$email} успешно присвоена роль администратора");
        return 0;
    }
} 