<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class PartService
{
    /**
     * Получить популярные запчасти для отображения на главной странице
     * 
     * @param int $limit Количество запчастей для отображения
     * @return \Illuminate\Support\Collection
     */
    public function getPopularParts(int $limit = 8)
    {
        return DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.stock', '>', 0)
            ->where('parts.is_popular', true)
            ->orderBy('parts.price', 'asc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Получить информацию о конкретной запчасти по ID
     * 
     * @param int $id ID запчасти
     * @return object
     */
    public function getPartById(int $id)
    {
        return DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.id', $id)
            ->first();
    }
    
    /**
     * Получить похожие запчасти для указанной запчасти
     * 
     * @param int $partId ID запчасти
     * @param int $limit Количество похожих запчастей
     * @return \Illuminate\Support\Collection
     */
    public function getSimilarParts(int $partId, int $limit = 4)
    {
        // Получаем информацию о текущей запчасти
        $part = $this->getPartById($partId);
        
        if (!$part) {
            return collect([]);
        }
        
        // Находим запчасти той же категории и для той же модели
        return DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.id', '!=', $partId)
            ->where('parts.category_id', $part->category_id)
            ->where('parts.model_id', $part->model_id)
            ->where('parts.stock', '>', 0)
            ->orderBy(DB::raw('RAND()'))
            ->limit($limit)
            ->get();
    }
    
    /**
     * Поиск запчастей по названию или артикулу
     * 
     * @param string $query Поисковый запрос
     * @return \Illuminate\Support\Collection
     */
    public function searchParts(string $query)
    {
        return DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.name', 'like', "%{$query}%")
            ->orWhere('parts.sku', 'like', "%{$query}%")
            ->orWhere('parts.description', 'like', "%{$query}%")
            ->orderBy('parts.name')
            ->get();
    }
    
    /**
     * Получить запчасти для указанной модели автомобиля
     * 
     * @param int $modelId ID модели
     * @param array $filters Фильтры
     * @return \Illuminate\Support\Collection
     */
    public function getPartsByModel(int $modelId, array $filters = [])
    {
        $query = DB::table('parts')
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->join('part_categories', 'parts.category_id', '=', 'part_categories.id')
            ->select(
                'parts.*', 
                'car_brands.name as brand_name', 
                'car_models.name as model_name',
                'part_categories.name as category_name'
            )
            ->where('parts.model_id', $modelId);
        
        // Применяем фильтры
        if (!empty($filters['category_id'])) {
            $query->where('parts.category_id', $filters['category_id']);
        }
        
        if (!empty($filters['price_min'])) {
            $query->where('parts.price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('parts.price', '<=', $filters['price_max']);
        }
        
        if (!empty($filters['in_stock']) && $filters['in_stock']) {
            $query->where('parts.stock', '>', 0);
        }
        
        // Сортировка
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'price_asc':
                    $query->orderBy('parts.price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('parts.price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('parts.name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('parts.name', 'desc');
                    break;
                default:
                    $query->orderBy('parts.name', 'asc');
            }
        } else {
            $query->orderBy('parts.name', 'asc');
        }
        
        return $query->get();
    }
    
    /**
     * Получить запчасти по VIN-коду
     * 
     * @param string $vin VIN-код автомобиля
     * @return \Illuminate\Support\Collection
     */
    public function getPartsByVin(string $vin)
    {
        // Здесь должна быть логика работы с VIN-кодом
        // В реальном проекте здесь может быть обращение к внешнему API
        // или к базе данных соответствий VIN-кодов и запчастей
        
        // Находим бренд и модель по VIN
        $vinInfo = $this->decodeVin($vin);
        
        if (!$vinInfo) {
            return collect([]);
        }
        
        // Получаем ID модели
        $model = DB::table('car_models')
            ->join('car_brands', 'car_models.brand_id', '=', 'car_brands.id')
            ->where('car_brands.name', $vinInfo['brand'])
            ->where('car_models.name', $vinInfo['model'])
            ->select('car_models.id')
            ->first();
        
        if (!$model) {
            return collect([]);
        }
        
        // Получаем запчасти для данной модели
        return $this->getPartsByModel($model->id);
    }
    
    /**
     * Декодирование VIN-кода (пример упрощенной реализации)
     * 
     * @param string $vin VIN-код автомобиля
     * @return array|null Информация о автомобиле или null
     */
    private function decodeVin(string $vin)
    {
        // Пример упрощенной реализации декодирования VIN
        // В реальном проекте здесь может быть сложная логика или обращение к API
        
        // Проверяем формат VIN
        if (strlen($vin) !== 17) {
            return null;
        }
        
        // Определяем страну производителя по первому символу
        $countryCode = substr($vin, 0, 1);
        
        // Упрощенная логика определения бренда по первым символам
        if (in_array($countryCode, ['1', '4', '5'])) {
            // США
            if (substr($vin, 1, 2) === 'G1') {
                return ['brand' => 'Chevrolet', 'model' => 'Cruze'];
            } elseif (substr($vin, 1, 2) === 'G2') {
                return ['brand' => 'Pontiac', 'model' => 'GTO'];
            }
        } elseif ($countryCode === 'J') {
            // Япония
            if (substr($vin, 1, 2) === 'T1') {
                return ['brand' => 'Toyota', 'model' => 'Corolla'];
            } elseif (substr($vin, 1, 2) === 'HG') {
                return ['brand' => 'Honda', 'model' => 'Accord'];
            }
        } elseif (in_array($countryCode, ['W', 'X'])) {
            // Германия
            if (substr($vin, 1, 2) === 'DD') {
                return ['brand' => 'Mercedes-Benz', 'model' => 'C-Class'];
            } elseif (substr($vin, 1, 2) === 'BA') {
                return ['brand' => 'BMW', 'model' => '3 Series'];
            }
        }
        
        return null;
    }
} 