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
        Schema::dropIfExists('car_model_spare_part');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('car_model_spare_part', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['car_model_id', 'spare_part_id']);
        });
    }
}; 