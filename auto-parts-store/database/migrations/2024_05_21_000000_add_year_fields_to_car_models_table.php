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
            if (!Schema::hasColumn('car_models', 'year_from')) {
                $table->integer('year_from')->nullable()->after('image');
            }
            
            if (!Schema::hasColumn('car_models', 'year_to')) {
                $table->integer('year_to')->nullable()->after('year_from');
            }
            
            if (!Schema::hasColumn('car_models', 'is_popular')) {
                $table->boolean('is_popular')->default(false)->after('year_to');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            $table->dropColumn(['year_from', 'year_to', 'is_popular']);
        });
    }
}; 