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
        
        $brands = $query->orderBy('name')->get();
        
        // Удаляем кавычки из названий
        $brands = $brands->map(function($brand) {
            if ($brand->name) {
                $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
            }
            return $brand;
        });
        
        return $brands;
    }
    
    /**
     * Получить информацию о конкретном бренде по ID
     * 
     * @param int|string $id ID бренда
     * @return \App\Models\CarBrand
     */
    public function getBrandById($id)
    {
        // Преобразуем $id в целое число, если это строка
        $id = is_string($id) ? (int)$id : $id;
        
        $brand = CarBrand::with('carModels')->findOrFail($id);
        
        // Удаляем кавычки из названия
        if ($brand->name) {
            $brand->name = preg_replace('/^"(.+)"$/', '$1', $brand->name);
        }
        
        return $brand;
    }
    
    /**
     * Получить модели для указанного бренда
     * 
     * @param int|string $brandId ID бренда
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getModelsByBrandId($brandId)
    {
        // Преобразуем $brandId в целое число, если это строка
        $brandId = is_string($brandId) ? (int)$brandId : $brandId;
        
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