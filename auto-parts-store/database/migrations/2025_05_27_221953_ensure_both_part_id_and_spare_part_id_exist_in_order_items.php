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
        // Шаг 1: Логируем информацию о структуре таблицы
        $columns = DB::select("
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'order_items'
        ");
        
        $columnsList = array_map(function($col) {
            return $col->column_name . ' (' . $col->data_type . ')';
        }, $columns);
        
        \Log::info('Структура таблицы order_items:', ['columns' => $columnsList]);
        
        // Шаг 2: Добавляем поле spare_part_id, если оно не существует
        if (!Schema::hasColumn('order_items', 'spare_part_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('spare_part_id')->nullable()->after('order_id');
            });
            \Log::info('Добавлено поле spare_part_id в таблицу order_items');
        } else {
            \Log::info('Поле spare_part_id уже существует в таблице order_items');
        }
        
        // Шаг 3: Проверяем и добавляем поле part_id, если оно не существует
        if (!Schema::hasColumn('order_items', 'part_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->unsignedBigInteger('part_id')->nullable()->after('spare_part_id');
            });
            \Log::info('Добавлено поле part_id в таблицу order_items');
        } else {
            \Log::info('Поле part_id уже существует в таблице order_items');
        }
        
        // Шаг 4: Синхронизируем данные между полями (если оба существуют)
        if (Schema::hasColumn('order_items', 'spare_part_id') && Schema::hasColumn('order_items', 'part_id')) {
            // Копируем данные из spare_part_id в part_id, если part_id пусто
            DB::statement('UPDATE order_items SET part_id = spare_part_id WHERE part_id IS NULL AND spare_part_id IS NOT NULL');
            
            // Копируем данные из part_id в spare_part_id, если spare_part_id пусто
            DB::statement('UPDATE order_items SET spare_part_id = part_id WHERE spare_part_id IS NULL AND part_id IS NOT NULL');
            
            \Log::info('Данные синхронизированы между part_id и spare_part_id');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Мы не будем удалять поля в down-миграции для безопасности
    }
};
