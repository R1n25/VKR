<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filter_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('filter_attribute_id')->constrained()->onDelete('cascade');
            $table->foreignId('part_category_id')->constrained()->onDelete('cascade');
            $table->integer('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filter_category');
    }
}; 