<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Добавляем внешний ключ к filter_values.part_id
        Schema::table('filter_values', function (Blueprint $table) {
            $table->foreign('part_id')->references('id')->on('parts')->onDelete('cascade');
        });
        
        // Добавляем внешний ключ к parts.category_id
        Schema::table('parts', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('part_categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('filter_values', function (Blueprint $table) {
            $table->dropForeign(['part_id']);
        });
        
        Schema::table('parts', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });
    }
}; 