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
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use App\Http\Controllers\UserSuggestionController;
use App\Http\Controllers\Admin\SparePartController as AdminSparePartController;
use App\Http\Controllers\Admin\SuggestionController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\CatalogManagerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\Admin\PartCategoryController;
use App\Http\Controllers\CheckoutController;

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

// Маршруты для моделей
Route::get('/models/{id}', function ($id) {
    return Inertia::render('Models/Show', [
        'modelId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('models.show');

// Маршруты для запчастей
Route::get('/parts/{id}', [PartsController::class, 'show'])->name('parts.show');
Route::get('/search', [PartsController::class, 'search'])->name('search');
Route::get('/article-search', [PartsController::class, 'findByArticle'])->name('parts.article-search');

// Тестовый маршрут для отладки поиска
Route::get('/search-debug', function (Illuminate\Http\Request $request) {
    $controller = app()->make(App\Http\Controllers\PartsController::class);
    $result = $controller->search($request);
    return response()->json([
        'request' => $request->all(),
        'response_type' => get_class($result),
        'data' => $result
    ]);
})->name('search.debug');

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
    
    // Маршруты для работы с финансами
    Route::get('/finances', [PaymentController::class, 'index'])->name('finances.index');
    Route::get('/finances/create', [PaymentController::class, 'create'])->name('finances.create');
    Route::post('/finances', [PaymentController::class, 'store'])->name('finances.store');
    Route::get('/finances/{id}', [PaymentController::class, 'show'])->name('finances.show');
    Route::put('/finances/{id}/status', [PaymentController::class, 'updateStatus'])->name('finances.update-status');
    Route::get('/orders/{id}/add-payment', [PaymentController::class, 'createForOrder'])->name('orders.add-payment');
});

// Маршрут для корзины
Route::get('/cart', function () {
    return Inertia::render('Cart', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('cart');

// Маршрут для оформления заказа
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');

// Маршрут для обработки формы заказа
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

// Маршрут для просмотра списка заказов (требуется аутентификация)
Route::get('/orders', [OrderController::class, 'index'])->middleware(['auth'])->name('orders.index');

// Маршрут для просмотра деталей заказа (требуется аутентификация)
Route::get('/orders/{id}', [OrderController::class, 'show'])->middleware(['auth'])->name('orders.show');

// Маршрут для оплаты заказа с баланса пользователя
Route::post('/orders/{id}/pay-from-balance', [OrderController::class, 'payFromBalance'])->name('orders.pay-from-balance');

// Маршруты для информационных страниц
Route::get('/news', [InfoController::class, 'news'])->name('news');
Route::get('/about', [InfoController::class, 'about'])->name('about');
Route::get('/contacts', [InfoController::class, 'contacts'])->name('contacts');
Route::get('/location-map', [InfoController::class, 'locationMap'])->name('location-map');

// Маршруты для подбора запчастей по VIN
Route::get('/vin-request', [VinRequestController::class, 'index'])->name('vin-request.index');
Route::post('/vin-request', [VinRequestController::class, 'store'])->name('vin-request.store');
Route::get('/vin-request/success', [VinRequestController::class, 'success'])->name('vin-request.success');

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
});

// Маршруты админ-панели
Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    
    // Управление запчастями
    Route::resource('spare-parts', App\Http\Controllers\Admin\SparePartController::class);
    Route::get('spare-parts-inertia', [App\Http\Controllers\Admin\SparePartController::class, 'indexInertia'])->name('spare-parts.inertia');
    Route::get('spare-parts-create', [App\Http\Controllers\Admin\SparePartController::class, 'createInertia'])->name('spare-parts.create-inertia');
    Route::post('spare-parts-store', [App\Http\Controllers\Admin\SparePartController::class, 'storeInertia'])->name('spare-parts.store-inertia');
    Route::get('spare-parts-show/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'showInertia'])->name('spare-parts.show-inertia');
    Route::get('spare-parts-edit/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'editInertia'])->name('spare-parts.edit-inertia');
    Route::put('spare-parts-update/{sparePart}', [App\Http\Controllers\Admin\SparePartController::class, 'updateInertia'])->name('spare-parts.update-inertia');
    
    // Управление аналогами запчастей
    Route::get('spare-parts/{sparePart}/analogs', [App\Http\Controllers\Admin\SparePartController::class, 'manageAnalogs'])->name('spare-parts.analogs');
    Route::post('spare-parts/{sparePart}/add-analog', [App\Http\Controllers\Admin\SparePartController::class, 'addAnalog'])->name('spare-parts.add-analog');
    Route::delete('spare-parts/{sparePart}/analogs/{analogId}', [App\Http\Controllers\Admin\SparePartController::class, 'removeAnalog'])->name('spare-parts.remove-analog');
    
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
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('/orders/{id}/note', [App\Http\Controllers\Admin\OrderController::class, 'addNote'])->name('orders.add-note');
    Route::get('/orders-export', [App\Http\Controllers\Admin\OrderController::class, 'export'])->name('orders.export');
    
    // Управление платежами
    Route::get('/payments', [App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/create', [App\Http\Controllers\Admin\PaymentController::class, 'create'])->name('payments.create');
    Route::post('/payments', [App\Http\Controllers\Admin\PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'show'])->name('payments.show');
    Route::put('/payments/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'update'])->name('payments.update');
    Route::get('/payments-export', [App\Http\Controllers\Admin\PaymentController::class, 'export'])->name('payments.export');
    Route::get('/orders/{id}/add-payment', [App\Http\Controllers\Admin\PaymentController::class, 'createForOrder'])->name('orders.add-payment');
    
    // Управление методами оплаты
    Route::get('/payment-methods', [App\Http\Controllers\Admin\PaymentController::class, 'paymentMethods'])->name('payment-methods');
    Route::post('/payment-methods', [App\Http\Controllers\Admin\PaymentController::class, 'storePaymentMethod'])->name('payment-methods.store');
    Route::put('/payment-methods/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'updatePaymentMethod'])->name('payment-methods.update');

    // Управление предложениями пользователей
    Route::get('/suggestions-inertia', [App\Http\Controllers\Admin\SuggestionController::class, 'indexInertia'])->name('suggestions.inertia');
    Route::get('/suggestions-show-inertia/{suggestion}', [App\Http\Controllers\Admin\SuggestionController::class, 'showInertia'])->name('suggestions.show-inertia')->whereNumber('suggestion');
    Route::get('/suggestions', [App\Http\Controllers\Admin\SuggestionController::class, 'index'])->name('suggestions.index');
    Route::get('/suggestions/{suggestion}', [App\Http\Controllers\Admin\SuggestionController::class, 'show'])->name('suggestions.show');
    Route::post('/suggestions/{suggestion}/approve', [App\Http\Controllers\Admin\SuggestionController::class, 'approve'])->name('suggestions.approve');
    Route::post('/suggestions/{suggestion}/reject', [App\Http\Controllers\Admin\SuggestionController::class, 'reject'])->name('suggestions.reject');
    Route::delete('/suggestions/{suggestion}', [App\Http\Controllers\Admin\SuggestionController::class, 'destroy'])->name('suggestions.destroy');
    
    // Управление каталогом
    Route::get('/catalog-manager', [CatalogManagerController::class, 'index'])->name('catalog-manager.index');
    Route::post('/catalog-manager/import-parts', [CatalogManagerController::class, 'importParts'])->name('catalog-manager.import-parts');
    Route::post('/catalog-manager/import-cars', [CatalogManagerController::class, 'importCars'])->name('catalog-manager.import-cars');
    Route::get('/catalog-manager/export-parts', [CatalogManagerController::class, 'exportParts'])->name('catalog-manager.export-parts');
    Route::get('/catalog-manager/export-cars', [CatalogManagerController::class, 'exportCars'])->name('catalog-manager.export-cars');
    Route::get('/catalog-manager/download-backup', [CatalogManagerController::class, 'downloadBackup'])->name('catalog-manager.download-backup');

    // Управление категориями запчастей
    Route::resource('part-categories', PartCategoryController::class);

    // Управление финансами пользователей
    Route::get('/finances', [\App\Http\Controllers\Admin\FinanceController::class, 'index'])->name('finances.index');
    Route::get('/finances/users/{user}', [\App\Http\Controllers\Admin\FinanceController::class, 'show'])->name('finances.show');
    Route::get('/finances/users/{user}/create', [\App\Http\Controllers\Admin\FinanceController::class, 'create'])->name('finances.create');
    Route::post('/finances/users/{user}', [\App\Http\Controllers\Admin\FinanceController::class, 'store'])->name('finances.store');
    Route::patch('/finances/users/{user}/balance', [\App\Http\Controllers\Admin\FinanceController::class, 'updateBalance'])->name('finances.update-balance');
});

require __DIR__.'/auth.php';
