<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\User\DashboardController as UserDashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BrandsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\PartsController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\VinRequestController;
use App\Http\Controllers\InfoController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use App\Http\Controllers\UserSuggestionController;
use App\Http\Controllers\Admin\SparePartController as AdminSparePartController;
use App\Http\Controllers\Admin\SuggestionController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\CatalogManagerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\EngineController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PartDetailController;
use App\Http\Controllers\SparePartController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Главная страница
Route::get('/', [HomeController::class, 'index']);
Route::get('/home', [HomeController::class, 'index'])->name('home');

// Маршруты для брендов
Route::get('/brands', [BrandsController::class, 'index'])->name('brands.index');
Route::get('/brands/{id}', [BrandsController::class, 'show'])->name('brands.show');

// Маршруты для категорий
Route::get('/categories', [CategoriesController::class, 'index'])->name('categories.index');
Route::get('/categories/{id}', [CategoriesController::class, 'show'])->name('categories.show');

// Новый маршрут для просмотра категории с пагинацией
Route::get('/category/{id}', [CategoryController::class, 'show'])->name('category.show');

// Маршруты для моделей
Route::get('/models/{id}', function ($id) {
    return redirect()->route('engines.index', ['id' => $id]);
})->name('models.show');

// Маршруты для двигателей
Route::get('/models/{id}/engines', function ($id) {
    return Inertia::render('Engines/Index', [
        'modelId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('engines.index');
Route::get('/engines/{id}/parts', function ($id) {
    return Inertia::render('Engines/Parts', [
        'engineId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('engines.parts');

// Маршруты для запчастей
Route::middleware(['auth', 'verified'])->group(function () {
    // Поиск запчастей
    Route::get('/search', [SparePartController::class, 'search'])->name('search');
    
    // Поиск запчасти по артикулу
    Route::get('/article-search', [SparePartController::class, 'findByArticle'])->name('parts.article-search');
    
    // Детальная информация о запчасти
    Route::get('/parts/{id}', [PartDetailController::class, 'show'])->name('parts.show');
    
    // Альтернативный маршрут для обратной совместимости
    Route::get('/spare-parts/{id}', [PartDetailController::class, 'show'])->name('spare-parts.show');
});

// Маршруты для авторизованных пользователей
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function() {
        if (auth()->user() && auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return app(\App\Http\Controllers\User\DashboardController::class)->index();
    })->name('dashboard');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // История VIN-запросов пользователя
    Route::get('/my-vin-requests', [VinRequestController::class, 'userRequests'])->name('vin-request.user');
});

// Маршрут для корзины
Route::get('/cart', [CartController::class, 'index'])->name('cart');

// Маршрут для оформления заказа
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');

// Маршрут для обработки заказа без CSRF-защиты
Route::post('/process-order', [CheckoutController::class, 'processOrder'])->name('process.order')->withoutMiddleware(['web']);

// Маршрут для страницы успешного оформления заказа
Route::get('/order-success', function() {
    return Inertia::render('OrderSuccess', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'order' => session('order')
    ]);
})->name('order.success');

// Специальный маршрут для тестирования оформления заказа
Route::post('/test-checkout', [CheckoutController::class, 'processTestCheckout'])->name('test.checkout');

// Тестовая страница оформления заказа
Route::get('/test-checkout-page', function() {
    return Inertia::render('TestCheckout');
})->name('test.checkout.page');

// Маршрут для просмотра списка заказов (требуется аутентификация)
Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth'])->name('orders.index');

// Маршрут для просмотра деталей заказа (требуется аутентификация)
Route::get('/orders/{id}', [OrderController::class, 'show'])->middleware(['auth'])->name('orders.show');



// Маршруты для информационных страниц
Route::get('/news', [InfoController::class, 'news'])->name('news');
Route::get('/about', [InfoController::class, 'about'])->name('about');
Route::get('/contacts', [InfoController::class, 'contacts'])->name('contacts');
Route::get('/location-map', [InfoController::class, 'locationMap'])->name('location-map');

// Маршруты для подбора запчастей по VIN
Route::get('/vin-request', [VinRequestController::class, 'index'])->name('vin-request.index');
Route::post('/vin-request', [VinRequestController::class, 'store'])->name('vin-request.store');
Route::get('/vin-request/success', [VinRequestController::class, 'success'])->name('vin-request.success');
Route::get('/vin-request/{id}', [VinRequestController::class, 'show'])->name('vin-request.show');

// Маршруты для предложений пользователей
Route::middleware(['auth'])->group(function () {
    // Формы создания предложений
    Route::get('/spare-parts/{sparePart}/suggest-analog', [UserSuggestionController::class, 'createAnalog'])
        ->name('suggestions.create-analog')
        ->middleware('auth');
    Route::post('/spare-parts/{sparePart}/suggest-analog', [UserSuggestionController::class, 'storeAnalog'])
        ->name('suggestions.store-analog')
        ->middleware('auth');
    
    // Сохранение предложений
    Route::get('/spare-parts/{sparePart}/suggest-compatibility', [UserSuggestionController::class, 'createCompatibility'])
        ->name('suggestions.create-compatibility')
        ->middleware('auth');
    Route::post('/spare-parts/{sparePart}/suggest-compatibility', [UserSuggestionController::class, 'storeCompatibility'])
        ->name('suggestions.store-compatibility')
        ->middleware('auth');
        
    // Маршруты для предложений через id запчасти (для страницы каталога)
    Route::get('/parts/{id}/suggest-analog', [UserSuggestionController::class, 'createAnalogById'])
        ->name('suggestions.create-analog-by-id')
        ->middleware('auth');
    Route::post('/parts/{id}/suggest-analog', [UserSuggestionController::class, 'storeAnalogById'])
        ->name('suggestions.store-analog-by-id')
        ->middleware('auth')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/parts/{id}/suggest-compatibility', [UserSuggestionController::class, 'createCompatibilityById'])
        ->name('suggestions.create-compatibility-by-id')
        ->middleware('auth');
    Route::post('/parts/{id}/suggest-compatibility', [UserSuggestionController::class, 'storeCompatibilityById'])
        ->name('suggestions.store-compatibility-by-id')
        ->middleware('auth')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
});

// Маршруты админ-панели
Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
    
    // Управление запчастями
    Route::prefix('spare-parts')->name('spare-parts.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SparePartController::class, 'indexInertia'])->name('index');
        Route::get('/create', [App\Http\Controllers\Admin\SparePartController::class, 'createInertia'])->name('create');
        Route::post('/', [App\Http\Controllers\Admin\SparePartController::class, 'storeInertia'])->name('store');
        Route::get('/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'showInertia'])->name('show');
        Route::get('/{sparePart}/edit', [App\Http\Controllers\Admin\SparePartController::class, 'editInertia'])->name('edit');
        Route::put('/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'updateInertia'])->name('update');
        Route::delete('/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'destroy'])->name('destroy');
        
        // Маршруты для управления аналогами
        Route::get('/{id}/analogs', [App\Http\Controllers\Admin\SparePartController::class, 'manageAnalogs'])->name('analogs');
        Route::post('/{id}/add-analog', [App\Http\Controllers\Admin\SparePartController::class, 'addAnalog'])->name('add-analog');
        Route::delete('/{id}/analogs/{analogId}', [App\Http\Controllers\Admin\SparePartController::class, 'removeAnalog'])->name('remove-analog');
        
        // Маршрут для обновления категории запчасти
        Route::put('/{sparePart}/update-category', [App\Http\Controllers\Admin\SparePartController::class, 'updateCategory'])->name('update-category');
        
        // Маршруты для массовых действий
        Route::post('/activate-all', [App\Http\Controllers\Admin\SparePartController::class, 'activateAll'])->name('activate-all');
        Route::post('/set-all-active', [App\Http\Controllers\Admin\SparePartController::class, 'setAllActive'])->name('set-all-active');
        
        // Маршрут для синхронизации аналогов
        Route::get('/sync-all-analogs', [App\Http\Controllers\Admin\SparePartController::class, 'syncAllAnalogs'])->name('sync-all-analogs');
    });
    
    // Управление VIN-запросами
    Route::get('/vin-requests', [App\Http\Controllers\Admin\VinRequestController::class, 'index'])->name('vin-requests.index');
    Route::get('/vin-requests/{id}', [App\Http\Controllers\Admin\VinRequestController::class, 'show'])->name('vin-requests.show');
    Route::patch('/vin-requests/{id}/status', [App\Http\Controllers\Admin\VinRequestController::class, 'updateStatus'])->name('vin-requests.update-status');
    
    // Управление пользователями
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{user}/markup', [App\Http\Controllers\Admin\UserController::class, 'updateMarkup'])->name('users.update-markup');
    
    // Управление заказами
    Route::get('/orders', [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/status', [\App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('/orders/{id}/note', [\App\Http\Controllers\Admin\OrderController::class, 'addNote'])->name('orders.add-note');
    Route::get('/orders-export', [\App\Http\Controllers\Admin\OrderController::class, 'export'])->name('orders.export');
    


    // Управление предложениями пользователей
    Route::get('/suggestions', [App\Http\Controllers\Admin\SuggestionController::class, 'indexInertia'])->name('suggestions.index');
    Route::get('/suggestions/{suggestion}', [App\Http\Controllers\Admin\SuggestionController::class, 'showInertia'])->name('suggestions.show')->whereNumber('suggestion');
    Route::post('/suggestions/{suggestion}/approve', [App\Http\Controllers\Admin\SuggestionController::class, 'approve'])->name('suggestions.approve');
    Route::post('/suggestions/{suggestion}/reject', [App\Http\Controllers\Admin\SuggestionController::class, 'reject'])->name('suggestions.reject');
    Route::delete('/suggestions/{suggestion}', [App\Http\Controllers\Admin\SuggestionController::class, 'destroy'])->name('suggestions.destroy');
    
    // Управление каталогом
    Route::get('/catalog-manager', [CatalogManagerController::class, 'index'])->name('catalog-manager.index');
    Route::get('/catalog-manager/import-parts', function() {
        return redirect()->route('admin.catalog-manager.index');
    })->name('catalog-manager.import-parts.get');
    Route::post('/catalog-manager/import-parts', [CatalogManagerController::class, 'importParts'])->name('catalog-manager.import-parts');
    Route::get('/catalog-manager/import-cars', function() {
        return redirect()->route('admin.catalog-manager.index');
    })->name('catalog-manager.import-cars.get');
    Route::post('/catalog-manager/import-cars', [CatalogManagerController::class, 'importCars'])->name('catalog-manager.import-cars');
    Route::get('/catalog-manager/export-parts', [CatalogManagerController::class, 'exportParts'])->name('catalog-manager.export-parts');
    Route::get('/catalog-manager/export-cars', [CatalogManagerController::class, 'exportCars'])->name('catalog-manager.export-cars');
    Route::get('/catalog-manager/download-backup', [CatalogManagerController::class, 'downloadBackup'])->name('catalog-manager.download-backup');

    // Управление категориями запчастей
    Route::get('part-categories', [\App\Http\Controllers\Admin\PartCategoryController::class, 'indexInertia'])->name('part-categories.index');
    Route::get('part-categories/create', [\App\Http\Controllers\Admin\PartCategoryController::class, 'createInertia'])->name('part-categories.create');
    Route::post('part-categories', [\App\Http\Controllers\Admin\PartCategoryController::class, 'storeInertia'])->name('part-categories.store');
    Route::get('part-categories/{partCategory}', [\App\Http\Controllers\Admin\PartCategoryController::class, 'showInertia'])->name('part-categories.show');
    Route::get('part-categories/{partCategory}/edit', [\App\Http\Controllers\Admin\PartCategoryController::class, 'editInertia'])->name('part-categories.edit');
    Route::put('part-categories/{partCategory}', [\App\Http\Controllers\Admin\PartCategoryController::class, 'updateInertia'])->name('part-categories.update');
    Route::delete('part-categories/{partCategory}', [\App\Http\Controllers\Admin\PartCategoryController::class, 'destroyInertia'])->name('part-categories.destroy');



    // Управление моделями автомобилей
    Route::get('/car-models', [App\Http\Controllers\Admin\CarModelController::class, 'index'])->name('car-models.index');
    Route::get('/car-models/create', [App\Http\Controllers\Admin\CarModelController::class, 'create'])->name('car-models.create');
    Route::post('/car-models', [App\Http\Controllers\Admin\CarModelController::class, 'store'])->name('car-models.store');
    Route::get('/car-models/{carModel}', [App\Http\Controllers\Admin\CarModelController::class, 'show'])->name('car-models.show');
    Route::get('/car-models/{carModel}/edit', [App\Http\Controllers\Admin\CarModelController::class, 'edit'])->name('car-models.edit');
    Route::put('/car-models/{carModel}', [App\Http\Controllers\Admin\CarModelController::class, 'update'])->name('car-models.update');
    Route::delete('/car-models/{carModel}', [App\Http\Controllers\Admin\CarModelController::class, 'destroy'])->name('car-models.destroy');
    Route::delete('/car-models/{carModel}/image', [App\Http\Controllers\Admin\CarModelController::class, 'deleteImage'])->name('car-models.delete-image');
});

// Маршруты для каталога автомобилей
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/catalog/{brandSlug}', [CatalogController::class, 'brand'])->name('catalog.brand');
Route::get('/catalog/{brandSlug}/{modelSlug}', [CatalogController::class, 'model'])->name('catalog.model');
Route::get('/catalog/{brandSlug}/{modelSlug}/{generation}', [CatalogController::class, 'generation'])->name('catalog.generation');
Route::get('/catalog/{brandSlug}/{modelSlug}/{generation}/parts', [CatalogController::class, 'parts'])->name('catalog.parts');
Route::get('/part/{partSlug}', [CatalogController::class, 'part'])->name('catalog.part');

// Тестовый маршрут для проверки отключения CSRF
Route::post('/test-post', function (Request $request) {
    return response()->json([
        'success' => true,
        'message' => 'Тестовый запрос успешно обработан',
        'data' => $request->all()
    ]);
})->middleware('api')->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

require __DIR__.'/auth.php';
