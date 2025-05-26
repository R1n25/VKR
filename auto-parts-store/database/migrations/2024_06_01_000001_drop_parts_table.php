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
        // Удаляем внешние ключи, ссылающиеся на таблицу parts
        Schema::table('part_category_part', function (Blueprint $table) {
            if (Schema::hasColumn('part_category_part', 'part_id')) {
                $table->dropForeign(['part_id']);
            }
        });

        Schema::table('part_scheme_items', function (Blueprint $table) {
            if (Schema::hasColumn('part_scheme_items', 'part_id')) {
                $table->dropForeign(['part_id']);
            }
        });

        Schema::table('filter_values', function (Blueprint $table) {
            if (Schema::hasColumn('filter_values', 'part_id')) {
                $table->dropForeign(['part_id']);
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'part_id')) {
                $table->dropForeign(['part_id']);
            }
        });

        Schema::table('cart_items', function (Blueprint $table) {
            if (Schema::hasColumn('cart_items', 'part_id')) {
                $table->dropForeign(['part_id']);
            }
        });

        // Теперь удаляем саму таблицу
        Schema::dropIfExists('parts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Восстанавливать таблицу parts не будем, так как она заменена на spare_parts
    }
}; 