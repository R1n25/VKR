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
        Schema::table('car_models', function (Blueprint $table) {
            // Проверяем наличие колонки start_year
            if (!Schema::hasColumn('car_models', 'start_year')) {
                $table->integer('start_year')->nullable()->after('slug');
            }
            
            // Проверяем наличие колонки end_year
            if (!Schema::hasColumn('car_models', 'end_year')) {
                $table->integer('end_year')->nullable()->after('start_year');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            // Удаляем колонки, если они существуют
            if (Schema::hasColumn('car_models', 'start_year')) {
                $table->dropColumn('start_year');
            }
            
            if (Schema::hasColumn('car_models', 'end_year')) {
                $table->dropColumn('end_year');
            }
        });
    }
}; 