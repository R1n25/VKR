<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            // Добавляем колонку car_brand_id
            $table->unsignedBigInteger('car_brand_id')->nullable()->after('brand_id');
            
            // Создаем внешний ключ
            $table->foreign('car_brand_id')->references('id')->on('car_brands')->onDelete('cascade');
        });
        
        // Копируем данные из brand_id в car_brand_id
        DB::statement('UPDATE car_models SET car_brand_id = brand_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            // Удаляем внешний ключ
            $table->dropForeign(['car_brand_id']);
            
            // Удаляем колонку
            $table->dropColumn('car_brand_id');
        });
    }
};
