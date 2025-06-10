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
        Schema::dropIfExists('part_scheme_items');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
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
}; 