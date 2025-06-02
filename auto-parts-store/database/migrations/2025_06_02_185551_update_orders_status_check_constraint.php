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
        // Сначала удаляем старое ограничение CHECK
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
        
        // Теперь обновляем все старые статусы на новые
        // completed -> delivered
        DB::table('orders')->where('status', 'completed')->update(['status' => 'delivered']);
        // cancelled -> returned
        DB::table('orders')->where('status', 'cancelled')->update(['status' => 'returned']);
        // shipped -> shipping
        DB::table('orders')->where('status', 'shipped')->update(['status' => 'shipping']);
        
        // Добавляем новое ограничение CHECK с новыми статусами
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status::text IN ('pending', 'processing', 'ready_for_pickup', 'ready_for_delivery', 'shipping', 'delivered', 'returned'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем новое ограничение CHECK
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
        
        // Обновляем новые статусы на старые
        // delivered -> completed
        DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);
        // returned -> cancelled
        DB::table('orders')->where('status', 'returned')->update(['status' => 'cancelled']);
        // shipping -> shipped
        DB::table('orders')->where('status', 'shipping')->update(['status' => 'shipped']);
        // ready_for_pickup и ready_for_delivery -> processing
        DB::table('orders')->whereIn('status', ['ready_for_pickup', 'ready_for_delivery'])->update(['status' => 'processing']);
        
        // Добавляем старое ограничение CHECK
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status::text IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'))");
    }
};
