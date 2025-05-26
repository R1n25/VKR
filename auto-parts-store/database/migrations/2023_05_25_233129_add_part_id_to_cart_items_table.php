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
        Schema::table('cart_items', function (Blueprint $table) {
            $table->unsignedBigInteger('part_id')->nullable()->after('spare_part_id');
            $table->foreign('part_id')->references('id')->on('parts')->onDelete('cascade');
            
            // Делаем spare_part_id допускающим null
            $table->unsignedBigInteger('spare_part_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['part_id']);
            $table->dropColumn('part_id');
            
            // Возвращаем spare_part_id в состояние not null
            $table->unsignedBigInteger('spare_part_id')->nullable(false)->change();
        });
    }
}; 