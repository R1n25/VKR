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
        Schema::table('orders', function (Blueprint $table) {
            // Делаем поле total_price nullable
            if (Schema::hasColumn('orders', 'total_price')) {
                $table->decimal('total_price', 10, 2)->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Возвращаем не-nullable
            if (Schema::hasColumn('orders', 'total_price')) {
                $table->decimal('total_price', 10, 2)->nullable(false)->change();
            }
        });
    }
};
