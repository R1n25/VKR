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
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->foreignId('analog_spare_part_id')->constrained('spare_parts')->onDelete('cascade');
            $table->boolean('is_direct')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
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