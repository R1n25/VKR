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
        // Проверяем, существует ли уже столбец is_popular
        if (!Schema::hasColumn('car_brands', 'is_popular')) {
            Schema::table('car_brands', function (Blueprint $table) {
                $table->boolean('is_popular')->default(false)->after('vin_required');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('car_brands', 'is_popular')) {
            Schema::table('car_brands', function (Blueprint $table) {
                $table->dropColumn('is_popular');
            });
        }
    }
};
