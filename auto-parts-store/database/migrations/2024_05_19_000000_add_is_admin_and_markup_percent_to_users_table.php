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
        Schema::table('users', function (Blueprint $table) {
            // Добавляем поле is_admin, если его нет
            if (!Schema::hasColumn('users', 'is_admin')) {
                $table->boolean('is_admin')->default(false)->after('email_verified_at');
            }
            
            // Добавляем поле markup_percent, если его нет
            if (!Schema::hasColumn('users', 'markup_percent')) {
                $table->float('markup_percent')->default(0)->after('is_admin');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Удаляем поля при откате миграции
            if (Schema::hasColumn('users', 'is_admin')) {
                $table->dropColumn('is_admin');
            }
            
            if (Schema::hasColumn('users', 'markup_percent')) {
                $table->dropColumn('markup_percent');
            }
        });
    }
}; 