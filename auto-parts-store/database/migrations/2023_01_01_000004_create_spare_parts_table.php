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
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('part_number')->unique();
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->string('manufacturer');
            $table->foreignId('category_id')->nullable()->constrained('part_categories')->onDelete('set null');
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Индекс для ускорения поиска по номеру запчасти
            $table->index('part_number');
            // Индекс для ускорения поиска по производителю
            $table->index('manufacturer');
        });

        // Создаем связующую таблицу между запчастями и моделями автомобилей
        Schema::create('car_model_spare_part', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['car_model_id', 'spare_part_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_model_spare_part');
        Schema::dropIfExists('spare_parts');
    }
}; 