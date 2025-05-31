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
        // Проверяем, существует ли столбец car_brand_id
        if (Schema::hasColumn('car_models', 'car_brand_id') && !Schema::hasColumn('car_models', 'brand_id')) {
            // Переименовываем car_brand_id в brand_id
            Schema::table('car_models', function (Blueprint $table) {
                $table->renameColumn('car_brand_id', 'brand_id');
            });
            
            // Обновляем связи в существующих данных
            DB::statement('UPDATE user_suggestions SET car_model_id = NULL WHERE car_model_id IS NOT NULL AND car_model_id NOT IN (SELECT id FROM car_models)');
        }
        
        // Проверяем, что отношение использует правильный внешний ключ
        if (!Schema::hasColumn('car_models', 'brand_id') && Schema::hasTable('car_brands')) {
        Schema::table('car_models', function (Blueprint $table) {
                $table->unsignedBigInteger('brand_id')->nullable()->after('slug');
                $table->foreign('brand_id')->references('id')->on('car_brands')->onDelete('set null');
        });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Обратная операция не требуется, поскольку это исправление структуры базы данных
    }
};
