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
        // Проверяем, существует ли таблица
        if (!Schema::hasTable('payment_methods')) {
            Schema::create('payment_methods', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->string('icon')->nullable();
                $table->json('settings')->nullable();
                $table->timestamps();
            });
        } else {
            // Добавляем недостающие столбцы, если таблица уже существует
            if (!Schema::hasColumn('payment_methods', 'icon')) {
                Schema::table('payment_methods', function (Blueprint $table) {
                    $table->string('icon')->nullable();
                });
            }
            
            if (!Schema::hasColumn('payment_methods', 'settings')) {
                Schema::table('payment_methods', function (Blueprint $table) {
                    $table->json('settings')->nullable();
                });
            }
        }

        // Проверяем наличие базовых методов оплаты и добавляем их, если они отсутствуют
        $methods = [
            [
                'name' => 'Наличные',
                'code' => 'cash',
                'description' => 'Оплата наличными при получении',
                'is_active' => true,
            ],
            [
                'name' => 'Банковская карта',
                'code' => 'card',
                'description' => 'Оплата банковской картой при получении',
                'is_active' => true,
            ],
            [
                'name' => 'Онлайн-платеж',
                'code' => 'online',
                'description' => 'Оплата онлайн через платежную систему',
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            DB::table('payment_methods')->updateOrInsert(
                ['code' => $method['code']],
                array_merge($method, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем таблицу, так как она могла существовать до миграции
    }
}; 