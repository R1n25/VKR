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
            $table->string('type')->default('text'); // text, number, select, etc.
            $table->json('options')->nullable();
            $table->timestamps();
        });
        
        // Связующая таблица между атрибутами фильтра и категориями запчастей
        Schema::create('filter_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filter_attribute_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['filter_attribute_id', 'part_category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filter_category');
        Schema::dropIfExists('filter_attributes');
    }
}; 