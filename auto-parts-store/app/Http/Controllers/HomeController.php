<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Services\BrandService;
use App\Services\CategoryService;
use App\Services\PartService;
use App\Services\VinRequestService;

class HomeController extends Controller
{
    protected $brandService;
    protected $categoryService;
    protected $partService;
    protected $vinRequestService;

    /**
     * Конструктор контроллера с внедрением сервисов
     */
    public function __construct(
        BrandService $brandService, 
        CategoryService $categoryService, 
        PartService $partService, 
        VinRequestService $vinRequestService
    ) {
        $this->brandService = $brandService;
        $this->categoryService = $categoryService;
        $this->partService = $partService;
        $this->vinRequestService = $vinRequestService;
    }

    /**
     * Главная страница
     */
    public function index()
    {
        // Получаем популярные бренды
        $brands = $this->brandService->getAllBrands(true);
        
        // Получаем корневые категории
        $categories = $this->categoryService->getRootCategories();
        
        return Inertia::render('Home', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'brands' => $brands,
            'categories' => $categories
        ]);
    }

    /**
     * Страница бренда
     */
    public function brand(Request $request, $brandId)
    {
        // Получаем информацию о бренде
        $brand = $this->brandService->getBrandById($brandId);
        
        if (!$brand) {
            abort(404);
        }
        
        // Получаем модели этого бренда
        $models = $this->brandService->getModelsByBrandId($brandId);
        
        return Inertia::render('Brand', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'brand' => $brand,
            'models' => $models
        ]);
    }

    /**
     * Страница категории
     */
    public function category(Request $request, $categoryId)
    {
        // Получаем категорию с запчастями, применяя фильтры
        $filters = $request->only(['brands', 'price_min', 'price_max', 'in_stock', 'sort']);
        $categoryData = $this->categoryService->getCategoryWithParts($categoryId, $filters);
        
        if (!$categoryData['category']) {
            abort(404);
        }
        
        // Получаем бренды для фильтра
        $brands = $this->brandService->getAllBrands();
        
        return Inertia::render('Category', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'category' => $categoryData['category'],
            'parts' => $categoryData['parts'],
            'filters' => $filters,
            'brands' => $brands
        ]);
    }

    /**
     * Страница запчасти
     */
    public function part(Request $request, $partId)
    {
        // Получаем информацию о запчасти
        $part = $this->partService->getPartById($partId);
        
        if (!$part) {
            abort(404);
        }
        
        // Получаем похожие запчасти
        $similarParts = $this->partService->getSimilarParts($partId);
        
        return Inertia::render('Part', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'part' => $part,
            'similarParts' => $similarParts
        ]);
    }

    /**
     * Поиск запчастей
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        
        // Поиск запчастей
        $parts = $this->partService->searchParts($query);
        
        // Поиск брендов
        $brands = $this->brandService->searchBrands($query);
        
        // Поиск категорий
        $categories = $this->categoryService->searchCategories($query);
        
        return Inertia::render('Search', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'query' => $query,
            'parts' => $parts,
            'brands' => $brands,
            'categories' => $categories
        ]);
    }

    /**
     * Страница для подбора запчастей по VIN
     */
    public function vinSelection()
    {
        return Inertia::render('VinSelection', [
            'auth' => [
                'user' => auth()->user(),
            ],
            'statuses' => $this->vinRequestService->getAllStatuses(),
        ]);
    }

    /**
     * Сохранение VIN-запроса
     */
    public function saveVinRequest(Request $request)
    {
        $validated = $request->validate([
            'vin' => 'required|string|size:17',
            'car_make' => 'nullable|string|max:100',
            'car_model' => 'nullable|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'parts_list' => 'required|string',
            'additional_info' => 'nullable|string|max:1000',
        ]);
        
        $vinRequest = $this->vinRequestService->createRequest($validated);
        
        return redirect()->route('vin.requests')->with('message', 'Запрос успешно создан');
    }

    /**
     * История VIN-запросов пользователя
     */
    public function vinRequests()
    {
        $user = auth()->user();
        $requests = $this->vinRequestService->getUserRequests($user->id);
        
        return Inertia::render('VinRequests', [
            'auth' => [
                'user' => $user,
            ],
            'requests' => $requests,
            'statuses' => $this->vinRequestService->getAllStatuses(),
            'statusClasses' => [
                'pending' => $this->vinRequestService->getStatusClass('pending'),
                'processing' => $this->vinRequestService->getStatusClass('processing'),
                'completed' => $this->vinRequestService->getStatusClass('completed'),
                'cancelled' => $this->vinRequestService->getStatusClass('cancelled'),
                'rejected' => $this->vinRequestService->getStatusClass('rejected'),
            ]
        ]);
    }

    /**
     * Детали VIN-запроса
     */
    public function vinRequestDetail($requestId)
    {
        $user = auth()->user();
        $request = $this->vinRequestService->getRequestDetails($requestId, $user->id);
        
        if (!$request) {
            abort(404);
        }
        
        return Inertia::render('VinRequestDetail', [
            'auth' => [
                'user' => $user,
            ],
            'request' => $request,
            'statuses' => $this->vinRequestService->getAllStatuses(),
            'statusClass' => $this->vinRequestService->getStatusClass($request->status)
        ]);
    }

    /**
     * Отмена VIN-запроса
     */
    public function cancelVinRequest($requestId)
    {
        $user = auth()->user();
        $success = $this->vinRequestService->cancelRequest($requestId, $user->id);
        
        if (!$success) {
            return redirect()->back()->with('error', 'Невозможно отменить запрос');
        }
        
        return redirect()->route('vin.requests')->with('message', 'Запрос успешно отменен');
    }

    /**
     * Отображает страницу "О нас"
     */
    public function about()
    {
        return Inertia::render('About', [
            'auth' => [
                'user' => auth()->user(),
            ]
        ]);
    }
    
    /**
     * Отображает страницу контактов
     */
    public function contacts()
    {
        return Inertia::render('Contacts', [
            'auth' => [
                'user' => auth()->user(),
            ]
        ]);
    }
    
    /**
     * Отображает страницу новостей
     */
    public function news()
    {
        return Inertia::render('News', [
            'auth' => [
                'user' => auth()->user(),
            ]
        ]);
    }
    
    /**
     * Отображает страницу карты местоположения
     */
    public function locationMap()
    {
        return Inertia::render('LocationMap', [
            'auth' => [
                'user' => auth()->user(),
            ]
        ]);
    }
}
