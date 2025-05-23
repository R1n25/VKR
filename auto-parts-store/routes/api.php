<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CarBrandController;
use App\Http\Controllers\API\CarModelController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\PartController;
use App\Http\Controllers\API\OrderController;

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

// Перенаправляем запросы с /api/brands на /brands
Route::get('/brands', function () {
    return redirect('/brands');
});

Route::get('/brands/{id}', function ($id) {
    return redirect('/brands/' . $id);
});

// Закомментировали оригинальный маршрут для брендов
// Route::apiResource('brands', CarBrandController::class);

// Маршруты для моделей автомобилей
Route::get('models', [CarModelController::class, 'index']);
Route::get('models/{id}', [CarModelController::class, 'show']);
Route::get('models/{id}/parts', [CarModelController::class, 'getParts']);

// Маршруты для категорий запчастей
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);
Route::get('categories/{id}/subcategories', [CategoryController::class, 'getSubcategories']);
Route::get('categories/{id}/parts', [CategoryController::class, 'getParts']);

// Маршруты для запчастей
Route::get('parts', [PartController::class, 'index']);
Route::get('parts/{id}', [PartController::class, 'show']);

// Маршруты для заказов
Route::apiResource('orders', OrderController::class);

// Заглушка для API заказов
Route::post('orders', function (Request $request) {
    // В реальной системе здесь была бы обработка заказа
    return response()->json([
        'status' => 'success',
        'message' => 'Заказ успешно создан',
        'data' => [
            'order_id' => rand(1000, 9999),
            'order_date' => now()->toDateTimeString(),
            'status' => 'в обработке',
            'total' => $request->total
        ]
    ], 201);
}); 