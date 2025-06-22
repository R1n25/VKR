<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    protected $cartService;
    
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }
    
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        // Создаем новый экземпляр LoginRequest
        $loginRequest = new LoginRequest($request->all());
        
        // Аутентифицируем пользователя
        $loginRequest->authenticate();
        
        // Получаем пользователя
        $user = Auth::user();
        
        // Проверяем, есть ли у пользователя активная корзина
        $userCart = \App\Models\Cart::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();
        
        // Если у пользователя нет активной корзины, создаем новую
        if (!$userCart) {
            \App\Models\Cart::create([
                'user_id' => $user->id,
                'session_id' => null,
                'is_active' => true,
                'total_price' => 0
            ]);
        }
        
        // Регенерируем сессию
        $request->session()->regenerate();

        // Перенаправляем на домашнюю страницу
        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Сохраняем ID пользователя перед выходом
        $userId = Auth::id();
        
        // Деактивируем все корзины пользователя при выходе
        if ($userId) {
            \App\Models\Cart::where('user_id', $userId)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }
        
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
