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
        Schema::table('order_items', function (Blueprint $table) {
            // Изменяем тип поля part_id на nullable
            if (Schema::hasColumn('order_items', 'part_id')) {
                $table->unsignedBigInteger('part_id')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Возвращаем обратно не-nullable, если нужно
            if (Schema::hasColumn('order_items', 'part_id')) {
                $table->unsignedBigInteger('part_id')->nullable(false)->change();
            }
        });
    }
};
