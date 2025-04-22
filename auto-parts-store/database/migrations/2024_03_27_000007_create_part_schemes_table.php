<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('part_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image');
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_category_id')->constrained()->onDelete('cascade');
            $table->json('hotspots')->nullable(); // Точки на схеме, связанные с запчастями
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Таблица для связи схем с запчастями
        Schema::create('part_scheme_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_scheme_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_id')->constrained()->onDelete('cascade');
            $table->integer('position_x')->nullable();
            $table->integer('position_y')->nullable();
            $table->string('number')->nullable(); // Номер детали на схеме
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('part_scheme_items');
        Schema::dropIfExists('part_schemes');
    }
}; 