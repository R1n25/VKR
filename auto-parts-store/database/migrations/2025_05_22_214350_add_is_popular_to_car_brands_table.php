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
        Schema::table('car_brands', function (Blueprint $table) {
            // Проверяем, существует ли уже столбец is_popular
            if (!Schema::hasColumn('car_brands', 'is_popular')) {
                $table->boolean('is_popular')->default(false)->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_brands', function (Blueprint $table) {
            if (Schema::hasColumn('car_brands', 'is_popular')) {
                $table->dropColumn('is_popular');
            }
        });
    }
};
