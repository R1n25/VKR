<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\PartsService;
use App\Services\BrandService;
use App\Services\CategoryService;
use Illuminate\Support\Facades\Log;

class PartsController extends Controller
{
    protected $partsService;
    protected $brandService;
    protected $categoryService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        PartsService $partsService,
        BrandService $brandService,
        CategoryService $categoryService
    ) {
        $this->partsService = $partsService;
        $this->brandService = $brandService;
        $this->categoryService = $categoryService;
    }

    /**
     * Отображение информации о запчасти
     */
    public function show($id)
    {
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Получаем информацию о запчасти с учетом роли пользователя
        $part = $this->partsService->getPartById($id, $isAdmin);
        
        if (!$part) {
            abort(404);
        }
        
        // Добавляем расширенные логи для отладки
        Log::info('Детальная информация о запчасти до преобразования: ', [
            'id' => $part->id,
            'name' => $part->name,
            'price' => $part->price,
            'original_price' => $part->original_price ?? null,
            'markup_price' => $part->markup_price ?? null,
            'markup_percent' => $part->markup_percent ?? null,
            'attributes' => $part->getAttributes(),
            'is_admin' => $isAdmin,
        ]);
        
        // Преобразуем объект модели в массив для гарантии правильной передачи
        $partData = [
            'id' => $part->id,
            'name' => $part->name,
            'slug' => $part->slug,
            'description' => $part->description,
            'part_number' => $part->part_number,
            'price' => number_format((float)$part->price, 2, '.', ''),
            'stock_quantity' => $part->stock_quantity,
            'manufacturer' => $part->manufacturer,
            'category' => $part->category,
            'image_url' => $part->image_url,
            'is_available' => $part->is_available,
            'created_at' => $part->created_at,
            'updated_at' => $part->updated_at,
        ];
        
        // Добавляем поля для администратора, если они есть
        if ($isAdmin) {
            $partData['original_price'] = number_format((float)($part->original_price ?? $part->price), 2, '.', '');
            $partData['markup_price'] = number_format((float)($part->markup_price ?? $part->price), 2, '.', '');
            $partData['markup_percent'] = $part->markup_percent ?? 0;
        }
        
        // Добавляем отладочные логи для итоговых данных
        Log::info('Детальная информация о запчасти после преобразования: ', $partData);
        
        // Получаем похожие запчасти
        $similarParts = $this->partsService->getSimilarParts($id, 4, $isAdmin);
        
        // Также преобразуем похожие запчасти
        $similarPartsData = $similarParts->map(function ($similarPart) use ($isAdmin) {
            $data = [
                'id' => $similarPart->id,
                'name' => $similarPart->name,
                'slug' => $similarPart->slug,
                'description' => $similarPart->description,
                'part_number' => $similarPart->part_number,
                'price' => number_format((float)$similarPart->price, 2, '.', ''),
                'stock_quantity' => $similarPart->stock_quantity,
                'manufacturer' => $similarPart->manufacturer,
                'category' => $similarPart->category,
                'image_url' => $similarPart->image_url,
                'is_available' => $similarPart->is_available,
                'created_at' => $similarPart->created_at,
                'updated_at' => $similarPart->updated_at,
            ];
            
            // Добавляем поля для администратора, если они есть
            if ($isAdmin) {
                $data['original_price'] = number_format((float)($similarPart->original_price ?? $similarPart->price), 2, '.', '');
                $data['markup_price'] = number_format((float)($similarPart->markup_price ?? $similarPart->price), 2, '.', '');
                $data['markup_percent'] = $similarPart->markup_percent ?? 0;
            }
            
            return $data;
        });
        
        return Inertia::render('Parts/Show', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'part' => $partData,
            'similarParts' => $similarPartsData,
            'isAdmin' => $isAdmin
        ]);
    }

    /**
     * Поиск запчастей
     */
    public function search(Request $request)
    {
        // Получаем поисковый запрос из параметра q (как в React-компоненте)
        $query = $request->input('q');
        
        // Проверяем, является ли пользователь администратором
        $isAdmin = auth()->check() && auth()->user()->is_admin;
        
        // Поиск запчастей с учетом роли пользователя
        $parts = $this->partsService->searchParts($query, $isAdmin);
        
        // Расширенный отладочный код
        if ($parts->isNotEmpty()) {
            $firstPart = $parts->first();
            Log::info('Первая запчасть до toArray(): ', (array) $firstPart);
            
            $arrayData = $firstPart->toArray();
            Log::info('Первая запчасть после toArray(): ', $arrayData);
            
            $jsonData = json_encode($firstPart);
            Log::info('Первая запчасть как JSON: ' . $jsonData);
            
            Log::info('Цена первой запчасти: ' . $firstPart->price);
            Log::info('ID первой запчасти: ' . $firstPart->id);
            Log::info('Название первой запчасти: ' . $firstPart->name);
            
            // Собираем модифицированные данные для отправки
            $firstPartData = [
                'id' => $firstPart->id,
                'name' => $firstPart->name,
                'price' => $firstPart->price,
                'is_available' => $firstPart->is_available,
                'part_number' => $firstPart->part_number,
                'stock_quantity' => $firstPart->stock_quantity,
                'manufacturer' => $firstPart->manufacturer,
                'category' => $firstPart->category,
            ];
            
            if (isset($firstPart->original_price)) {
                $firstPartData['original_price'] = $firstPart->original_price;
            }
            
            if (isset($firstPart->markup_price)) {
                $firstPartData['markup_price'] = $firstPart->markup_price;
            }
            
            Log::info('Модифицированные данные для отправки: ', $firstPartData);
            
            // Временный хак для гарантированной передачи данных
            $parts = $parts->map(function ($part) {
                // Создаем простой массив вместо модели
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'slug' => $part->slug,
                    'description' => $part->description,
                    'part_number' => $part->part_number,
                    'price' => number_format((float)$part->price, 2, '.', ''),
                    'stock_quantity' => $part->stock_quantity,
                    'manufacturer' => $part->manufacturer,
                    'category' => $part->category,
                    'image_url' => $part->image_url,
                    'is_available' => $part->is_available,
                    'created_at' => $part->created_at,
                    'updated_at' => $part->updated_at,
                    'original_price' => isset($part->original_price) ? number_format((float)$part->original_price, 2, '.', '') : null,
                    'markup_price' => isset($part->markup_price) ? number_format((float)$part->markup_price, 2, '.', '') : null,
                    'markup_percent' => $part->markup_percent ?? null,
                ];
            });
        }
        
        // Поиск брендов
        $brands = $this->brandService->searchBrands($query);
        
        // Поиск категорий
        $categories = $this->categoryService->searchCategories($query);
        
        return Inertia::render('Search', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'searchQuery' => $query,  // Используем searchQuery как в React-компоненте
            'spareParts' => $parts,   // Используем spareParts как в React-компоненте
            'brands' => $brands,
            'categories' => $categories,
            'isAdmin' => $isAdmin
        ]);
    }
} 