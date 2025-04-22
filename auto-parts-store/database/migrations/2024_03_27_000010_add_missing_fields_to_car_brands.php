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
            // Добавляем недостающие поля из миграции 2025_03_24_182305_create_car_brands_table.php
            $table->string('country')->after('name');
            $table->text('description')->nullable()->after('slug');
            
            // Переименовываем поле logo в logo_url если оно существует
            if (Schema::hasColumn('car_brands', 'logo')) {
                $table->renameColumn('logo', 'logo_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_brands', function (Blueprint $table) {
            $table->dropColumn(['country', 'description']);
            
            if (Schema::hasColumn('car_brands', 'logo_url')) {
                $table->renameColumn('logo_url', 'logo');
            }
        });
    }
}; 