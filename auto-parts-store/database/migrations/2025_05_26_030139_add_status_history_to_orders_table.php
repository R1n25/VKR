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
            // Добавляем новое поле notes_json вместо изменения существующего notes
            $table->json('notes_json')->nullable()->after('notes');
            
            // Добавляем новые поля для истории статусов
            $table->json('status_history')->nullable()->after('notes_json');
            $table->timestamp('status_updated_at')->nullable()->after('status_history');
            $table->unsignedBigInteger('status_updated_by')->nullable()->after('status_updated_at');
            
            // Добавляем внешний ключ
            $table->foreign('status_updated_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Удаляем внешний ключ
            $table->dropForeign(['status_updated_by']);
            
            // Удаляем добавленные поля
            $table->dropColumn(['notes_json', 'status_history', 'status_updated_at', 'status_updated_by']);
        });
    }
};
