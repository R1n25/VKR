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
        if (!Schema::hasColumn('car_brands', 'is_popular')) {
            Schema::table('car_brands', function (Blueprint $table) {
                $table->boolean('is_popular')->default(false)->after('description');
            });
            
            echo "Столбец is_popular добавлен в таблицу car_brands\n";
        } else {
            echo "Столбец is_popular уже существует в таблице car_brands\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем столбец при откате, так как он может быть создан другой миграцией
    }
}; 