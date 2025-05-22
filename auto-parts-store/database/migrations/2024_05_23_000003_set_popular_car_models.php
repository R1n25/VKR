<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\CarBrand;
use App\Models\CarModel;

return new class extends Migration
{
    /**
     * Популярные модели автомобилей по маркам
     */
    protected $popularModels = [
        'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'],
        'Honda' => ['Civic', 'Accord', 'CR-V'],
        'Volkswagen' => ['Golf', 'Passat', 'Tiguan', 'Polo'],
        'BMW' => ['3 Series', '5 Series', 'X5', 'X3'],
        'Mercedes-Benz' => ['C-Class', 'E-Class', 'S-Class', 'GLE'],
        'Audi' => ['A4', 'A6', 'Q5', 'Q7'],
        'Ford' => ['Focus', 'Mustang', 'F-150', 'Explorer'],
        'Nissan' => ['Qashqai', 'X-Trail', 'Juke', 'Leaf'],
        'Hyundai' => ['Solaris', 'Tucson', 'Santa Fe', 'Creta'],
        'Kia' => ['Rio', 'Sportage', 'Optima', 'Sorento']
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Проверяем существование столбца is_popular
        if (Schema::hasColumn('car_models', 'is_popular')) {
            // Сначала сбрасываем все популярные модели
            DB::table('car_models')->update(['is_popular' => false]);
            
            // Устанавливаем популярные модели
            foreach ($this->popularModels as $brandName => $models) {
                // Получаем ID бренда
                $brand = CarBrand::where('name', $brandName)->first();
                
                if ($brand) {
                    foreach ($models as $modelName) {
                        $updated = DB::table('car_models')
                            ->where('brand_id', $brand->id)
                            ->where('name', $modelName)
                            ->update(['is_popular' => true]);
                        
                        if ($updated) {
                            echo "Модель {$brandName} {$modelName} установлена как популярная\n";
                        }
                    }
                }
            }
        } else {
            echo "Столбец is_popular не найден в таблице car_models\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Сбрасываем все популярные модели
        if (Schema::hasColumn('car_models', 'is_popular')) {
            DB::table('car_models')->update(['is_popular' => false]);
        }
    }
}; 