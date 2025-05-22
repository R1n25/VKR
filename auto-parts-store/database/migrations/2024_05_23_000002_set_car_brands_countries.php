<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Страны для марок автомобилей
     */
    protected $brandCountries = [
        'Toyota' => 'Япония',
        'Honda' => 'Япония',
        'Volkswagen' => 'Германия',
        'BMW' => 'Германия',
        'Mercedes' => 'Германия',
        'Audi' => 'Германия',
        'Ford' => 'США',
        'Chevrolet' => 'США',
        'Nissan' => 'Япония',
        'Hyundai' => 'Южная Корея',
        'Kia' => 'Южная Корея',
        'Mazda' => 'Япония',
        'Subaru' => 'Япония',
        'Mitsubishi' => 'Япония',
        'Lexus' => 'Япония',
        'Porsche' => 'Германия',
        'Volvo' => 'Швеция',
        'Jaguar' => 'Великобритания',
        'Land Rover' => 'Великобритания',
        'Renault' => 'Франция',
        'Peugeot' => 'Франция',
        'Citroen' => 'Франция',
        'Fiat' => 'Италия',
        'Alfa Romeo' => 'Италия',
        'Ferrari' => 'Италия',
        'Lamborghini' => 'Италия',
        'Maserati' => 'Италия',
        'Skoda' => 'Чехия',
        'SEAT' => 'Испания',
        'Suzuki' => 'Япония',
        'Acura' => 'Япония',
        'Infiniti' => 'Япония',
        'Cadillac' => 'США',
        'Chrysler' => 'США',
        'Dodge' => 'США',
        'Jeep' => 'США',
        'Tesla' => 'США',
        'Buick' => 'США',
        'GMC' => 'США',
        'Lincoln' => 'США',
        'Opel' => 'Германия',
        'Mini' => 'Великобритания',
        'Bentley' => 'Великобритания',
        'Rolls-Royce' => 'Великобритания',
        'Aston Martin' => 'Великобритания',
        'Bugatti' => 'Франция',
        'Dacia' => 'Румыния',
        'Lada' => 'Россия',
        'UAZ' => 'Россия',
        'GAZ' => 'Россия',
        'Geely' => 'Китай',
        'Great Wall' => 'Китай',
        'Chery' => 'Китай',
        'BYD' => 'Китай',
        'Haval' => 'Китай',
        'Daewoo' => 'Южная Корея',
        'SsangYong' => 'Южная Корея',
        'Genesis' => 'Южная Корея'
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Устанавливаем страны для марок
        foreach ($this->brandCountries as $brandName => $country) {
            $updated = DB::table('car_brands')
                ->where('name', $brandName)
                ->update(['country' => $country]);
            
            if ($updated) {
                echo "Страна для марки {$brandName} установлена как {$country}\n";
            }
        }
        
        // Для всех остальных марок устанавливаем "Неизвестно"
        $updated = DB::table('car_brands')
            ->whereIn('country', ['Unknown', ''])
            ->update(['country' => 'Неизвестно']);
        
        if ($updated) {
            echo "Для {$updated} марок без указанной страны установлено значение 'Неизвестно'\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // В случае отката ничего не делаем
    }
}; 