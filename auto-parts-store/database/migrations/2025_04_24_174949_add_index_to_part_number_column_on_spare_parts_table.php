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
            // Добавляем индекс к колонке part_number для ускорения поиска
            $table->index('part_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            // Удаляем индекс при откате миграции
            $table->dropIndex(['part_number']);
        });
    }
};
