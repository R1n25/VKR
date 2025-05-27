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
        Schema::create('spare_part_analogs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('spare_part_id'); // Основная запчасть
            $table->unsignedBigInteger('analog_spare_part_id'); // Аналог запчасти
            $table->boolean('is_direct')->default(true); // Прямой аналог или косвенный
            $table->text('notes')->nullable(); // Примечания к аналогу
            $table->timestamps();
            
            // Внешние ключи
            $table->foreign('spare_part_id')->references('id')->on('spare_parts')->onDelete('cascade');
            $table->foreign('analog_spare_part_id')->references('id')->on('spare_parts')->onDelete('cascade');
            
            // Уникальный индекс для предотвращения дублирования
            $table->unique(['spare_part_id', 'analog_spare_part_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_analogs');
    }
}; 