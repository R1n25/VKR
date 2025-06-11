<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CarModelController;
use App\Http\Controllers\API\CategoryController;
// use App\Http\Controllers\API\PartController; // Устаревший контроллер
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\SparePartController;
use App\Http\Controllers\API\BaseSparePartController;
use App\Http\Controllers\SpareParts\SparePartController as SparePartsSparePartController;
use App\Http\Controllers\API\BrandController;
use App\Http\Controllers\API\VinRequestController;
use App\Http\Controllers\API\CarEngineController;
use App\Http\Controllers\API\EnginePartController;
use App\Http\Controllers\API\PartCategoryController;
// use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\CheckoutController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Эти маршруты уже имеют префикс api в RouteServiceProvider
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Маршруты для работы с VIN-запросами (VinRequestController для запросов пользователей)
Route::prefix('vin-requests')->group(function () {
    Route::post('/', [VinRequestController::class, 'decode']);
    Route::get('/{vin}/info', [VinRequestController::class, 'getVinInfo']);
});

// Перенаправляем запросы с /api/brands на /brands
Route::get('/brands', function () {
    return redirect('/brands');
});

Route::get('/brands/{id}', function ($id) {
    return redirect('/brands/' . $id);
});

// Добавляем маршрут для получения моделей по ID бренда
Route::get('/brands/{id}/models', [BrandController::class, 'getModels']);

// Маршруты для брендов
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

// Маршруты для моделей автомобилей
Route::get('models', [CarModelController::class, 'index']);
Route::get('models/{id}', [CarModelController::class, 'show']);
Route::get('models/{id}/parts', [CarModelController::class, 'getParts']);
// Маршрут для получения двигателей по ID модели
Route::get('models/{id}/engines', [CarEngineController::class, 'getEnginesByModel']);
// Маршрут для получения информации о модели автомобиля по ID
Route::get('car-models/{id}', [CarModelController::class, 'show'])->where('id', '[0-9]+');
// Маршрут для получения информации о двигателе автомобиля по ID
Route::get('car-engines/{id}', [CarEngineController::class, 'show'])->where('id', '[0-9]+');

// Маршруты для двигателей автомобилей
Route::get('engines/{id}', [CarEngineController::class, 'show']);
Route::get('engines/{id}/part-categories', [CarEngineController::class, 'getPartCategories']);

// Маршруты для категорий запчастей
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);
Route::get('categories/{id}/subcategories', [CategoryController::class, 'getSubcategories']);
Route::get('categories/{id}/parts', [CategoryController::class, 'getParts']);

// Маршруты для категорий запчастей (новый API)
Route::get('part-categories', [PartCategoryController::class, 'index']);
Route::get('part-categories/{id}', [PartCategoryController::class, 'show']);
Route::get('part-categories/{id}/filtered-parts', [PartCategoryController::class, 'filteredParts']);

// Маршруты для запчастей
// Оставляем устаревшие маршруты для обратной совместимости
Route::get('parts', [SparePartController::class, 'index']);
Route::get('parts/{id}', [SparePartController::class, 'show']);

// Основные маршруты для запчастей
Route::prefix('spare-parts')->group(function () {
    // Основные операции
    Route::get('/', [SparePartController::class, 'index']);
    Route::get('/search', [SparePartController::class, 'search']);
    Route::get('/search-suggestions', [SparePartController::class, 'searchSuggestions']);
    Route::get('/{id}', [SparePartController::class, 'show'])->where('id', '[0-9]+');
    
    // Детальная информация
    Route::get('/{id}/details', [SparePartController::class, 'showDetails'])->where('id', '[0-9]+');
    Route::get('/{id}/full', [SparePartController::class, 'getFullInfo'])->where('id', '[0-9]+');
    
    // Связанные данные
    Route::get('/{id}/analogs', [SparePartController::class, 'getAnalogs'])->where('id', '[0-9]+');
    Route::get('/{id}/compatibilities', [SparePartController::class, 'getCompatibilities'])->where('id', '[0-9]+');
    
    // Информация о наличии (из другого контроллера)
    Route::get('/{id}/quantity', [SparePartsSparePartController::class, 'getQuantity'])->where('id', '[0-9]+');
    Route::get('/{id}/info', [SparePartsSparePartController::class, 'getInfo'])->where('id', '[0-9]+');
    
    // Проверка существования запчасти
    Route::get('/{id}/exists', [SparePartController::class, 'exists'])->where('id', '[0-9]+');
});

