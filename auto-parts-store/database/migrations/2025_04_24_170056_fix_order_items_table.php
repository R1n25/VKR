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
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'order_id')) {
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            }
            if (!Schema::hasColumn('order_items', 'spare_part_id')) {
                $table->foreignId('spare_part_id')->constrained('spare_parts')->onDelete('restrict');
            }
            if (!Schema::hasColumn('order_items', 'quantity')) {
                $table->integer('quantity');
            }
            if (!Schema::hasColumn('order_items', 'price')) {
                $table->decimal('price', 10, 2);
            }
            if (!Schema::hasColumn('order_items', 'part_number')) {
                $table->string('part_number')->nullable();
            }
            if (!Schema::hasColumn('order_items', 'part_name')) {
                $table->string('part_name')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем таблицу, так как она была создана ранее
    }
};
