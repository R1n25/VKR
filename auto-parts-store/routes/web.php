<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\User\DashboardController as UserDashboardController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\VinRequestController;

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

Route::get('/', function () {
    $brands = \App\Models\CarBrand::all();
    $categories = \Illuminate\Support\Facades\DB::table('part_categories')->whereNull('parent_id')->get();
    
    return Inertia::render('Home', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'brands' => $brands,
        'categories' => $categories,
    ]);
});

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
});

// Маршруты для магазина автозапчастей
Route::get('/home', function () {
    $brands = \App\Models\CarBrand::all();
    $categories = \Illuminate\Support\Facades\DB::table('part_categories')->whereNull('parent_id')->get();
    
    return Inertia::render('Home', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'brands' => $brands,
        'categories' => $categories,
    ]);
})->name('home');

Route::get('/brands', function () {
    // Получаем бренды из базы данных
    $brands = \App\Models\CarBrand::all();
    
    // Всегда возвращаем обычный Inertia-рендер
    return Inertia::render('Brands/Index', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'brands' => $brands,
    ]);
})->name('brands.index');

Route::get('/brands/{id}', function ($id) {
    $brand = \App\Models\CarBrand::with('carModels')->findOrFail($id);
    $models = \App\Models\CarModel::where('brand_id', $id)->get();
    
    return Inertia::render('Brands/Show', [
        'brandId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
        'brand' => $brand,
        'models' => $models,
    ]);
})->name('brands.show');

Route::get('/categories', function () {
    return Inertia::render('Categories/Index', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('categories.index');

Route::get('/categories/{id}', function ($id) {
    return Inertia::render('Categories/Show', [
        'categoryId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('categories.show');

Route::get('/models/{id}', function ($id) {
    return Inertia::render('Models/Show', [
        'modelId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('models.show');

Route::get('/parts/{id}', function ($id) {
    return Inertia::render('Parts/Show', [
        'partId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('parts.show');

// Маршрут для страницы поиска
Route::get('/search', function () {
    return Inertia::render('Search', [
        'searchQuery' => request('q'),
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('search');

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

// Маршрут для просмотра списка заказов (требуется аутентификация)
Route::get('/orders', function () {
    return Inertia::render('Orders/Index', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->middleware(['auth'])->name('orders.index');

// Маршрут для просмотра деталей заказа (требуется аутентификация)
Route::get('/orders/{id}', function ($id) {
    return Inertia::render('Orders/Show', [
        'orderId' => $id,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->middleware(['auth'])->name('orders.show');

// Маршруты для новых страниц
Route::get('/news', function () {
    return Inertia::render('News', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('news');

Route::get('/about', function () {
    return Inertia::render('About', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('about');

Route::get('/contacts', function () {
    return Inertia::render('Contacts', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('contacts');

Route::get('/location-map', function () {
    return Inertia::render('LocationMap', [
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('location-map');

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
});

require __DIR__.'/auth.php';
