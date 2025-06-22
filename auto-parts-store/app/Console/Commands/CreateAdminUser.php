<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {--name=Администратор : Имя администратора} {--email=admin@autoparts.ru : Email администратора} {--password=admin12345 : Пароль администратора}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Создание пользователя с правами администратора';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем создание администратора...');
        
        $name = $this->option('name');
        $email = $this->option('email');
        $password = $this->option('password');
        
        $this->info("Параметры: Имя: {$name}, Email: {$email}");
        
        // Проверяем, существует ли уже администратор с таким email
        $existingAdmin = User::where('email', $email)->first();
        
        if ($existingAdmin) {
            if ($existingAdmin->role === 'admin') {
                $this->info("Администратор с email {$email} уже существует.");
                
                if ($this->confirm('Хотите обновить данные администратора?', false)) {
                    $existingAdmin->name = $name;
                    $existingAdmin->password = Hash::make($password);
                    $existingAdmin->save();
                    
                    $this->info('Данные администратора обновлены успешно.');
                }
            } else {
                if ($this->confirm("Пользователь с email {$email} существует, но не является администратором. Сделать его администратором?", true)) {
                    $existingAdmin->role = 'admin';
                    $existingAdmin->save();
                    
                    $this->info('Пользователь успешно назначен администратором.');
                }
            }
            
            return;
        }
        
        try {
            // Создаем нового администратора
            $admin = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'role' => 'admin',
                'markup_percent' => 0, // Нет наценки для администратора
            ]);
            
            $this->info("Администратор {$name} ({$email}) успешно создан.");
        } catch (\Exception $e) {
            $this->error("Ошибка при создании администратора: " . $e->getMessage());
        }
        
        return 0;
    }
} 