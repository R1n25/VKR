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
        Schema::table('spare_part_compatibilities', function (Blueprint $table) {
            $table->unsignedBigInteger('car_engine_id')->nullable()->after('car_model_id');
            $table->foreign('car_engine_id')->references('id')->on('car_engines')->onDelete('set null');
            
            // Удаляем поля start_year и end_year, так как они больше не используются
            $table->dropColumn(['start_year', 'end_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_part_compatibilities', function (Blueprint $table) {
            // Восстанавливаем поля start_year и end_year
            $table->integer('start_year')->nullable();
            $table->integer('end_year')->nullable();
            
            // Удаляем внешний ключ и колонку car_engine_id
            $table->dropForeign(['car_engine_id']);
            $table->dropColumn('car_engine_id');
        });
    }
};
