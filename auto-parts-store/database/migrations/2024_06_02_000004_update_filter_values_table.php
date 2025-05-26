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
        // Шаг 1: Удаляем старый внешний ключ, если он существует
        Schema::table('filter_values', function (Blueprint $table) {
            // Проверка существования внешнего ключа
            $foreignKeys = DB::select(
                "SELECT tc.constraint_name 
                FROM information_schema.table_constraints tc 
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = 'filter_values' 
                AND kcu.column_name = 'part_id'"
            );

            if (!empty($foreignKeys)) {
                foreach ($foreignKeys as $key) {
                    $table->dropForeign($key->constraint_name);
                }
            }
        });

        // Шаг 2: Переименовываем колонку
        Schema::table('filter_values', function (Blueprint $table) {
            $table->renameColumn('part_id', 'spare_part_id');
        });

        // Шаг 3: Добавляем новый внешний ключ
        Schema::table('filter_values', function (Blueprint $table) {
            $table->foreign('spare_part_id')
                  ->references('id')
                  ->on('spare_parts')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Шаг 1: Удаляем новый внешний ключ
        Schema::table('filter_values', function (Blueprint $table) {
            $table->dropForeign(['spare_part_id']);
        });

        // Шаг 2: Переименовываем колонку обратно
        Schema::table('filter_values', function (Blueprint $table) {
            $table->renameColumn('spare_part_id', 'part_id');
        });

        // Шаг 3: Добавляем старый внешний ключ
        Schema::table('filter_values', function (Blueprint $table) {
            $table->foreign('part_id')
                  ->references('id')
                  ->on('spare_parts')
                  ->onDelete('cascade');
        });
    }
}; 