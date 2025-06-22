<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CategoryService
{
    /**
     * Получить все категории запчастей
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getAllCategories()
    {
        return DB::table('part_categories')
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Получить все корневые категории запчастей
     * 
     * @return \Illuminate\Support\Collection
     */
    public function getRootCategories()
    {
        return DB::table('part_categories')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Получить информацию о конкретной категории по ID
     * 
     * @param int $id ID категории
     * @return object
     */
    public function getCategoryById(int $id)
    {
        return DB::table('part_categories')->find($id);
    }
    
    /**
     * Получить подкатегории для указанной категории
     * 
     * @param int $categoryId ID категории
     * @return \Illuminate\Support\Collection
     */
    public function getSubcategories(int $categoryId)
    {
        return DB::table('part_categories')
            ->where('parent_id', $categoryId)
            ->orderBy('name')
            ->get();
    }
    
    /**
     * Построить древовидную структуру категорий
     * 
     * @return array
     */
    public function getCategoryTree()
    {
        $allCategories = DB::table('part_categories')->get();
        
        // Создаем мапу категорий по ID для быстрого доступа
        $categoriesMap = [];
        foreach ($allCategories as $category) {
            $categoriesMap[$category->id] = (array) $category;
            $categoriesMap[$category->id]['children'] = [];
        }
        
        // Выстраиваем дерево категорий
        $rootCategories = [];
        foreach ($allCategories as $category) {
            if ($category->parent_id) {
                // Это дочерняя категория
                if (isset($categoriesMap[$category->parent_id])) {
                    $categoriesMap[$category->parent_id]['children'][] = &$categoriesMap[$category->id];
                }
            } else {
                // Это корневая категория
                $rootCategories[] = &$categoriesMap[$category->id];
            }
        }
        
        return $rootCategories;
    }
    
    /**
     * Получить запчасти для указанной категории и её подкатегорий
     * 
     * @param int $categoryId ID категории
     * @param array $filters Фильтры для запчастей
     * @return array Массив с категорией и запчастями
     */
    public function getCategoryWithParts(int $categoryId, array $filters = [])
    {
        $category = $this->getCategoryById($categoryId);
        
        if (!$category) {
            return [
                'category' => null,
                'parts' => []
            ];
        }
        
        // Получаем ID всех подкатегорий
        $subcategoryIds = DB::table('part_categories')
            ->where('parent_id', $categoryId)
            ->pluck('id')
            ->toArray();
        
        // Добавляем ID текущей категории
        $categoryIds = array_merge([$categoryId], $subcategoryIds);
        
        // Формируем запрос
        $query = DB::table('spare_parts')
            ->whereIn('category_id', $categoryIds)
            ->join('car_brands', 'spare_parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'spare_parts.model_id', '=', 'car_models.id')
            ->select('spare_parts.*', 'car_brands.name as brand_name', 'car_models.name as model_name');
        
        // Применяем фильтры
        if (!empty($filters['price_min'])) {
            $query->where('spare_parts.price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('spare_parts.price', '<=', $filters['price_max']);
        }
        
        if (!empty($filters['brands'])) {
            $query->whereIn('car_brands.name', $filters['brands']);
        }
        
        if (!empty($filters['in_stock']) && $filters['in_stock']) {
            $query->where('spare_parts.stock_quantity', '>', 0);
        }
        
        // Фильтр по модели автомобиля
        if (!empty($filters['model_id'])) {
            $query->where('spare_parts.model_id', $filters['model_id']);
        }
        
        // Фильтр по бренду автомобиля
        if (!empty($filters['brand_id'])) {
            $query->where('spare_parts.brand_id', $filters['brand_id']);
        }
        
        // Фильтр по двигателю
        if (!empty($filters['engine_id'])) {
            // Присоединяем таблицу с двигателями
            $query->join('car_engines', function ($join) use ($filters) {
                $join->on('car_engines.model_id', '=', 'spare_parts.model_id')
                    ->where('car_engines.id', '=', $filters['engine_id']);
            });
            
            // Дополнительно можно добавить условия для фильтрации по параметрам двигателя
            // Например, фильтр по объему двигателя
            if (!empty($filters['engine_volume'])) {
                $query->where('car_engines.volume', $filters['engine_volume']);
            }
            
            // Фильтр по типу двигателя
            if (!empty($filters['engine_type'])) {
                $query->where('car_engines.type', $filters['engine_type']);
            }
        }
        
        // Применяем сортировку
        if (!empty($filters['sort'])) {
            $sortField = 'spare_parts.name';
            $sortDirection = 'asc';
            
            switch ($filters['sort']) {
                case 'price_asc':
                    $sortField = 'spare_parts.price';
                    $sortDirection = 'asc';
                    break;
                case 'price_desc':
                    $sortField = 'spare_parts.price';
                    $sortDirection = 'desc';
                    break;
                case 'name_asc':
                    $sortField = 'spare_parts.name';
                    $sortDirection = 'asc';
                    break;
                case 'name_desc':
                    $sortField = 'spare_parts.name';
                    $sortDirection = 'desc';
                    break;
            }
            
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('spare_parts.name', 'asc');
        }
        
        $parts = $query->get();
        
        return [
            'category' => $category,
            'parts' => $parts
        ];
    }
    
    /**
     * Поиск категорий по названию
     * 
     * @param string|null $query Поисковый запрос
     * @return \Illuminate\Support\Collection
     */
    public function searchCategories(?string $query)
    {
        $query = $query ?? '';
        
        return DB::table('part_categories')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orderBy('name')
            ->get();
    }
} 