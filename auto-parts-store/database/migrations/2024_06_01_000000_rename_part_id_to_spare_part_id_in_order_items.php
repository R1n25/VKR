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
        // Проверяем, существует ли столбец part_id и не существует ли столбец spare_part_id
        if (Schema::hasColumn('order_items', 'part_id') && !Schema::hasColumn('order_items', 'spare_part_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->renameColumn('part_id', 'spare_part_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Проверяем, существует ли столбец spare_part_id и не существует ли столбец part_id
        if (Schema::hasColumn('order_items', 'spare_part_id') && !Schema::hasColumn('order_items', 'part_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->renameColumn('spare_part_id', 'part_id');
            });
        }
    }
}; 