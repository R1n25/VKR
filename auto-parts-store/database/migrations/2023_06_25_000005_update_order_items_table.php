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
            // Переименовываем поле part_name в name, если оно существует
            if (Schema::hasColumn('order_items', 'part_name')) {
                $table->renameColumn('part_name', 'name');
            } elseif (!Schema::hasColumn('order_items', 'name')) {
                // Добавляем поле name, если оно не существует
                $table->string('name')->nullable()->after('spare_part_id');
            }
            
            // Добавляем поле total, если оно не существует
            if (!Schema::hasColumn('order_items', 'total')) {
                $table->decimal('total', 10, 2)->nullable()->after('price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Переименовываем поле name обратно в part_name, если оно существует
            if (Schema::hasColumn('order_items', 'name')) {
                $table->renameColumn('name', 'part_name');
            }
            
            // Удаляем поле total, если оно существует
            if (Schema::hasColumn('order_items', 'total')) {
                $table->dropColumn('total');
            }
        });
    }
}; 