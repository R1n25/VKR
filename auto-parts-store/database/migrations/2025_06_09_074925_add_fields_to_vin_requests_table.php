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
        Schema::table('vin_requests', function (Blueprint $table) {
            // Добавляем недостающие поля для VIN-запросов
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('parts_description')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('processed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vin_requests', function (Blueprint $table) {
            // Удаляем добавленные поля при откате миграции
            $table->dropColumn([
                'name',
                'email',
                'phone',
                'parts_description',
                'admin_notes',
                'processed_at'
            ]);
        });
    }
};
