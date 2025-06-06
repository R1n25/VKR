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
        Schema::create('part_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->string('image_url');
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        Schema::create('part_scheme_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_scheme_id')->constrained()->onDelete('cascade');
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->integer('position_x');
            $table->integer('position_y');
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_scheme_items');
        Schema::dropIfExists('part_schemes');
    }
}; 