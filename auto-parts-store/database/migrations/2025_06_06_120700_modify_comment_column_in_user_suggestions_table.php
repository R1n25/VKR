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
        // В PostgreSQL нельзя просто изменить ограничение NOT NULL через Schema Builder
        // Поэтому используем прямой SQL-запрос
        DB::statement('ALTER TABLE user_suggestions ALTER COLUMN comment DROP NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE user_suggestions ALTER COLUMN comment SET NOT NULL');
    }
}; 