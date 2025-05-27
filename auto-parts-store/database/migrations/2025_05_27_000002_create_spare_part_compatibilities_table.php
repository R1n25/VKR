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
        Schema::create('spare_part_compatibilities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('spare_part_id'); // Запчасть
            $table->unsignedBigInteger('car_model_id'); // Модель автомобиля
            $table->integer('start_year')->nullable(); // Начальный год применимости
            $table->integer('end_year')->nullable(); // Конечный год применимости
            $table->text('notes')->nullable(); // Примечания к совместимости
            $table->timestamps();
            
            // Внешние ключи
            $table->foreign('spare_part_id')->references('id')->on('spare_parts')->onDelete('cascade');
            $table->foreign('car_model_id')->references('id')->on('car_models')->onDelete('cascade');
            
            // Уникальный индекс для предотвращения дублирования
            $table->unique(['spare_part_id', 'car_model_id', 'start_year', 'end_year'], 'unique_compatibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spare_part_compatibilities');
    }
}; 