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
        // Сначала проверяем, существует ли таблица cart_items
        if (!Schema::hasTable('cart_items')) {
            // Если таблица не существует, создаем её
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
                $table->foreignId('spare_part_id')->constrained('spare_parts')->onDelete('cascade');
                $table->integer('quantity')->default(1);
                $table->decimal('price', 10, 2);
                $table->timestamps();
            });
        } else {
            // Если таблица существует, добавляем недостающие столбцы
            Schema::table('cart_items', function (Blueprint $table) {
                if (!Schema::hasColumn('cart_items', 'cart_id')) {
                    $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
                }
                if (!Schema::hasColumn('cart_items', 'spare_part_id')) {
                    $table->foreignId('spare_part_id')->constrained('spare_parts')->onDelete('cascade');
                }
                if (!Schema::hasColumn('cart_items', 'quantity')) {
                    $table->integer('quantity')->default(1);
                }
                if (!Schema::hasColumn('cart_items', 'price')) {
                    $table->decimal('price', 10, 2);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем таблицу при откате
    }
}; 