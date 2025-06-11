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

        // Регенерируем сессию
        $request->session()->regenerate();
        
        // Объединяем корзину гостя с корзиной пользователя
        $this->cartService->mergeGuestCartWithUserCart(Auth::user());

        // Перенаправляем на домашнюю страницу
        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();
        
        // Очищаем ключ корзины гостя при выходе
        if ($request->hasHeader('User-Agent')) {
            $response = redirect('/login');
            $response->header('Set-Cookie', 'cart_guest_key=; Max-Age=0; path=/');
            return $response;
        }

        return redirect('/login');
    }
}
