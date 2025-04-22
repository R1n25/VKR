<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CategoryService
{
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
        $query = DB::table('parts')
            ->whereIn('category_id', $categoryIds)
            ->join('car_brands', 'parts.brand_id', '=', 'car_brands.id')
            ->join('car_models', 'parts.model_id', '=', 'car_models.id')
            ->select('parts.*', 'car_brands.name as brand_name', 'car_models.name as model_name');
        
        // Применяем фильтры
        if (!empty($filters['price_min'])) {
            $query->where('parts.price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('parts.price', '<=', $filters['price_max']);
        }
        
        if (!empty($filters['brands'])) {
            $query->whereIn('car_brands.name', $filters['brands']);
        }
        
        if (!empty($filters['in_stock']) && $filters['in_stock']) {
            $query->where('parts.stock', '>', 0);
        }
        
        // Применяем сортировку
        if (!empty($filters['sort'])) {
            $sortField = 'parts.name';
            $sortDirection = 'asc';
            
            switch ($filters['sort']) {
                case 'price_asc':
                    $sortField = 'parts.price';
                    $sortDirection = 'asc';
                    break;
                case 'price_desc':
                    $sortField = 'parts.price';
                    $sortDirection = 'desc';
                    break;
                case 'name_asc':
                    $sortField = 'parts.name';
                    $sortDirection = 'asc';
                    break;
                case 'name_desc':
                    $sortField = 'parts.name';
                    $sortDirection = 'desc';
                    break;
            }
            
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('parts.name', 'asc');
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
     * @param string $query Поисковый запрос
     * @return \Illuminate\Support\Collection
     */
    public function searchCategories(string $query)
    {
        return DB::table('part_categories')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orderBy('name')
            ->get();
    }
} 