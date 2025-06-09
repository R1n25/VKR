<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CarBrandController;
use App\Http\Controllers\API\CarModelController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\PartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\SparePartController;
use App\Http\Controllers\SpareParts\SparePartController as SparePartsSparePartController;
use App\Http\Controllers\API\BrandController;
use App\Http\Controllers\VinSearchController;
use App\Http\Controllers\API\CarEngineController;
use App\Http\Controllers\API\EnginePartController;

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

// Маршруты для работы с VIN-кодами
Route::post('/vin/decode', [VinSearchController::class, 'decode']);
Route::get('/vin/{vin}/schemes', [VinSearchController::class, 'getSchemes']);

// Перенаправляем запросы с /api/brands на /brands
Route::get('/brands', function () {
    return redirect('/brands');
});

Route::get('/brands/{id}', function ($id) {
    return redirect('/brands/' . $id);
});

// Добавляем маршрут для получения моделей по ID бренда
Route::get('/brands/{id}/models', [BrandController::class, 'getModels']);

// Закомментировали оригинальный маршрут для брендов
// Route::apiResource('brands', CarBrandController::class);

// Маршруты для моделей автомобилей
Route::get('models', [CarModelController::class, 'index']);
Route::get('models/{id}', [CarModelController::class, 'show']);
Route::get('models/{id}/parts', [CarModelController::class, 'getParts']);
// Маршрут для получения двигателей по ID модели
Route::get('models/{id}/engines', [CarEngineController::class, 'getEnginesByModel']);

// Маршруты для двигателей автомобилей
Route::get('engines/{id}', [CarEngineController::class, 'show']);
Route::get('engines/{id}/part-categories', [CarEngineController::class, 'getPartCategories']);

// Маршруты для категорий запчастей
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);
Route::get('categories/{id}/subcategories', [CategoryController::class, 'getSubcategories']);
Route::get('categories/{id}/parts', [CategoryController::class, 'getParts']);

// Маршруты для запчастей
Route::get('parts', [PartController::class, 'index']);
Route::get('parts/{id}', [PartController::class, 'show']);
Route::get('/spare-parts', [SparePartController::class, 'index']);
Route::get('/spare-parts/{id}', [SparePartController::class, 'show']);
Route::get('/spare-parts/{id}/quantity', [SparePartsSparePartController::class, 'getQuantity']);
Route::get('/spare-parts/{id}/info', [SparePartsSparePartController::class, 'getInfo']);

// Маршрут для получения полной информации о запчасти по ID
Route::get('/spare-parts/{id}/full', function ($id) {
    $sparePart = \App\Models\SparePart::find($id);
    if (!$sparePart) {
        return response()->json(['error' => 'Запчасть не найдена'], 404);
    }
    
    return response()->json([
        'id' => $sparePart->id,
        'name' => $sparePart->name,
        'part_number' => $sparePart->part_number,
        'manufacturer' => $sparePart->manufacturer,
        'description' => $sparePart->description,
        'price' => $sparePart->price,
        'stock_quantity' => $sparePart->stock_quantity,
        'category_id' => $sparePart->category_id,
        'is_available' => $sparePart->is_available,
    ]);
});

// Маршрут для проверки существования запчасти
Route::get('/spare-parts/{id}/exists', function ($id) {
    $exists = \App\Models\SparePart::where('id', $id)->exists();
    return response()->json([
        'exists' => $exists,
        'id' => $id
    ]);
});

// Маршруты для корзины
Route::get('cart', [CartController::class, 'getCart']);
Route::post('cart/add', [CartController::class, 'addToCart']);
Route::post('cart/sync', [CartController::class, 'syncCart']);
Route::post('cart/remove', [CartController::class, 'removeFromCart']);
Route::post('cart/update', [CartController::class, 'updateQuantity']);
Route::post('cart/clear', [CartController::class, 'clearCart']);
Route::post('cart/add-order', [CartController::class, 'addOrderToCart']);

// Маршруты для заказов с поддержкой веб-сессии
Route::middleware(['web'])->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
});

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