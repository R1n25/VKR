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
            // Добавляем поле status_updated_at, если оно не существует
            if (!Schema::hasColumn('orders', 'status_updated_at')) {
                $table->timestamp('status_updated_at')->nullable()->after('status');
            }
            
            // Добавляем поле status_updated_by, если оно не существует
            if (!Schema::hasColumn('orders', 'status_updated_by')) {
                $table->unsignedBigInteger('status_updated_by')->nullable()->after('status_updated_at');
                // Добавляем внешний ключ на таблицу users
                $table->foreign('status_updated_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Удаляем внешний ключ, если он существует
            if (Schema::hasColumn('orders', 'status_updated_by')) {
                $table->dropForeign(['status_updated_by']);
                $table->dropColumn('status_updated_by');
            }
            
            // Удаляем поле status_updated_at, если оно существует
            if (Schema::hasColumn('orders', 'status_updated_at')) {
                $table->dropColumn('status_updated_at');
            }
        });
    }
}; 