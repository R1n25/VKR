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
        Schema::create('car_engines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('car_models')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // бензин, дизель, гибрид, электро
            $table->string('volume')->nullable(); // объем в литрах
            $table->integer('power')->nullable(); // мощность в л.с.
            $table->integer('year_start')->nullable();
            $table->integer('year_end')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_engines');
    }
}; 