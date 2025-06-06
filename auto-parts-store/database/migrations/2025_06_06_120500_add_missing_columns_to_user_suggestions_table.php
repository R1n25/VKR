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
        Schema::table('user_suggestions', function (Blueprint $table) {
            if (!Schema::hasColumn('user_suggestions', 'analog_spare_part_id')) {
                $table->foreignId('analog_spare_part_id')->nullable()->after('spare_part_id');
            }
            
            if (!Schema::hasColumn('user_suggestions', 'car_model_id')) {
                $table->foreignId('car_model_id')->nullable()->after('analog_spare_part_id');
            }
            
            if (!Schema::hasColumn('user_suggestions', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('admin_comment');
            }
            
            if (!Schema::hasColumn('user_suggestions', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_suggestions', function (Blueprint $table) {
            $table->dropColumn([
                'analog_spare_part_id',
                'car_model_id',
                'approved_by',
                'approved_at'
            ]);
        });
    }
}; 