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
            if (!Schema::hasColumn('orders', 'user_id')) {
                $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            }
            if (!Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->unique();
            }
            if (!Schema::hasColumn('orders', 'total_price')) {
                $table->decimal('total_price', 10, 2);
            }
            if (!Schema::hasColumn('orders', 'status')) {
                $table->string('status')->default('pending');
            }
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->default('cash');
            }
            if (!Schema::hasColumn('orders', 'shipping_address')) {
                $table->string('shipping_address')->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_city')) {
                $table->string('shipping_city')->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_zip')) {
                $table->string('shipping_zip')->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_phone')) {
                $table->string('shipping_phone')->nullable();
            }
            if (!Schema::hasColumn('orders', 'shipping_name')) {
                $table->string('shipping_name')->nullable();
            }
            if (!Schema::hasColumn('orders', 'notes')) {
                $table->text('notes')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем таблицу, так как она была создана ранее
    }
};
