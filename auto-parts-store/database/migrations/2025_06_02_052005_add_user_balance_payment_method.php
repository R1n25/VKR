<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Добавляем метод оплаты "Баланс пользователя"
        DB::table('payment_methods')->insert([
            'name' => 'Баланс пользователя',
            'code' => 'user_balance',
            'description' => 'Оплата с баланса пользователя',
            'is_active' => true,
            'settings' => json_encode([
                'auto_complete' => true,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем метод оплаты "Баланс пользователя"
        DB::table('payment_methods')->where('code', 'user_balance')->delete();
    }
};
