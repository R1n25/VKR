<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Удаляет все таблицы и поля, связанные с финансовым функционалом
     */
    public function up(): void
    {
        // Удаляем внешние ключи сначала, чтобы избежать ошибок при удалении таблиц
        Schema::table('balance_transactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['order_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['payment_method_id']);
        });

        // Удаляем таблицы, связанные с платежами
        Schema::dropIfExists('balance_transactions');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_methods');

        // Удаляем поле balance из таблицы users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('balance');
        });

        // Удаляем поля, связанные с оплатой, из таблицы orders
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'is_paid',
                'paid_at'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     * Восстанавливает все таблицы и поля, связанные с финансовым функционалом
     */
    public function down(): void
    {
        // Добавляем поля в таблицу orders
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->timestamp('paid_at')->nullable();
        });

        // Добавляем поле balance в таблицу users
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('balance', 10, 2)->default(0.00);
        });

        // Создаем таблицу payment_methods
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('config')->nullable();
            $table->timestamps();
        });

        // Создаем таблицу payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_method_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('status'); // pending, completed, failed, refunded
            $table->string('transaction_id')->nullable();
            $table->json('transaction_data')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // Создаем таблицу balance_transactions
        Schema::create('balance_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('type'); // deposit, withdraw, order_payment, refund
            $table->string('status'); // pending, completed, failed
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }
};
