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
        Schema::dropIfExists('user_cars');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('user_cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('car_model_id')->constrained()->onDelete('cascade');
            $table->integer('year')->nullable();
            $table->string('vin')->nullable();
            $table->string('license_plate')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }
}; 