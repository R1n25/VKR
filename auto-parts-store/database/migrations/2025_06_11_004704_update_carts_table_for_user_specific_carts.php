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
        // Обновляем существующие корзины пользователей, убирая привязку к сессии
        DB::statement('UPDATE carts SET session_id = NULL WHERE user_id IS NOT NULL');
        
        // Добавляем индекс для user_id для ускорения поиска корзин пользователей
        Schema::table('carts', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем индекс для user_id
        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
