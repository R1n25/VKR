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
        Schema::create('user_suggestions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Пользователь, который предложил (может быть гость)
            $table->string('suggestion_type'); // Тип предложения: 'analog' или 'compatibility'
            
            // Для аналогов
            $table->unsignedBigInteger('spare_part_id')->nullable(); // Основная запчасть
            $table->unsignedBigInteger('analog_spare_part_id')->nullable(); // Аналог запчасти
            
            // Для применимости
            $table->unsignedBigInteger('car_model_id')->nullable(); // Модель автомобиля
            
            $table->text('comment')->nullable(); // Комментарий пользователя
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_comment')->nullable(); // Комментарий администратора
            $table->unsignedBigInteger('approved_by')->nullable(); // Кто из администраторов одобрил
            $table->timestamp('approved_at')->nullable(); // Когда одобрено
            $table->timestamps();
            
            // Внешние ключи
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('spare_part_id')->references('id')->on('spare_parts')->onDelete('cascade');
            $table->foreign('analog_spare_part_id')->references('id')->on('spare_parts')->onDelete('cascade');
            $table->foreign('car_model_id')->references('id')->on('car_models')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_suggestions');
    }
}; 