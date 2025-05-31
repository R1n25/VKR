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
        Schema::table('spare_parts', function (Blueprint $table) {
            // Добавляем новое поле category_id как внешний ключ
            $table->unsignedBigInteger('category_id')->nullable()->after('manufacturer');
            
            // Добавляем внешний ключ, ссылающийся на таблицу part_categories
            $table->foreign('category_id')
                  ->references('id')
                  ->on('part_categories')
                  ->onDelete('set null');
                  
            // Удаляем старое текстовое поле category
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            // Удаляем внешний ключ
            $table->dropForeign(['category_id']);
            
            // Удаляем поле category_id
            $table->dropColumn('category_id');
            
            // Восстанавливаем старое текстовое поле category
            $table->string('category')->nullable()->after('manufacturer');
        });
    }
};
