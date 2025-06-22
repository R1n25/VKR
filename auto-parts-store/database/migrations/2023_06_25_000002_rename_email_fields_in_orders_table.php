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
            // Переименовываем поля для соответствия контроллеру
            $table->renameColumn('customer_email', 'email');
            $table->renameColumn('customer_phone', 'phone');
            $table->renameColumn('shipping_address', 'address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Возвращаем исходные имена полей
            $table->renameColumn('email', 'customer_email');
            $table->renameColumn('phone', 'customer_phone');
            $table->renameColumn('address', 'shipping_address');
        });
    }
}; 