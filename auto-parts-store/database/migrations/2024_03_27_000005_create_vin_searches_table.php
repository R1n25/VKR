<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vin_searches', function (Blueprint $table) {
            $table->id();
            $table->string('vin', 17);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('vehicle_info')->nullable();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->integer('year')->nullable();
            $table->string('engine')->nullable();
            $table->string('transmission')->nullable();
            $table->string('body_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vin_searches');
    }
}; 