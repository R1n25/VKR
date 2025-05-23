<?php

namespace App\Services;

use App\Models\CarBrand;
use App\Models\CarModel;

class BrandService
{
    /**
     * Получить все бренды автомобилей
     * 
     * @param bool $onlyPopular Получить только популярные бренды
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllBrands(bool $onlyPopular = false)
    {
        $query = CarBrand::query();
        
        if ($onlyPopular) {
            $query->where('is_popular', true);
        }
        
        return $query->orderBy('name')->get();
    }
    
    /**
     * Получить информацию о конкретном бренде по ID
     * 
     * @param int $id ID бренда
     * @return \App\Models\CarBrand
     */
    public function getBrandById(int $id)
    {
        return CarBrand::with('carModels')->findOrFail($id);
    }
    
    /**
     * Получить модели для указанного бренда
     * 
     * @param int $brandId ID бренда
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getModelsByBrandId(int $brandId)
    {
        return CarModel::where('brand_id', $brandId)
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Поиск брендов по названию
     * 
     * @param string|null $query Поисковый запрос
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function searchBrands(?string $query)
    {
        $query = $query ?? '';
        
        return CarBrand::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orderBy('name')
            ->get();
    }
} 