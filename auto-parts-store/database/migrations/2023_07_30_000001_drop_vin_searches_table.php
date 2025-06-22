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
        Schema::dropIfExists('vin_searches');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('vin_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('vin');
            $table->foreignId('car_brand_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('car_model_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('year')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });
    }
}; 