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
        Schema::create('filter_attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // select, range, checkbox
            $table->string('unit')->nullable(); // единица измерения (мм, кг и т.д.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filter_attributes');
    }
}; 