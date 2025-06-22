<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PartCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Models\SparePart;

class PartCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PartCategory::with('children');
        
        // Получаем только корневые категории
        if ($request->boolean('root_only', false)) {
            $query->whereNull('parent_id');
        }
        
        $categories = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:part_categories,id',
            'image' => 'nullable|image|max:2048'
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = $path;
        }

        $category = PartCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Категория успешно создана',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = PartCategory::with(['parent', 'children', 'parts'])->findOrFail($id);
        
        // Получаем доступные фильтры для этой категории
        $filters = $this->getCategoryFilters($id);
        
        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'filters' => $filters
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $category = PartCategory::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'exists:part_categories,id',
                function ($attribute, $value, $fail) use ($id) {
                    if ($value == $id) {
                        $fail('Категория не может быть родителем самой себя.');
                    }
                }
            ],
            'image' => 'nullable|image|max:2048'
        ]);
        
        if ($request->filled('name') && $category->name !== $validated['name']) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        if ($request->hasFile('image')) {
            // Удаляем старое изображение
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = $path;
        }
        
        $category->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Категория успешно обновлена',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = PartCategory::findOrFail($id);
        
        // Удаляем изображение
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        
        $category->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Категория успешно удалена'
        ]);
    }
    
    /**
     * Получить запчасти по категории с фильтрацией
     * 
     * @param Request $request
     * @param string $id ID категории
     * @return \Illuminate\Http\JsonResponse
     */
    public function filteredParts(Request $request, string $id)
    {
        try {
            // Получаем категорию
            $category = PartCategory::findOrFail($id);
            
            // Логируем информацию о запрашиваемой категории
            \Log::info('Запрос запчастей для категории', [
                'category_id' => $id,
                'category_name' => $category->name,
                'is_parent' => $category->children()->count() > 0
            ]);
            
            // Проверяем, является ли категория родительской
            $isParentCategory = $category->children()->count() > 0;
            
            // Получаем ID всех подкатегорий
            $subcategoryIds = PartCategory::where('parent_id', $id)->pluck('id')->toArray();
            
            // Логируем подкатегории
            \Log::info('Подкатегории', [
                'subcategory_ids' => $subcategoryIds,
                'count' => count($subcategoryIds)
            ]);
            
            // Всегда включаем ID текущей категории и ID всех её подкатегорий
            $categoryIds = array_merge([$id], $subcategoryIds);
            
            // Логируем итоговые ID категорий для запроса
            \Log::info('Используемые ID категорий для запроса', [
                'category_ids' => $categoryIds,
                'is_parent_category' => $isParentCategory
            ]);
            
            // Если категория родительская, но у неё нет подкатегорий, возвращаем пустой результат
            if ($isParentCategory && empty($categoryIds)) {
                \Log::warning('Родительская категория без подкатегорий', ['category_id' => $id]);
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'У этой категории нет подкатегорий с запчастями'
                ]);
            }
            
            // Получаем параметры фильтрации
            $filters = $request->all();
            
            // Количество элементов на странице
            $perPage = $request->input('per_page', 12);
            
            // Создаем запрос к базе данных
            $query = SparePart::whereIn('category_id', $categoryIds);
        
            // Проверяем, есть ли запчасти в выбранных категориях
            $totalParts = $query->count();
            \Log::info('Количество найденных запчастей', ['total' => $totalParts]);
            
            if ($totalParts === 0) {
                \Log::warning('Запчасти не найдены для категорий', ['category_ids' => $categoryIds]);
                return response()->json([
                    'success' => false,
                    'message' => 'Не удалось загрузить запчасти для выбранной категории',
                    'error' => 'В данной категории нет запчастей',
                    'data' => []
                ]);
            }
        
            // Применяем фильтры
            if (!empty($filters['brand'])) {
                $query->where('manufacturer', $filters['brand']);
            }
            
            if (!empty($filters['price_min'])) {
                $query->where('price', '>=', $filters['price_min']);
            }
            
            if (!empty($filters['price_max'])) {
                $query->where('price', '<=', $filters['price_max']);
            }
            
            if (!empty($filters['in_stock']) && $filters['in_stock'] === 'true') {
                $query->where('stock_quantity', '>', 0);
            }
            
            // Фильтрация по двигателю
            if (!empty($filters['engine_id'])) {
                $engineId = $filters['engine_id'];
                \Log::info('Применяем фильтр по двигателю', ['engine_id' => $engineId]);
                
                // Подзапрос для получения ID запчастей, совместимых с двигателем
                $query->whereIn('id', function($subquery) use ($engineId) {
                    $subquery->select('spare_part_id')
                        ->from('car_engine_spare_part')
                        ->where('car_engine_id', $engineId);
                });
            }
            
            if (!empty($filters['search'])) {
                $searchTerm = $filters['search'];
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('part_number', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
        
            // Сортировка
            if (!empty($filters['sort'])) {
                $sortField = 'name';
                $sortDirection = 'asc';
                
                switch ($filters['sort']) {
                    case 'price_asc':
                        $sortField = 'price';
                        $sortDirection = 'asc';
                        break;
                    case 'price_desc':
                        $sortField = 'price';
                        $sortDirection = 'desc';
                        break;
                    case 'name_asc':
                        $sortField = 'name';
                        $sortDirection = 'asc';
                        break;
                    case 'name_desc':
                        $sortField = 'name';
                        $sortDirection = 'desc';
                        break;
                }
                
                $query->orderBy($sortField, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
        
            // Получаем результаты с пагинацией
            $parts = $query->paginate($perPage);
            
            \Log::info('Запчасти успешно получены', [
                'count' => $parts->count(),
                'current_page' => $parts->currentPage(),
                'last_page' => $parts->lastPage()
            ]);
        
            // Создаем ссылки для пагинации в формате, который ожидает компонент Pagination
            $parts->links = $this->generatePaginationLinks($parts, $request);
        
            return response()->json([
                'success' => true,
                'data' => $parts,
                'debug' => [
                    'per_page' => $perPage,
                    'current_page' => $parts->currentPage(),
                    'last_page' => $parts->lastPage(),
                    'should_show_pagination' => $parts->lastPage() > 1,
                    'pagination_links' => $parts->links,
                    'category_ids' => $categoryIds,
                    'is_parent_category' => $isParentCategory,
                    'total_parts' => $totalParts
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Ошибка при получении запчастей', [
                'category_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Не удалось загрузить запчасти для выбранной категории',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    
    /**
     * Получить доступные фильтры для категории
     * 
     * @param string $categoryId ID категории
     * @return array
     */
    protected function getCategoryFilters(string $categoryId)
    {
        // Получаем категорию и её подкатегории
        $category = PartCategory::findOrFail($categoryId);
        $subcategoryIds = PartCategory::where('parent_id', $categoryId)->pluck('id')->toArray();
        $categoryIds = array_merge([$categoryId], $subcategoryIds);
        
        // Получаем минимальную и максимальную цену
        $priceRange = SparePart::whereIn('category_id', $categoryIds)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();
        
        // Получаем доступные бренды
        $brands = SparePart::whereIn('category_id', $categoryIds)
            ->join('car_brands', 'spare_parts.brand_id', '=', 'car_brands.id')
            ->select('car_brands.name')
            ->distinct()
            ->orderBy('car_brands.name')
            ->pluck('name')
            ->toArray();
        
        return [
            'price_range' => [
                'min' => $priceRange->min_price ?? 0,
                'max' => $priceRange->max_price ?? 0
            ],
            'brands' => $brands
        ];
    }
    
    /**
     * Генерирует ссылки для пагинации в формате, ожидаемом компонентом Pagination
     * 
     * @param \Illuminate\Pagination\LengthAwarePaginator $paginator
     * @param Request $request
     * @return array
     */
    protected function generatePaginationLinks($paginator, $request)
    {
        $links = [];
        $lastPage = $paginator->lastPage();
        $currentPage = $paginator->currentPage();
        
        // Кнопка "Предыдущая"
        $links[] = [
            'url' => $currentPage > 1 ? $this->getPageUrl($currentPage - 1, $request) : null,
            'label' => '&laquo; Предыдущая',
            'active' => false
        ];
        
        // Номера страниц
        $window = 2; // Количество страниц до и после текущей
        
        // Начальная страница
        $startPage = max(1, $currentPage - $window);
        $endPage = min($lastPage, $currentPage + $window);
        
        // Добавляем кнопку первой страницы, если текущая страница слишком далеко
        if ($startPage > 1) {
            $links[] = [
                'url' => $this->getPageUrl(1, $request),
                'label' => '1',
                'active' => false
            ];
            
            // Добавляем многоточие, если нужно
            if ($startPage > 2) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false
                ];
            }
        }
        
        // Номера страниц
        for ($page = $startPage; $page <= $endPage; $page++) {
            $links[] = [
                'url' => $this->getPageUrl($page, $request),
                'label' => (string) $page,
                'active' => $page == $currentPage
            ];
        }
        
        // Добавляем многоточие и последнюю страницу, если текущая страница далеко от конца
        if ($endPage < $lastPage) {
            if ($endPage < $lastPage - 1) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false
                ];
            }
            
            $links[] = [
                'url' => $this->getPageUrl($lastPage, $request),
                'label' => (string) $lastPage,
                'active' => false
            ];
        }
        
        // Кнопка "Следующая"
        $links[] = [
            'url' => $currentPage < $lastPage ? $this->getPageUrl($currentPage + 1, $request) : null,
            'label' => 'Следующая &raquo;',
            'active' => false
        ];
        
        return $links;
    }
    
    /**
     * Формирует URL для страницы пагинации
     * 
     * @param int $page
     * @param Request $request
     * @return string
     */
    protected function getPageUrl($page, $request)
    {
        $params = $request->all();
        $params['page'] = $page;
        return url()->current() . '?' . http_build_query($params);
    }

    /**
     * Получить запчасти по категории
     * 
     * @param Request $request
     * @param int $id ID категории
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPartsByCategory(Request $request, $id)
    {
        try {
            // Проверяем существование категории
            $category = PartCategory::find($id);
            if (!$category) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Категория не найдена'
                ], 404);
            }
            
            // Получаем ID всех подкатегорий
            $subcategoryIds = PartCategory::where('parent_id', $id)->pluck('id')->toArray();
            
            // Добавляем ID текущей категории
            $categoryIds = array_merge([$id], $subcategoryIds);
            
            // Получаем параметры фильтрации и сортировки
            $filters = $request->all();
            
            // Количество элементов на странице
            $perPage = $request->input('per_page', 12);
            
            // Создаем запрос к базе данных
            $query = SparePart::whereIn('category_id', $categoryIds);
            
            // Применяем фильтры
            if (!empty($filters['brand'])) {
                $query->where('manufacturer', $filters['brand']);
            }
            
            if (!empty($filters['price_min'])) {
                $query->where('price', '>=', $filters['price_min']);
            }
            
            if (!empty($filters['price_max'])) {
                $query->where('price', '<=', $filters['price_max']);
            }
            
            if (!empty($filters['in_stock']) && $filters['in_stock'] === 'true') {
                $query->where('stock_quantity', '>', 0);
            }
            
            if (!empty($filters['search'])) {
                $searchTerm = $filters['search'];
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('part_number', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
            
            // Применяем сортировку
            if (!empty($filters['sort'])) {
                $sortField = 'name';
                $sortDirection = 'asc';
                
                switch ($filters['sort']) {
                    case 'price_asc':
                        $sortField = 'price';
                        $sortDirection = 'asc';
                        break;
                    case 'price_desc':
                        $sortField = 'price';
                        $sortDirection = 'desc';
                        break;
                    case 'name_asc':
                        $sortField = 'name';
                        $sortDirection = 'asc';
                        break;
                    case 'name_desc':
                        $sortField = 'name';
                        $sortDirection = 'desc';
                        break;
                }
                
                $query->orderBy($sortField, $sortDirection);
            } else {
                $query->orderBy('name', 'asc');
            }
            
            // Получаем результаты с пагинацией
            $parts = $query->paginate($perPage);
            
            // Создаем ссылки для пагинации в формате, который ожидает компонент Pagination
            $parts->links = $this->generatePaginationLinks($parts, $request);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'parts' => $parts->items(),
                    'pagination' => [
                        'total' => $parts->total(),
                        'per_page' => $parts->perPage(),
                        'current_page' => $parts->currentPage(),
                        'last_page' => $parts->lastPage(),
                        'from' => $parts->firstItem(),
                        'to' => $parts->lastItem(),
                        'links' => $parts->links,
                    ],
                    'category' => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'description' => $category->description,
                    ],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ошибка при получении запчастей: ' . $e->getMessage(),
            ], 500);
        }
    }
}
