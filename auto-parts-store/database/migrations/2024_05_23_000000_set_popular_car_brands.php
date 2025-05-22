<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CarBrand;

return new class extends Migration
{
    /**
     * Популярные марки автомобилей
     */
    protected $popularBrands = [
        'Toyota',
        'Honda',
        'Volkswagen',
        'BMW',
        'Mercedes-Benz',
        'Audi',
        'Ford',
        'Nissan',
        'Hyundai',
        'Kia'
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Проверяем существование столбца is_popular
        if (Schema::hasColumn('car_brands', 'is_popular')) {
            // Сначала сбрасываем все популярные марки
            DB::table('car_brands')->update(['is_popular' => false]);
            
            // Устанавливаем популярные марки
            foreach ($this->popularBrands as $brandName) {
                DB::table('car_brands')
                    ->where('name', $brandName)
                    ->update(['is_popular' => true]);
                
                echo "Марка {$brandName} установлена как популярная\n";
            }
        } else {
            echo "Столбец is_popular не найден в таблице car_brands\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Сбрасываем все популярные марки
        if (Schema::hasColumn('car_brands', 'is_popular')) {
            DB::table('car_brands')->update(['is_popular' => false]);
        }
    }
}; 