// Маршруты для корзины
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'getCart']);
    Route::post('/add', [CartController::class, 'addToCart']);
    Route::post('/sync', [CartController::class, 'syncCart']);
    Route::delete('/remove', [CartController::class, 'removeFromCart']);
    Route::post('/update', [CartController::class, 'updateQuantity']);
    Route::delete('/clear', [CartController::class, 'clearCart']);
    Route::post('/add-order', [CartController::class, 'addOrderToCart']);
});

// Маршруты для заказов с поддержкой веб-сессии
Route::middleware(['web'])->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
});

// API маршруты для заказов (доступны через axios)
Route::get('user/orders', [OrderController::class, 'index']);
Route::get('user/orders/{id}', [OrderController::class, 'show']);

// Остальные маршруты для заказов без дополнительных middleware
Route::post('orders', [OrderController::class, 'store']);
Route::put('orders/{id}', [OrderController::class, 'update']);
Route::delete('orders/{id}', [OrderController::class, 'destroy']);

// Маршруты для связи двигателей и запчастей
Route::prefix('engine-parts')->group(function () {
    Route::get('engine/{engineId}/parts', [EnginePartController::class, 'getPartsByEngine']);
    Route::get('part/{partId}/engines', [EnginePartController::class, 'getEnginesByPart']);
    Route::post('engine/{engineId}/part/{partId}/attach', [EnginePartController::class, 'attachPartToEngine']);
    Route::delete('engine/{engineId}/part/{partId}/detach', [EnginePartController::class, 'detachPartFromEngine']);
    Route::put('engine/{engineId}/part/{partId}/notes', [EnginePartController::class, 'updateNotes']);
    Route::post('engine/{engineId}/parts/bulk-attach', [EnginePartController::class, 'bulkAttachPartsToEngine']);
});

// Добавляю тестовый API-маршрут для проверки соединения
Route::get('/test', function () {
    return response()->json([
        'message' => 'API connection test successful!'
    ]);
});

// Публичные API маршруты
Route::prefix('v1')->group(function () {
    // Маршруты для поиска запчастей
    Route::get('/search', [SparePartController::class, 'search']);
    Route::get('/search/article', [SparePartController::class, 'findByArticle']);
    
    // Маршруты для запчастей
    Route::get('/parts/{id}', [SparePartController::class, 'show']);
    Route::get('/parts/{id}/analogs', [SparePartController::class, 'analogs']);
    Route::get('/parts/{id}/compatibility', [SparePartController::class, 'compatibility']);
    
    // Маршруты для брендов
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{id}/models', [BrandController::class, 'models']);
    
    // Маршруты для корзины
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/update', [CartController::class, 'update']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::get('/cart', [CartController::class, 'index']);
    
    // Маршруты для VIN-запросов
    Route::post('/vin-request', [VinRequestController::class, 'store']);
    Route::get('/vin-request/{id}', [VinRequestController::class, 'show']);
    
    // Маршруты для заказов (требуется аутентификация)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
    });
});

// Тестовый маршрут для проверки оформления заказа
Route::post('/test-checkout', [CheckoutController::class, 'testCheckout']);

// Самый простой маршрут для проверки
Route::post('/simple-test', function () {
    return response()->json([
        'success' => true,
        'message' => 'Простой тестовый маршрут работает',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Маршрут для обработки заказа без CSRF-защиты
Route::post('/process-order', [App\Http\Controllers\CheckoutController::class, 'processOrder'])->middleware('cors');

// Маршруты для категорий
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/{id}/parts', [CategoryController::class, 'getParts'])->where('id', '[0-9]+');
    Route::get('/{id}/name', [CategoryController::class, 'getName'])->where('id', '[0-9]+');
}); 