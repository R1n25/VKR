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
        Schema::table('spare_part_compatibilities', function (Blueprint $table) {
            // Добавляем поле car_engine_id и is_verified
            if (!Schema::hasColumn('spare_part_compatibilities', 'car_engine_id')) {
                $table->foreignId('car_engine_id')->nullable()->after('car_model_id');
            }
            
            if (!Schema::hasColumn('spare_part_compatibilities', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('notes');
            }
            
            // Проверяем наличие индекса перед удалением
            try {
                $indexExists = DB::select("
                    SELECT indexname 
                    FROM pg_indexes 
                    WHERE tablename = 'spare_part_compatibilities' 
                    AND indexname = 'spare_part_compatibilities_spare_part_id_car_model_id_unique'
                ");
                
                if (count($indexExists) > 0) {
                    $table->dropUnique(['spare_part_id', 'car_model_id']);
                }
            } catch (\Exception $e) {
                // Если ошибка, игнорируем - возможно индекса нет
            }
            
            // Создаем новый уникальный индекс, учитывающий car_engine_id
            $table->unique(['spare_part_id', 'car_model_id', 'car_engine_id'], 'compatibility_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_part_compatibilities', function (Blueprint $table) {
            // Удаляем новый уникальный индекс
            $table->dropUnique('compatibility_unique');
            
            // Удаляем поля
            if (Schema::hasColumn('spare_part_compatibilities', 'car_engine_id')) {
                $table->dropColumn('car_engine_id');
            }
            
            if (Schema::hasColumn('spare_part_compatibilities', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
            
            // Восстанавливаем старый уникальный индекс
            $table->unique(['spare_part_id', 'car_model_id']);
        });
    }
};
