<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('balance_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Сумма операции (положительная или отрицательная)
            $table->decimal('balance_after', 10, 2); // Баланс после операции
            $table->string('operation_type'); // Тип операции (пополнение, списание, корректировка)
            $table->string('description')->nullable(); // Описание операции
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete(); // Связь с платежом, если есть
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete(); // Связь с заказом, если есть
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete(); // Администратор, выполнивший операцию
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balance_transactions');
    }
}; 