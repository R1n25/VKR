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
        Schema::dropIfExists('part_schemes');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('part_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->string('image_url');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
}; 