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
            // Добавляем поле spare_part_id, если оно не существует
            if (!Schema::hasColumn('order_items', 'spare_part_id')) {
                $table->unsignedBigInteger('spare_part_id')->nullable()->after('order_id');
                
                // Добавляем внешний ключ, если нужно
                $table->foreign('spare_part_id')
                      ->references('id')
                      ->on('spare_parts')
                      ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Удаляем внешний ключ
            if (Schema::hasColumn('order_items', 'spare_part_id')) {
                $table->dropForeign(['spare_part_id']);
                $table->dropColumn('spare_part_id');
            }
        });
    }
};
