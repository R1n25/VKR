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
        // Шаг 1: Скопировать данные из part_id в spare_part_id, если spare_part_id пусто
        DB::statement('UPDATE cart_items SET spare_part_id = part_id WHERE spare_part_id IS NULL AND part_id IS NOT NULL');
        
        // Шаг 2: Удалить внешний ключ на part_id (если существует)
        Schema::table('cart_items', function (Blueprint $table) {
            // Проверка существования внешнего ключа
            $foreignKeys = DB::select(
                "SELECT tc.constraint_name 
                FROM information_schema.table_constraints tc 
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = 'cart_items' 
                AND kcu.column_name = 'part_id'"
            );

            if (!empty($foreignKeys)) {
                foreach ($foreignKeys as $key) {
                    $table->dropForeign($key->constraint_name);
                }
            }
        });
        
        // Шаг 3: Удалить столбец part_id
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('part_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Восстановление поля part_id
        Schema::table('cart_items', function (Blueprint $table) {
            $table->unsignedBigInteger('part_id')->nullable()->after('cart_id');
        });
        
        // Копирование данных из spare_part_id обратно в part_id
        DB::statement('UPDATE cart_items SET part_id = spare_part_id');
    }
}; 