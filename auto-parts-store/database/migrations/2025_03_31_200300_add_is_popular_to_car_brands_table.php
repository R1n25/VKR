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
            $table->boolean('is_popular')->default(false)->after('vin_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_brands', function (Blueprint $table) {
            $table->dropColumn('is_popular');
        });
    }
};
