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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Маршруты для авторизованных пользователей
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');
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
Route::get('/checkout', function () {
    return Inertia::render('Checkout', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('checkout');

// Маршрут для обработки формы заказа
Route::post('/checkout', function (Request $request) {
    // Простая обработка заказа для локального сервера
    return response()->json([
        'success' => true,
        'message' => 'Заказ успешно создан',
        'order_id' => rand(1000, 9999)
    ]);
})->name('checkout.store');

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

// Маршруты админ-панели
Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    
    // Управление VIN-запросами
    Route::get('/vin-requests', [App\Http\Controllers\Admin\VinRequestController::class, 'index'])->name('admin.vin-requests.index');
    Route::get('/vin-requests/{id}', [App\Http\Controllers\Admin\VinRequestController::class, 'show'])->name('admin.vin-requests.show');
    Route::patch('/vin-requests/{id}/status', [App\Http\Controllers\Admin\VinRequestController::class, 'updateStatus'])->name('admin.vin-requests.update-status');
    
    // Управление пользователями
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/{user}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
    Route::patch('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::patch('/users/{user}/markup', [App\Http\Controllers\Admin\UserController::class, 'updateMarkup'])->name('admin.users.update-markup');
    
    // Управление заказами
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index'])->name('admin.orders.index');
    Route::get('/orders/{id}', [App\Http\Controllers\Admin\OrderController::class, 'show'])->name('admin.orders.show');
    Route::put('/orders/{id}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus'])->name('admin.orders.update-status');
    Route::post('/orders/{id}/note', [App\Http\Controllers\Admin\OrderController::class, 'addNote'])->name('admin.orders.add-note');
    Route::get('/orders-export', [App\Http\Controllers\Admin\OrderController::class, 'export'])->name('admin.orders.export');
    
    // Управление платежами
    Route::get('/payments', [App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/payments/create', [App\Http\Controllers\Admin\PaymentController::class, 'create'])->name('admin.payments.create');
    Route::post('/payments', [App\Http\Controllers\Admin\PaymentController::class, 'store'])->name('admin.payments.store');
    Route::get('/payments/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'show'])->name('admin.payments.show');
    Route::put('/payments/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'update'])->name('admin.payments.update');
    Route::get('/payments-export', [App\Http\Controllers\Admin\PaymentController::class, 'export'])->name('admin.payments.export');
    Route::get('/orders/{id}/add-payment', [App\Http\Controllers\Admin\PaymentController::class, 'createForOrder'])->name('admin.orders.add-payment');
    
    // Управление методами оплаты
    Route::get('/payment-methods', [App\Http\Controllers\Admin\PaymentController::class, 'paymentMethods'])->name('admin.payment-methods');
    Route::post('/payment-methods', [App\Http\Controllers\Admin\PaymentController::class, 'storePaymentMethod'])->name('admin.payment-methods.store');
    Route::put('/payment-methods/{id}', [App\Http\Controllers\Admin\PaymentController::class, 'updatePaymentMethod'])->name('admin.payment-methods.update');
});

require __DIR__.'/auth.php';
